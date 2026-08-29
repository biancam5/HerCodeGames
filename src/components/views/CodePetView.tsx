import React, { useState, useEffect } from 'react';
import { PlayerProfile, CodePetLevel, PetState, TutorObservation, TutorDecision } from '../../types';
import { CODE_PET_LEVELS } from '../../data/levels';
import { PetStage } from '../pet/PetStage';
import { GraceTutor } from '../tutor/GraceTutor';
import { runSafeJavaScript } from '../../utils/safeJsRunner';
import { saveActiveProfile, saveTrajectoryLog } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code,
  Terminal,
  ChevronLeft,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Award,
} from 'lucide-react';

interface CodePetViewProps {
  profile: PlayerProfile;
  levelId?: string;
  onBackToHub: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const CodePetView: React.FC<CodePetViewProps> = ({
  profile,
  levelId = 'code-1',
  onBackToHub,
  onProfileUpdated,
}) => {
  const currentLevelIndex = CODE_PET_LEVELS.findIndex((l) => l.id === levelId) >= 0
    ? CODE_PET_LEVELS.findIndex((l) => l.id === levelId)
    : 0;

  const [activeLevel, setActiveLevel] = useState<CodePetLevel>(CODE_PET_LEVELS[currentLevelIndex]);
  const [code, setCode] = useState<string>(activeLevel.starterCode);
  const [petState, setPetState] = useState<PetState>({
    hunger: 70,
    energy: 80,
    cleanliness: 90,
    happiness: 60,
    position: 0,
    starsCollected: 0,
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    stars: number;
    title: string;
    body: string;
    badge?: string;
  } | null>(null);
  const [showTutor, setShowTutor] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(profile.attemptsByLevel[levelId] || 1);

  // Sync level on change
  useEffect(() => {
    const lvl = CODE_PET_LEVELS.find((l) => l.id === levelId) || CODE_PET_LEVELS[0];
    setActiveLevel(lvl);
    setCode(lvl.starterCode);
    setPetState({
      hunger: lvl.id === 'code-2' || lvl.id === 'code-5' ? 70 : 30,
      energy: 80,
      cleanliness: 90,
      happiness: 60,
      position: 0,
      starsCollected: 0,
    });
    setConsoleLogs([]);
    setResultModal(null);
    setShowTutor(false);
  }, [levelId]);

  const insertSnippet = (snippet: string) => {
    setCode((prev) => prev.trim() + '\n' + snippet);
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleLogs(['[Runner] Compiling JavaScript safely...']);

    const initial: PetState = {
      hunger: activeLevel.id === 'code-2' || activeLevel.id === 'code-5' ? 70 : 30,
      energy: 80,
      cleanliness: 90,
      happiness: 60,
      position: 0,
      starsCollected: 0,
    };

    const execResult = runSafeJavaScript(code, initial, profile.pet.name);

    // Animate execution steps
    const newLogs: string[] = ['[Runner] JavaScript sandbox executing...'];
    for (const step of execResult.steps) {
      await new Promise((res) => setTimeout(res, 600));
      newLogs.push(`> ${step.message}`);
      setConsoleLogs([...newLogs]);
      setPetState({ ...step.stateSnapshot });
    }

    if (execResult.error) {
      newLogs.push(`[Error] ${execResult.error}`);
      setConsoleLogs([...newLogs]);
    } else {
      newLogs.push('[Runner] Program finished successfully.');
      setConsoleLogs([...newLogs]);
    }

    setIsRunning(false);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    // Validate Level Completion
    let isSuccess = false;
    let feedback = '';

    if (activeLevel.id === 'code-1') {
      const hasPetName = execResult.declaredVariables['petName'] !== undefined;
      const hasHappiness = execResult.declaredVariables['happiness'] !== undefined;
      if (hasPetName && hasHappiness && execResult.success) {
        isSuccess = true;
        feedback = 'Variables defined perfectly! JavaScript now knows your pet’s name and stats.';
      } else {
        feedback = 'Make sure you declare both let petName and let happiness variables!';
      }
    } else if (activeLevel.id === 'code-2') {
      const ateFood = execResult.calledFunctions.some((f) => f.includes('feed'));
      if (ateFood && code.includes('if') && code.includes('>') && execResult.success) {
        isSuccess = true;
        feedback = 'if statement executed accurately! Your pet checked hunger and ate.';
      } else if (code.includes('<')) {
        feedback = "Check the comparison: your if condition used '<' instead of '>'. Luna is hungry when hunger is greater than (>) 50!";
      } else {
        feedback = 'Make sure your if statement tests (hunger > 50) and calls feed() inside {}.';
      }
    } else if (activeLevel.id === 'code-3') {
      const stars = execResult.collectedStars >= 3;
      if (stars && code.includes('for') && code.includes('collectStar') && execResult.success) {
        isSuccess = true;
        feedback = 'for loop executed 3 times! All 3 stars collected with clean repetition.';
      } else {
        feedback = 'Make sure your for loop counts 3 times and calls collectStar()!';
      }
    } else if (activeLevel.id === 'code-4') {
      const calledRoutine = execResult.calledFunctions.includes('morningRoutine');
      if (calledRoutine && code.includes('function morningRoutine') && execResult.success) {
        isSuccess = true;
        feedback = 'Function morningRoutine() defined and called cleanly!';
      } else if (code.includes('function morningRoutine') && !code.includes('morningRoutine();')) {
        feedback = 'You defined morningRoutine, but forgot to call morningRoutine(); at the bottom!';
      } else {
        feedback = 'Make sure to define function morningRoutine() { ... } and call it.';
      }
    } else if (activeLevel.id === 'code-5') {
      const collected = execResult.collectedStars >= 3;
      const fed = execResult.calledFunctions.some((f) => f.includes('feed'));
      const played = execResult.calledFunctions.some((f) => f.includes('play'));

      if (collected && fed && played && execResult.success) {
        isSuccess = true;
        feedback = 'Incredible! You combined variables, loops, conditions, and actions into a complete JavaScript program!';
      } else {
        feedback = 'Make sure your program loops to collect 3 stars, uses if (hunger > 50) { feed(); }, and calls play()!';
      }
    }

    if (isSuccess) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F472B6', '#A78BFA', '#FBBF24', '#34D399', '#60A5FA'],
        });
      } catch (e) {}

