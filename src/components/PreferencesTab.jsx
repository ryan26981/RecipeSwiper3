import { useState } from 'react';
import {
  Check,
  ChefHat,
  Flame,
  Gauge,
  Heart,
  HeartPulse,
  Leaf,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Smile,
  Tag,
  Timer,
  UserRound,
  UsersRound,
  Utensils,
} from 'lucide-react';
import {
  CLEANUP_LEVELS,
  COMPLEXITIES,
  COOK_TIMES,
  CUISINES,
  DEFAULT_PREFERENCES,
  DIET_RESTRICTIONS,
  EQUIPMENT,
  HEALTH_GOALS,
  MEAL_TYPES,
  OPTIONAL_CARD_STATS,
  PRICE_LEVELS,
  SPICE_LEVELS,
} from '../utils/constants.js';
import { getDiscoverRecipes } from '../utils/recipeFilters.js';
import { cx } from './ui.jsx';

const HEALTH_ICONS = {
  Balanced: Leaf,
  'High Protein': HeartPulse,
  'Low Calorie': Gauge,
  Vegetarian: Leaf,
  Bulking: Flame,
  Cutting: Timer,
};

const COMPLEXITY_ICONS = {
  Easy: Smile,
  Medium: Gauge,
  Difficult: Flame,
};

const CUISINE_MARKS = {
  American: 'US',
  Mexican: 'MX',
  Italian: 'IT',
  Asian: 'AS',
  Mediterranean: 'MED',
  Indian: 'IN',
};

const RESTRICTION_LABELS = {
  Vegan: 'Vegan',
  Vegetarian: 'Vegetarian',
  'Gluten-Free': 'Gluten Free',
  'Dairy-Free': 'Dairy Free',
  'Nut-Free': 'No Nuts',
};

const COOK_TIME_LABELS = {
  Any: 'Any',
  'Under 15 min': '< 15 min',
  'Under 30 min': '< 30 min',
  'Under 60 min': '< 60 min',
};

function SectionIcon({ icon: Icon, tone = 'green' }) {
  const tones = {
    green: 'bg-[#eefadc] text-[#55a630]',
    purple: 'bg-[#efe5ff] text-[#8a55e7]',
    coral: 'bg-[#fff0e9] text-[#ff5a43]',
    yellow: 'bg-[#fff6dd] text-[#dfa613]',
  };

  return (
    <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] sm:h-10 sm:w-10', tones[tone])}>
      <Icon className="h-4 w-4 stroke-[2.4] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
    </span>
  );
}

function SectionHeader({ icon, tone, title }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <SectionIcon icon={icon} tone={tone} />
      <h2 className="text-base font-black leading-none text-[#071124] sm:text-lg">{title}</h2>
    </div>
  );
}

