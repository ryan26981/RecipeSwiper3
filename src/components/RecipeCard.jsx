import { useEffect, useRef, useState } from 'react';
import { ChefHat, Clock3, Dumbbell } from 'lucide-react';
import { formatStat } from '../utils/recipeFilters.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getHighlights(recipe, cardStats = []) {
  const chosenStats = cardStats
    .slice(0, 3)
    .map((statId) => formatStat(recipe, statId))
    .filter(Boolean);

  return Array.from(new Set(chosenStats.length ? chosenStats : [recipe.complexity])).slice(0, 3);
}

const RECIPE_DESCRIPTIONS = {
  'greek-chicken-pita': 'Marinated chicken, tzatziki, feta, crisp greens.',
};

const BADGE_STYLES = {
  neutral: 'bg-[#f3f3f3] text-[#70737c]',
  green: 'bg-[#f4f7f1] text-[#339218]',
  purple: 'bg-[#f5f2fa] text-[#68626f]',
};

function getRecipeDescription(recipe) {
  if (RECIPE_DESCRIPTIONS[recipe.id]) return RECIPE_DESCRIPTIONS[recipe.id];

  const ingredientList = recipe.ingredients.slice(0, 3);
  const lastIngredient = ingredientList.pop();
  const ingredients = ingredientList.length
    ? `${ingredientList.join(', ')} & ${lastIngredient}`
    : lastIngredient;

  return `${recipe.cuisine} ${recipe.mealType.toLowerCase()} with ${ingredients}.`;
}

function StatBadge({ icon: Icon, label, tone = 'neutral' }) {
  return (
    <span
      className={`inline-flex h-7 min-w-0 items-center gap-1.5 rounded-[9px] px-2.5 text-[0.64rem] font-black uppercase leading-none min-[380px]:text-[0.68rem] ${BADGE_STYLES[tone]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.6]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function CalorieRing({ recipe }) {
  const progress = clamp(recipe.healthScore, 55, 92);

  return (
    <div
      className="relative flex h-[4.35rem] w-[4.35rem] shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.92),0_10px_24px_rgba(51,146,24,0.13)] sm:h-20 sm:w-20"
      style={{
        background: `conic-gradient(#9fd987 ${progress}%, #edf5e8 0)`,
      }}
      aria-label={`${recipe.calories} calories`}
    >
      <div className="absolute inset-1.5 rounded-full bg-[#fbfcf9]" />
      <div className="relative text-center">
        <p className="text-[1.22rem] font-black leading-none text-[#277c12] sm:text-[1.38rem]">{recipe.calories}</p>
        <p className="mt-0.5 text-[0.58rem] font-black uppercase leading-none tracking-[0.08em] text-[#4b9b34] sm:text-[0.64rem]">
          Cal
        </p>
      </div>
    </div>
  );
}

export default function RecipeCard({ recipe, cardStats, onSave, onHide, onOpenDetails }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const startPoint = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    setPhotoIndex(0);
    setDrag({ x: 0, y: 0 });
  }, [recipe.id]);

  function goToNextPhoto() {
    setPhotoIndex((current) => Math.min(current + 1, recipe.images.length - 1));
  }

  function goToPreviousPhoto() {
    setPhotoIndex((current) => Math.max(current - 1, 0));
  }

  function handlePointerDown(event) {
    startPoint.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    cardRef.current?.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!startPoint.current) return;

    setDrag({
      x: event.clientX - startPoint.current.x,
      y: event.clientY - startPoint.current.y,
    });
  }

  function handlePointerUp(event) {
    if (!startPoint.current) return;

    const deltaX = event.clientX - startPoint.current.x;
    const deltaY = event.clientY - startPoint.current.y;
    const wasTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;

    cardRef.current?.releasePointerCapture(startPoint.current.pointerId);
    startPoint.current = null;
    setDrag({ x: 0, y: 0 });

    if (wasTap) {
      const bounds = cardRef.current?.getBoundingClientRect();
      if (!bounds || recipe.images.length <= 1) return;
      const tappedRightSide = event.clientX > bounds.left + bounds.width / 2;
      tappedRightSide ? goToNextPhoto() : goToPreviousPhoto();
      return;
    }

    if (deltaY < -80 && Math.abs(deltaY) > Math.abs(deltaX)) {
      onOpenDetails(recipe);
      return;
    }

    if (deltaX > 90) {
      onSave(recipe.id);
      return;
    }

    if (deltaX < -90) {
      onHide(recipe.id);
    }
  }

  const highlights = getHighlights(recipe, cardStats);
  const featuredTag = recipe.tags[0] || highlights[0];
  const rotation = clamp(drag.x / 20, -9, 9);
  const dragDistance = Math.min(Math.abs(drag.x) + Math.abs(drag.y), 180);
  const saveOpacity = clamp((drag.x - 35) / 90, 0, 1);
  const skipOpacity = clamp((-drag.x - 35) / 90, 0, 1);
  const detailsOpacity = clamp((-drag.y - 35) / 90, 0, 1);
  const isDragging = Boolean(startPoint.current);

  return (
    <article
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startPoint.current = null;
        setDrag({ x: 0, y: 0 });
      }}
      className={`card-enter relative z-10 mx-auto w-full touch-none overflow-hidden rounded-[30px] bg-white shadow-card ring-1 ring-black/[0.03] ${
        isDragging ? 'transition-transform duration-75' : 'transition-transform duration-300'
      }`}
      style={{
        transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotation}deg) scale(${
          1 - dragDistance / 2600
        })`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="relative h-[clamp(285px,39svh,410px)] overflow-hidden bg-[#e8e2d5]">
        <img
          src={recipe.images[photoIndex]}
          alt={recipe.name}
          draggable="false"
          className="h-full w-full select-none object-cover transition duration-500"
        />

        <div
          className="absolute left-5 top-16 rounded-[16px] border border-white/70 bg-[#44a934]/45 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-action backdrop-blur-xl"
          style={{ opacity: saveOpacity }}
        >
          Save
        </div>
        <div
          className="absolute right-5 top-16 rounded-[16px] border border-white/70 bg-[#ff5a43]/50 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-action backdrop-blur-xl"
          style={{ opacity: skipOpacity }}
        >
          Skip
        </div>
        <div
          className="absolute left-1/2 top-16 -translate-x-1/2 rounded-[16px] border border-white/70 bg-white/40 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#071124] shadow-action backdrop-blur-xl"
          style={{ opacity: detailsOpacity }}
        >
          Nutrition
        </div>
      </div>

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-5 pb-5 pt-4 sm:px-6">
        <span className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-[#e7e3dd]" />

        <div className="min-w-0">
          <h2 className="truncate text-[1.38rem] font-black leading-tight tracking-[-0.035em] text-[#071124] sm:text-[1.65rem]">
            {recipe.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-[#687086] sm:text-sm">
            {getRecipeDescription(recipe)}
          </p>
        </div>

        <CalorieRing recipe={recipe} />

        <div className="col-span-2 flex min-w-0 flex-nowrap gap-1.5 overflow-hidden border-t border-[#f0eee9] pt-3 min-[380px]:gap-2">
          <StatBadge icon={Clock3} label={`${recipe.timeMinutes} min`} />
          <StatBadge icon={ChefHat} label={recipe.complexity} tone="green" />
          {featuredTag && <StatBadge icon={Dumbbell} label={featuredTag} tone="purple" />}
        </div>
      </div>
    </article>
  );
}
