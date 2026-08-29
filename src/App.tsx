 import React, { useState, useEffect } from 'react';
import { PlayerProfile, PetType } from './types';
import {
  loadActiveProfile,
  saveActiveProfile,
  loadAllProfiles,
  createPlayerProfile,
  getSeedProfile,
} from './services/storage';
import { WelcomeView } from './components/views/WelcomeView';
import { GameHubView } from './components/views/GameHubView';
import { PetLogicView } from './components/views/PetLogicView';
import { CodePetView } from './components/views/CodePetView';
import { LevelMapView } from './components/views/LevelMapView';
import { EvaluationView } from './components/views/EvaluationView';
import { TrajectoriesView } from './components/views/TrajectoriesView';
import { PetAvatar } from './components/pet/PetAvatar';
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  BarChart3,
  ListTree,
  RotateCcw,
  Wand2,
  Users,
} from 'lucide-react';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(() => loadActiveProfile());
  const [allProfiles, setAllProfiles] = useState<PlayerProfile[]>(() => loadAllProfiles());
  const [currentView, setCurrentView] = useState<
    'welcome' | 'hub' | 'pet-logic' | 'code-pet' | 'level-map' | 'evaluation' | 'trajectories'
  >(() => (loadActiveProfile() ? 'hub' : 'welcome'));

  const [activeLevelId, setActiveLevelId] = useState<string>('logic-1');

  useEffect(() => {
    const p = loadActiveProfile();
    setActiveProfile(p);
    setAllProfiles(loadAllProfiles());
  }, []);

  const handleStartAdventure = (name: string, petType: PetType, petName: string) => {
    const newP = createPlayerProfile(name, petType, petName);
    setActiveProfile(newP);
    setAllProfiles(loadAllProfiles());
    setCurrentView('hub');
  };

  const handleSelectProfile = (id: string) => {
    const target = allProfiles.find((p) => p.id === id);
    if (target) {
      saveActiveProfile(target);
      setActiveProfile(target);
      setCurrentView('hub');
    }
  };

  const handleLaunchDemoMode = () => {
    const demo = getSeedProfile();
    saveActiveProfile(demo);
    setActiveProfile(demo);
    setAllProfiles(loadAllProfiles());
    setCurrentView('hub');
  };

  const handleUnlockAll = () => {
    if (!activeProfile) return;
    const updated = {
      ...activeProfile,
      unlockedLevels: [
        'logic-1',
        'logic-2',
        'logic-3',
        'logic-4',
        'logic-5',
        'code-1',
        'code-2',
        'code-3',
        'code-4',
        'code-5',
      ],
    };
    saveActiveProfile(updated);
    setActiveProfile(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Reset local progress and return to welcoming start?')) {
      localStorage.removeItem('hercodegames_active_profile');
      setActiveProfile(null);
      setCurrentView('welcome');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F6] text-[#2D264B] flex flex-col font-['Inter',sans-serif]">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => activeProfile && setCurrentView('hub')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Outfit'] font-extrabold text-lg sm:text-xl text-purple-950 tracking-tight flex items-center">
                HerCodeGames
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 text-pink-700 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide hidden sm:inline-flex items-center gap-1 shadow-2xs">
                  ✨ Coding game for Girls
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links for Active Player */}
          {activeProfile && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                id="nav-hub-btn"
                onClick={() => setCurrentView('hub')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  currentView === 'hub'
                    ? 'bg-purple-100 text-purple-900 shadow-2xs'
                    : 'text-purple-800 hover:bg-pink-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Hub</span>
              </button>

              <button
                id="nav-level-map-btn"
                onClick={() => setCurrentView('level-map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  currentView === 'level-map'
                    ? 'bg-pink-100 text-pink-900 shadow-2xs'
                    : 'text-purple-800 hover:bg-pink-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden md:inline">Map</span>
              </button>

              <button
                id="nav-eval-btn"
                onClick={() => setCurrentView('evaluation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  currentView === 'evaluation'
                    ? 'bg-indigo-100 text-indigo-900 shadow-2xs'
                    : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline">Evaluation Suite</span>
              </button>

              <button
                id="nav-traj-btn"
                onClick={() => setCurrentView('trajectories')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  currentView === 'trajectories'
                    ? 'bg-purple-100 text-purple-900 shadow-2xs'
                    : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                <ListTree className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden lg:inline">Trajectories</span>
              </button>

              {/* Player Quick Capsule */}
              <div className="flex items-center space-x-2 pl-2 border-l border-pink-200">
                <div
                  onClick={() => setCurrentView('welcome')}
                  className="flex items-center space-x-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 py-1 px-2.5 rounded-xl cursor-pointer transition-colors"
                  title="Switch Player"
                >
                  <PetAvatar type={activeProfile.pet.type} mood="idle" size="sm" />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-purple-950 leading-tight">
                      {activeProfile.name}
                    </p>
                    <p className="text-[10px] text-pink-600 font-semibold">
                      ⭐ {activeProfile.stars} stars
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center space-x-2">
            {!activeProfile && (
              <button
                id="nav-demo-mode-btn"
                onClick={handleLaunchDemoMode}
                className="py-1.5 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center space-x-1 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">1-Click Demo</span>
              </button>
            )}

            {activeProfile && (
              <button
                id="nav-reset-profile-btn"
                onClick={handleResetData}
                title="Reset or Switch Player"
                className="p-2 rounded-xl text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 pb-12">
        {currentView === 'welcome' && (
          <WelcomeView
            existingProfile={activeProfile}
            allProfiles={allProfiles}
            onStartAdventure={handleStartAdventure}
            onContinue={() => setCurrentView('hub')}
            onChooseLevel={() => setCurrentView('level-map')}
            onSelectProfile={handleSelectProfile}
            onLaunchDemoMode={handleLaunchDemoMode}
          />
        )}

        {currentView === 'hub' && activeProfile && (
          <GameHubView
            profile={activeProfile}
            onOpenPetLogic={(levelId) => {
              setActiveLevelId(levelId || 'logic-1');
              setCurrentView('pet-logic');
            }}
            onOpenCodePet={(levelId) => {
              setActiveLevelId(levelId || 'code-1');
              setCurrentView('code-pet');
            }}
            onOpenLevelMap={() => setCurrentView('level-map')}
            onOpenEvaluation={() => setCurrentView('evaluation')}
            onOpenTrajectories={() => setCurrentView('trajectories')}
            onUnlockAllLevels={handleUnlockAll}
          />
        )}

        {currentView === 'pet-logic' && activeProfile && (
          <PetLogicView
            profile={activeProfile}
            levelId={activeLevelId}
            onSelectLevel={(lvlId) => setActiveLevelId(lvlId)}
            onBackToHub={() => setCurrentView('hub')}
            onOpenCodePet={(lvlId) => {
              setActiveLevelId(lvlId || 'code-1');
              setCurrentView('code-pet');
            }}
            onProfileUpdated={(updated) => setActiveProfile(updated)}
          />
        )}

        {currentView === 'code-pet' && activeProfile && (
          <CodePetView
            profile={activeProfile}
            levelId={activeLevelId}
            onBackToHub={() => setCurrentView('hub')}
            onProfileUpdated={(updated) => setActiveProfile(updated)}
          />
        )}

        {currentView === 'level-map' && activeProfile && (
          <LevelMapView
            profile={activeProfile}
            onSelectLevel={(game, lvlId) => {
              setActiveLevelId(lvlId);
              setCurrentView(game === 'pet-logic' ? 'pet-logic' : 'code-pet');
            }}
            onBackToHub={() => setCurrentView('hub')}
          />
        )}

        {currentView === 'evaluation' && (
          <EvaluationView onBackToHub={() => setCurrentView('hub')} />
        )}

        {currentView === 'trajectories' && (
          <TrajectoriesView onBackToHub={() => setCurrentView('hub')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-5 text-center text-xs text-purple-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <p className="font-medium text-slate-700">
            <strong className="font-black text-pink-600">HerCodeGames</strong> &bull; Girls just wanna have fun! Learn to code
          </p>

          <span className="hidden sm:inline text-pink-200 font-black">•</span>

          <span className="font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
            Built by Bianca Mainella
          </span>
        </div>
      </footer>
    </div>
  );
}