      const updated = { ...profile };
      if (!updated.completedLevels.includes(activeLevel.id)) {
        updated.completedLevels.push(activeLevel.id);
      }
      updated.levelStars[activeLevel.id] = 3;
      updated.stars = Object.values(updated.levelStars).reduce((a: number, b: number) => a + (b || 0), 0);

      // Unlock next code level
      const nextIdx = currentLevelIndex + 1;
      if (nextIdx < CODE_PET_LEVELS.length) {
        const nextId = CODE_PET_LEVELS[nextIdx].id;
        if (!updated.unlockedLevels.includes(nextId)) {
          updated.unlockedLevels.push(nextId);
        }
      }

      if (activeLevel.badgeReward && !updated.badges.includes(activeLevel.badgeReward)) {
        updated.badges.push(activeLevel.badgeReward);
      }

      updated.learningProfile.concepts[activeLevel.conceptKey] = 'mastered';
      saveActiveProfile(updated);
      onProfileUpdated(updated);

      setResultModal({
        isOpen: true,
        success: true,
        stars: 3,
        title: activeLevel.explanationSuccess.title,
        body: activeLevel.explanationSuccess.body,
        badge: activeLevel.badgeReward,
      });
    } else {
      setShowTutor(true);
      setResultModal({
        isOpen: true,
        success: false,
        stars: 0,
        title: 'Let’s Debug This!',
        body: feedback,
      });

      // Save trajectory
      saveTrajectoryLog({
        id: 'traj_' + Date.now(),
        timestamp: Date.now(),
        playerName: profile.name,
        levelId: activeLevel.id,
        levelTitle: activeLevel.title,
        concept: activeLevel.concept,
        attemptNumber: newAttempt,
        learnerAttempt: code,
        misconceptionCategory: code.includes('<') ? 'reversed_comparison' : 'syntax_or_logic',
        hintLevel: 1,
        teachingDecision: 'Provide Level 1 Conceptual guidance',
        hintDelivered: feedback,
        outcome: 'in_progress',
      });
    }
  };

  const handleNextLevel = () => {
    setResultModal(null);
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < CODE_PET_LEVELS.length) {
      setActiveLevel(CODE_PET_LEVELS[nextIdx]);
      setCode(CODE_PET_LEVELS[nextIdx].starterCode);
      setShowTutor(false);
    } else {
      onBackToHub();
    }
  };

  const tutorObservation: TutorObservation = {
    player: profile.name,
    ageBand: '8-12',
    currentConcept: activeLevel.concept,
    challenge: activeLevel.instructions,
    expectedSkill: activeLevel.concept,
    attempt: code,
    attemptNumber: attemptCount,
    previousErrors: [resultModal?.body || ''],
    conceptsMastered: Object.entries(profile.learningProfile.concepts)
      .filter(([_, v]) => v === 'mastered')
      .map(([k]) => k),
    conceptsLearning: [activeLevel.conceptKey],
    hintLevel: 1,
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            id="code-back-to-hub-btn"
            onClick={onBackToHub}
            className="p-2.5 rounded-xl bg-white border border-purple-200 text-purple-900 hover:bg-purple-50 transition-all shadow-2xs flex items-center space-x-1 font-bold text-xs"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
            <span>Game Hub</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold uppercase">
                Code Your Pet &bull; JavaScript Level {activeLevel.number} of 5
              </span>
              <span className="text-xs font-semibold text-pink-600">{activeLevel.concept}</span>
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-2xl text-purple-950 mt-0.5">
              {activeLevel.title}
            </h1>
          </div>
        </div>

        {/* Level Switcher pills */}
        <div className="flex items-center space-x-1.5 bg-white p-1.5 rounded-2xl border border-purple-100 shadow-2xs">
          {CODE_PET_LEVELS.map((lvl) => {
            const isDone = profile.completedLevels.includes(lvl.id);
            const isCurrent = lvl.id === activeLevel.id;
            return (
              <button
                key={lvl.id}
                id={`code-level-pill-${lvl.number}`}
                onClick={() => {
                  setActiveLevel(lvl);
                  setCode(lvl.starterCode);
                  setResultModal(null);
                  setShowTutor(false);
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-xs scale-105'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-purple-100'
                }`}
              >
                <span>{lvl.number}</span>
                <span className="text-[8px]">{isDone ? '★' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story & Instructions Banner */}
      <div className="bg-white/95 rounded-2xl p-4 md:p-5 border border-purple-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">The Story:</p>
          <p className="text-sm font-medium text-purple-950 leading-relaxed">{activeLevel.story}</p>
        </div>
        <div className="bg-pink-50 p-3 rounded-xl border border-pink-100 min-w-[280px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink-700">Instructions:</p>
          <p className="text-xs font-semibold text-pink-950">{activeLevel.instructions}</p>
        </div>
      </div>

      {/* Pet Interactive Stage */}
      <PetStage
        petType={profile.pet.type}
        petName={profile.pet.name}
        petState={petState}
        showMeters={true}
        stageTitle={`JavaScript Controller: ${profile.pet.name}`}
        starsGoal={activeLevel.number >= 3 ? 3 : 0}
      />

      {/* Code Editor & Execution Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Editor (Left Col 7) */}
        <div className="lg:col-span-7 bg-[#1E1B2E] rounded-2xl p-4 md:p-5 shadow-md flex flex-col justify-between text-white space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="font-['Fira_Code'] text-xs font-semibold text-pink-300 ml-2">
                  petController.js
                </span>
              </div>
              <span className="text-[11px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md font-mono">
                JavaScript ES6
              </span>
            </div>

            {/* Quick Snippet Helpers */}
            {activeLevel.availableSnippets && activeLevel.availableSnippets.length > 0 && (
              <div className="my-2.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase font-bold text-purple-300 mr-1">Snippets:</span>
                {activeLevel.availableSnippets.map((snp, idx) => (
                  <button
                    key={idx}
                    id={`snippet-btn-${idx}`}
                    onClick={() => insertSnippet(snp)}
                    className="px-2 py-1 bg-purple-800/60 hover:bg-purple-700/80 rounded-md text-[11px] font-mono text-purple-200 border border-purple-700/60 transition-colors"
                  >
                    + {snp}
                  </button>
                ))}
              </div>
            )}

            {/* Real Textarea Code Editor */}
            <div className="relative mt-2">
              <textarea
                id="javascript-code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isRunning}
                rows={9}
                className="w-full bg-[#161424] text-pink-100 font-['Fira_Code',monospace] text-xs md:text-sm p-4 rounded-xl border border-purple-800/80 focus:border-pink-400 focus:outline-none leading-relaxed resize-none shadow-inner"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              id="code-ask-tutor-btn"
              onClick={() => setShowTutor(!showTutor)}
              className="py-3 px-4 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 font-bold text-xs border border-purple-700 transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>{showTutor ? 'Hide Grace' : 'Ask Grace 💡'}</span>
            </button>

            <button
              id="code-run-javascript-btn"
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
              className={`flex-1 py-3.5 px-6 rounded-xl font-['Outfit'] font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                !isRunning && code.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-purple-950/60 text-purple-600 cursor-not-allowed'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Running JavaScript...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN CODE ▶</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Execution Console & Output (Right Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-purple-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-600" />
                <h3 className="font-['Outfit'] font-bold text-sm text-purple-950">
                  Execution Output
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Safe Sandbox
              </span>
            </div>

            {/* Terminal Window */}
            <div className="mt-3 bg-[#FAF7F5] rounded-xl p-3.5 border border-purple-100 min-h-[190px] font-mono text-xs text-purple-950 space-y-1.5 overflow-y-auto max-h-56">
              {consoleLogs.length === 0 ? (
                <p className="text-purple-400 italic">Click "RUN CODE ▶" to execute your program.</p>
              ) : (
                consoleLogs.map((log, idx) => (
                  <p
                    key={idx}
                    className={`leading-relaxed ${
                      log.includes('[Error]')
                        ? 'text-rose-600 font-bold'
                        : log.includes('finished')
                        ? 'text-emerald-700 font-bold'
                        : 'text-purple-900'
                    }`}
                  >
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Educational Concept Footer */}
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-800">
              <strong>JavaScript Tip:</strong> Statements inside curly braces <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold text-purple-900">{'{ ... }'}</code> run when their condition or function is triggered.
            </p>
          </div>
        </div>
      </div>

      {/* Grace AI Tutor Drawer */}
      {showTutor && (
        <GraceTutor
          observation={tutorObservation}
          onHintReceived={(decision: TutorDecision) => {
            saveTrajectoryLog({
              id: 'traj_' + Date.now(),
              timestamp: Date.now(),
              playerName: profile.name,
              levelId: activeLevel.id,
              levelTitle: activeLevel.title,
              concept: activeLevel.concept,
              attemptNumber: attemptCount,
              learnerAttempt: code,
              misconceptionCategory: decision.misconceptionCategory,
              hintLevel: decision.hintLevel,
              teachingDecision: decision.hintMessage,
              hintDelivered: decision.hintMessage,
              outcome: 'in_progress',
            });
          }}
        />
      )}

      {/* Result Modal */}
      {resultModal && resultModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-purple-100 text-center">
            {resultModal.success ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🎉
                </div>

                <div className="flex justify-center space-x-1 text-2xl text-amber-400 mb-2">
                  <span>⭐⭐⭐</span>
                </div>

                <h2 className="font-['Outfit'] font-extrabold text-2xl text-purple-950">
                  {resultModal.title}
                </h2>

                {resultModal.badge && (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold my-2 shadow-2xs">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Unlocked Badge: {resultModal.badge}</span>
                  </div>
                )}

                <p className="text-sm text-purple-800/90 leading-relaxed bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 my-3">
                  {resultModal.body}
                </p>

                <div className="mt-6 flex space-x-3">
                  <button
                    id="code-retry-btn"
                    onClick={() => setResultModal(null)}
                    className="flex-1 py-3 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-2xl border border-purple-200"
                  >
                    Keep Experimenting
                  </button>

                  <button
                    id="code-next-level-btn"
                    onClick={handleNextLevel}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <span>
                      {currentLevelIndex === CODE_PET_LEVELS.length - 1
                        ? 'Finish Adventure 🌟'
                        : 'Next JS Level'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
                  🔍
                </div>

                <h2 className="font-['Outfit'] font-extrabold text-xl text-purple-950">
                  {resultModal.title}
                </h2>

                <p className="text-sm text-rose-900 mt-2 bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                  {resultModal.body}
                </p>

                <div className="mt-6 flex space-x-3">
                  <button
                    id="code-debug-try-again-btn"
                    onClick={() => setResultModal(null)}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md"
                  >
                    Edit Code & Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
