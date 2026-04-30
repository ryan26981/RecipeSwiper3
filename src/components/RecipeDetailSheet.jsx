import { useEffect, useState } from 'react';
import {
  ChefHat,
  Clock3,
  Drumstick,
  ExternalLink,
  Flame,
  ListChecks,
  Salad,
  X,
} from 'lucide-react';
import { cx } from './ui.jsx';

const DETAIL_TABS = [
  { id: 'Nutrition', icon: Flame },
  { id: 'Ingredients', icon: Salad },
  { id: 'Recipe', icon: ListChecks },
];

export default function RecipeDetailSheet({ recipe, onClose }) {
  const [activeTab, setActiveTab] = useState('Nutrition');

  useEffect(() => {
    setActiveTab('Nutrition');
  }, [recipe?.id]);

  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#071124]/54 px-0 pt-10 backdrop-blur-[2px] sm:px-4" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close recipe details"
      />

      <section className="sheet-up absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] max-w-[480px] overflow-hidden rounded-t-[28px] bg-white shadow-soft sm:bottom-4 sm:rounded-[28px]">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 z-20 flex justify-center bg-white/95 py-2 backdrop-blur">
            <span className="h-1.5 w-12 rounded-full bg-[#dedede]" />
          </div>

          <div className="relative h-56 bg-[#071124] min-[420px]:h-64">
            <img src={recipe.images[0]} alt={recipe.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/75 bg-white/92 text-[#071124] shadow-[0_12px_28px_rgba(15,23,42,0.18)] backdrop-blur transition active:scale-[0.98]"
              title="Close"
              aria-label="Close recipe details"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h2 className="text-[1.85rem] font-black leading-tight min-[420px]:text-3xl">{recipe.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-black text-white/[0.88] min-[420px]:text-base">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  {recipe.timeMinutes} min
                </span>
                <span>{recipe.cuisine}</span>
                <span>{recipe.mealType}</span>
              </p>
            </div>
          </div>

          <div className="sticky top-9 z-10 grid grid-cols-3 gap-2 border-b border-[#eceef3] bg-white/95 px-3 py-3 backdrop-blur min-[420px]:px-4">
            {DETAIL_TABS.map((tab) => {
              const Icon = tab.icon;

              return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  'flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-[0.72rem] font-black transition min-[380px]:text-sm',
                  activeTab === tab.id
                    ? 'bg-[#ff4f3f] text-white shadow-[0_12px_24px_rgba(255,79,63,0.22)]'
                    : 'bg-[#f5f6f8] text-[#68779e] hover:bg-[#eef0f4]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{tab.id}</span>
              </button>
              );
            })}
          </div>

          <div className="px-4 py-5 min-[420px]:px-5">
            {activeTab === 'Nutrition' && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NutritionItem label="Calories" value={recipe.calories} />
                <NutritionItem label="Protein" value={`${recipe.protein}g`} icon={Drumstick} />
                <NutritionItem label="Carbs" value={`${recipe.carbs}g`} />
                <NutritionItem label="Fat" value={`${recipe.fat}g`} />
                <NutritionItem label="Serving" value={recipe.servingSize} />
                <NutritionItem label="Health" value={`${recipe.healthScore}/100`} />
                <NutritionItem label="Price" value={recipe.priceLevel} />
                <NutritionItem label="Cleanup" value={recipe.cleanupLevel} />
                <NutritionItem label="Complexity" value={recipe.complexity} />
                <NutritionItem label="Time" value={`${recipe.timeMinutes} min`} />
              </div>
            )}

            {activeTab === 'Ingredients' && (
              <ul className="grid gap-2 min-[420px]:grid-cols-2">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="rounded-xl border border-[#e3e7f0] bg-[#f7f8fb] px-4 py-3 text-sm font-bold capitalize text-[#071124] min-[420px]:text-base">
                    {ingredient}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'Recipe' && (
              <div className="space-y-5">
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex gap-3 rounded-xl border border-[#e3e7f0] bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#071124] text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm font-medium leading-6 text-[#4c5875] min-[420px]:text-base">{instruction}</p>
                    </li>
                  ))}
                </ol>

                <div className="border-t border-[#eceef3] pt-4">
                  <p className="flex items-center gap-2 text-sm font-black text-[#68779e]">
                    <ChefHat className="h-4 w-4" aria-hidden="true" />
                    Source
                  </p>
                  {recipe.sourceUrl ? (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-black text-[#ff402f] underline-offset-4 hover:underline"
                    >
                      {recipe.sourceName}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-1 font-bold text-[#071124]">{recipe.sourceName}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function NutritionItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#e3e7f0] bg-[#f7f8fb] px-3 py-3 min-[420px]:px-4">
      <p className="flex min-w-0 items-center gap-1.5 text-[0.64rem] font-black uppercase tracking-[0.12em] text-[#7f89a4] min-[420px]:text-xs">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 truncate text-lg font-black text-[#071124]">{value}</p>
    </div>
  );
}
