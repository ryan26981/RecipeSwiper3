import { Bookmark, Compass, UserRound } from 'lucide-react';

const NAV_ICONS = {
  preferences: UserRound,
  discover: Compass,
  library: Bookmark,
};

export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid h-[70px] max-w-[380px] grid-cols-3 rounded-[26px] border border-white/80 bg-white/94 px-3 py-2 shadow-[0_18px_52px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = NAV_ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex min-w-0 flex-col items-center justify-center rounded-[18px] px-1 text-[0.7rem] font-bold transition duration-200 min-[380px]:text-xs ${
                isActive
                  ? 'text-[#ff402f]'
                  : 'text-[#68779e] hover:bg-[#f7f8fb] hover:text-[#071124]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span className="absolute -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4f3f] text-white shadow-[0_12px_24px_rgba(255,79,63,0.28)] min-[380px]:h-11 min-[380px]:w-11">
                  <Icon className="h-5 w-5 stroke-[2.1]" aria-hidden="true" />
                </span>
              ) : (
                <Icon className="mb-1 h-5 w-5 stroke-[1.9] min-[380px]:h-6 min-[380px]:w-6" aria-hidden="true" />
              )}
              <span className={isActive ? 'mt-7 truncate leading-none' : 'truncate leading-none'}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
