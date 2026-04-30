import {
  Dumbbell,
  Flame,
  Heart,
  Info,
  Leaf,
  RotateCcw,
  SlidersHorizontal,
  Sprout,
  Sun,
  X,
} from 'lucide-react';
import RecipeCard from './RecipeCard.jsx';
import { getDiscoverRecipes } from '../utils/recipeFilters.js';

const ACTION_ICONS = {
  skip: X,
  save: Heart,
  details: Info,
};

const ACTION_STYLES = {
  skip: 'text-[#ff5a43] hover:border-[#ffd1c7] hover:bg-[#fff8f5]',
  save: 'text-[#ff5a43] hover:border-[#ffd1c7] hover:bg-[#fff8f5]',
  details: 'text-[#2f8f19] hover:border-[#cfe9c4] hover:bg-[#f7fbf3]',
};

const CHIP_STYLES = {
  coral: {
    shell: 'border-[#ff684f] bg-[#fff4ef] text-[#ff5a43]',
    icon: 'text-[#ff5a43]',
  },
  green: {
    shell: 'border-white bg-white/86 text-[#0a1328]',
    icon: 'text-[#55a630]',
  },
  amber: {
    shell: 'border-white bg-white/86 text-[#0a1328]',
    icon: 'text-[#f8b315]',
  },
  purple: {
    shell: 'border-white bg-white/86 text-[#0a1328]',
    icon: 'text-[#842cf2]',
  },
};

function RecipeActionButton({ type, label, onClick }) {
  const Icon = ACTION_ICONS[type] || Info;

  return (
    <div className="flex min-w-[4.75rem] flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`group flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/95 shadow-action backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 active:scale-[0.96] ${ACTION_STYLES[type]}`}
      >
        <Icon
          className={`h-7 w-7 stroke-[2.4] ${type === 'save' ? 'group-hover:fill-current' : ''}`}
          aria-hidden="true"
        />
      </button>
      <span className="text-[0.66rem] font-black uppercase tracking-[0.12em] text-[#7b8499]">
        {label}
      </span>
    </div>
  );
}

function getSmartChips(recipe, profile) {
  const goal =
    profile.preferences.healthGoal === 'Balanced'
      ? 'Balanced picks'
      : `${profile.preferences.healthGoal} picks`;

  return [
    { label: goal, icon: Leaf, tone: 'coral' },
    { label: recipe.cuisine, icon: Sprout, tone: 'green' },
    { label: recipe.mealType, icon: Sun, tone: 'amber' },
    { label: recipe.tags[0], icon: Dumbbell, tone: 'purple' },
  ]
    .filter((chip) => chip.label)
    .slice(0, 4);
}

function SmartChip({ chip }) {
  const Icon = chip.icon;
  const style = CHIP_STYLES[chip.tone] || CHIP_STYLES.green;

  return (
    <span
      className={`inline-flex h-10 basis-[calc((100%-1rem)/3)] shrink-0 items-center justify-center gap-1.5 rounded-[16px] border px-2.5 text-[0.68rem] font-black shadow-[0_10px_24px_rgba(15,23,42,0.055)] backdrop-blur-xl sm:h-11 sm:gap-2 sm:rounded-[18px] sm:px-3 sm:text-xs ${style.shell}`}
    >
      <Icon className={`h-4 w-4 shrink-0 stroke-[2.3] ${style.icon}`} aria-hidden="true" />
      <span className="min-w-0 truncate whitespace-nowrap">{chip.label}</span>
    </span>
  );
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
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(255,91,65,0.16),transparent_68%)]" />
        <div className="w-full rounded-[28px] border border-white/80 bg-white/84 px-6 py-8 shadow-glass backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff5a43]">
            Discover
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#071124]">No recipes left</h2>
          <p className="mt-3 text-sm leading-6 text-[#7d849b]">
            Saved and hidden recipes are removed from this stack for {profile.name}. Filters can
            also narrow the list.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onResetHidden}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#071124] px-5 py-3 text-sm font-black text-white shadow-action transition hover:bg-[#18213a]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset hidden recipes
            </button>
            <button
              type="button"
              onClick={onGoToPreferences}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#071124] transition hover:border-slate-300"
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

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden px-4 pb-28 pt-5 sm:px-5 sm:pt-7">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#dff1f0]/70 blur-3xl" />
        <div className="absolute -right-24 top-48 h-72 w-72 rounded-full bg-[#ffe4dc]/80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,247,244,0.96)_44%,#f7f7f4_100%)]" />
      </div>

      <header className="relative z-10 flex w-full items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#a1a7b6]">
            Explore recipes
          </p>
          <h1 className="mt-2 max-w-[8.5em] text-[2.05rem] font-black leading-[0.94] tracking-[-0.055em] text-[#071124] min-[380px]:text-[2.35rem] sm:text-[2.85rem]">
            Find your next{' '}
            <span className="relative inline-block text-[#ff5a43]">
              favorite
              <span className="absolute -bottom-1 left-1 right-1 h-1 rounded-full bg-[#ff5a43]/28" />
            </span>
          </h1>
        </div>

        <div className="mt-2 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-[#7b8499] shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <Flame className="h-3.5 w-3.5 fill-[#ff5a43] text-[#ff5a43]" aria-hidden="true" />
          <span className="text-sm font-black leading-none text-[#071124]">{discoverRecipes.length}</span>
          <span className="text-[0.62rem] font-black uppercase tracking-[0.12em]">left</span>
        </div>
      </header>

      <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:mt-6 sm:px-5">
        {smartChips.map((chip) => (
          <SmartChip key={chip.label} chip={chip} />
        ))}
      </div>

      <div className="relative mt-4 w-full sm:mt-5">
        <div className="absolute inset-x-7 -bottom-7 h-28 rotate-[-4deg] rounded-[28px] bg-white/70 shadow-soft" />
        <div className="absolute inset-x-4 -bottom-5 h-28 rotate-[2deg] rounded-[28px] bg-white/86 shadow-soft" />
        <RecipeCard
          key={activeRecipe.id}
          recipe={activeRecipe}
          cardStats={profile.preferences.cardStats}
          onSave={onSaveRecipe}
          onHide={onHideRecipe}
          onOpenDetails={onOpenDetails}
        />
      </div>

      <div className="z-10 mt-5 flex w-full translate-y-6 items-start justify-center gap-5 sm:mt-7 sm:translate-y-0 sm:gap-8">
        <RecipeActionButton
          type="skip"
          label="Reject"
          onClick={() => onHideRecipe(activeRecipe.id)}
        />
        <RecipeActionButton
          type="details"
          label="Nutrition"
          onClick={() => onOpenDetails(activeRecipe)}
        />
        <RecipeActionButton
          type="save"
          label="Save"
          onClick={() => onSaveRecipe(activeRecipe.id)}
        />
      </div>
    </div>
  );
}
