import { useMemo, useState } from 'react';
import { BookmarkCheck, Heart, Search, SlidersHorizontal } from 'lucide-react';
import SavedRecipeRow from './SavedRecipeRow.jsx';
import { AppSurface, FieldShell } from './ui.jsx';

const SORT_OPTIONS = ['Newest', 'Fastest', 'Lowest calorie', 'Highest protein', 'Favorites'];

function createSearchText(recipe, folder) {
  return [
    recipe.name,
    recipe.cuisine,
    recipe.mealType,
    folder,
    recipe.tags.join(' '),
    recipe.ingredients.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export default function RecipeLibraryTab({
  profile,
  recipes,
  onOpenDetails,
  onToggleFavorite,
  onDeleteSavedRecipe,
  onMoveRecipeToFolder,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const savedRecipes = useMemo(() => {
    const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
    const term = searchTerm.trim().toLowerCase();

    return profile.savedRecipes
      .map((savedRecipe) => ({
        ...savedRecipe,
        recipe: recipeById.get(savedRecipe.recipeId),
      }))
      .filter((savedRecipe) => savedRecipe.recipe)
      .filter((savedRecipe) => {
        if (!term) return true;
        return createSearchText(savedRecipe.recipe, savedRecipe.folder).includes(term);
      })
      .sort((first, second) => {
        if (sortBy === 'Fastest') return first.recipe.timeMinutes - second.recipe.timeMinutes;
        if (sortBy === 'Lowest calorie') return first.recipe.calories - second.recipe.calories;
        if (sortBy === 'Highest protein') return second.recipe.protein - first.recipe.protein;
        if (sortBy === 'Favorites') {
          return Number(second.favorite) - Number(first.favorite) || second.savedAt - first.savedAt;
        }
        return second.savedAt - first.savedAt;
      });
  }, [profile.savedRecipes, recipes, searchTerm, sortBy]);

  const favoriteCount = profile.savedRecipes.filter((savedRecipe) => savedRecipe.favorite).length;

  return (
    <AppSurface
      eyebrow={profile.name}
      title="Saved"
      meta={`${profile.savedRecipes.length} recipes saved`}
      actions={
        <div className="hidden grid-cols-2 gap-2 sm:grid">
          <LibraryMetric icon={BookmarkCheck} label="Saved" value={profile.savedRecipes.length} />
          <LibraryMetric icon={Heart} label="Favorites" value={favoriteCount} />
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <FieldShell icon={Search}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search saved recipes"
            className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </FieldShell>
        <FieldShell icon={SlidersHorizontal}>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FieldShell>
      </div>

      <div className="mt-5 grid gap-3">
        {savedRecipes.map((savedRecipe) => (
          <SavedRecipeRow
            key={savedRecipe.recipeId}
            savedRecipe={savedRecipe}
            folders={profile.folders}
            onOpenDetails={onOpenDetails}
            onToggleFavorite={onToggleFavorite}
            onMoveToFolder={onMoveRecipeToFolder}
            onDeleteRecipe={onDeleteSavedRecipe}
          />
        ))}
      </div>

      {!savedRecipes.length && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-950 text-white">
            <BookmarkCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-950">No saved recipes found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Saved recipes appear here for {profile.name}. Search, folders, favorites, and sorting
            all stay separate for each profile.
          </p>
        </div>
      )}
    </AppSurface>
  );
}

function LibraryMetric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
      <div className="flex items-center justify-end gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1 text-lg font-black leading-none text-slate-950">{value}</p>
    </div>
  );
}
