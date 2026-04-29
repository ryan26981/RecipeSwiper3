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
  'greek-chicken-pita': 'Juicy marinated chicken, tzatziki, feta & crisp veggies.',
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
      className={`inline-flex h-8 min-w-0 items-center gap-1.5 rounded-[9px] px-3 text-[0.75rem] font-black uppercase leading-none ${BADGE_STYLES[tone]}`}
    >
      <Icon className="h-4 w-4 shrink-0 stroke-[2.6]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function CalorieRing({ recipe }) {
  const progress = clamp(recipe.healthScore, 55, 92);

  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
      style={{
        background: `conic-gradient(#bde3a6 ${progress}%, #edf5e8 0)`,
      }}
      aria-label={`${recipe.calories} calories`}
    >
      <div className="absolute inset-1.5 rounded-full bg-white" />
      <div className="relative text-center">
        <p className="text-[1.55rem] font-black leading-none text-[#339218] sm:text-[1.85rem]">{recipe.calories}</p>
        <p className="mt-1 text-[0.72rem] font-black uppercase leading-none text-[#339218] sm:text-[0.85rem]">
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
      className={`card-enter relative z-10 mx-auto w-full touch-none overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-white/70 ${
        isDragging ? 'transition-transform duration-75' : 'transition-transform duration-300'
      }`}
      style={{
        transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotation}deg) scale(${
          1 - dragDistance / 2600
        })`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="relative h-[clamp(270px,37svh,390px)] overflow-hidden bg-[#e8e2d5]">
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

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 pb-5 pt-7">
        <span className="absolute left-1/2 top-3 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#dedede]" />

        <div className="min-w-0">
          <h2 className="truncate text-[1.45rem] font-black leading-tight text-[#071124] sm:text-[1.75rem]">
            {recipe.name}
          </h2>
          <p className="mt-1 truncate text-sm font-bold text-[#8c93a8]">
            {getRecipeDescription(recipe)}
          </p>

          <div className="mt-4 flex min-w-0 flex-wrap gap-2">
            <StatBadge icon={Clock3} label={`${recipe.timeMinutes} min`} />
            <StatBadge icon={ChefHat} label={recipe.complexity} tone="green" />
            {featuredTag && <StatBadge icon={Dumbbell} label={featuredTag} tone="purple" />}
          </div>
        </div>

        <CalorieRing recipe={recipe} />
      </div>
    </article>
  );
}
