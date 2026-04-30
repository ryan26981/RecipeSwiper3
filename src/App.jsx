import { useEffect, useMemo, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import DiscoverTab from './components/DiscoverTab.jsx';
import PreferencesTab from './components/PreferencesTab.jsx';
import RecipeDetailSheet from './components/RecipeDetailSheet.jsx';
import RecipeLibraryTab from './components/RecipeLibraryTab.jsx';
import { mockRecipes } from './data/mockRecipes.js';
import { loadRecipeCatalog } from './data/themealdbRecipes.js';
import { TABS } from './utils/constants.js';
import { createDefaultProfile, loadAppData, saveAppData } from './utils/storage.js';

export default function App() {
  const [appData, setAppData] = useState(loadAppData);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeCatalogStatus, setRecipeCatalogStatus] = useState('loading');

  const activeProfile = useMemo(() => {
    return (
      appData.profiles.find((profile) => profile.id === appData.activeProfileId) ||
      appData.profiles[0]
    );
  }, [appData.activeProfileId, appData.profiles]);

  useEffect(() => {
    // Persist the whole profile tree so each profile keeps its own library and settings.
    saveAppData(appData);
  }, [appData]);

  useEffect(() => {
    let isActive = true;

    loadRecipeCatalog()
      .then((catalog) => {
        if (!isActive) return;
        const nextRecipes = catalog.length ? catalog : mockRecipes;
        setRecipes(nextRecipes);
        setRecipeCatalogStatus(catalog.length ? 'ready' : 'fallback');
      })
      .catch(() => {
        if (!isActive) return;
        setRecipes(mockRecipes);
        setRecipeCatalogStatus('fallback');
      });

    return () => {
      isActive = false;
    };
  }, []);

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
        {recipeCatalogStatus === 'loading' ? (
          <div className="flex min-h-screen items-center justify-center px-6 text-center">
            <div className="max-w-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5a43]">
                Loading recipes
              </p>
              <h1 className="mt-3 text-3xl font-black text-[#071124]">Free catalog setup</h1>
              <p className="mt-3 text-sm leading-6 text-[#6f7d99]">
                Pulling recipes from TheMealDB before the app becomes interactive.
              </p>
            </div>
          </div>
        ) : (
          <>
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
      {recipeCatalogStatus !== 'loading' && (
        <BottomNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      )}
    </div>
  );
}
