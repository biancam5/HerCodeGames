import React from 'react';
import { PlayerProfile } from '../../types';
import { PET_LOGIC_LEVELS, CODE_PET_LEVELS } from '../../data/levels';
import { PetAvatar } from '../pet/PetAvatar';
import { ChevronLeft, Sparkles, Star, Lock, Play, Award, CheckCircle } from 'lucide-react';

interface LevelMapViewProps {
  profile: PlayerProfile;
  onSelectLevel: (game: 'pet-logic' | 'code-pet', levelId: string) => void;
  onBackToHub: () => void;
}

export const LevelMapView: React.FC<LevelMapViewProps> = ({
  profile,
  onSelectLevel,
  onBackToHub,
}) => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pink-100">
        <div className="flex items-center space-x-3">
          <button
            id="map-back-to-hub-btn"
            onClick={onBackToHub}
            className="p-2.5 rounded-xl bg-white border border-pink-200 text-purple-900 hover:bg-pink-50 transition-all shadow-2xs flex items-center space-x-1 font-bold text-xs"
          >
            <ChevronLeft className="w-4 h-4 text-pink-600" />
            <span>Game Hub</span>
          </button>
          <div>
            <h1 className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-purple-950">
              Adventure Level Map
            </h1>
            <p className="text-xs text-purple-700">
              Replay completed levels or discover newly unlocked worlds!
            </p>
          </div>
        </div>

        {/* Total Stars Pill */}
        <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl shadow-2xs">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="font-['Outfit'] font-extrabold text-lg text-amber-900">
            {profile.stars} Stars
          </span>
        </div>
      </div>

      {/* SECTION 1: PET LOGIC ROADMAP */}
      <div className="bg-white/95 rounded-3xl p-6 md:p-8 border-2 border-pink-100 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h2 className="font-['Outfit'] font-extrabold text-xl text-purple-950">
                World 1: Pet Logic
              </h2>
              <p className="text-xs text-pink-600 font-semibold">Computational Thinking Foundation</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
            5 Levels
          </span>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {PET_LOGIC_LEVELS.map((lvl) => {
            const isCompleted = profile.completedLevels.includes(lvl.id);
            const isUnlocked = profile.unlockedLevels.includes(lvl.id);
            const stars = profile.levelStars[lvl.id] || 0;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) onSelectLevel('pet-logic', lvl.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative group ${
                  isCompleted
                    ? 'bg-gradient-to-b from-emerald-50 to-pink-50/30 border-emerald-300 shadow-2xs hover:shadow-md cursor-pointer hover:scale-102'
                    : isUnlocked
                    ? 'bg-white border-pink-300 shadow-2xs hover:shadow-md cursor-pointer hover:scale-102 ring-2 ring-pink-100'
                    : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 font-['Outfit'] font-extrabold text-xs flex items-center justify-center">
                      L{lvl.number}
                    </span>
                    {isCompleted ? (
                      <div className="flex text-amber-400 text-xs">
                        {Array.from({ length: stars || 3 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <h3 className="font-['Outfit'] font-bold text-sm text-purple-950 line-clamp-1">
                    {lvl.title}
                  </h3>
                  <p className="text-[11px] text-purple-700/80 font-medium mt-0.5">{lvl.concept}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-pink-100/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">
                    {isCompleted ? 'Replay' : isUnlocked ? 'Play' : 'Locked'}
                  </span>
                  {isUnlocked && <Play className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CODE YOUR PET ROADMAP */}
      <div className="bg-white/95 rounded-3xl p-6 md:p-8 border-2 border-purple-100 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h2 className="font-['Outfit'] font-extrabold text-xl text-purple-950">
                World 2: Code Your Pet
              </h2>
              <p className="text-xs text-purple-600 font-semibold">Real JavaScript Syntax & Algorithms</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
            5 Levels
          </span>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {CODE_PET_LEVELS.map((lvl) => {
            const isCompleted = profile.completedLevels.includes(lvl.id);
            const isUnlocked = profile.unlockedLevels.includes(lvl.id);
            const stars = profile.levelStars[lvl.id] || 0;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) onSelectLevel('code-pet', lvl.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative group ${
                  isCompleted
                    ? 'bg-gradient-to-b from-purple-50 to-indigo-50/30 border-purple-300 shadow-2xs hover:shadow-md cursor-pointer hover:scale-102'
                    : isUnlocked
                    ? 'bg-white border-purple-300 shadow-2xs hover:shadow-md cursor-pointer hover:scale-102 ring-2 ring-purple-100'
                    : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-['Outfit'] font-extrabold text-xs flex items-center justify-center">
                      L{lvl.number}
                    </span>
                    {isCompleted ? (
                      <div className="flex text-amber-400 text-xs">
                        {Array.from({ length: stars || 3 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <h3 className="font-['Outfit'] font-bold text-sm text-purple-950 line-clamp-1">
                    {lvl.title}
                  </h3>
                  <p className="text-[11px] text-purple-700/80 font-medium mt-0.5">{lvl.concept}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-purple-100/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">
                    {isCompleted ? 'Replay' : isUnlocked ? 'Play' : 'Locked'}
                  </span>
                  {isUnlocked && <Play className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
