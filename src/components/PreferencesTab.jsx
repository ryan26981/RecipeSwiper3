import AdvancedSettings from './AdvancedSettings.jsx';
import ProfileSwitcher from './ProfileSwitcher.jsx';
import { AppSurface, Chip, FieldShell, SectionBlock } from './ui.jsx';
import {
  CLEANUP_LEVELS,
  COMPLEXITIES,
  COOK_TIMES,
  CUISINES,
  DIET_RESTRICTIONS,
  EQUIPMENT,
  HEALTH_GOALS,
  MEAL_TYPES,
  PRICE_LEVELS,
  SPICE_LEVELS,
} from '../utils/constants.js';
import { Flame, Gauge, HeartPulse, Search, Timer, Utensils } from 'lucide-react';

export default function PreferencesTab({
  profile,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onCreateProfile,
  onUpdatePreferences,
}) {
  const preferences = profile.preferences;

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

  return (
    <AppSurface
      eyebrow={profile.name}
      title="Taste"
      meta="Personal filters and card display"
    >
      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={onSwitchProfile}
        onCreateProfile={onCreateProfile}
      />

      <div className="pt-2">
        <SectionBlock title="Health goal">
          <div className="flex flex-wrap gap-2">
            {HEALTH_GOALS.map((goal) => (
              <Chip
                key={goal}
                active={preferences.healthGoal === goal}
                onClick={() => setPreference('healthGoal', goal)}
              >
                {goal}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Complexity">
          <div className="flex flex-wrap gap-2">
            {COMPLEXITIES.map((complexity) => (
              <Chip
                key={complexity}
                active={preferences.complexities.includes(complexity)}
                onClick={() => toggleListValue('complexities', complexity)}
              >
                {complexity}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Price and time">
          <div className="flex flex-wrap gap-2">
            {PRICE_LEVELS.map((price) => (
              <Chip
                key={price}
                active={preferences.priceLevels.includes(price)}
                onClick={() => toggleListValue('priceLevels', price)}
              >
                {price}
              </Chip>
            ))}
          </div>
          <div className="mt-3">
            <FieldShell icon={Timer}>
              <select
                value={preferences.cookTime}
                onChange={(event) => setPreference('cookTime', event.target.value)}
                className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none"
              >
                {COOK_TIMES.map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
            </FieldShell>
          </div>
        </SectionBlock>

        <SectionBlock title="Calories">
          <FieldShell icon={Gauge}>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={preferences.maxCalories}
              onChange={(event) => setPreference('maxCalories', event.target.value)}
              placeholder="Maximum calories"
              className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </FieldShell>
        </SectionBlock>

        <SectionBlock title="Cuisine">
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((cuisine) => (
              <Chip
                key={cuisine}
                active={preferences.cuisines.includes(cuisine)}
                onClick={() => toggleListValue('cuisines', cuisine)}
              >
                {cuisine}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Meal type">
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((mealType) => (
              <Chip
                key={mealType}
                active={preferences.mealTypes.includes(mealType)}
                onClick={() => toggleListValue('mealTypes', mealType)}
              >
                {mealType}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Diet restrictions">
          <div className="flex flex-wrap gap-2">
            {DIET_RESTRICTIONS.map((restriction) => (
              <Chip
                key={restriction}
                active={preferences.dietRestrictions.includes(restriction)}
                onClick={() => toggleListValue('dietRestrictions', restriction)}
              >
                {restriction}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Ingredients">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldShell icon={Search}>
              <input
                value={preferences.dislikedIngredients}
                onChange={(event) => setPreference('dislikedIngredients', event.target.value)}
                placeholder="Disliked ingredients"
                className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </FieldShell>
            <FieldShell icon={HeartPulse}>
              <input
                value={preferences.favoriteIngredients}
                onChange={(event) => setPreference('favoriteIngredients', event.target.value)}
                placeholder="Favorite ingredients"
                className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </FieldShell>
          </div>
        </SectionBlock>

        <SectionBlock title="Equipment">
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((item) => (
              <Chip
                key={item}
                active={preferences.equipment.includes(item)}
                onClick={() => toggleListValue('equipment', item)}
              >
                {item}
              </Chip>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="Spice and cleanup">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldShell icon={Flame}>
              <select
                value={preferences.spiceTolerance}
                onChange={(event) => setPreference('spiceTolerance', event.target.value)}
                className="w-full bg-transparent py-3 font-bold text-slate-800 outline-none"
              >
                {SPICE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </FieldShell>
            <div className="flex flex-wrap gap-2">
              {CLEANUP_LEVELS.map((level) => (
                <Chip
                  key={level}
                  active={preferences.cleanupLevels.includes(level)}
                  onClick={() => toggleListValue('cleanupLevels', level)}
                  icon={Utensils}
                >
                  {level}
                </Chip>
              ))}
            </div>
          </div>
        </SectionBlock>

        <AdvancedSettings
          selectedStats={preferences.cardStats}
          onChange={(nextStats) => setPreference('cardStats', nextStats)}
        />
      </div>
    </AppSurface>
  );
}
