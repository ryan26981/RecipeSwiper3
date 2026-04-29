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
import { iconButtonClass } from './ui.jsx';

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
    <div className="fixed inset-0 z-40 bg-slate-950/50 px-0 pt-10 sm:px-4" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close recipe details"
      />

      <section className="sheet-up absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] max-w-2xl overflow-hidden rounded-t-[24px] bg-white shadow-soft sm:bottom-4 sm:rounded-[24px]">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 z-20 flex justify-center bg-white/95 py-2 backdrop-blur">
            <span className="h-1.5 w-12 rounded-full bg-slate-200" />
          </div>

          <div className="relative h-56 bg-stone-900">
            <img src={recipe.images[0]} alt={recipe.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className={`absolute right-4 top-4 ${iconButtonClass('neutral')} bg-white/[0.92] backdrop-blur`}
              title="Close"
              aria-label="Close recipe details"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h2 className="text-3xl font-black leading-tight">{recipe.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-black text-white/[0.88]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  {recipe.timeMinutes} min
                </span>
                <span>{recipe.cuisine}</span>
                <span>{recipe.mealType}</span>
              </p>
            </div>
          </div>

          <div className="sticky top-9 z-10 flex gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            {DETAIL_TABS.map((tab) => {
              const Icon = tab.icon;

              return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.id}
              </button>
              );
            })}
          </div>

          <div className="px-5 py-5">
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
              <ul className="grid gap-2 sm:grid-cols-2">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold capitalize text-slate-800">
                    {ingredient}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'Recipe' && (
              <div className="space-y-5">
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 leading-6 text-slate-700">{instruction}</p>
                    </li>
                  ))}
                </ol>

                <div className="border-t border-slate-200 pt-4">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-500">
                    <ChefHat className="h-4 w-4" aria-hidden="true" />
                    Source
                  </p>
                  {recipe.sourceUrl ? (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-black text-emerald-900 underline-offset-4 hover:underline"
                    >
                      {recipe.sourceName}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-1 font-bold text-slate-950">{recipe.sourceName}</p>
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