function ChoicePill({
  children,
  active,
  onClick,
  icon: Icon,
  className,
  activeClassName = 'border-[#006046] bg-[#006046] text-white shadow-[0_18px_35px_rgba(0,96,70,0.22)]',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-[16px] border px-3 text-[0.78rem] font-bold text-[#4e596f] shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition duration-200 active:scale-[0.98] sm:min-h-12 sm:gap-2 sm:rounded-[18px] sm:px-4 sm:text-sm',
        active ? activeClassName : 'border-[#e7e8ec] bg-white hover:border-[#d6dae3]',
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.4] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />}
      <span className="truncate">{children}</span>
      {active && (
        <span className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25 sm:h-5 sm:w-5">
          <Check className="h-3 w-3 stroke-[3] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

function SegmentedChoice({ options, values, onToggle, icons = {}, tone = 'purple' }) {
  const activeClasses =
    tone === 'coral'
      ? 'bg-[#fff0e9] text-[#ff5a43]'
      : tone === 'green'
        ? 'bg-[#eefadc] text-[#3f9b21]'
        : 'bg-[#efe5ff] text-[#8a55e7]';

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-[16px] border border-[#e6e8ee] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:rounded-[18px]">
      {options.map((option) => {
        const Icon = icons[option];
        const active = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={active}
            className={cx(
              'flex min-h-11 items-center justify-center gap-1.5 border-r border-[#e6e8ee] px-2 text-[0.78rem] font-bold text-[#687084] transition last:border-r-0 sm:min-h-12 sm:gap-2 sm:text-sm',
              active && activeClasses,
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 stroke-[2.4] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />}
            <span className="truncate">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function CuisineButton({ cuisine, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'relative flex h-[76px] min-w-[76px] flex-col items-center justify-center rounded-[20px] border px-2 text-center text-[0.68rem] font-bold shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition duration-200 active:scale-[0.98] sm:h-[86px] sm:min-w-[88px] sm:rounded-[24px] sm:text-xs',
        active
          ? 'border-[#d5f4be] bg-[#eefadc] text-[#3f9b21]'
          : 'border-[#e7e8ec] bg-white text-[#4e596f]',
      )}
    >
      {active && (
        <span className="absolute right-1.5 top-[-7px] flex h-5 w-5 items-center justify-center rounded-full bg-[#55a630] text-white shadow-action sm:h-6 sm:w-6">
          <Check className="h-3 w-3 stroke-[3] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        </span>
      )}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[0.58rem] font-black text-[#55a630] sm:h-9 sm:w-9 sm:text-[0.68rem]">
        {CUISINE_MARKS[cuisine] || cuisine.slice(0, 2).toUpperCase()}
      </span>
      <span className="mt-1.5 max-w-full truncate sm:mt-2">{cuisine}</span>
    </button>
  );
}

function MiniField({ icon: Icon, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-[16px] border border-[#e7e8ec] bg-white px-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)] focus-within:ring-4 focus-within:ring-[#ff5a43]/10 sm:min-h-12 sm:rounded-[18px]">
      <Icon className="h-4 w-4 shrink-0 text-[#8b93a7] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      <input
        type={type}
        min={type === 'number' ? '0' : undefined}
        inputMode={type === 'number' ? 'numeric' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[0.82rem] font-bold text-[#071124] outline-none placeholder:text-[#9ca4b8] sm:text-sm"
      />
    </label>
  );
}

function ProfileMiniForm({ profiles, activeProfileId, onSwitchProfile, onCreateProfile }) {
  const [name, setName] = useState('');

  function submitProfile(event) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) return;

    onCreateProfile(nextName);
    setName('');
  }

  return (
    <section className="border-t border-[#eceef3] pt-5">
      <SectionHeader icon={UsersRound} tone="purple" title="Profiles" />
      <div className="grid gap-2 min-[420px]:grid-cols-[1fr_auto]">
        <label className="flex min-h-11 items-center gap-2 rounded-[16px] border border-[#e7e8ec] bg-white px-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:min-h-12 sm:rounded-[18px]">
          <UserRound className="h-4 w-4 shrink-0 text-[#8b93a7] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
          <select
            value={activeProfileId}
            onChange={(event) => onSwitchProfile(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[0.82rem] font-black text-[#071124] outline-none sm:text-sm"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={submitProfile} className="flex gap-2">
          <label className="flex min-h-11 min-w-0 flex-1 items-center rounded-[16px] border border-[#e7e8ec] bg-white px-3 shadow-[0_8px_22px_rgba(15,23,42,0.05)] sm:min-h-12 sm:rounded-[18px]">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Create profile"
              className="min-w-0 flex-1 bg-transparent text-[0.82rem] font-bold text-[#071124] outline-none placeholder:text-[#9ca4b8] sm:text-sm"
            />
          </label>
          <button
            type="submit"
            title="Add profile"
            aria-label="Add profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#071124] text-white shadow-action sm:h-12 sm:w-12 sm:rounded-[18px]"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}

function AvocadoIllustration() {
  return (
    <div className="pointer-events-none absolute -right-4 bottom-0 hidden h-[142px] w-[156px] sm:block">
      <div className="absolute bottom-0 right-0 h-[118px] w-[118px] rounded-full bg-[#ff8f7d]/30" />
      <div className="absolute bottom-5 left-0 h-11 w-20 -rotate-12 rounded-full bg-[#82bd31]" />
      <div className="absolute bottom-4 left-14 h-[118px] w-[74px] rotate-12 rounded-[46px] bg-[#3f8d26] shadow-[inset_-10px_0_0_rgba(0,0,0,0.12)]" />
      <div className="absolute bottom-8 left-[4.55rem] h-[88px] w-[54px] rotate-12 rounded-[34px] bg-[#e5f78f]" />
      <div className="absolute bottom-11 left-[5.15rem] h-8 w-8 rotate-12 rounded-full bg-[#a85d2b] shadow-[inset_-6px_4px_0_rgba(255,255,255,0.16)]" />
      <span className="absolute bottom-[5.4rem] left-[5.65rem] h-1 w-1 rounded-full bg-[#071124]" />
      <span className="absolute bottom-[5.4rem] left-[6.5rem] h-1 w-1 rounded-full bg-[#071124]" />
      <span className="absolute bottom-[4.85rem] left-[5.95rem] h-2 w-4 rounded-b-full border-b-2 border-[#071124]" />
    </div>
  );
}

export default function PreferencesTab({
  profile,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onCreateProfile,
  onUpdatePreferences,
  recipes,
}) {
  const preferences = profile.preferences;
  const favoriteCount = profile.savedRecipes.filter((savedRecipe) => savedRecipe.favorite).length;
  const stackLeft = getDiscoverRecipes(recipes, profile).length;
  const initials = profile.name.slice(0, 2).toUpperCase();
  const greetingName = profile.name.toLowerCase() === 'me' ? 'Alex' : profile.name;

  function setPreference(field, value) {
    onUpdatePreferences({ ...preferences, [field]: value });
  }

  function toggleListValue(field, value) {
    const currentValues = preferences[field];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    setPreference(field, nextValues);
  }

  function resetPreferences() {
    onUpdatePreferences({ ...DEFAULT_PREFERENCES });
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f7f7f4] px-2 pb-28 pt-2 text-[#071124] sm:px-4 sm:pt-5">
      <div className="relative overflow-hidden rounded-t-[28px] bg-[#ffe7db] px-4 pb-7 pt-5 shadow-[0_18px_54px_rgba(255,91,67,0.12)] sm:rounded-t-[36px] sm:px-6 sm:pb-9 sm:pt-7">
        <div className="absolute -right-14 -top-12 h-36 w-36 rounded-full bg-white/25 sm:-right-9 sm:h-40 sm:w-40" />
        <div className="absolute right-1 top-12 h-20 w-28 rounded-full bg-[#fdd6c8]/70 sm:right-4 sm:h-24 sm:w-32" />
        <AvocadoIllustration />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#d6eb12] text-lg font-black shadow-[0_14px_34px_rgba(255,91,67,0.14)] sm:h-20 sm:w-20 sm:border-[5px] sm:text-2xl">
              {initials}
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[3px] border-white bg-[#ff5a43] sm:bottom-1 sm:h-6 sm:w-6 sm:border-[4px]" />
              </div>
              <p className="min-w-0 truncate text-xs font-bold text-[#e0573d] sm:text-sm">
                Good morning, {greetingName}
              </p>
            </div>

            <button
              type="button"
              title="Profile settings"
              aria-label="Profile settings"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white text-[#071124] shadow-[0_12px_28px_rgba(15,23,42,0.11)] sm:h-14 sm:w-14 sm:rounded-[20px]"
            >
              <Settings className="h-5 w-5 stroke-[2.2] sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </div>

          <h1 className="mt-4 max-w-[10em] text-[1.75rem] font-black leading-[0.98] text-[#071124] sm:mt-2 sm:max-w-[9em] sm:text-[2rem]">
            Your taste, your way
          </h1>
          <p className="mt-2 max-w-[20rem] truncate text-sm font-bold text-[#71809a] sm:mt-3 sm:text-base">
            {preferences.healthGoal} picks - {preferences.cookTime === 'Any' ? 'any cook time' : preferences.cookTime.toLowerCase()}
          </p>
        </div>

        <div className="relative z-10 mt-5 grid max-w-[230px] grid-cols-2 gap-2 sm:mt-6 sm:max-w-[245px] sm:gap-3">
          <div className="flex h-14 items-center gap-2.5 rounded-[18px] border border-white/70 bg-white/60 px-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur sm:h-16 sm:gap-3 sm:rounded-[20px] sm:px-4">
            <Flame className="h-5 w-5 fill-[#ff5a43] text-[#ff5a43] sm:h-7 sm:w-7" aria-hidden="true" />
            <div>
              <p className="text-xl font-black leading-none sm:text-2xl">{stackLeft}</p>
              <p className="mt-0.5 text-[0.55rem] font-black uppercase leading-none text-[#ff5a43] sm:mt-1 sm:text-[0.62rem]">
                Stack left
              </p>
            </div>
          </div>
          <div className="flex h-14 items-center gap-2.5 rounded-[18px] border border-white/70 bg-white/60 px-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur sm:h-16 sm:gap-3 sm:rounded-[20px] sm:px-4">
            <Heart className="h-5 w-5 fill-[#ff5a43] text-[#ff5a43] sm:h-7 sm:w-7" aria-hidden="true" />
            <div>
              <p className="text-xl font-black leading-none sm:text-2xl">{favoriteCount}</p>
              <p className="mt-0.5 text-[0.55rem] font-black uppercase leading-none text-[#ff5a43] sm:mt-1 sm:text-[0.62rem]">
                Favorites
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-5 rounded-t-[26px] bg-white px-4 pb-5 pt-7 shadow-[0_-14px_44px_rgba(15,23,42,0.06)] sm:-mt-6 sm:rounded-t-[30px] sm:px-6 sm:pb-6 sm:pt-8">
        <section className="border-b border-[#eceef3] pb-4 sm:pb-5">
          <SectionHeader icon={Leaf} tone="green" title="Health Goal" />
          <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
            {HEALTH_GOALS.map((goal) => {
              const Icon = HEALTH_ICONS[goal] || Leaf;
              return (
                <ChoicePill
                  key={goal}
                  active={preferences.healthGoal === goal}
                  onClick={() => setPreference('healthGoal', goal)}
                  icon={Icon}
                  className="w-full"
                >
                  {goal}
                </ChoicePill>
              );
            })}
          </div>
        </section>

        <section className="border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={ChefHat} tone="purple" title="Complexity" />
          <SegmentedChoice
            options={COMPLEXITIES}
            values={preferences.complexities}
            onToggle={(value) => toggleListValue('complexities', value)}
            icons={COMPLEXITY_ICONS}
          />
        </section>

        <section className="grid gap-4 border-b border-[#eceef3] py-4 min-[420px]:grid-cols-2 sm:gap-5 sm:py-5">
          <div>
            <SectionHeader icon={Tag} tone="green" title="Price" />
            <div className="flex flex-wrap gap-2">
              {PRICE_LEVELS.map((price) => (
                <ChoicePill
                  key={price}
                  active={preferences.priceLevels.includes(price)}
                  onClick={() => toggleListValue('priceLevels', price)}
                  className="min-h-11 px-3"
                  activeClassName="border-[#55a630] bg-[#eefadc] text-[#3f9b21]"
                >
                  {price}
                </ChoicePill>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader icon={Timer} tone="coral" title="Cook Time" />
            <div className="grid grid-cols-2 gap-2">
              {COOK_TIMES.map((time) => (
                <ChoicePill
                  key={time}
                  active={preferences.cookTime === time}
                  onClick={() => setPreference('cookTime', time)}
                  className="min-h-11 px-3"
                  activeClassName="border-[#ff6a4d] bg-[#fff0e9] text-[#ff5a43]"
                >
                  {COOK_TIME_LABELS[time] || time}
                </ChoicePill>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={Smile} tone="yellow" title="Cuisine / Mood" />
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:gap-3 sm:px-6">
            {CUISINES.map((cuisine) => (
              <CuisineButton
                key={cuisine}
                cuisine={cuisine}
                active={preferences.cuisines.includes(cuisine)}
                onClick={() => toggleListValue('cuisines', cuisine)}
              />
            ))}
          </div>
        </section>

        <section className="border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={ShieldCheck} tone="purple" title="Restrictions" />
          <div className="flex flex-wrap gap-2">
            {DIET_RESTRICTIONS.map((restriction) => (
              <ChoicePill
                key={restriction}
                active={preferences.dietRestrictions.includes(restriction)}
                onClick={() => toggleListValue('dietRestrictions', restriction)}
                className="min-h-11 px-3.5"
                activeClassName="border-[#9659f4] bg-[#f4eaff] text-[#8a55e7]"
              >
                {RESTRICTION_LABELS[restriction] || restriction}
              </ChoicePill>
            ))}
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#cfd3dc] bg-white px-4 text-sm font-bold text-[#8b93a7]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </div>
        </section>

        <section className="grid gap-3 border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={Gauge} tone="coral" title="More Filters" />
          <MiniField
            icon={Gauge}
            type="number"
            value={preferences.maxCalories}
            onChange={(value) => setPreference('maxCalories', value)}
            placeholder="Maximum calories"
          />
          <div className="grid gap-2 min-[420px]:grid-cols-2">
            <MiniField
              icon={Search}
              value={preferences.dislikedIngredients}
              onChange={(value) => setPreference('dislikedIngredients', value)}
              placeholder="Disliked ingredients"
            />
            <MiniField
              icon={HeartPulse}
              value={preferences.favoriteIngredients}
              onChange={(value) => setPreference('favoriteIngredients', value)}
              placeholder="Favorite ingredients"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((mealType) => (
              <ChoicePill
                key={mealType}
                active={preferences.mealTypes.includes(mealType)}
                onClick={() => toggleListValue('mealTypes', mealType)}
                className="min-h-10 px-3 text-xs"
                activeClassName="border-[#ff6a4d] bg-[#fff0e9] text-[#ff5a43]"
              >
                {mealType}
              </ChoicePill>
            ))}
          </div>
        </section>

        <section className="grid gap-4 border-b border-[#eceef3] py-4 min-[420px]:grid-cols-2 sm:gap-5 sm:py-5">
          <div>
            <SectionHeader icon={Utensils} tone="green" title="Equipment" />
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((item) => (
                <ChoicePill
                  key={item}
                  active={preferences.equipment.includes(item)}
                  onClick={() => toggleListValue('equipment', item)}
                  className="min-h-10 px-3 text-xs"
                  activeClassName="border-[#55a630] bg-[#eefadc] text-[#3f9b21]"
                >
                  {item}
                </ChoicePill>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader icon={Flame} tone="coral" title="Spice" />
            <div className="grid grid-cols-2 gap-2">
              {SPICE_LEVELS.map((level) => (
                <ChoicePill
                  key={level}
                  active={preferences.spiceTolerance === level}
                  onClick={() => setPreference('spiceTolerance', level)}
                  className="min-h-10 px-3 text-xs"
                  activeClassName="border-[#ff6a4d] bg-[#fff0e9] text-[#ff5a43]"
                >
                  {level}
                </ChoicePill>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={Utensils} tone="yellow" title="Cleanup" />
          <div className="flex flex-wrap gap-2">
            {CLEANUP_LEVELS.map((level) => (
              <ChoicePill
                key={level}
                active={preferences.cleanupLevels.includes(level)}
                onClick={() => toggleListValue('cleanupLevels', level)}
                className="min-h-10 px-3 text-xs"
                activeClassName="border-[#dfa613] bg-[#fff6dd] text-[#b98500]"
              >
                {level}
              </ChoicePill>
            ))}
          </div>
        </section>

        <section className="border-b border-[#eceef3] py-4 sm:py-5">
          <SectionHeader icon={ChefHat} tone="purple" title="Recipe Card" />
          <p className="mb-3 text-sm font-bold text-[#8b93a7]">Pick up to three extra fields.</p>
          <div className="flex flex-wrap gap-2">
            {OPTIONAL_CARD_STATS.map((stat) => {
              const selected = preferences.cardStats.includes(stat.id);
              const disabled = !selected && preferences.cardStats.length >= 3;

              return (
                <ChoicePill
                  key={stat.id}
                  active={selected}
                  onClick={() => {
                    if (selected) {
                      setPreference(
                        'cardStats',
                        preferences.cardStats.filter((id) => id !== stat.id),
                      );
                      return;
                    }

                    if (!disabled) {
                      setPreference('cardStats', [...preferences.cardStats, stat.id]);
                    }
                  }}
                  className={cx('min-h-10 px-3 text-xs', disabled && 'cursor-not-allowed opacity-40')}
                  activeClassName="border-[#9659f4] bg-[#f4eaff] text-[#8a55e7]"
                >
                  {stat.label}
                </ChoicePill>
              );
            })}
          </div>
        </section>

        <ProfileMiniForm
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitchProfile={onSwitchProfile}
          onCreateProfile={onCreateProfile}
        />

        <button
          type="button"
          onClick={resetPreferences}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#f7f7f4] px-4 py-4 text-sm font-black text-[#8b93a7]"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Reset all preferences
        </button>
      </div>
    </section>
  );
}
