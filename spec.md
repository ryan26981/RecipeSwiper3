You are helping me build my first serious web app.

I am new to React and Tailwind, but I do not want an oversimplified toy app. Build a real working MVP that is clean, polished, and beginner-readable.

Use:
- Plain React with Vite
- JavaScript, not TypeScript
- Tailwind CSS
- localStorage for persistence
- Mock recipe data for now

Do NOT add:
- Backend
- Authentication
- Database
- Payments
- Real scraping
- AI/API calls yet
- TypeScript
- Over-engineered architecture

Before coding:
1. Create a short implementation plan.
2. Explain the file structure.
3. Build the app in small, clean components.
4. Add comments where the logic is important.
5. After coding, explain exactly how to run the app locally.

App name:
RecipeSwipe

Product vision:
RecipeSwipe is a premium, clean, mobile-first recipe discovery and personal recipe-library app.

The user swipes through recipe cards to discover meals they may want to cook. When they like something, they save it to their personal recipe library so they can easily find it again later.

The app should feel:
- Premium
- Clean
- Minimal
- Smooth
- Image-heavy
- Useful to the average person

The app should NOT feel:
- Goofy
- Cartoonish
- Joke-heavy
- Fitness-only
- Chef-only
- Meal-prep-only
- Overly complicated

Target user:
The target user is the average person who wants to discover new recipes and save the ones they like. Do not make the app specifically for gym people, weight loss users, expert cooks, or budget meal preppers. It should feel broadly useful.

Recommendation logic:
For version 1, recommendations should be based on explicit user preferences and filters.
Do not build complex swiping-behavior recommendation logic yet.
Swiping behavior should only save, hide, or open details.

Main layout:
Use a bottom navigation with 3 tabs:
1. Preferences
2. Discover
3. Recipe Library

Default opening tab:
Discover

--------------------------------------------------
DISCOVER TAB
--------------------------------------------------

Show one recipe card at a time.

Swipe actions:
- Swipe right = save recipe and add it to the top of Recipe Library
- Swipe left = hide recipe permanently for that profile
- Swipe up = open the recipe detail sheet
- Tap right side of image = next photo
- Tap left side of image = previous photo

Also include desktop-friendly buttons below the card:
- Nope
- Save
- Details

Recipe card style:
- Similar to a modern dating app card interface (Should look similar to tinders UI)
- Large image-based card
- Rounded corners
- Smooth animations
- Bottom gradient overlay
- Minimal text
- Premium, clean visual design

Default visible card information:
Only show 3 pieces of information by default:
1. Meal name in bold
2. Time to cook directly below the name
3. One optional stat, defaulting to Complexity

Important card rules:
- Meal name is locked and always visible
- Time to cook is locked and always visible
- Complexity is NOT locked
- Complexity is only the default optional stat and can be replaced in Advanced Settings

Optional card stats:
The user can choose optional visible stats from:
- Complexity
- Calories
- Protein
- Price level
- Cuisine
- Meal type
- Health score
- Cleanup level
- Number of ingredients
- Diet tags

Advanced card display rules:
- Default total visible fields: 3
- Maximum total visible fields: 5
- Name and time are always included
- User can choose up to 3 extra optional fields
- Show a counter like “3/5 card fields used”
- Prevent the card from ever showing more than 5 total pieces of information

Photo behavior:
- Each recipe can have multiple photos
- Add thin progress bars at the top of the card showing how many photos exist
- Tap right side of image to move to next photo
- Tap left side of image to move to previous photo
- If only one photo exists, hide or simplify the progress bars

Empty state:
- If the user reaches the end of available recipes, show a clean empty state
- Include a reset option that lets the user clear hidden recipes for the current profile

--------------------------------------------------
RECIPE DETAIL SHEET
--------------------------------------------------

The recipe detail sheet opens from:
- Swipe up
- Details button
- Info button if you add one

The detail sheet should feel like a premium mobile bottom sheet.

It should have:
- Close button
- Smooth open/close animation
- Top tabs/buttons so the user does not need to scroll forever

Tabs:
1. Nutrition
2. Ingredients
3. Recipe

Nutrition tab shows:
- Calories
- Protein
- Carbs
- Fat
- Serving size
- Health score
- Price level
- Cleanup level
- Complexity
- Time to cook

Ingredients tab shows:
- Full ingredient list
- Clean, scannable formatting

Recipe tab shows:
- Step-by-step cooking instructions
- Source name
- Source link if available

--------------------------------------------------
PREFERENCES TAB
--------------------------------------------------

