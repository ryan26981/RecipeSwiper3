import { useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Calendar,
  Check,
  ChevronRight,
  Clock3,
  ListFilter,
  MoveHorizontal,
  Search,
  ShoppingBag,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { cx } from './ui.jsx';

const FILTERS = ['All', 'Planned', 'Want to Try', 'Favorites'];
const SHOWCASE_COUNT = 4;
const WEEK_DAYS = [
  { day: 'Mon', full: 'Monday', date: '19' },
  { day: 'Tue', full: 'Tuesday', date: '20' },
  { day: 'Wed', full: 'Wednesday', date: '21', active: true },
  { day: 'Thu', full: 'Thursday', date: '22' },
  { day: 'Fri', full: 'Friday', date: '23' },
  { day: 'Sat', full: 'Saturday', date: '24' },
  { day: 'Sun', full: 'Sunday', date: '25' },
];
const DAY_NAMES = WEEK_DAYS.map((day) => day.full);

function createSearchText(recipe, folder, displayName) {
  return [
    displayName || recipe.name,
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

function makeFallbackSaved(recipe, index) {
  const folders = ['Weeknight Dinners', 'High Protein', 'Meal Prep', 'Comfort Food'];
  return {
    recipeId: recipe.id,
    savedAt: Date.now() - index * 1000,
    favorite: true,
    folder: folders[index] || 'Want to Try',
    recipe,
    plannedDay: '',
    cookedCount: 0,
    displayName: recipe.name,
    isShowcase: true,
  };
}

function getRows(profile, recipes) {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const savedRows = profile.savedRecipes
    .map((savedRecipe) => ({
      ...savedRecipe,
      recipe: recipeById.get(savedRecipe.recipeId),
      plannedDay: savedRecipe.plannedDay || '',
      cookedCount: savedRecipe.cookedCount || 0,
    }))
    .filter((savedRecipe) => savedRecipe.recipe);

  if (savedRows.length) return savedRows;

  return recipes.slice(0, SHOWCASE_COUNT)
    .map(makeFallbackSaved);
}

function getIngredientMatch(recipe) {
  const matchedCount = Math.max(1, Math.min(recipe.ingredients.length, Math.ceil(recipe.ingredients.length * 0.75)));
  return `${matchedCount}/${recipe.ingredients.length}`;
}

function getNextPlanningDay(rows) {
  const plannedDays = new Set(rows.map((row) => row.plannedDay).filter(Boolean));
  return DAY_NAMES.find((day) => !plannedDays.has(day)) || DAY_NAMES[0];
}

function getFollowingDay(currentDay) {
  const currentIndex = DAY_NAMES.indexOf(currentDay);
  return DAY_NAMES[(currentIndex + 1) % DAY_NAMES.length] || DAY_NAMES[0];
}

function getSuggestion(recipes, profile) {
  if (!recipes.length) {
    return null;
  }

  const dismissedIds = new Set(profile.dismissedSuggestionIds || []);
  const plannedIds = new Set(
    profile.savedRecipes
      .filter((savedRecipe) => savedRecipe.plannedDay)
      .map((savedRecipe) => savedRecipe.recipeId),
  );
  const recipe =
    recipes.find((item) => !dismissedIds.has(item.id) && !plannedIds.has(item.id) && item.cuisine === 'Mediterranean') ||
    recipes.find((item) => !dismissedIds.has(item.id) && !plannedIds.has(item.id)) ||
    recipes[0];

  if (!recipe) return null;

  return {
    ...recipe,
    displayName: recipe.name,
    ingredientMatch: getIngredientMatch(recipe),
  };
}

function getGrocerySummary(plannedRows) {
  const ingredients = new Set();
  plannedRows.forEach((row) => {
    row.recipe.ingredients.forEach((ingredient) => ingredients.add(ingredient.toLowerCase()));
  });

  return {
    ingredientCount: ingredients.size,
    mealCount: plannedRows.length,
  };
}

export default function RecipeLibraryTab({
  profile,
  recipes,
  onOpenDetails,
  onDeleteSavedRecipe,
  onPlanRecipe,
  onDismissSuggestion,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const plannerRef = useRef(null);
  const allRows = useMemo(() => getRows(profile, recipes), [profile, recipes]);
  const persistedRows = useMemo(
    () => allRows.filter((savedRecipe) => !savedRecipe.isShowcase),
    [allRows],
  );
  const plannedRows = useMemo(
    () => allRows.filter((savedRecipe) => savedRecipe.plannedDay),
    [allRows],
  );
  const grocerySummary = useMemo(() => getGrocerySummary(plannedRows), [plannedRows]);
  const suggestion = useMemo(() => getSuggestion(recipes, profile), [profile, recipes]);

  const savedRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allRows
      .filter((savedRecipe) => {
        if (activeFilter === 'Planned') return Boolean(savedRecipe.plannedDay);
        if (activeFilter === 'Want to Try') return savedRecipe.folder === 'Want to Try';
        if (activeFilter === 'Favorites') return savedRecipe.favorite;
        return true;
      })
      .filter((savedRecipe) => {
        if (!term) return true;
        return createSearchText(
          savedRecipe.recipe,
          savedRecipe.folder,
          savedRecipe.displayName,
        ).includes(term);
      });
  }, [activeFilter, allRows, searchTerm]);

  function openRecipe(recipe) {
    onOpenDetails(recipe);
  }

  function handleSavedClick(savedRecipe) {
    if (savedRecipe.isShowcase) {
      onPlanRecipe(savedRecipe.recipeId, '');
      return;
    }

    onDeleteSavedRecipe(savedRecipe.recipeId);
  }

  function planSavedRecipe(savedRecipe) {
    onPlanRecipe(savedRecipe.recipeId, savedRecipe.plannedDay || getNextPlanningDay(plannedRows));
  }

  function moveSavedRecipe(savedRecipe) {
    onPlanRecipe(savedRecipe.recipeId, getFollowingDay(savedRecipe.plannedDay));
  }

  function handleSuggestionPlan() {
    if (!suggestion) return;
    onPlanRecipe(suggestion.id, getNextPlanningDay(plannedRows));
  }

  function scrollToPlanner() {
    plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-[480px] bg-[#fdfdfe] px-3 pb-28 pt-2 text-[#071124] shadow-[0_0_80px_rgba(15,23,42,0.08)] min-[390px]:px-4">
      <StatusBar />

      <header className="mt-4 flex items-start justify-between gap-3 min-[420px]:gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.82rem] font-black leading-[0.96] tracking-[0.01em] text-[#071124] min-[380px]:text-[2.08rem] min-[420px]:text-[2.35rem]">
            Saved Recipes
          </h1>
          <p className="mt-1 truncate text-[0.78rem] font-semibold text-[#6f7da4] min-[380px]:text-[0.84rem] min-[420px]:text-[0.95rem]">
            Save, plan, and cook smarter.
          </p>
        </div>
        <button
          type="button"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e5e9f2] bg-white text-[#69779c] shadow-[0_8px_24px_rgba(15,23,42,0.06)] min-[420px]:h-12 min-[420px]:w-12"
          aria-label="Filter saved recipes"
        >
          <ListFilter className="h-5 w-5 stroke-[2.1] min-[420px]:h-6 min-[420px]:w-6" aria-hidden="true" />
        </button>
      </header>

      <label className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-[#dde3ee] bg-white px-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)] focus-within:ring-4 focus-within:ring-[#ff5a43]/10 min-[420px]:h-[56px] min-[420px]:gap-3.5 min-[420px]:px-5">
        <Search className="h-5 w-5 shrink-0 text-[#7180a6] min-[420px]:h-6 min-[420px]:w-6" aria-hidden="true" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search your saved recipes"
          className="min-w-0 flex-1 bg-transparent text-[0.88rem] font-semibold text-[#071124] outline-none placeholder:text-[#7786ac] min-[420px]:text-[0.95rem]"
        />
      </label>

        {suggestion ? (
          <CookTonightCard
            recipe={suggestion}
            onOpenDetails={openRecipe}
            onPlan={handleSuggestionPlan}
            onDismiss={() => onDismissSuggestion(suggestion.id)}
          />
        ) : (
          <div className="mt-3 rounded-[16px] border border-[#e1e6ef] bg-white p-4 text-sm font-semibold text-[#68779e] shadow-[0_14px_38px_rgba(15,23,42,0.045)]">
            No recipe suggestions are available yet.
          </div>
        )}
      <WeekPlanner
        plannerRef={plannerRef}
        plannedRows={plannedRows}
        onViewPlan={() => setActiveFilter('Planned')}
        onPlanDay={(day) => {
          const nextRecipe = persistedRows.find((savedRecipe) => !savedRecipe.plannedDay) || allRows[0];
          if (nextRecipe) onPlanRecipe(nextRecipe.recipeId, day);
        }}
      />
      <GroceryStrip
        summary={grocerySummary}
        onView={() => {
          setActiveFilter('Planned');
          scrollToPlanner();
        }}
      />

      <div className="mt-2.5 grid h-11 grid-cols-4 overflow-hidden rounded-2xl border border-[#e2e6ef] bg-white text-[0.68rem] font-bold text-[#59688d] shadow-[0_12px_32px_rgba(15,23,42,0.035)] min-[380px]:text-[0.78rem] min-[420px]:h-[50px] min-[420px]:text-[0.88rem]">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={cx(
              'min-w-0 px-1 transition',
              activeFilter === filter && 'bg-[#fff0ed] text-[#ff402f]',
            )}
          >
            <span className="block truncate">{filter}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-[18px] border border-[#e3e7f0] bg-white shadow-[0_14px_38px_rgba(15,23,42,0.045)]">
        {savedRecipes.map((savedRecipe, index) => (
          <SavedPlannerRow
            key={`${savedRecipe.recipeId}-${index}`}
            savedRecipe={savedRecipe}
            isLast={index === savedRecipes.length - 1}
            onOpenDetails={openRecipe}
            onSavedClick={handleSavedClick}
            onPlan={planSavedRecipe}
            onMove={moveSavedRecipe}
          />
        ))}

        {!savedRecipes.length && (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#ff4e3e]">
              <Bookmark className="h-6 w-6 fill-current" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-black">No saved recipes found</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f7da4]">
              Try another search or filter to find recipes in {profile.name}&apos;s library.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBar() {
  return (
    <div className="flex h-6 items-center justify-between px-1 text-[1.04rem] font-black leading-none text-black">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
          <span className="block h-1.5 w-1 rounded-sm bg-black" />
          <span className="block h-2.5 w-1 rounded-sm bg-black" />
          <span className="block h-3.5 w-1 rounded-sm bg-black" />
          <span className="block h-4 w-1 rounded-sm bg-black" />
        </span>
        <span className="relative h-4 w-5" aria-hidden="true">
          <span className="absolute left-0 top-0 h-5 w-5 rounded-full border-[3px] border-black border-b-transparent border-l-transparent border-r-transparent" />
          <span className="absolute left-[4px] top-[5px] h-3 w-3 rounded-full border-[3px] border-black border-b-transparent border-l-transparent border-r-transparent" />
          <span className="absolute bottom-0 left-[8px] h-1.5 w-1.5 rounded-full bg-black" />
        </span>
        <span className="flex h-[15px] w-[25px] items-center rounded-[4px] border-2 border-black p-[2px]" aria-hidden="true">
          <span className="h-full flex-1 rounded-[2px] bg-black" />
        </span>
      </div>
    </div>
  );
}

function CookTonightCard({ recipe, onOpenDetails, onPlan, onDismiss }) {
  const displayName = recipe.displayName || recipe.name;

  return (
    <article className="mt-3 rounded-[16px] border border-[#e1e6ef] bg-white p-2.5 shadow-[0_14px_38px_rgba(15,23,42,0.045)] min-[420px]:mt-3.5 min-[420px]:p-3">
      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 min-[420px]:grid-cols-[78px_minmax(0,1fr)_96px]">
        <button
          type="button"
          onClick={() => onOpenDetails(recipe)}
          className="h-[66px] overflow-hidden rounded-2xl bg-[#f2f4f8] min-[420px]:h-[76px]"
          aria-label={`Open ${displayName}`}
        >
          <img src={recipe.images[0]} alt={displayName} className="h-full w-full object-cover" />
        </button>

        <div className="min-w-0 pr-1 min-[420px]:pr-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#5f22ff] min-[420px]:h-4 min-[420px]:w-4" aria-hidden="true" />
            <p className="min-w-0 truncate text-[0.78rem] font-black text-[#071124] min-[420px]:shrink-0 min-[420px]:text-[0.86rem]">
              Cook Tonight
            </p>
            <span className="shrink-0 rounded-full bg-[#f0e9ff] px-1.5 py-0.5 text-[0.55rem] font-black text-[#5f22ff] min-[420px]:py-1 min-[420px]:text-[0.58rem]">
              AI Pick
            </span>
          </div>
          <button type="button" onClick={() => onOpenDetails(recipe)} className="mt-1 block max-w-full text-left">
            <h2 className="truncate text-[0.86rem] font-black leading-tight text-[#071124] min-[420px]:text-[0.95rem]">
              {displayName}
            </h2>
          </button>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[0.66rem] font-semibold text-[#6f7da4] min-[420px]:text-[0.72rem]">
            <span>{recipe.timeMinutes} min</span>
            <span>&bull;</span>
            <span className="truncate">{recipe.cuisine}</span>
            <span className="hidden min-[430px]:inline">&bull;</span>
            <span className="hidden min-[430px]:inline">High Protein</span>
          </p>
        </div>

        <div className="col-span-2 grid grid-cols-[1fr_auto] items-center gap-2 pt-1 min-[420px]:col-span-1 min-[420px]:flex min-[420px]:min-w-0 min-[420px]:flex-col min-[420px]:items-center min-[420px]:gap-2 min-[420px]:pt-0">
          <button
            type="button"
            onClick={onPlan}
            className="flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-[#ff4f3f] px-3 text-[0.74rem] font-black text-white shadow-[0_12px_24px_rgba(255,79,63,0.24)] min-[420px]:h-10 min-[420px]:px-1 min-[420px]:text-[0.68rem]"
          >
            <span>Plan It</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 min-[420px]:h-4 min-[420px]:w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onDismiss} className="whitespace-nowrap px-1 text-xs font-bold text-[#6f7184] underline underline-offset-2">
            Not now
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-1 min-[380px]:ml-[80px] min-[380px]:grid-cols-2 min-[420px]:ml-[86px] min-[420px]:gap-1.5">
        <InfoPill icon={Calendar} label={`You have ${recipe.ingredientMatch} ingredients`} />
        <InfoPill icon={Target} label="Matches your goals" />
      </div>
    </article>
  );
}

function InfoPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex h-6 min-w-0 items-center gap-1 rounded-lg bg-[#ecf9f2] px-1.5 text-[0.49rem] font-black text-[#009b57] min-[420px]:h-7 min-[420px]:text-[0.54rem]">
      <Icon className="h-3 w-3 shrink-0 text-[#4c5a75] min-[420px]:h-3.5 min-[420px]:w-3.5" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function WeekPlanner({ plannerRef, plannedRows, onViewPlan, onPlanDay }) {
  const rowByDay = new Map(plannedRows.map((row) => [row.plannedDay, row]));
  const plannedCount = plannedRows.length;

  return (
    <section ref={plannerRef} className="mt-3 rounded-[16px] border border-[#e1e6ef] bg-white p-3 shadow-[0_14px_38px_rgba(15,23,42,0.045)] min-[420px]:mt-3.5 min-[420px]:p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-black text-[#071124] min-[420px]:text-[1.13rem]">This Week</h2>
        <button type="button" onClick={onViewPlan} className="flex items-center gap-1 text-[0.8rem] font-bold text-[#ff402f] min-[420px]:text-sm">
          View Plan
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-7 gap-0.5 min-[420px]:mt-3 min-[420px]:gap-1">
        {WEEK_DAYS.map((item) => {
          const savedRecipe = rowByDay.get(item.full);
          const recipe = savedRecipe?.recipe;
          return (
            <div
              key={item.day}
              className={cx(
                'rounded-xl px-0.5 py-1 text-center min-[420px]:py-1.5',
                item.active && 'bg-[#fff0ed]',
              )}
            >
              <p className={cx('text-[0.7rem] font-bold text-[#445174] min-[420px]:text-[0.78rem]', item.active && 'text-[#ff402f]')}>
                {item.day}
              </p>
              <p className={cx('text-[0.82rem] font-medium text-[#6c789d] min-[420px]:text-[0.92rem]', item.active && 'text-[#ff402f]')}>
                {item.date}
              </p>
              <div className="mt-1.5 flex justify-center min-[420px]:mt-2">
                {recipe ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-[#f2f4f8] min-[420px]:h-9 min-[420px]:w-9">
                    <img src={recipe.images[0]} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#17b36b] text-white ring-2 ring-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPlanDay(item.full)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#d7deeb] text-lg font-light leading-none text-[#68779e] min-[420px]:h-9 min-[420px]:w-9 min-[420px]:text-xl"
                    aria-label={`Add meal for ${item.day}`}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-5 text-[0.78rem] font-semibold text-[#68779e] min-[420px]:mt-3 min-[420px]:text-sm">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#17a86b]" />
          Planned ({plannedCount})
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#8793b4]" />
          Open ({Math.max(0, WEEK_DAYS.length - plannedCount)})
        </span>
      </div>
    </section>
  );
}

function GroceryStrip({ summary, onView }) {
  const hasPlan = summary.mealCount > 0;

  return (
    <div className="mt-2.5 flex h-10 items-center justify-between rounded-xl border border-[#e2e6ef] bg-white px-3 shadow-[0_12px_32px_rgba(15,23,42,0.035)] min-[420px]:mt-3 min-[420px]:h-11">
      <p className="flex min-w-0 items-center gap-1.5 text-[0.68rem] font-semibold text-[#607098] min-[380px]:text-[0.72rem] min-[420px]:text-[0.78rem]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#fff1e8] text-[#ff8a3d] min-[420px]:h-7 min-[420px]:w-7" aria-hidden="true">
          <ShoppingBag className="h-3.5 w-3.5 min-[420px]:h-4 min-[420px]:w-4" />
        </span>
        <span className="truncate">{hasPlan ? 'Grocery list ready' : 'Plan meals to build groceries'}</span>
        <span className="shrink-0">&bull;</span>
        <span className="truncate">
          {hasPlan
            ? `${summary.ingredientCount} items from ${summary.mealCount} meal${summary.mealCount === 1 ? '' : 's'}`
            : '0 planned meals'}
        </span>
      </p>
      <button
        type="button"
        onClick={onView}
        className="ml-2 h-7 rounded-lg border border-[#ffb3aa] px-2.5 text-[0.72rem] font-bold text-[#ff402f] min-[420px]:h-8 min-[420px]:px-4 min-[420px]:text-sm"
      >
        View
      </button>
    </div>
  );
}

function SavedPlannerRow({
  savedRecipe,
  isLast,
  onOpenDetails,
  onSavedClick,
  onPlan,
  onMove,
}) {
  const { recipe } = savedRecipe;
  const displayName = savedRecipe.displayName || recipe.name;

  return (
    <article className={cx('grid grid-cols-[76px_minmax(0,1fr)] gap-2 px-2.5 py-2.5 min-[420px]:grid-cols-[88px_minmax(0,1fr)_82px] min-[420px]:gap-3 min-[420px]:px-3 min-[420px]:py-3', !isLast && 'border-b border-[#edf0f5]')}>
      <button
        type="button"
        onClick={() => onOpenDetails(recipe)}
        className="h-[72px] overflow-hidden rounded-2xl bg-[#f2f4f8] min-[420px]:h-[82px]"
        aria-label={`Open ${displayName}`}
      >
        <img src={recipe.images[0]} alt={displayName} className="h-full w-full object-cover" />
      </button>

      <div className="min-w-0 py-0.5">
        <button type="button" onClick={() => onOpenDetails(recipe)} className="block max-w-full text-left">
          <h3 className="truncate text-[0.92rem] font-black leading-tight text-[#071124] min-[420px]:text-[1.04rem]">
            {displayName}
          </h3>
        </button>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[0.68rem] font-semibold text-[#68779e] min-[420px]:text-[0.78rem]">
          <Clock3 className="h-3.5 w-3.5 shrink-0 min-[420px]:h-4 min-[420px]:w-4" aria-hidden="true" />
          <span>{recipe.timeMinutes} min</span>
          <span>&bull;</span>
          <span className="truncate">{recipe.cuisine}</span>
        </p>

        <div className="mt-1.5 flex flex-wrap gap-1.5 min-[420px]:gap-2">
          <span className="rounded-lg bg-[#ecf9f2] px-2 py-0.5 text-[0.63rem] font-black text-[#009b57] min-[420px]:px-2.5 min-[420px]:py-1 min-[420px]:text-[0.72rem]">
            {recipe.protein}g protein
          </span>
          <span className="rounded-lg bg-[#f1f3f6] px-2 py-0.5 text-[0.63rem] font-bold text-[#69779c] min-[420px]:px-2.5 min-[420px]:py-1 min-[420px]:text-[0.72rem]">
            {savedRecipe.folder}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-1 text-[0.62rem] font-semibold text-[#009b57] min-[420px]:gap-1.5 min-[420px]:text-[0.72rem]">
          {savedRecipe.cookedCount ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Cooked {savedRecipe.cookedCount}x
            </>
          ) : recipe.timeMinutes <= 25 ? (
            <>
              <Zap className="h-4 w-4 text-[#6f7da4]" aria-hidden="true" />
              <span className="text-[#6f7da4]">Quickest option</span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" aria-hidden="true" />
              You have 7/8 ingredients
            </>
          )}
        </p>
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-2 min-[420px]:col-span-1 min-[420px]:flex min-[420px]:flex-col">
        {savedRecipe.plannedDay ? (
          <>
            <button
              type="button"
              onClick={() => onPlan(savedRecipe)}
              className="flex h-[42px] items-center justify-center gap-1 rounded-xl bg-[#eaf9f1] px-1.5 text-center text-[0.66rem] font-black leading-tight text-[#009b57] min-[420px]:h-[48px] min-[420px]:gap-2 min-[420px]:text-[0.76rem]"
            >
              <Calendar className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Planned
                <br />
                <span className="font-semibold">{savedRecipe.plannedDay}</span>
              </span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onMove(savedRecipe)}
                className="flex h-[46px] flex-col items-center justify-center rounded-xl border border-[#e3e7f0] bg-white text-[0.62rem] font-bold text-[#68779e] min-[420px]:h-[52px] min-[420px]:text-[0.68rem]"
              >
                <MoveHorizontal className="h-5 w-5" aria-hidden="true" />
                Move
              </button>
              <SavedButton savedRecipe={savedRecipe} onSavedClick={onSavedClick} />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onPlan(savedRecipe)}
              className="flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#ff4f3f] px-2 text-[0.78rem] font-black text-white shadow-[0_12px_24px_rgba(255,79,63,0.2)] min-[420px]:h-[48px] min-[420px]:text-[0.9rem]"
            >
              <Calendar className="h-5 w-5" aria-hidden="true" />
              Plan
            </button>
            <SavedButton savedRecipe={savedRecipe} onSavedClick={onSavedClick} />
          </>
        )}
      </div>
    </article>
  );
}

function SavedButton({ savedRecipe, onSavedClick }) {
  const label = savedRecipe.isShowcase ? 'Save' : 'Remove';

  return (
    <button
      type="button"
      onClick={() => onSavedClick(savedRecipe)}
      className="flex h-[42px] flex-col items-center justify-center rounded-xl border border-[#e3e7f0] bg-white text-[0.66rem] font-bold text-[#ff402f] min-[420px]:h-[48px] min-[420px]:text-[0.74rem]"
    >
      <Bookmark className="h-5 w-5 fill-current" aria-hidden="true" />
      {label}
    </button>
  );
}
