import { Bookmark, Compass, UserRound } from 'lucide-react';

const NAV_ICONS = {
  preferences: UserRound,
  discover: Compass,
  library: Bookmark,
};

export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 px-5">
      <div className="mx-auto grid h-[92px] max-w-[408px] grid-cols-3 rounded-[34px] border border-white/80 bg-white/90 px-5 py-3 shadow-[0_22px_65px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = NAV_ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex min-w-0 flex-col items-center justify-center rounded-[24px] px-1 text-sm font-bold transition duration-200 ${
                isActive
                  ? 'text-[#ff5a43]'
                  : 'text-[#9ca2b8] hover:bg-[#f7f7f4] hover:text-[#071124]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span className="absolute -top-8 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#ff6a4d] text-white shadow-[0_14px_28px_rgba(255,90,67,0.36)]">
                  <Icon className="h-7 w-7 stroke-[2.2]" aria-hidden="true" />
                </span>
              ) : (
                <Icon className="mb-2 h-7 w-7 stroke-[2.1]" aria-hidden="true" />
              )}
              <span className={isActive ? 'mt-10 truncate leading-none' : 'truncate leading-none'}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
