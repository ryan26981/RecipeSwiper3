import {
  DEFAULT_FOLDERS,
  DEFAULT_PREFERENCES,
  DEFAULT_PROFILE_NAMES,
} from './constants.js';

const STORAGE_KEY = 'recipeswipe-app-state-v1';

export function createDefaultProfile(name, id) {
  return {
    id: id || `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    preferences: structuredClone(DEFAULT_PREFERENCES),
    savedRecipes: [],
    hiddenRecipeIds: [],
    dismissedSuggestionIds: [],
    folders: [...DEFAULT_FOLDERS],
  };
}

export function createInitialAppData() {
  const profiles = DEFAULT_PROFILE_NAMES.map((name) =>
    createDefaultProfile(name, `profile-${name.toLowerCase().replace(/\s+/g, '-')}`),
  );

  return {
    activeProfileId: profiles[0].id,
    profiles,
  };
}

function normalizeProfile(profile) {
  const fallback = createDefaultProfile(profile?.name || 'Me', profile?.id);

  return {
    ...fallback,
    ...profile,
    preferences: {
      ...fallback.preferences,
      ...(profile?.preferences || {}),
      cardStats: profile?.preferences?.cardStats?.length
        ? profile.preferences.cardStats.slice(0, 3)
        : fallback.preferences.cardStats,
    },
    savedRecipes: Array.isArray(profile?.savedRecipes) ? profile.savedRecipes : [],
    hiddenRecipeIds: Array.isArray(profile?.hiddenRecipeIds) ? profile.hiddenRecipeIds : [],
    dismissedSuggestionIds: Array.isArray(profile?.dismissedSuggestionIds)
      ? profile.dismissedSuggestionIds
      : [],
    folders: profile?.folders?.length ? profile.folders : fallback.folders,
  };
}

export function loadAppData() {
  if (typeof localStorage === 'undefined') {
    return createInitialAppData();
  }

  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return createInitialAppData();
  }

  try {
    const parsed = JSON.parse(storedValue);
    const profiles = Array.isArray(parsed.profiles)
      ? parsed.profiles.map(normalizeProfile)
      : createInitialAppData().profiles;
    const activeProfileId =
      profiles.find((profile) => profile.id === parsed.activeProfileId)?.id || profiles[0].id;

    return { activeProfileId, profiles };
  } catch {
    return createInitialAppData();
  }
}

export function saveAppData(appData) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}
