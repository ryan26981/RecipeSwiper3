import { Bookmark, Compass, UserRound } from 'lucide-react';

const NAV_ICONS = {
  preferences: UserRound,
  discover: Compass,
  library: Bookmark,
};

export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid h-[62px] max-w-[350px] grid-cols-3 rounded-[24px] border border-white/85 bg-white/94 p-1.5 shadow-[0_16px_42px_rgba(15,23,42,0.11)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = NAV_ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[0.68rem] font-black transition duration-200 min-[380px]:text-[0.72rem] ${
                isActive
                  ? 'bg-[#fff0ed] text-[#ff402f] shadow-[inset_0_0_0_1px_rgba(255,90,67,0.08)]'
                  : 'text-[#68779e] hover:bg-[#f7f8fb] hover:text-[#071124]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-1.5 h-1 w-5 rounded-full bg-[#ff5a43]" aria-hidden="true" />
              )}
              <Icon
                className={`h-5 w-5 stroke-[2.15] ${isActive ? 'mt-1' : ''}`}
                aria-hidden="true"
              />
              <span className="truncate leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
