# RecipeSwipe Handoff

This document is meant to give another coding assistant enough context to work on the RecipeSwipe app without needing the original conversation.

## App Summary

RecipeSwipe is a mobile-first recipe discovery and personal recipe library app. The product idea is similar to a polished dating-app-style recipe browser:

- Users swipe through recipe cards.
- Swiping right saves a recipe.
- Swiping left hides a recipe.
- Swiping up opens a recipe detail sheet.
- Saved recipes live in a profile-specific recipe library.
- Profiles have separate preferences, saved recipes, hidden recipes, folders, suggestions, and card display settings.

The app is intentionally an MVP, but it should feel like a serious product rather than a toy. It uses localStorage for persistence and currently supports both built-in mock recipes and live Spoonacular-backed recipe search through a local Vite proxy.

## Tech Stack

- Vite
- React 18
- JavaScript, not TypeScript
- Tailwind CSS
- lucide-react icons
- localStorage persistence
- Optional Spoonacular API key through `.env`

Do not add backend infrastructure, auth, database, payments, TypeScript, or heavy architecture unless the user explicitly asks.

## How To Run

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Optional: add a Spoonacular key:

```bash
SPOONACULAR_API_KEY=your_key_here
```

Run the app:

```bash
npm run dev
```

Build check:

```bash
npm run build
```

If the Spoonacular key is missing, quota is exhausted, the request fails, or no results are returned, the app falls back to the built-in mock catalog.

## Important Files

### Root

- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite config plus the local `/api/recipes` Spoonacular proxy.
- `.env.example`: documents the required Spoonacular environment variable.
- `README.md`: basic run instructions.
- `spec.md`: original product/MVP spec.

### App Entry

- `src/main.jsx`: React entry point.
- `src/App.jsx`: top-level state, active tab, selected recipe detail sheet, profile mutations, recipe catalog loading, and persistence.
- `src/index.css`: global Tailwind and visual styling.

### Data

- `src/data/mockRecipes.js`: built-in mock catalog used as fallback.
- `src/data/spoonacularRecipes.js`: builds Spoonacular query params from user preferences, fetches `/api/recipes`, normalizes Spoonacular data into the app recipe shape, and falls back cleanly.

### Utilities

- `src/utils/constants.js`: tabs, default folders, preference options, card stat options, default preferences.
- `src/utils/storage.js`: localStorage key, default profile creation, state normalization, load/save helpers.
- `src/utils/recipeFilters.js`: preference matching, discover stack filtering, ingredient text parsing, and card stat formatting.

### Components

- `src/components/BottomNav.jsx`: bottom tab navigation.
- `src/components/DiscoverTab.jsx`: discover screen, smart chips, current active recipe, empty state.
- `src/components/RecipeCard.jsx`: swipe/tap behavior, recipe image card, card highlights.
- `src/components/RecipeDetailSheet.jsx`: modal/bottom sheet with Nutrition, Ingredients, and Recipe tabs.
- `src/components/PreferencesTab.jsx`: profile selector/creator and preference controls.
- `src/components/RecipeLibraryTab.jsx`: saved recipes, search, filters, weekly planner, cook tonight suggestion, grocery summary strip.
- `src/components/AdvancedSettings.jsx`: older/alternate advanced card settings component. Current preferences UI mostly handles card stats inline.
- `src/components/SavedRecipeRow.jsx`: older/alternate saved recipe row component. Current library uses row components defined inside `RecipeLibraryTab.jsx`.
- `src/components/ProfileSwitcher.jsx`: older/alternate profile switcher component. Current preferences UI uses an inline mini form.
- `src/components/ui.jsx`: small UI helper utilities such as `cx`.

## Current App Behavior

### Top-Level State

`App.jsx` owns:

- `appData`: the full profile tree loaded from localStorage.
- `activeTab`: one of `preferences`, `discover`, or `library`.
- `selectedRecipe`: recipe shown in the detail sheet.
- `recipes`: active catalog, merged from Spoonacular and mock recipes.
- `recipeCatalogStatus`: loading/refreshing/error/ready status.
- `recipeCatalogMessage`: user-facing status/fallback message.

`appData` is persisted on every change using `saveAppData(appData)`.

### Profile State Shape

Profiles are created in `src/utils/storage.js`.

Each profile has:

```js
{
  id,
  name,
  preferences,
  savedRecipes,
  hiddenRecipeIds,
  dismissedSuggestionIds,
  folders
}
```

Saved recipes are stored as lightweight metadata, not full recipe objects:

```js
{
  recipeId,
  savedAt,
  favorite,
  folder,
  plannedDay
}
```

The actual recipe object is resolved from the active `recipes` catalog when rendering the library.

### Recipe Shape

Both mock and Spoonacular-normalized recipes should conform to:

```js
{
  id,
  name,
  images,
  complexity,
  timeMinutes,
  calories,
  protein,
  carbs,
  fat,
  priceLevel,
  cuisine,
  mealType,
  healthScore,
  cleanupLevel,
  servingSize,
  ingredients,
  instructions,
  tags,
  sourceName,
  sourceUrl,
  equipment,
  spiceLevel
}
```

### Discover

`getDiscoverRecipes(recipes, profile)` filters out:

- recipes already saved for the active profile
- recipes hidden for the active profile
- recipes that do not match the active profile preferences

`RecipeCard.jsx` handles pointer gestures:

- tap left/right side of image: previous/next photo
- horizontal drag right over threshold: save
- horizontal drag left over threshold: hide
- upward drag over threshold: open details

