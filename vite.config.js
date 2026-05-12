import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const SPOONACULAR_API_URL = 'https://api.spoonacular.com/recipes/complexSearch';
const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUIRED_SEARCH_PARAMS = {
  instructionsRequired: 'true',
  addRecipeInformation: 'true',
  addRecipeInstructions: 'true',
  addRecipeNutrition: 'true',
  number: '24',
};

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function stableCacheKey(params) {
  return Array.from(params.entries())
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) return leftValue.localeCompare(rightValue);
      return leftKey.localeCompare(rightKey);
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function spoonacularRecipesProxy(env) {
  const cache = new Map();

  function recipesMiddleware(request, response, next) {
    const requestUrl = new URL(request.url || '/', 'http://localhost');
    if (requestUrl.pathname !== '/api/recipes') {
      next();
      return;
    }

    handleRecipesRequest(request, response, requestUrl);
  }

  async function handleRecipesRequest(request, response, requestUrl) {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Only GET requests are supported.' });
      return;
    }

    const apiKey = env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      sendJson(response, 503, { error: 'Missing SPOONACULAR_API_KEY in .env.' });
      return;
    }

    const params = new URLSearchParams(requestUrl.searchParams);
    params.delete('apiKey');
    Object.entries(REQUIRED_SEARCH_PARAMS).forEach(([key, value]) => {
      params.set(key, value);
    });

    const cacheKey = stableCacheKey(params);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      response.statusCode = cached.statusCode;
      response.setHeader('Content-Type', cached.contentType);
      response.setHeader('Cache-Control', 'private, max-age=3600');
      response.setHeader('X-RecipeSwipe-Cache', 'HIT');
      response.end(cached.body);
      return;
    }

    params.set('apiKey', apiKey);

    try {
      const upstreamResponse = await fetch(`${SPOONACULAR_API_URL}?${params.toString()}`);
      const body = await upstreamResponse.text();
      const contentType = upstreamResponse.headers.get('content-type') || 'application/json';

      response.statusCode = upstreamResponse.status;
      response.setHeader('Content-Type', contentType);
      response.setHeader('Cache-Control', 'private, max-age=3600');
      response.setHeader('X-RecipeSwipe-Cache', 'MISS');
      response.end(body);

      if (upstreamResponse.ok) {
        cache.set(cacheKey, {
          body,
          contentType,
          createdAt: Date.now(),
          statusCode: upstreamResponse.status,
        });
      }
    } catch (error) {
      sendJson(response, 502, {
        error: error instanceof Error ? error.message : 'Unable to reach Spoonacular.',
      });
    }
  }

  return {
    name: 'recipeswipe-spoonacular-proxy',
    configureServer(server) {
      server.middlewares.use(recipesMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(recipesMiddleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), spoonacularRecipesProxy(env)],
  };
});
