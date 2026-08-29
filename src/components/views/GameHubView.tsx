
import { PlayerProfile } from '../../types';
import { PET_LOGIC_LEVELS, CODE_PET_LEVELS, PETS } from '../../data/levels';
import { PetAvatar } from '../pet/PetAvatar';
import {
  Sparkles,
  Play,
  Lock,
  Compass,
  Award,
  Code,
  BrainCircuit,
  BarChart3,
  ListTree,
  ArrowRight,
  Unlock,
} from 'lucide-react';

interface GameHubViewProps {
  profile: PlayerProfile;
  onOpenPetLogic: (levelId?: string) => void;
  onOpenCodePet: (levelId?: string) => void;
  onOpenLevelMap: () => void;
  onOpenEvaluation: () => void;
  onOpenTrajectories: () => void;
  onUnlockAllLevels: () => void;
}

export const GameHubView: React.FC<GameHubViewProps> = ({
  profile,
  onOpenPetLogic,
  onOpenCodePet,
  onOpenLevelMap,
  onOpenEvaluation,
  onOpenTrajectories,
  onUnlockAllLevels,
}) => {
  // Game 2 is intentionally disabled for the current hackathon MVP.
  // Progress reflects the playable Pet Logic experience only.
  const completedPetLogicLevels = profile.completedLevels.filter((levelId) =>
    levelId.startsWith('logic-')
  ).length;
  const progressPercent = Math.round(
    (completedPetLogicLevels / PET_LOGIC_LEVELS.length) * 100
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Player Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Ambient background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-300/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Player & Pet Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
              <PetAvatar type={profile.pet.type} mood="happy" size="lg" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2 text-pink-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{PETS[profile.pet.type]?.species || 'Coding Companion'}</span>
              </div>
              <h1 className="font-['Outfit'] font-extrabold text-2xl md:text-3xl tracking-tight">
                {profile.name} & {profile.pet.name}
              </h1>
              <p className="text-xs md:text-sm text-pink-100 mt-1 max-w-md">
                {PETS[profile.pet.type]?.tagline || 'Ready for coding adventures!'}
              </p>

              {/* Badges preview */}
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {profile.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-semibold text-white border border-white/20 flex items-center space-x-1"
                  >
                    <Award className="w-3 h-3 text-amber-300" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats & Star Count */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center justify-center min-w-[170px]">
            <div className="flex items-center space-x-1.5 text-2xl md:text-3xl font-extrabold font-['Outfit'] text-amber-300 drop-shadow-sm">
              <span>⭐</span>
              <span>{profile.stars}</span>
            </div>
            <span className="text-xs font-bold text-pink-100 uppercase tracking-wider mt-0.5">
              Stars Earned
            </span>

            <div className="mt-3 w-full">
              <div className="flex justify-between text-[11px] font-semibold text-pink-100 mb-1">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GAME 1: PET LOGIC */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-pink-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-pink-100/50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xl shadow-xs">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-bold text-pink-700 uppercase tracking-wide">
                Game 1 &bull; 5 Levels
              </span>
            </div>

            <h2 className="font-['Outfit'] font-extrabold text-2xl text-purple-950">
              PET LOGIC
            </h2>
            <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mt-0.5">
              "Learn how programmers think."
            </p>

            <p className="text-sm text-purple-800/80 mt-3 leading-relaxed">
              Use the keyboard to guide {profile.pet.name || 'Manchu'} through playful logic challenges while learning sequences, variables, algorithms, functions, data types, and IF conditions.
            </p>

            {/* Level Highlights */}
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {PET_LOGIC_LEVELS.map((lvl) => {
                const isDone = profile.completedLevels.includes(lvl.id);
                const isUnlocked = profile.unlockedLevels.includes(lvl.id);
                return (
                  <div
                    key={lvl.id}
                    className={`py-2 px-1 rounded-xl text-center border text-[11px] font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : isUnlocked
                        ? 'bg-pink-100 border-pink-300 text-pink-800'
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}
                  >
                    <span>L{lvl.number}</span>
                    <span className="block text-[9px]">{isDone ? '⭐' : isUnlocked ? '▶' : '🔒'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-between">
            <button
              id="hub-play-pet-logic-btn"
              onClick={() => onOpenPetLogic()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-['Outfit'] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Pet Logic</span>
            </button>
          </div>
        </div>

        {/* GAME 2: CODE YOUR PET — COMING SOON */}
        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border-2 border-gray-200 flex flex-col justify-between relative overflow-hidden opacity-90">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gray-200/40 rounded-bl-full pointer-events-none" />

          <div>
            <div className="mb-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Coming Soon</span>
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xl">
                <Code className="w-6 h-6" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-gray-100 border-gray-200 text-gray-500">
                Game 2 &bull; Future Levels
              </span>
            </div>

            <h2 className="font-['Outfit'] font-extrabold text-2xl text-gray-700">
              CODE YOUR PET
            </h2>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">
              "Turn your logic into real JavaScript."
            </p>

            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              A future game where learners will move from visual logic into beginner JavaScript with variables, IF statements, loops, and functions.
            </p>

            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {CODE_PET_LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  className="py-2 px-1 rounded-xl text-center border text-[11px] font-bold bg-gray-100 border-gray-200 text-gray-400"
                >
                  <span>L{lvl.number}</span>
                  <span className="block text-[9px]">🔒</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              id="hub-play-code-pet-btn"
              type="button"
              disabled
              aria-disabled="true"
              title="Code Your Pet is coming soon"
              className="w-full py-3.5 px-6 rounded-2xl bg-gray-200 text-gray-500 font-['Outfit'] font-bold text-sm border border-gray-300 flex items-center justify-center space-x-2 cursor-not-allowed select-none"
            >
              <Lock className="w-4 h-4" />
              <span>Coming Soon</span>
            </button>

            <p className="text-[11px] text-gray-500 font-semibold text-center mt-2">
              Not available in this version.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links & Concept Mastery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Map Button Card */}
        <div
          onClick={onOpenLevelMap}
          className="bg-white p-4 rounded-2xl border border-pink-100 hover:border-pink-300 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-purple-950">Adventure Level Map</p>
              <p className="text-xs text-purple-700">Replay levels & see star ratings</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-pink-500 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Hackathon Evaluation Button Card */}
        <div
          onClick={onOpenEvaluation}
          className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-purple-950">Evaluation Suite</p>
              <p className="text-xs text-purple-700">10 Scenarios & Baseline vs Grace</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Agent Trajectories Button Card */}
        <div
          onClick={onOpenTrajectories}
          className="bg-white p-4 rounded-2xl border border-indigo-100 hover:border-indigo-300 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ListTree className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-purple-950">Agent Trajectories</p>
              <p className="text-xs text-purple-700">Structured decision & hint logs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
