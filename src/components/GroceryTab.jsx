import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { cx } from './ui.jsx';

const FALLBACK_QUANTITIES = {
  'chicken breast': '1 lb',
  chicken: '1 lb',
  turnips: '2 medium',
  turnip: '2 medium',
  carrots: '2 medium',
  carrot: '2 medium',
  'olive oil': '2 tbsp',
  lentils: '1 cup',
  'red lentils': '1 cup',
  tomatoes: '1 can (14 oz)',
  'crushed tomatoes': '1 can (14 oz)',
  'canned diced tomatoes': '1 can (14 oz)',
  onion: '1 medium',
  garlic: '3 cloves',
  'vegetable broth': '4 cups',
  broth: '4 cups',
  cumin: '1 tsp',
  rice: '1 cup',
  pasta: '8 oz',
  egg: '2',
  eggs: '2',
  avocado: '1',
  lime: '1',
  cilantro: '1 bunch',
};

const QUANTITY_UNITS = [
  'cup',
  'cups',
  'tbsp',
  'tsp',
  'lb',
  'lbs',
  'oz',
  'can',
  'cans',
  'clove',
  'cloves',
  'medium',
  'large',
  'small',
  'bunch',
  'serving',
  'servings',
];

function normalizeIngredient(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value) {
  return String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function splitIngredient(ingredient) {
  const cleaned = String(ingredient || '').replace(/\s+/g, ' ').trim();
  const match = cleaned.match(
    /^((?:\d+\/\d+|\d+(?:\.\d+)?)(?:\s+(?:\d+\/\d+))?\s*(?:cup|cups|tbsp|tsp|lb|lbs|oz|can|cans|clove|cloves|medium|large|small|bunch|serving|servings)?(?:\s*\([^)]+\))?)\s+(.+)$/i,
  );

  if (!match) {
    const normalized = normalizeIngredient(cleaned);
    return {
      name: titleCase(cleaned),
      quantity: FALLBACK_QUANTITIES[normalized] || '',
    };
  }

  const possibleQuantity = match[1].trim();
  const possibleName = match[2].trim();
  const hasUnit = QUANTITY_UNITS.some((unit) =>
    possibleQuantity.toLowerCase().split(/\s+/).includes(unit),
  );

  if (!hasUnit && /^\d+$/.test(possibleQuantity)) {
    return {
      name: titleCase(cleaned),
      quantity: FALLBACK_QUANTITIES[normalizeIngredient(cleaned)] || '',
    };
  }

  return {
    name: titleCase(possibleName),
    quantity: possibleQuantity,
  };
}

function getPlannedRows(profile, recipes) {
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return profile.savedRecipes
    .filter((savedRecipe) => savedRecipe.plannedDay)
    .map((savedRecipe) => ({
      ...savedRecipe,
      recipe: recipeById.get(savedRecipe.recipeId),
    }))
    .filter((savedRecipe) => savedRecipe.recipe);
}

function buildGroceryItems(plannedRows, checkedItemIds = []) {
  const itemByName = new Map();

  plannedRows.forEach((row) => {
    row.recipe.ingredients.forEach((ingredient) => {
      const parsed = splitIngredient(ingredient);
      const normalized = normalizeIngredient(parsed.name || ingredient);
      if (!normalized) return;

      const existing = itemByName.get(normalized);
      if (existing) {
        existing.recipeIds = Array.from(new Set([...existing.recipeIds, row.recipe.id]));
        existing.recipeNames = Array.from(new Set([...existing.recipeNames, row.recipe.name]));
        if (!existing.quantity && parsed.quantity) existing.quantity = parsed.quantity;
        return;
      }

      itemByName.set(normalized, {
        id: `grocery-${normalized.replace(/\s+/g, '-')}`,
        name: parsed.name || titleCase(ingredient),
        quantity: parsed.quantity,
        recipeIds: [row.recipe.id],
        recipeNames: [row.recipe.name],
      });
    });
  });

  return Array.from(itemByName.values()).map((item) => ({
    ...item,
    checked: checkedItemIds.includes(item.id),
  }));
}

function StatCard({ tone, icon: Icon, label, count }) {
  const isGreen = tone === 'green';

  return (
    <button
      type="button"
      className={cx(
        'grid min-h-[78px] grid-cols-[50px_minmax(0,1fr)_auto] items-center gap-2 rounded-[20px] border bg-white/84 p-2.5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl min-[420px]:min-h-[88px] min-[420px]:grid-cols-[56px_minmax(0,1fr)_auto] min-[420px]:p-3',
        isGreen ? 'border-[#cfe8d3]' : 'border-[#ffd5cd]',
      )}
    >
      <span
        className={cx(
          'flex h-[50px] w-[50px] items-center justify-center rounded-[18px] min-[420px]:h-[56px] min-[420px]:w-[56px]',
          isGreen ? 'bg-[#e7f5e9] text-[#208927]' : 'bg-[#fff0ed] text-[#ff4f3f]',
        )}
      >
        <Icon className="h-7 w-7 stroke-[2.2]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span
          className={cx(
            'block truncate text-[0.78rem] font-black min-[420px]:text-[0.88rem]',
            isGreen ? 'text-[#23852c]' : 'text-[#ff4f3f]',
          )}
        >
          {label}
        </span>
        <span className="mt-1 flex items-end gap-2">
          <span className="text-[1.85rem] font-black leading-none text-[#071124] min-[420px]:text-[2.15rem]">
            {count}
          </span>
          <span className="pb-0.5 text-xs font-black text-[#8791ad] min-[420px]:text-sm">
            items
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#4e5564]" aria-hidden="true" />
    </button>
  );
}

