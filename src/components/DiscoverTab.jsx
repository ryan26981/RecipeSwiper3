import { Bookmark, Info, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import RecipeCard from './RecipeCard.jsx';
import { getDiscoverRecipes } from '../utils/recipeFilters.js';

const ACTION_ICONS = {
  skip: X,
  save: Bookmark,
  details: Info,
};

function RecipeActionButton({ type, label, onClick, primary = false }) {
  const Icon = ACTION_ICONS[type] || Info;

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group flex h-16 items-center justify-center gap-2 rounded-xl border text-sm font-black shadow-action transition duration-200 active:scale-[0.97] ${
        primary
          ? 'action-pop border-emerald-800 bg-emerald-950 px-5 text-white hover:bg-emerald-900'
          : 'border-white/80 bg-white/75 px-4 text-slate-700 backdrop-blur-xl hover:bg-white hover:text-slate-950'
      }`}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
      <span className={primary ? 'block' : 'hidden sm:block'}>{label}</span>
    </button>
  );
}

function getSmartChips(recipe, profile) {
  const goal =
    profile.preferences.healthGoal === 'Balanced'
      ? 'Balanced picks'
      : `${profile.preferences.healthGoal} picks`;

  return [goal, recipe.cuisine, recipe.mealType, recipe.tags[0]]
    .filter(Boolean)
    .slice(0, 4);
}

export default function DiscoverTab({
  recipes,
  profile,
  onSaveRecipe,
  onHideRecipe,
  onOpenDetails,
  onResetHidden,
  onGoToPreferences,
}) {
  const discoverRecipes = getDiscoverRecipes(recipes, profile);
  const activeRecipe = discoverRecipes[0];

  if (!activeRecipe) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-100px)] max-w-xl flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-6 text-center">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)]" />
        <div className="w-full rounded-xl border border-white/80 bg-white/80 px-6 py-8 shadow-glass backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-900/70">
            Discover
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">No recipes left</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Saved and hidden recipes are removed from this stack for {profile.name}. Filters can
            also narrow the list.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onResetHidden}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-5 py-3 text-sm font-black text-white shadow-action transition hover:bg-emerald-900"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset hidden recipes
            </button>
            <button
              type="button"
              onClick={onGoToPreferences}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:border-slate-300"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Adjust filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  const smartChips = getSmartChips(activeRecipe, profile);
  const initials = profile.name.slice(0, 2).toUpperCase();

  return (
    <div className="relative isolate mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-6xl flex-col items-center overflow-hidden px-4 pb-28 pt-4 sm:pt-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          src={activeRecipe.images[0]}
          alt=""
          aria-hidden="true"
          className="absolute inset-x-[-15%] top-[-18rem] h-[44rem] w-[130%] object-cover opacity-20 blur-3xl saturate-150 sm:top-[-23rem] sm:h-[58rem]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(246,247,243,0.9)_48%,rgba(246,247,243,1)_100%)]" />
      </div>

      <header className="z-10 mb-4 flex w-full max-w-[450px] items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-sm font-black tracking-[0.08em] text-white shadow-action">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              For {profile.name}
            </p>
            <h1 className="text-3xl font-black leading-none text-slate-950">Discover</h1>
          </div>
        </div>

        <div className="rounded-lg border border-white/80 bg-white/75 px-3.5 py-2 text-right shadow-sm backdrop-blur-xl">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-400">
            Stack
          </p>
          <p className="text-sm font-black text-slate-950">{discoverRecipes.length} left</p>
        </div>
      </header>

      <div className="mb-4 flex w-full max-w-[450px] gap-2 overflow-x-auto pb-1">
        {smartChips.map((chip) => (
          <span
            key={chip}
            className="whitespace-nowrap rounded-lg border border-white/80 bg-white/[0.65] px-3 py-2 text-xs font-black text-slate-700 shadow-sm backdrop-blur-xl"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-[450px]">
        <div className="absolute inset-x-8 top-5 aspect-[4/5] rotate-[3deg] rounded-[24px] bg-white/40 shadow-soft backdrop-blur-xl" />
        <div className="absolute inset-x-12 top-9 aspect-[4/5] rotate-[-2deg] rounded-[24px] bg-white/30 shadow-soft backdrop-blur-xl" />
        <RecipeCard
          key={activeRecipe.id}
          recipe={activeRecipe}
          cardStats={profile.preferences.cardStats}
          onSave={onSaveRecipe}
          onHide={onHideRecipe}
          onOpenDetails={onOpenDetails}
        />
      </div>

      <div className="mt-5 grid w-full max-w-[450px] grid-cols-[1fr_1.18fr_1fr] gap-3">
        <RecipeActionButton
          type="skip"
          label="Skip"
          onClick={() => onHideRecipe(activeRecipe.id)}
        />
        <RecipeActionButton
          type="save"
          label="Save"
          primary
          onClick={() => onSaveRecipe(activeRecipe.id)}
        />
        <RecipeActionButton
          type="details"
          label="Details"
          onClick={() => onOpenDetails(activeRecipe)}
        />
      </div>
    </div>
  );
}