There are also desktop-friendly buttons below the card.

### Preferences

The preferences screen lets users configure:

- health goal
- complexity
- price
- cook time
- cuisine
- restrictions
- max calories
- disliked ingredients
- favorite ingredients
- meal types
- equipment
- spice tolerance
- cleanup level
- recipe card optional stats
- profile switching and profile creation

Preferences directly affect both Spoonacular requests and local filtering.

### Recipe Library

The library currently includes:

- search saved recipes
- filters: All, Planned, Want to Try, Favorites
- a "Cook Tonight" suggestion card
- a weekly planning strip
- a grocery summary strip
- saved recipe rows with open details, plan, move, favorite, and remove actions

Important implementation detail: if a profile has no saved recipes, `RecipeLibraryTab.jsx` renders several showcase/fallback rows from the recipe catalog. These are marked with `isShowcase`. Clicking Save/Favorite/Plan on showcase rows persists them.

## Spoonacular Proxy

The app does not call Spoonacular directly from browser code. `vite.config.js` defines a local proxy at:

```txt
/api/recipes
```

The proxy:

- reads `SPOONACULAR_API_KEY` from `.env` or process env
- enforces required search params
- strips any client-provided `apiKey`
- caches successful responses in memory for one hour
- returns JSON errors for missing key, unsupported methods, or upstream failure

`src/data/spoonacularRecipes.js` calls this proxy and normalizes results.

## Local Persistence

Data is stored under:

```txt
recipeswipe-app-state-v1
```

in browser localStorage.

The loader normalizes older saved data so missing fields do not crash the app. If changing profile or saved recipe shape, update `normalizeProfile` in `src/utils/storage.js`.

## Design Direction

Keep the app:

- premium
- clean
- mobile-first
- image-heavy
- broadly useful to average people
- practical and usable

Avoid making it:

- goofy
- cartoonish
- fitness-only
- chef-only
- meal-prep-only
- over-engineered

The UI already uses rounded cards, strong food imagery, warm coral/green accents, and compact mobile layouts. Continue matching the current visual language rather than introducing a completely different design system.

## Known Rough Edges

These are worth checking before or during future work:

- `RecipeCard.jsx` computes selected optional card stats but currently renders mostly fixed stats: time, complexity, and first tag. If user-selected card stats should fully control the visible badges, this needs tightening.
- The original spec asked for a visible counter such as `3/5 card fields used`; the current Preferences screen says "Pick up to three extra fields" but does not show the exact counter.
- `RecipeLibraryTab.jsx` has planner and grocery summary UI, but no full grocery list view yet.
- `WEEK_DAYS` in `RecipeLibraryTab.jsx` is hardcoded with dates. It should eventually derive dates from the current week.
- "AI Pick" text appears in the Cook Tonight card, but there is no AI. It is currently a simple heuristic suggestion. Consider renaming unless actual AI is added.
- Some older components still exist but are not central to the current screen implementation: `AdvancedSettings.jsx`, `SavedRecipeRow.jsx`, and `ProfileSwitcher.jsx`.
- The repo currently has modified files. Do not reset or revert unrelated changes without user permission.

## Best Next Feature

The best next product step is a real grocery list flow inside the Recipe Library.

Why: the app already supports saving and planning meals. A grocery list closes the loop from discovery to cooking:

```txt
Discover -> Save -> Plan -> Grocery List -> Cook
```

Suggested grocery list implementation:

1. Add grocery list state per profile or derive it from planned recipes plus persisted checked item IDs.
2. Generate ingredients from recipes with `plannedDay`.
3. Group or dedupe ingredient strings.
4. Show checkboxes for each grocery item.
5. Persist checked items in localStorage.
6. Add "Clear checked" action.
7. Add a simple empty state when no meals are planned.
8. Let users tap an ingredient or recipe group to open the related recipe detail sheet.

Keep this simple. Do not build complex unit conversion yet.

## Suggested Implementation Pattern For Next Work

If adding grocery list:

- Add `checkedGroceryItems` or similar to each profile in `createDefaultProfile`.
- Normalize it in `normalizeProfile`.
- Add mutation handlers in `App.jsx`.
- Add UI in `RecipeLibraryTab.jsx`, probably near the existing `GroceryStrip`.
- Prefer derived grocery items from `plannedRows`, not a separate duplicated grocery database.
- Use stable grocery item keys based on profile, recipe IDs, and normalized ingredient text.

Example profile addition:

```js
checkedGroceryItems: []
```

Example derived grocery item:

```js
{
  id: `${recipeId}:${normalizedIngredient}`,
  ingredient,
  recipeIds: [recipeId],
  recipeNames: [recipe.name],
  checked: profile.checkedGroceryItems.includes(id)
}
```

## Development Guidelines

- Use plain React state and props.
- Keep components beginner-readable.
- Prefer local helper functions over clever abstractions.
- Use existing constants and filtering helpers.
- Keep changes scoped.
- Preserve localStorage compatibility through normalization.
- Run `npm run build` before considering work complete.
- Do not introduce network APIs beyond the current Spoonacular proxy unless requested.
- Do not add TypeScript.
- Do not add a backend/database/auth.

## Current Git Status At Time Of Handoff

At the time this file was created, these files were already modified:

- `src/App.jsx`
- `src/components/PreferencesTab.jsx`
- `src/components/RecipeLibraryTab.jsx`
- Vite log files

Treat these as user/workspace changes. Do not revert them unless explicitly instructed.