function RecipeChip({ row, onOpen }) {
  const recipe = row.recipe;

  return (
    <button
      type="button"
      onClick={() => onOpen(recipe)}
      className="grid h-[58px] min-w-[168px] grid-cols-[46px_minmax(0,1fr)] items-center gap-2.5 rounded-[18px] border border-[#e8edf4] bg-white px-2.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <img
        src={recipe.images[0]}
        alt={recipe.name}
        className="h-[42px] w-[46px] rounded-[14px] object-cover"
      />
      <span className="min-w-0">
        <span className="block truncate text-xs font-black text-[#071124]">{recipe.name}</span>
        <span className="mt-0.5 block truncate text-[0.68rem] font-bold text-[#7683a1]">
          {recipe.mealType} - {recipe.cuisine}
        </span>
      </span>
    </button>
  );
}

function GroceryRow({ item, checked = false, onToggle, onOpenRecipe }) {
  return (
    <div className="grid min-h-[48px] grid-cols-[34px_minmax(0,1fr)_auto_32px] items-center gap-1.5 border-b border-[#edf0f5] px-3 last:border-b-0 min-[420px]:min-h-[54px] min-[420px]:grid-cols-[38px_minmax(0,1fr)_auto_34px]">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cx(
          'flex h-7 w-7 items-center justify-center rounded-lg border transition',
          checked
            ? 'border-[#bfe2c7] bg-[#bfe2c7] text-white'
            : 'border-[#b8bfce] bg-white text-transparent hover:border-[#ff9b8f]',
        )}
        aria-label={checked ? `Mark ${item.name} as needed` : `Mark ${item.name} as already have`}
      >
        <Check className="h-5 w-5 stroke-[3]" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onOpenRecipe(item.recipeIds[0])}
        className="min-w-0 text-left"
      >
        <span
          className={cx(
            'block truncate text-[0.88rem] font-black text-[#071124] min-[420px]:text-[0.96rem]',
            checked && 'text-[#7c879f] line-through decoration-[#7c879f] decoration-2',
          )}
        >
          {item.name}
        </span>
      </button>
      <span className="max-w-[88px] truncate text-right text-xs font-black text-[#7986a4] min-[420px]:max-w-[108px] min-[420px]:text-sm">
        {item.quantity || '1 item'}
      </span>
      {checked ? (
        <button
          type="button"
          onClick={() => onOpenRecipe(item.recipeIds[0])}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#7180a0]"
          aria-label={`Open source recipe for ${item.name}`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0ed] text-[#ff4f3f]"
          aria-label={`Add note for ${item.name}`}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function PantryCta() {
  return (
    <button
      type="button"
      className="mt-0 grid min-h-[62px] w-full grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[18px] bg-[#eef9f1] px-3 text-left text-[#238b45]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border-2 border-[#35a563]">
        <ClipboardList className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-black text-[#1e944d]">Update pantry</span>
        <span className="mt-0.5 block truncate text-[0.68rem] font-bold text-[#667799]">
          Let RecipeSwipe know what you have.
        </span>
      </span>
      <ChevronRight className="h-5 w-5 text-[#677289]" aria-hidden="true" />
    </button>
  );
}

function EmptyGroceries({ onAddRecipe }) {
  return (
    <section className="mt-8 rounded-[28px] border border-[#e6ebf2] bg-white px-6 py-10 text-center shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#fff0ed] text-[#ff4f3f]">
        <ShoppingCart className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-[#071124]">Plan meals first</h2>
      <p className="mx-auto mt-2 max-w-[18rem] text-sm font-semibold leading-6 text-[#6f7da4]">
        Groceries are built from recipes you add to your weekly plan in Saved.
      </p>
      <button
        type="button"
        onClick={onAddRecipe}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#ff4f3f] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(255,79,63,0.22)]"
      >
        Open Saved
      </button>
    </section>
  );
}

export default function GroceryTab({
  profile,
  recipes,
  onOpenDetails,
  onToggleGroceryItem,
  onAddRecipe,
}) {
  const plannedRows = getPlannedRows(profile, recipes);
  const groceryItems = buildGroceryItems(plannedRows, profile.checkedGroceryItems || []);
  const needItems = groceryItems.filter((item) => !item.checked);
  const haveItems = groceryItems.filter((item) => item.checked);
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const [needOpen, setNeedOpen] = useState(true);
  const [haveOpen, setHaveOpen] = useState(true);

  function openRecipe(recipeId) {
    const recipe = recipeById.get(recipeId);
    if (recipe) onOpenDetails(recipe);
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-[480px] bg-[#fdfdfb] px-4 pb-24 pt-2 text-[#071124] shadow-[0_0_80px_rgba(15,23,42,0.08)]">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[2.35rem] font-black leading-[0.92] tracking-[0.01em] text-[#071124] min-[420px]:text-[2.75rem]">
            Groceries
          </h1>
          <p className="mt-1 truncate text-[0.95rem] font-black text-[#8691ad] min-[420px]:text-lg">
            Only buy what you're missing.
          </p>
        </div>
        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#e0e5ee] bg-white text-[#637190] shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
          aria-label="Filter groceries"
          title="Filter groceries"
        >
          <SlidersHorizontal className="h-6 w-6 stroke-[2.1]" aria-hidden="true" />
        </button>
      </header>

      {!plannedRows.length ? (
        <EmptyGroceries onAddRecipe={onAddRecipe} />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard tone="coral" icon={ShoppingCart} label="Need to buy" count={needItems.length} />
            <StatCard tone="green" icon={CheckCircle2} label="Already have" count={haveItems.length} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 px-4">
            <h2 className="text-sm font-black text-[#53617e] min-[420px]:text-base">
              From these recipes
            </h2>
            <button
              type="button"
              onClick={onAddRecipe}
              className="text-sm font-black text-[#ff4f3f] min-[420px]:text-base"
            >
              Edit
            </button>
          </div>

          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1">
            {plannedRows.map((row) => (
              <RecipeChip key={row.recipeId} row={row} onOpen={onOpenDetails} />
            ))}
            <button
              type="button"
              onClick={onAddRecipe}
              className="flex h-[58px] min-w-[104px] items-center justify-center rounded-[18px] border border-[#e8edf4] bg-[#f3f5f8] px-3 text-center text-xs font-black leading-tight text-[#68779e] shadow-[0_10px_24px_rgba(15,23,42,0.035)]"
            >
              + Add
              <br />
              Recipe
            </button>
          </div>

          <section className="mt-5 rounded-[24px] border border-[#f2d6d2] bg-[#fffafa] p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
            <button
              type="button"
              onClick={() => setNeedOpen((current) => !current)}
              className={cx('flex w-full items-center gap-2.5 text-left', needOpen && 'mb-3')}
              aria-expanded={needOpen}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#ff4939] text-white shadow-[0_10px_22px_rgba(255,73,57,0.2)]">
                <ShoppingCart className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="min-w-0 flex-1 truncate text-[1.35rem] font-black text-[#071124]">
                Need to Buy
              </h2>
              <span className="shrink-0 text-xs font-black text-[#ff4f3f] min-[420px]:text-sm">
                {needItems.length} items
              </span>
              {needOpen ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-[#4e5564]" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-[#4e5564]" aria-hidden="true" />
              )}
            </button>

            {needOpen && (
              <div className="overflow-hidden rounded-[16px] border border-[#e7ebf1] bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]">
                {needItems.map((item) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    onToggle={onToggleGroceryItem}
                    onOpenRecipe={openRecipe}
                  />
                ))}
                {!needItems.length && (
                  <p className="px-4 py-8 text-center text-sm font-bold text-[#7d879f]">
                    Everything in this plan is marked as already have.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="mt-3 rounded-[24px] border border-[#d9eddc] bg-[#fbfffc] p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.045)]">
            <button
              type="button"
              onClick={() => setHaveOpen((current) => !current)}
              className={cx('flex w-full items-center gap-2.5 text-left', haveOpen && 'mb-3')}
              aria-expanded={haveOpen}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2ea23b] text-white shadow-[0_10px_22px_rgba(46,162,59,0.16)]">
                <Check className="h-7 w-7 stroke-[3]" aria-hidden="true" />
              </span>
              <h2 className="min-w-0 flex-1 truncate text-[1.35rem] font-black text-[#071124]">
                Already Have
              </h2>
              <span className="shrink-0 text-xs font-black text-[#238b2c] min-[420px]:text-sm">
                {haveItems.length} items
              </span>
              {haveOpen ? (
                <ChevronUp className="h-5 w-5 shrink-0 text-[#4e5564]" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-[#4e5564]" aria-hidden="true" />
              )}
            </button>

            {haveOpen && (
              <>
                <div className="overflow-hidden rounded-[18px] border border-[#edf1f5] bg-white/72">
                  {haveItems.slice(0, 6).map((item) => (
                    <GroceryRow
                      key={item.id}
                      item={item}
                      checked
                      onToggle={onToggleGroceryItem}
                      onOpenRecipe={openRecipe}
                    />
                  ))}
                  {!haveItems.length && (
                    <p className="px-4 py-6 text-center text-sm font-bold text-[#7d879f]">
                      Check items off as you confirm what is already in your kitchen.
                    </p>
                  )}
                </div>

                <PantryCta />
              </>
            )}
          </section>
        </>
      )}
    </section>
  );
}
