import { Clock3, Folder, Heart, Trash2 } from 'lucide-react';
import { iconButtonClass } from './ui.jsx';

export default function SavedRecipeRow({
  savedRecipe,
  folders,
  onOpenDetails,
  onToggleFavorite,
  onMoveToFolder,
  onDeleteRecipe,
}) {
  const { recipe } = savedRecipe;

  return (
    <article className="grid grid-cols-[96px_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <button
        type="button"
        onClick={() => onOpenDetails(recipe)}
        className="overflow-hidden rounded-lg bg-slate-100"
        aria-label={`Open ${recipe.name}`}
      >
        <img src={recipe.images[0]} alt={recipe.name} className="h-full min-h-28 w-full object-cover" />
      </button>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenDetails(recipe)}
            className="min-w-0 text-left"
          >
            <h3 className="truncate text-lg font-black leading-tight text-slate-950">{recipe.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {recipe.timeMinutes} min
            </p>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(recipe.id)}
            title={savedRecipe.favorite ? 'Remove favorite' : 'Add favorite'}
            aria-label={savedRecipe.favorite ? 'Remove favorite' : 'Add favorite'}
            className={iconButtonClass(savedRecipe.favorite ? 'active' : 'neutral')}
          >
            <Heart className={savedRecipe.favorite ? 'h-5 w-5 fill-current' : 'h-5 w-5'} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
            {recipe.cuisine}
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-900">
            {recipe.protein}g protein
          </span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600">
            <Folder className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <select
              value={savedRecipe.folder}
              onChange={(event) => onMoveToFolder(recipe.id, event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 outline-none"
            >
              {folders.map((folder) => (
                <option key={folder}>{folder}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => onDeleteRecipe(recipe.id)}
            title="Delete recipe"
            aria-label={`Delete ${recipe.name}`}
            className={iconButtonClass('danger')}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
