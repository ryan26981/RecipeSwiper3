export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function AppSurface({ eyebrow, title, meta, children, actions }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 sm:pt-7">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-black leading-none text-slate-950">{title}</h1>
          {meta && <p className="mt-2 text-sm font-semibold text-slate-500">{meta}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function SectionBlock({ title, helper, children }) {
  return (
    <section className="border-t border-slate-200/80 py-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          {helper && <p className="mt-1 text-sm font-medium leading-5 text-slate-500">{helper}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Chip({ children, active = false, disabled = false, onClick, icon: Icon }) {
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      <span>{children}</span>
    </>
  );

  if (!onClick) {
    return (
      <span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm">
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cx(
        'inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-bold shadow-sm transition duration-200',
        active
          ? 'border-emerald-900 bg-emerald-950 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {content}
    </button>
  );
}

export function FieldShell({ icon: Icon, children, className }) {
  return (
    <label
      className={cx(
        'flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 shadow-sm ring-emerald-900/10 transition focus-within:ring-4',
        className,
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />}
      {children}
    </label>
  );
}

export function iconButtonClass(tone = 'neutral') {
  return cx(
    'inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-black shadow-sm transition duration-200 active:scale-[0.98]',
    tone === 'danger'
      ? 'border-red-100 bg-red-50 text-red-700 hover:bg-red-100'
      : tone === 'active'
        ? 'border-amber-200 bg-amber-200 text-slate-950 hover:bg-amber-300'
        : tone === 'primary'
          ? 'border-emerald-900 bg-emerald-950 text-white hover:bg-emerald-900'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950',
  );
}
