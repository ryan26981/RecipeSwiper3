import { useState } from 'react';
import { Plus, UserRound, UsersRound } from 'lucide-react';
import { FieldShell, iconButtonClass } from './ui.jsx';

export default function ProfileSwitcher({ profiles, activeProfileId, onSwitchProfile, onCreateProfile }) {
  const [profileName, setProfileName] = useState('');

  function handleCreate(event) {
    event.preventDefault();
    const nextName = profileName.trim();
    if (!nextName) return;

    onCreateProfile(nextName);
    setProfileName('');
  }

  return (
    <section className="space-y-3 border-b border-slate-200/80 pb-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <FieldShell icon={UsersRound}>
          <select
            value={activeProfileId}
            onChange={(event) => onSwitchProfile(event.target.value)}
            className="w-full bg-transparent py-3 text-base font-black text-slate-900 outline-none"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </FieldShell>
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-500 shadow-sm sm:flex">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {profiles.length} profiles
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <FieldShell icon={UserRound} className="flex-1">
          <input
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Create profile"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </FieldShell>
        <button
          type="submit"
          title="Add profile"
          aria-label="Add profile"
          className={iconButtonClass('primary')}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
