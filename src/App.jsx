import { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import DiscoverTab from './components/DiscoverTab.jsx';
import PreferencesTab from './components/PreferencesTab.jsx';
import RecipeDetailSheet from './components/RecipeDetailSheet.jsx';
import RecipeLibraryTab from './components/RecipeLibraryTab.jsx';
import { mockRecipes } from './data/mockRecipes.js';
import { loadRecipeCatalog } from './data/spoonacularRecipes.js';
import { TABS } from './utils/constants.js';
import { createDefaultProfile, loadAppData, saveAppData } from './utils/storage.js';

function mergeRecipeLists(primaryRecipes, secondaryRecipes = []) {
  const recipesById = new Map();

  [...primaryRecipes, ...secondaryRecipes].forEach((recipe) => {
    if (!recipesById.has(recipe.id)) {
      recipesById.set(recipe.id, recipe);
    }
  });

  return Array.from(recipesById.values());
}

function getRecipeCatalogErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return 'Spoonacular took too long to respond, so the built-in catalog is active.';
  }

  const message = error instanceof Error ? error.message : '';
  if (/402|quota/i.test(message)) {
    return 'Spoonacular quota is unavailable, so the built-in catalog is active.';
  }
  if (/api key|SPOONACULAR_API_KEY/i.test(message)) {
    return 'Add SPOONACULAR_API_KEY to .env to load live Spoonacular recipes.';
  }

  return message || 'Spoonacular recipes could not be loaded, so the built-in catalog is active.';
}

