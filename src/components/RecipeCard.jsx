import { useEffect, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
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
      className={`card-enter relative mx-auto aspect-[4/5] w-full touch-none overflow-hidden rounded-[24px] bg-slate-950 shadow-card ring-1 ring-white/40 ${
        isDragging ? 'transition-transform duration-75' : 'transition-transform duration-300'
      }`}
      style={{
        transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${rotation}deg) scale(${
          1 - dragDistance / 2600
        })`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <img
        src={recipe.images[photoIndex]}
        alt={recipe.name}
        draggable="false"
        className="h-full w-full select-none object-cover transition duration-500"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.16)_46%,rgba(0,0,0,0.78)_100%)]" />

      {recipe.images.length > 1 && (
        <div className="absolute left-4 right-4 top-4 flex gap-1.5">
          {recipe.images.map((image, index) => (
            <span
              key={image}
              className={`h-1.5 flex-1 rounded-full shadow-sm ${
                index <= photoIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      <div
        className="absolute left-5 top-16 rounded-lg border border-emerald-200/70 bg-emerald-500/30 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-action backdrop-blur-xl"
        style={{ opacity: saveOpacity }}
      >
        Save
      </div>
      <div
        className="absolute right-5 top-16 rounded-lg border border-rose-200/70 bg-rose-500/30 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-action backdrop-blur-xl"
        style={{ opacity: skipOpacity }}
      >
        Skip
      </div>
      <div
        className="absolute left-1/2 top-16 -translate-x-1/2 rounded-lg border border-sky-200/70 bg-sky-500/30 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white shadow-action backdrop-blur-xl"
        style={{ opacity: detailsOpacity }}
      >
        Details
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-32 text-white">
        <h2 className="max-w-[14ch] text-[2rem] font-black leading-[0.98] tracking-normal text-white drop-shadow-sm sm:text-[2.15rem]">
          {recipe.name}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-base font-black text-white/[0.88]">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
          {recipe.timeMinutes} min
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map((stat) => (
            <span
              key={stat}
              className="rounded-lg border border-white/20 bg-white/20 px-3 py-1.5 text-sm font-black text-white shadow-sm backdrop-blur-xl"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
