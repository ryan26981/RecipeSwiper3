import {
  Apple,
  BatteryFull,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  RotateCcw,
  SignalHigh,
  SlidersHorizontal,
  Sprout,
  Sun,
  WifiHigh,
  X,
} from 'lucide-react';
import RecipeCard from './RecipeCard.jsx';
import { getDiscoverRecipes } from '../utils/recipeFilters.js';

const ACTION_ICONS = {
  skip: X,
  save: Heart,
  details: Apple,
};

const ACTION_STYLES = {
  skip: 'text-[#ff5a43] hover:text-[#f04a34]',
  save: 'text-[#ff5a43] hover:text-[#f04a34]',
  details: 'h-20 w-20 text-[#339218] hover:text-[#2b8415]',
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

function StatusBar() {
  return (
    <div className="flex h-9 items-center justify-between px-4 text-[#050814]">
      <span className="text-lg font-black leading-none">9:41</span>
      <div className="flex items-center gap-2">
        <SignalHigh className="h-5 w-5 stroke-[3]" aria-hidden="true" />
        <WifiHigh className="h-5 w-5 stroke-[3]" aria-hidden="true" />
        <BatteryFull className="h-6 w-6 stroke-[2.7]" aria-hidden="true" />
      </div>
    </div>
  );
}

function RecipeActionButton({ type, label, onClick }) {
  const Icon = ACTION_ICONS[type] || Apple;
  const isDetails = type === 'details';

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border border-white/80 bg-white/92 text-sm font-black shadow-action backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${ACTION_STYLES[type]}`}
    >
      <Icon className={isDetails ? 'h-10 w-10 stroke-[2]' : 'h-9 w-9 stroke-[2.5]'} aria-hidden="true" />
      {isDetails && <span className="mt-0.5 text-sm leading-none">{label}</span>}
    </button>
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

function prioritizeReferenceRecipe(recipes) {
  const referenceIndex = recipes.findIndex((recipe) => recipe.id === 'greek-chicken-pita');
  if (referenceIndex <= 0) return recipes;

  return [
    recipes[referenceIndex],
    ...recipes.slice(0, referenceIndex),
    ...recipes.slice(referenceIndex + 1),
  ];
}

function SmartChip({ chip }) {
  const Icon = chip.icon;
  const style = CHIP_STYLES[chip.tone] || CHIP_STYLES.green;
  const isBalancedChip = chip.tone === 'coral';

  return (
    <span
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-[20px] border px-3 text-[0.72rem] font-bold shadow-[0_16px_38px_rgba(15,23,42,0.08)] backdrop-blur-xl min-[380px]:h-12 min-[380px]:rounded-[22px] min-[380px]:px-3.5 min-[380px]:text-xs sm:h-14 sm:gap-3 sm:rounded-[24px] sm:px-5 sm:text-sm ${style.shell}`}
    >
      <Icon className={`h-4 w-4 shrink-0 stroke-[2.4] sm:h-5 sm:w-5 ${style.icon}`} aria-hidden="true" />
      {isBalancedChip ? (
        <span className="max-w-[4.7rem] whitespace-normal leading-tight">{chip.label}</span>
      ) : (
        <span className="whitespace-nowrap">{chip.label}</span>
      )}
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
  const discoverRecipes = prioritizeReferenceRecipe(getDiscoverRecipes(recipes, profile));
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
  const initials = profile.name.slice(0, 2).toUpperCase();
  const greetingName = profile.name.toLowerCase() === 'me' ? 'Alex' : profile.name;

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden px-4 pb-36 pt-2 sm:px-5">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#dff1f0]/70 blur-3xl" />
        <div className="absolute -right-24 top-48 h-72 w-72 rounded-full bg-[#ffe4dc]/80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,247,244,0.96)_44%,#f7f7f4_100%)]" />
      </div>

      <StatusBar />

      <header className="relative z-10 mt-5 flex w-full items-start">
        <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
          <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#d6eb12] text-lg font-black leading-none text-[#071124] shadow-[0_16px_38px_rgba(255,91,65,0.18)] min-[380px]:h-16 min-[380px]:w-16 min-[380px]:text-xl sm:h-[76px] sm:w-[76px] sm:text-[1.45rem]">
            {initials}
            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-white bg-[#ff5a43] sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate pt-1 text-sm font-bold text-[#a2a8bb] sm:pt-2 sm:text-base">
              Good morning, {greetingName}!
            </p>
            <h1 className="mt-1 max-w-[8.9em] text-[1.65rem] font-black leading-[0.95] text-[#071124] min-[380px]:text-[1.9rem] sm:text-[2.35rem]">
              Let's find your
              <span className="relative mt-1 inline-block text-[#ff5a43]">
                next favorite
                <span className="absolute -bottom-2 left-2 right-4 h-1 rounded-full bg-[#ff5a43]" />
                <span className="absolute -right-8 top-0 h-1 w-5 rotate-[-48deg] rounded-full bg-[#ff5a43]" />
                <span className="absolute -right-5 top-5 h-1 w-4 rotate-[-18deg] rounded-full bg-[#ff5a43]" />
              </span>
            </h1>
          </div>
        </div>

        <div className="absolute right-0 top-0 flex min-w-[62px] shrink-0 flex-col items-center rounded-[20px] bg-[#fff0ed] px-2 py-2.5 text-center shadow-[0_18px_40px_rgba(255,91,65,0.12)] min-[380px]:min-w-[68px] min-[380px]:rounded-[22px] min-[380px]:px-2.5 min-[380px]:py-3 sm:min-w-[72px] sm:px-3">
          <div className="flex items-center gap-2 text-[#071124]">
            <Flame className="h-5 w-5 fill-[#ff5a43] text-[#ff5a43] min-[380px]:h-6 min-[380px]:w-6" aria-hidden="true" />
            <span className="text-xl font-black leading-none min-[380px]:text-2xl">{discoverRecipes.length}</span>
          </div>
          <p className="mt-1 text-[0.58rem] font-bold uppercase leading-none text-[#cf4b34] min-[380px]:text-[0.68rem]">
            Stack left
          </p>
        </div>
      </header>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:mt-7 sm:gap-3 sm:px-5">
        {smartChips.map((chip) => (
          <SmartChip key={chip.label} chip={chip} />
        ))}
      </div>

      <div className="relative mt-6 w-full sm:mt-7">
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

      <div className="z-10 mt-8 flex w-full items-center justify-center gap-7 sm:gap-10">
        <RecipeActionButton
          type="skip"
          label="Skip"
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