function CatalogStatusNotice({ status, message }) {
  if (!['refreshing', 'error'].includes(status)) return null;

  const styles = {
    refreshing: {
      shell: 'border-[#dde9ff] bg-[#f6f9ff] text-[#2453a5]',
      label: 'Loading recipes',
      copy: 'Refreshing Spoonacular matches for this profile.',
    },
    error: {
      shell: 'border-[#ffd3cc] bg-[#fff4f1] text-[#b73928]',
      label: 'Recipe service',
      copy: 'Spoonacular recipes could not be loaded, so the built-in catalog is active.',
    },
  };
  const style = styles[status];

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pt-3">
      <div className={`rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${style.shell}`}>
        <p className="text-[0.68rem] font-black uppercase tracking-[0.14em]">
          {style.label}
        </p>
        <p className="mt-1 text-xs font-bold leading-5">{message || style.copy}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [appData, setAppData] = useState(loadAppData);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeCatalogStatus, setRecipeCatalogStatus] = useState('loading');
  const [recipeCatalogMessage, setRecipeCatalogMessage] = useState('');
  const hasLoadedRecipeCatalog = useRef(false);

  const activeProfile = useMemo(() => {
    return (
      appData.profiles.find((profile) => profile.id === appData.activeProfileId) ||
      appData.profiles[0]
    );
  }, [appData.activeProfileId, appData.profiles]);
  const activePreferencesKey = useMemo(
    () => JSON.stringify(activeProfile.preferences),
    [activeProfile.preferences],
  );

  useEffect(() => {
    // Persist the whole profile tree so each profile keeps its own library and settings.
    saveAppData(appData);
  }, [appData]);

  useEffect(() => {
    let isActive = true;

    setRecipeCatalogStatus(hasLoadedRecipeCatalog.current ? 'refreshing' : 'loading');
    setRecipeCatalogMessage('');

    loadRecipeCatalog(activeProfile.preferences)
      .then((catalog) => {
        if (!isActive) return;

        hasLoadedRecipeCatalog.current = true;

        if (catalog.length) {
          setRecipes((currentRecipes) => mergeRecipeLists(catalog, currentRecipes));
          setRecipeCatalogStatus('ready');
          return;
        }

        setRecipes((currentRecipes) => mergeRecipeLists(mockRecipes, currentRecipes));
        setRecipeCatalogStatus('ready');
      })
      .catch((error) => {
        if (!isActive) return;

        hasLoadedRecipeCatalog.current = true;
        setRecipes((currentRecipes) => mergeRecipeLists(mockRecipes, currentRecipes));
        setRecipeCatalogStatus('error');
        setRecipeCatalogMessage(getRecipeCatalogErrorMessage(error));
      });

    return () => {
      isActive = false;
    };
  }, [activePreferencesKey, activeProfile.preferences]);

  function updateActiveProfile(updateProfile) {
    setAppData((currentData) => ({
      ...currentData,
      profiles: currentData.profiles.map((profile) => {
        if (profile.id !== currentData.activeProfileId) return profile;
        return updateProfile(profile);
      }),
    }));
  }

  function switchProfile(profileId) {
    setAppData((currentData) => ({
      ...currentData,
      activeProfileId: profileId,
    }));
  }

  function createProfile(name) {
    setAppData((currentData) => {
      const existingProfile = currentData.profiles.find(
        (profile) => profile.name.toLowerCase() === name.toLowerCase(),
      );

      if (existingProfile) {
        return { ...currentData, activeProfileId: existingProfile.id };
      }

      const nextProfile = createDefaultProfile(name);
      return {
        activeProfileId: nextProfile.id,
        profiles: [...currentData.profiles, nextProfile],
      };
    });
  }

  function updatePreferences(nextPreferences) {
    updateActiveProfile((profile) => ({
      ...profile,
      preferences: nextPreferences,
    }));
  }

  function saveRecipe(recipeId) {
    updateActiveProfile((profile) => {
      const alreadySaved = profile.savedRecipes.some((recipe) => recipe.recipeId === recipeId);
      if (alreadySaved) return profile;

      const defaultFolder = profile.folders.includes('Want to Try')
        ? 'Want to Try'
        : profile.folders[0];

      return {
        ...profile,
        savedRecipes: [
          {
            recipeId,
            savedAt: Date.now(),
            favorite: false,
            folder: defaultFolder,
            plannedDay: '',
          },
          ...profile.savedRecipes,
        ],
        hiddenRecipeIds: profile.hiddenRecipeIds.filter((id) => id !== recipeId),
      };
    });
  }

  function hideRecipe(recipeId) {
    updateActiveProfile((profile) => {
      if (profile.hiddenRecipeIds.includes(recipeId)) return profile;

      return {
        ...profile,
        hiddenRecipeIds: [recipeId, ...profile.hiddenRecipeIds],
      };
    });
  }

  function resetHiddenRecipes() {
    updateActiveProfile((profile) => ({
      ...profile,
      hiddenRecipeIds: [],
    }));
  }

  function toggleFavorite(recipeId) {
    updateActiveProfile((profile) => ({
      ...profile,
      savedRecipes: profile.savedRecipes.map((savedRecipe) =>
        savedRecipe.recipeId === recipeId
          ? { ...savedRecipe, favorite: !savedRecipe.favorite }
          : savedRecipe,
      ),
    }));
  }

  function deleteSavedRecipe(recipeId) {
    updateActiveProfile((profile) => ({
      ...profile,
      savedRecipes: profile.savedRecipes.filter((savedRecipe) => savedRecipe.recipeId !== recipeId),
      hiddenRecipeIds: profile.hiddenRecipeIds.filter((id) => id !== recipeId),
    }));
  }

  function moveRecipeToFolder(recipeId, folder) {
    updateActiveProfile((profile) => ({
      ...profile,
      savedRecipes: profile.savedRecipes.map((savedRecipe) =>
        savedRecipe.recipeId === recipeId ? { ...savedRecipe, folder } : savedRecipe,
      ),
    }));
  }

  function planRecipe(recipeId, plannedDay) {
    updateActiveProfile((profile) => {
      const defaultFolder = profile.folders.includes('Want to Try')
        ? 'Want to Try'
        : profile.folders[0];
      const alreadySaved = profile.savedRecipes.some((savedRecipe) => savedRecipe.recipeId === recipeId);

      if (!alreadySaved) {
        return {
          ...profile,
          savedRecipes: [
            {
              recipeId,
              savedAt: Date.now(),
              favorite: false,
              folder: defaultFolder,
              plannedDay,
            },
            ...profile.savedRecipes,
          ],
          hiddenRecipeIds: profile.hiddenRecipeIds.filter((id) => id !== recipeId),
          dismissedSuggestionIds: profile.dismissedSuggestionIds.filter((id) => id !== recipeId),
        };
      }

      return {
        ...profile,
        savedRecipes: profile.savedRecipes.map((savedRecipe) =>
          savedRecipe.recipeId === recipeId ? { ...savedRecipe, plannedDay } : savedRecipe,
        ),
        dismissedSuggestionIds: profile.dismissedSuggestionIds.filter((id) => id !== recipeId),
      };
    });
  }

  function dismissSuggestion(recipeId) {
    updateActiveProfile((profile) => {
      if (profile.dismissedSuggestionIds.includes(recipeId)) return profile;

      return {
        ...profile,
        dismissedSuggestionIds: [recipeId, ...profile.dismissedSuggestionIds],
      };
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f7f4] text-[#071124]">
      <main>
        {recipeCatalogStatus === 'loading' && !recipes.length ? (
          <div className="flex min-h-screen items-center justify-center px-6 text-center">
            <div className="max-w-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a43]">
                Loading recipes
              </p>
              <h1 className="mt-3 text-3xl font-black text-[#071124]">Spoonacular catalog</h1>
              <p className="mt-3 text-sm leading-6 text-[#6f7d99]">
                Checking the local recipe proxy before the app becomes interactive.
              </p>
            </div>
          </div>
        ) : (
          <>
            <CatalogStatusNotice status={recipeCatalogStatus} message={recipeCatalogMessage} />
            {activeTab === 'preferences' && (
          <PreferencesTab
            profile={activeProfile}
            profiles={appData.profiles}
            activeProfileId={appData.activeProfileId}
            onSwitchProfile={switchProfile}
            onCreateProfile={createProfile}
            onUpdatePreferences={updatePreferences}
            recipes={recipes}
          />
        )}

            {activeTab === 'discover' && (
          <DiscoverTab
            recipes={recipes}
            profile={activeProfile}
            onSaveRecipe={saveRecipe}
            onHideRecipe={hideRecipe}
            onOpenDetails={setSelectedRecipe}
            onResetHidden={resetHiddenRecipes}
            onGoToPreferences={() => setActiveTab('preferences')}
          />
        )}

            {activeTab === 'library' && (
          <RecipeLibraryTab
            profile={activeProfile}
            recipes={recipes}
            onOpenDetails={setSelectedRecipe}
            onToggleFavorite={toggleFavorite}
            onDeleteSavedRecipe={deleteSavedRecipe}
            onMoveRecipeToFolder={moveRecipeToFolder}
            onPlanRecipe={planRecipe}
            onDismissSuggestion={dismissSuggestion}
          />
        )}
          </>
        )}
      </main>

      <RecipeDetailSheet recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      {(recipeCatalogStatus !== 'loading' || recipes.length > 0) && (
        <BottomNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      )}
    </div>
  );
}