At the top, include a profile switcher.

Profiles:
- Users can create and switch between profiles
- Each profile has its own:
  - Preferences
  - Saved recipes
  - Hidden recipes
  - Favorites
  - Folders
  - Card display settings

Example profiles:
- Me
- Partner
- Family
- Cutting
- Bulking
- Vegetarian

Store all profile data in localStorage.

Preference filters:
Include filters for:
- Health goal: Balanced, High Protein, Low Calorie, Vegetarian, Bulking, Cutting
- Complexity: Easy, Medium, Difficult
- Price: Cheap, Normal, Premium
- Cook time: Under 15 min, Under 30 min, Under 60 min
- Calories
- Cuisine: American, Mexican, Italian, Asian, Mediterranean, Indian
- Meal type: Breakfast, Lunch, Dinner, Snack, Dessert
- Diet restrictions: Vegan, Vegetarian, Gluten-Free, Dairy-Free, Nut-Free
- Disliked ingredients
- Favorite ingredients
- Equipment: Microwave, Air Fryer, Oven, Stovetop, Blender
- Spice tolerance: Mild, Medium, Spicy
- Cleanup level: One-pan, Normal, Lots of dishes

Advanced Settings:
Add an Advanced Settings section inside Preferences.

Advanced Settings controls which optional stats appear on the recipe card.

Advanced Settings requirements:
- Name and time are locked and always visible
- User can select optional card stats
- Complexity should be selected by default
- User can increase visible card info up to 5 total fields
- Show “3/5 card fields used” or similar
- Prevent selecting too many fields
- Keep this UI simple and understandable

--------------------------------------------------
RECIPE LIBRARY TAB
--------------------------------------------------

This is one of the most important parts of the app.

The Recipe Library should feel like the user’s go-to place to retrieve saved recipes.

Saved recipes:
- Show saved recipes in clean list view
- Most recently saved recipes appear at the top
- Saved recipes should persist after refresh
- Each profile should have a separate recipe library

Each saved recipe row should show:
- Small recipe image
- Meal name
- Time
- One or two small metadata tags
- Favorite button
- Folder tag
- Delete button

User actions:
- Search saved recipes
- Favorite/unfavorite a recipe
- Delete saved recipe
- Move recipe to folder
- Open full recipe details
- Sort saved recipes by:
  - Newest
  - Fastest
  - Lowest calorie
  - Highest protein
  - Favorites

Default folders:
- Weeknight Dinners
- High Protein
- Cheap Meals
- Meal Prep
- Comfort Food
- Want to Try

Search:
- Add a search bar at the top of Recipe Library
- Search should match recipe name, cuisine, tags, ingredients, and folder name
- This should make it easy for users to find recipes they saved before

--------------------------------------------------
DATA MODEL
--------------------------------------------------

Create mock recipe data with at least 12 recipes.

Each recipe should include:
- id
- name
- images array
- complexity
- timeMinutes
- calories
- protein
- carbs
- fat
- priceLevel
- cuisine
- mealType
- healthScore
- cleanupLevel
- servingSize
- ingredients
- instructions
- tags
- sourceName
- sourceUrl

Recipe examples:
- Chicken Burrito Bowl
- Spicy Ramen
- Greek Chicken Pita
- Turkey Chili
- Salmon Rice Bowl
- Pesto Pasta
- Breakfast Tacos
- Teriyaki Chicken Bowl
- Veggie Stir Fry
- Protein Pancakes
- Mediterranean Wrap
- Buffalo Chicken Salad

Important behavior:
- Hidden recipes should not reappear for that profile
- Saved recipes should be removed from the Discover stack for that profile
- Each profile should have separate saved recipes and hidden recipes
- Saved recipes should persist after refreshing the page
- Profile settings should persist after refreshing the page
- Preferences should affect which recipes appear in Discover

--------------------------------------------------
CODE ORGANIZATION
--------------------------------------------------

Use clean components.

Suggested components:
- App
- BottomNav
- ProfileSwitcher
- PreferencesTab
- DiscoverTab
- RecipeCard
- RecipeDetailSheet
- RecipeLibraryTab
- AdvancedSettings

Suggested helper files:
- mockRecipes.js
- storage.js
- constants.js

Keep code readable.
Avoid advanced React patterns unless needed.
Use simple state management with useState and useEffect.
Add comments explaining important logic.

Make the app actually functional, not jureadst a static UI.

After building, tell me:
1. What files were created
2. How to install dependencies
3. How to run the app locally
4. What features are complete
5. What I should build next