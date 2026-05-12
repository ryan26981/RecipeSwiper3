# RecipeSwipe

A mobile-first recipe discovery MVP built with plain React, Vite, Tailwind CSS,
Spoonacular-backed recipe data, and localStorage persistence.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Spoonacular key to `.env`:

```bash
SPOONACULAR_API_KEY=your_key_here
```

Then open the local URL printed by Vite. Recipe requests go through the local
`/api/recipes` proxy so the Spoonacular key is never bundled into client code.
The proxy caches matching requests for one hour. If the key is missing, quota is
unavailable, the request fails, or Spoonacular returns no matches, the app uses
the built-in mock catalog.
