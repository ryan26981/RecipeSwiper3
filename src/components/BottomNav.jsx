import { Compass, SlidersHorizontal, Bookmark } from 'lucide-react';

const NAV_ICONS = {
  preferences: SlidersHorizontal,
  discover: Compass,
  library: Bookmark,
};

export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 px-3">
      <div className="mx-auto grid max-w-[430px] grid-cols-3 gap-1 rounded-xl border border-white/80 bg-white/80 p-1.5 shadow-glass backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = NAV_ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition duration-200 ${
                isActive
                  ? 'bg-emerald-950 text-white shadow-action'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
