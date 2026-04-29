import { LockKeyhole, PanelTop } from 'lucide-react';
import { OPTIONAL_CARD_STATS } from '../utils/constants.js';
import { Chip, SectionBlock } from './ui.jsx';

export default function AdvancedSettings({ selectedStats, onChange }) {
  const totalFields = 2 + selectedStats.length;
  const isAtLimit = selectedStats.length >= 3;

  function toggleStat(statId) {
    if (selectedStats.includes(statId)) {
      onChange(selectedStats.filter((id) => id !== statId));
      return;
    }

    if (selectedStats.length < 3) {
      onChange([...selectedStats, statId]);
    }
  }

  return (
    <SectionBlock title="Recipe card display">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 text-white shadow-action">
            <PanelTop className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">Visible card fields</p>
            <p className="text-sm font-semibold text-slate-500">Meal name and time stay visible</p>
          </div>
        </div>
        <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-black text-white">
          {totalFields}/5
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Locked
          </p>
          <p className="mt-1 font-black text-slate-950">Meal name</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Locked
          </p>
          <p className="mt-1 font-black text-slate-950">Time to cook</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONAL_CARD_STATS.map((stat) => {
          const isSelected = selectedStats.includes(stat.id);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <Chip
              key={stat.id}
              onClick={() => toggleStat(stat.id)}
              disabled={isDisabled}
              active={isSelected}
            >
              {stat.label}
            </Chip>
          );
        })}
      </div>

      <p className="mt-3 text-sm font-bold text-slate-500">
        {totalFields}/5 card fields used
      </p>
    </SectionBlock>
  );
}
