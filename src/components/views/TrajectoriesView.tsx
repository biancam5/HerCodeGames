import React, { useState } from 'react';
import { AgentTrajectoryLog } from '../../types';
import { loadTrajectoryLogs } from '../../services/storage';
import {
  ChevronLeft,
  ListTree,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Compass,
  CheckCircle,
  Eye,
} from 'lucide-react';

const SEED_TRAJECTORIES: AgentTrajectoryLog[] = [
  {
    id: 'traj-seed-1',
    timestamp: Date.now() - 120000,
    playerName: 'Emma',
    levelId: 'code-2',
    levelTitle: 'Smart Decisions with if ()',
    concept: 'if Statements & Comparisons',
    attemptNumber: 1,
    learnerAttempt: 'if (hunger < 50) {\n    feed();\n}',
    misconceptionCategory: 'reversed_comparison',
    hintLevel: 1,
    teachingDecision: 'Use Hint Level 1: Observation Prompt. Guide learner to look at hunger level vs symbol.',
    hintDelivered: "You're super close! Look at how hungry Luna is (70%) and check the comparison symbol.",
    outcome: 'in_progress',
  },
  {
    id: 'traj-seed-2',
    timestamp: Date.now() - 60000,
    playerName: 'Emma',
    levelId: 'code-2',
    levelTitle: 'Smart Decisions with if ()',
    concept: 'if Statements & Comparisons',
    attemptNumber: 2,
    learnerAttempt: 'if (hunger <= 50) {\n    feed();\n}',
    misconceptionCategory: 'reversed_comparison',
    hintLevel: 2,
    teachingDecision: 'Use Hint Level 2: Conceptual Rule. Explain > (greater than) vs < (less than).',
    hintDelivered: "Luna should eat when her hunger is higher than 50. The '>' symbol means greater than, while '<' means less than.",
    outcome: 'in_progress',
  },
  {
    id: 'traj-seed-3',
    timestamp: Date.now() - 20000,
    playerName: 'Emma',
    levelId: 'code-2',
    levelTitle: 'Smart Decisions with if ()',
    concept: 'if Statements & Comparisons',
    attemptNumber: 3,
    learnerAttempt: 'if (hunger > 50) {\n    feed();\n}',
    misconceptionCategory: 'none_correct',
    hintLevel: 1,
    teachingDecision: 'Affirm success! Update learner model: conditions ➔ mastered.',
    hintDelivered: 'You found the pattern! Your if statement evaluated true and Luna ate a hearty breakfast.',
    outcome: 'solved',
  },
];

export const TrajectoriesView: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const stored = loadTrajectoryLogs();
  const allTrajectories = stored.length > 0 ? [...stored, ...SEED_TRAJECTORIES] : SEED_TRAJECTORIES;

  const [selectedTrajectory, setSelectedTrajectory] = useState<AgentTrajectoryLog>(allTrajectories[0]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
        <div className="flex items-center space-x-3">
          <button
            id="traj-back-to-hub-btn"
            onClick={onBackToHub}
            className="p-2.5 rounded-xl bg-white border border-indigo-200 text-purple-900 hover:bg-indigo-50 transition-all shadow-2xs flex items-center space-x-1 font-bold text-xs"
          >
            <ChevronLeft className="w-4 h-4 text-indigo-600" />
            <span>Game Hub</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">
                Agent Observability
              </span>
              <span className="text-xs text-indigo-600 font-semibold">Structured Pedagogical Decisions</span>
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-purple-950 mt-0.5">
              Agent Trajectories & Reasoning Cycles
            </h1>
          </div>
        </div>

        <div className="text-right">
          <span className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-900 shadow-2xs">
            {allTrajectories.length} Recorded Steps
          </span>
        </div>
      </div>

      {/* Trajectories Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trajectory Stream List (Left Col 5) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {allTrajectories.map((traj, idx) => {
            const isSelected = selectedTrajectory.id === traj.id;
            return (
              <div
                key={traj.id}
                id={`trajectory-card-${idx}`}
                onClick={() => setSelectedTrajectory(traj)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-indigo-500 shadow-md scale-101 ring-2 ring-indigo-100'
                    : 'bg-white/80 hover:bg-white border-indigo-100 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {traj.concept}
                  </span>
                  <span className="text-[10px] text-purple-500 font-medium">
                    Attempt #{traj.attemptNumber}
                  </span>
                </div>

                <h3 className="font-['Outfit'] font-bold text-sm text-purple-950">
                  {traj.levelTitle}
                </h3>
                <p className="text-xs text-purple-700/80 mt-1 line-clamp-1">
                  Misconception: <strong>{traj.misconceptionCategory}</strong>
                </p>

                <div className="mt-3 pt-2 border-t border-indigo-50 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-purple-900">
                    Hint Level {traj.hintLevel}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      traj.outcome === 'solved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {traj.outcome === 'solved' ? '✓ Mastered' : 'Observing'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Structured Trajectory Inspector (Right Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-100 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="font-['Outfit'] font-bold text-lg text-purple-950">
                Trajectory Deep Dive
              </h2>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
              ID: {selectedTrajectory.id}
            </span>
          </div>

          {/* Phase 1: Observation Input */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>1. Observed Learner Input</span>
            </span>
            <div className="bg-[#1E1B2E] p-3.5 rounded-xl text-white font-mono text-xs">
              <pre className="text-pink-200 overflow-x-auto leading-relaxed">
                {selectedTrajectory.learnerAttempt}
              </pre>
            </div>
          </div>

          {/* Phase 2: Diagnostic Categorization */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-[10px] uppercase font-bold text-purple-600">Misconception Category</p>
              <p className="text-xs font-bold text-purple-950 mt-0.5">
                {selectedTrajectory.misconceptionCategory}
              </p>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-[10px] uppercase font-bold text-indigo-600">Selected Hint Tier</p>
              <p className="text-xs font-bold text-indigo-950 mt-0.5">
                Level {selectedTrajectory.hintLevel} (Progressive Ladder)
              </p>
            </div>
          </div>

          {/* Phase 3: Teaching Decision */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>2. Pedagogical Decision Strategy</span>
            </span>
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed">
              {selectedTrajectory.teachingDecision}
            </div>
          </div>

          {/* Phase 4: Action / Delivered Hint */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>3. Delivered Hint to Learner</span>
            </span>
            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 text-xs font-semibold text-purple-950 leading-relaxed shadow-2xs">
              "{selectedTrajectory.hintDelivered}"
            </div>
          </div>

          {/* Phase 5: Next Step */}
          <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-xs text-purple-700">
            <span>Next Agent State: <strong>Observe subsequent attempt & update concept mastery</strong></span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
