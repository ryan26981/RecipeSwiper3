import { Bookmark, Compass, ShoppingCart, UserRound } from 'lucide-react';

const NAV_ICONS = {
  preferences: UserRound,
  discover: Compass,
  groceries: ShoppingCart,
  library: Bookmark,
};

export default function BottomNav({ tabs, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid h-[58px] max-w-[390px] grid-cols-4 rounded-[24px] border border-white/85 bg-white/94 p-1 shadow-[0_14px_36px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = NAV_ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 text-[0.6rem] font-black transition duration-200 min-[380px]:text-[0.66rem] ${
                isActive
                  ? 'border border-[#071124] bg-[#fff0ed] text-[#ff402f] shadow-[inset_0_0_0_1px_rgba(255,90,67,0.08)]'
                  : 'text-[#68779e] hover:bg-[#f7f8fb] hover:text-[#071124]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="h-[18px] w-[18px] stroke-[2.15]"
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
