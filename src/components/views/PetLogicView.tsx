 import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayerProfile,
  CommandType,
  PetLogicLevel,
  PetState,
  TutorObservation,
  TutorDecision,
} from '../../types';
import { PET_LOGIC_LEVELS } from '../../data/levels';
import { PetStage } from '../pet/PetStage';
import { GraceTutor } from '../tutor/GraceTutor';
import { saveActiveProfile, saveTrajectoryLog } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  ChevronLeft,
  Code2,
  Gamepad2,
  Bot,
  BookOpen,
  Terminal,
} from 'lucide-react';

interface PetLogicViewProps {
  profile: PlayerProfile;
  levelId?: string;
  onBackToHub: () => void;
  onOpenCodePet: (levelId?: string) => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const PetLogicView: React.FC<PetLogicViewProps> = ({
  profile,
  levelId = 'logic-1',
  onBackToHub,
  onOpenCodePet,
  onProfileUpdated,
}) => {
  const currentLevelIndex =
    PET_LOGIC_LEVELS.findIndex((l) => l.id === levelId) >= 0
      ? PET_LOGIC_LEVELS.findIndex((l) => l.id === levelId)
      : 0;

  const [activeLevel, setActiveLevel] = useState<PetLogicLevel>(
    PET_LOGIC_LEVELS[currentLevelIndex]
  );
  const [petState, setPetState] = useState<PetState>({
    ...PET_LOGIC_LEVELS[currentLevelIndex].initialPetState,
  });
  const [executedCommands, setExecutedCommands] = useState<CommandType[]>([]);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showGrace, setShowGrace] = useState<boolean>(false);
  const [attemptCount] = useState<number>(
    profile.attemptsByLevel[levelId] || 1
  );
  const [confusedMessage, setConfusedMessage] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    stars: number;
    feedback: string;
    commandsUsed: CommandType[];
    jsCodeSnippet: string;
    conceptTitle: string;
    conceptExplanation: string;
    logicDeepDive: string;
  } | null>(null);

  // Sync level on prop change
  useEffect(() => {
    const lvl =
      PET_LOGIC_LEVELS.find((l) => l.id === levelId) || PET_LOGIC_LEVELS[0];

    setActiveLevel(lvl);
    setPetState({ ...lvl.initialPetState });
    setExecutedCommands([]);
    setHasWon(false);
    setResultModal(null);
    setShowGrace(false);
    setConfusedMessage(null);
  }, [levelId]);

  const resetLevel = () => {
    setPetState({ ...activeLevel.initialPetState });
    setExecutedCommands([]);
    setHasWon(false);
    setResultModal(null);
    setConfusedMessage(null);
  };

  // Convert each game command into the JavaScript representation shown to the learner.
  const commandToCode = (cmd: CommandType): string => {
    switch (cmd) {
      case 'MOVE':
        return 'move();';
      case 'JUMP':
        return 'jump();';
      case 'EAT':
        return 'eat();';
      case 'PLAY':
        return 'play();';
      case 'BATH':
        return 'takeBath();';
      case 'SLEEP':
        return 'sleep();';
      case 'COLLECT':
        return 'collectStar();';
      case 'REPEAT_3':
        return 'for (let i = 0; i < 3; i++) {\n  collectStar();\n}';
      case 'IF_HUNGRY':
        return 'if (hunger > 50) {\n  eat();\n}';
      default:
        return 'doAction();';
    }
  };

  // Check victory after any pet-state / command mutation.
  const checkVictory = useCallback(
    (currentState: PetState, currentCmds: CommandType[]) => {
      if (hasWon) return;

      const evalResult = activeLevel.targetPetStateGoal(
        currentState,
        currentCmds
      );

      if (!evalResult.success) return;

      setHasWon(true);

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981'],
        });
      } catch (e) {
        // Confetti is decorative; gameplay should continue if it is unavailable.
      }

      const stars =
        currentCmds.length <= activeLevel.idealSequenceLength ? 3 : 2;

      // Update player profile.
      const updated = { ...profile };

      if (!updated.completedLevels.includes(activeLevel.id)) {
        updated.completedLevels.push(activeLevel.id);
      }

      updated.levelStars[activeLevel.id] = Math.max(
        updated.levelStars[activeLevel.id] || 0,
        stars
      );

      updated.stars = Object.values(updated.levelStars).reduce(
        (a: number, b: number) => a + (b || 0),
        0
      );

      // IMPORTANT: unlock from the level the learner is ACTUALLY playing.
      // This fixes the old Level 2 -> Level 3 progression bug.
      const activeLevelIndex = PET_LOGIC_LEVELS.findIndex(
        (level) => level.id === activeLevel.id
      );
      const nextIdx = activeLevelIndex + 1;

      if (activeLevelIndex >= 0 && nextIdx < PET_LOGIC_LEVELS.length) {
        const nextId = PET_LOGIC_LEVELS[nextIdx].id;

        if (!updated.unlockedLevels.includes(nextId)) {
          updated.unlockedLevels.push(nextId);
        }
      } else if (activeLevelIndex === PET_LOGIC_LEVELS.length - 1) {
        // Unlock Game 2: Code Your Pet.
        if (!updated.unlockedLevels.includes('code-1')) {
          updated.unlockedLevels.push('code-1');
        }

        if (!updated.badges.includes('Computational Logic 🏆')) {
          updated.badges.push('Computational Logic 🏆');
        }
      }

      updated.learningProfile.concepts[activeLevel.conceptKey] = 'mastered';

      saveActiveProfile(updated);
      onProfileUpdated(updated);

      // Build the real JavaScript code trace.
      const jsCodeSnippet = currentCmds.map(commandToCode).join('\n');

      let conceptTitle = 'YOU JUST CREATED A SEQUENCE! ⭐';
      let conceptExplanation = `You gave ${profile.pet.name} instructions one by one. Computers follow instructions the exact same way: in order from top to bottom!`;
      let logicDeepDive = `How your code worked: Your code ran (${currentCmds
        .map((c) => commandToCode(c))
        .join(' ➔ ')}) to complete the goal!`;

      if (activeLevel.id === 'logic-1') {
        conceptTitle = 'YOU JUST CREATED A SEQUENCE! ⭐';
        conceptExplanation = `You gave ${profile.pet.name} instructions one by one. A sequence is a set of instructions that happen in order.`;
        logicDeepDive = `How your code worked: ${profile.pet.name} walked forward with move() and then ate breakfast with eat() right at the steak!`;
      } else if (activeLevel.id === 'logic-2') {
        conceptTitle = 'MISSION COMPLETE! 🎉';
        conceptExplanation =
          'You built a longer sequence! Each step in your sequence helped Manchu reach the ball and play.';
        logicDeepDive = `How your code worked: ${profile.pet.name} stepped forward 3 times with move() and then played with the tennis ball using play()!`;
      } else if (activeLevel.id === 'logic-3') {
        conceptTitle = 'INPUT & OUTPUT UNLOCKED! 🎮';
        conceptExplanation =
          'An input is something you give the computer. An output is what the computer does in response.';
        logicDeepDive = `You pressed SPACE — that was the input. ${profile.pet.name} jumped — that was the output!`;
      } else if (activeLevel.id === 'logic-4') {
        conceptTitle = 'MAGIC LOOPS MASTERED! 🔁';
        conceptExplanation =
          'A loop tells the computer to repeat instructions without writing the same code over and over.';
        logicDeepDive =
          'How your code worked: Your loop collected 3 star berries with one single repeated command!';
      }

      setTimeout(() => {
        setResultModal({
          isOpen: true,
          success: true,
          stars,
          feedback: evalResult.feedback,
          commandsUsed: currentCmds,
          jsCodeSnippet,
          conceptTitle,
          conceptExplanation,
          logicDeepDive,
        });
      }, 500);
    },
    [activeLevel, hasWon, onProfileUpdated, profile]
  );

  // Real-time video game action execution.
  const handleAction = (cmd: CommandType) => {
    if (hasWon) return;

    const nextCmds = [...executedCommands, cmd];
    setExecutedCommands(nextCmds);

    let nextState: PetState = { ...petState };
    const targetBowl =
      activeLevel.foodBowlPosition !== undefined
        ? activeLevel.foodBowlPosition
        : 2;

    switch (cmd) {
      case 'MOVE':
        nextState = {
          ...nextState,
          position: Math.min(4, nextState.position + 1),
          energy: Math.max(10, nextState.energy - 2),
          starsCollected:
            activeLevel.number >= 4
              ? Math.min(3, nextState.starsCollected + 1)
              : nextState.starsCollected,
          currentAction: 'walking',
          mood: 'happy',
        };
        setConfusedMessage(null);
        break;

      case 'JUMP': {
        const puddlePos = activeLevel.puddlePosition;
        const isInFrontOfPuddle =
          puddlePos !== undefined && nextState.position === puddlePos - 1;

        nextState = {
          ...nextState,
          position: isInFrontOfPuddle
            ? Math.min(4, puddlePos + 1)
            : Math.min(4, nextState.position + 1),
          energy: Math.max(10, nextState.energy - 5),
          currentAction: 'jumping',
          mood: 'celebrating',
        };

        setConfusedMessage(null);
        break;
      }

      case 'EAT':
        if (nextState.position >= targetBowl) {
          nextState = {
            ...nextState,
            hunger: Math.max(0, nextState.hunger - 60),
            happiness: Math.min(100, nextState.happiness + 20),
            currentAction: 'eating',
            mood: 'eating',
          };
          setConfusedMessage(null);
        } else {
          nextState = {
            ...nextState,
            currentAction: 'thinking',
            mood: 'confused',
          };
          setConfusedMessage(
            `${profile.pet.name} tried to eat before reaching the food! Walk forward to the food first.`
          );
        }
        break;

      case 'PLAY': {
        const targetBallPos =
          activeLevel.targetPosition !== undefined
            ? activeLevel.targetPosition
            : 3;

        if (nextState.position >= targetBallPos) {
          nextState = {
            ...nextState,
            happiness: Math.min(100, nextState.happiness + 25),
            energy: Math.max(15, nextState.energy - 10),
            currentAction: 'playing',
            mood: 'playing',
          };
          setConfusedMessage(null);
        } else {
          nextState = {
            ...nextState,
            currentAction: 'thinking',
            mood: 'confused',
          };
          setConfusedMessage(
            `${profile.pet.name} tried to play before reaching the tennis ball! Walk forward to the ball first.`
          );
        }
        break;
      }

      case 'BATH':
        nextState = {
          ...nextState,
          cleanliness: 100,
          currentAction: 'bathing',
          mood: 'happy',
        };
        setConfusedMessage(null);
        break;

      case 'SLEEP':
        nextState = {
          ...nextState,
          energy: 100,
          currentAction: 'sleeping',
          mood: 'sleeping',
        };
        setConfusedMessage(null);
        break;

      case 'COLLECT':
      case 'REPEAT_3':
        nextState = {
          ...nextState,
          starsCollected: Math.min(
            3,
            nextState.starsCollected + (cmd === 'REPEAT_3' ? 3 : 1)
          ),
          happiness: Math.min(100, nextState.happiness + 20),
          currentAction: 'celebrating',
          mood: 'celebrating',
        };
        setConfusedMessage(null);
        break;

      case 'IF_HUNGRY':
        if (nextState.hunger > 50) {
          nextState = {
            ...nextState,
            hunger: Math.max(0, nextState.hunger - 60),
            happiness: Math.min(100, nextState.happiness + 25),
            currentAction: 'eating',
            mood: 'eating',
          };
        }
        setConfusedMessage(null);
        break;
    }

    setPetState(nextState);

    setTimeout(() => {
      setPetState((p) => ({ ...p, currentAction: undefined }));
    }, 700);

    checkVictory(nextState, nextCmds);
  };

  const handleManualMove = (dir: 'left' | 'right') => {
    if (dir === 'right') {
      const puddlePos = activeLevel.puddlePosition;

      // PetStage also visually blocks the puddle. This guard prevents
      // the parent state from moving through it anyway.
      if (
        puddlePos !== undefined &&
        petState.position === puddlePos - 1
      ) {
        setPetState((prev) => ({
          ...prev,
          currentAction: 'thinking',
          mood: 'confused',
        }));

        setConfusedMessage(
          `${profile.pet.name} can't walk through the puddle. What could help ${profile.pet.name} get over it?`
        );

        setTimeout(() => {
          setPetState((p) => ({
            ...p,
            currentAction: undefined,
            mood: 'happy',
          }));
        }, 700);

        return;
      }

      handleAction('MOVE');
    } else {
      setPetState((prev) => ({
        ...prev,
        position: Math.max(0, prev.position - 1),
        currentAction: 'walking',
        mood: 'happy',
      }));

      setTimeout(() => {
        setPetState((p) => ({ ...p, currentAction: undefined }));
      }, 350);
    }
  };

  const handleManualEat = () => {
    handleAction('EAT');
  };

  const handleManualPlay = () => {
    handleAction('PLAY');
  };

  const handleManualJump = () => {
    handleAction('JUMP');
  };

  // Navigate from the ACTUAL active level rather than the original levelId.
  // This fixes Next Challenge returning the player to Level 2.
  const handleNextLevel = () => {
    setResultModal(null);

    const activeLevelIndex = PET_LOGIC_LEVELS.findIndex(
      (level) => level.id === activeLevel.id
    );

    if (activeLevelIndex === -1) return;

    const nextIdx = activeLevelIndex + 1;

    if (nextIdx < PET_LOGIC_LEVELS.length) {
      const nextLevel = PET_LOGIC_LEVELS[nextIdx];

      setActiveLevel(nextLevel);
      setPetState({ ...nextLevel.initialPetState });
      setExecutedCommands([]);
      setHasWon(false);
      setShowGrace(false);
      setConfusedMessage(null);
    } else {
      onOpenCodePet('code-1');
    }
  };

  const tutorObservation: TutorObservation = {
    player: profile.name,
    ageBand: '8-12',
    currentConcept: activeLevel.concept,
    challenge: activeLevel.goal,
    expectedSkill: activeLevel.concept,
    attempt:
      executedCommands.map(commandToCode).join('\n') ||
      'In progress in game stage',
    attemptNumber: attemptCount,
    previousErrors: [confusedMessage || resultModal?.feedback || ''],
    conceptsMastered: Object.entries(profile.learningProfile.concepts)
      .filter(([_, v]) => v === 'mastered')
      .map(([k]) => k),
    conceptsLearning: [activeLevel.conceptKey],
    hintLevel: 1,
  };

  const contextualHintText =
    activeLevel.id === 'logic-1'
      ? `Computers run instructions in exact order. Help ${profile.pet.name} reach the steak before using eat().`
      : activeLevel.id === 'logic-2'
      ? `Think about the order: first reach the tennis ball, then use play().`
      : activeLevel.id === 'logic-3'
      ? `Look at the obstacle in the path. When walking is not enough, try a different input such as jump().`
      : `Look at what happened in the game and try changing your next command.`;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4">
      {/* Top Header & Level Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-purple-100">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            id="logic-back-to-hub-btn"
            onClick={onBackToHub}
            className="p-2 sm:p-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 transition-all shadow-xs flex items-center space-x-1.5 font-black text-xs cursor-pointer active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-pink-600" />
            <span>Game Hub</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-black uppercase tracking-wider">
                Level {activeLevel.number} of 5
              </span>

              <span className="text-xs font-bold text-purple-900 hidden sm:inline">
                {activeLevel.concept}
              </span>
            </div>

            <h1 className="font-['Outfit'] font-black text-xl sm:text-2xl text-slate-950 mt-0.5">
              {activeLevel.title}
            </h1>
          </div>
        </div>

        {/* Level Switcher pills */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border-2 border-slate-200 shadow-2xs self-end sm:self-auto">
          {PET_LOGIC_LEVELS.map((lvl) => {
            const isDone = profile.completedLevels.includes(lvl.id);
            const isCurrent = lvl.id === activeLevel.id;

            return (
              <button
                key={lvl.id}
                id={`logic-level-pill-${lvl.number}`}
                onClick={() => {
                  setActiveLevel(lvl);
                  setPetState({ ...lvl.initialPetState });
                  setExecutedCommands([]);
                  setHasWon(false);
                  setResultModal(null);
                  setShowGrace(false);
                  setConfusedMessage(null);
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-900 text-white shadow-xs scale-105'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{lvl.number}</span>
                <span className="text-[8px] leading-none">
                  {isDone ? '★' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Narrative Mission Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5 flex-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-pink-600 flex items-center space-x-1">
            <span>📖 {profile.pet.name}'s Mission:</span>
          </p>

          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {activeLevel.id === 'logic-1'
              ? `${profile.pet.name} woke up hungry! Help ${profile.pet.name} reach the steak and eat breakfast.`
              : activeLevel.id === 'logic-2'
              ? `${profile.pet.name} is feeling playful! Help ${profile.pet.name} reach the tennis ball and play.`
              : activeLevel.story}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <button
            id="logic-quick-restart-btn"
            onClick={resetLevel}
            title="Reset position and code"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
            <span>Reset Position</span>
          </button>
        </div>
      </div>

      {/* TWO COMPACT EDUCATIONAL CONCEPT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeLevel.number === 2 ? (
          <>
            {/* Level 2 — Step */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-purple-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  WHAT IS A STEP?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  A <strong>step</strong> is one action in a sequence.
                </p>
              </div>
            </div>

            {/* Level 2 — Code */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-pink-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="w-4 h-4 text-pink-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  WHAT IS CODE?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  <strong>Code</strong> is the written language programmers use
                  to create games, apps, and computer programs.
                </p>
              </div>
            </div>
          </>
        ) : activeLevel.number === 3 ? (
          <>
            {/* Level 3 — Input */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-purple-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                <Terminal className="w-4 h-4 text-purple-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  WHAT IS AN INPUT?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  An <strong>input</strong> is something you give a computer,
                  like pressing a key.
                </p>
              </div>
            </div>

            {/* Level 3 — Output */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-pink-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  WHAT IS AN OUTPUT?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  An <strong>output</strong> is what the computer does after
                  receiving an input.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Level 1/default — Sequence */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-purple-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  What is a sequence?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  A <strong>sequence</strong> is a set of instructions that
                  happen in order.
                </p>
              </div>
            </div>

            {/* Level 1/default — Command */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-pink-100 shadow-2xs flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shrink-0 mt-0.5">
                <Terminal className="w-4 h-4 text-pink-600" />
              </div>

              <div>
                <h3 className="font-['Outfit'] font-black text-sm text-slate-900">
                  What is a command?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                  A <strong>command</strong> tells the computer what action to
                  do.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MAIN GAME VIEW & CODE PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left/Center: Main Storybook Pet Game World Stage & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <PetStage
            petType={profile.pet.type}
            petName={profile.pet.name}
            petState={petState}
            foodBowlPosition={activeLevel.foodBowlPosition}
            puddlePosition={activeLevel.puddlePosition}
            homePosition={activeLevel.homePosition}
            targetObjectType={activeLevel.targetObjectType || 'steak'}
            targetPosition={
              activeLevel.targetPosition !== undefined
                ? activeLevel.targetPosition
                : activeLevel.foodBowlPosition
            }
            showMeters={true}
            stageTitle={`${profile.pet.name}'s Garden`}
            starsGoal={activeLevel.number >= 4 ? 3 : 0}
            interactiveGameMode={true}
            onManualMove={handleManualMove}
            onManualEat={handleManualEat}
            onManualPlay={handleManualPlay}
            onManualJump={handleManualJump}
          />

          {/* Quick Level Actions (for later multi-action levels) */}
          {activeLevel.availableCommands.length > 3 && (
            <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-['Outfit'] font-black text-xs text-slate-900 flex items-center space-x-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Special Level Actions:</span>
                </span>

                <span className="text-[10px] text-slate-500 font-medium">
                  Click to execute instruction
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeLevel.availableCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    id={`game-action-btn-${cmd.type.toLowerCase()}`}
                    onClick={() => handleAction(cmd.type)}
                    className="p-2.5 rounded-xl border-2 border-slate-200 hover:border-pink-500 bg-slate-50 hover:bg-pink-50 text-left flex flex-col space-y-0.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="font-['Outfit'] font-black text-xs text-slate-900">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] font-mono text-purple-700">
                      {commandToCode(cmd.type)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Consequence / Debugging Prompt */}
          {confusedMessage && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start space-x-3 shadow-xs">
              <div className="text-2xl select-none">💡</div>

              <div className="space-y-1 flex-1">
                <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Helpful Hint:
                </p>

                <p className="text-xs font-bold text-amber-900">
                  {confusedMessage}
                </p>

                <p className="text-[11px] text-amber-800 font-medium">
                  {contextualHintText}
                </p>
              </div>

              <button
                id="confused-ask-grace-btn"
                onClick={() => setShowGrace(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs shrink-0 cursor-pointer"
              >
                Ask Grace 💡
              </button>
            </div>
          )}
        </div>

        {/* Right Column: YOUR CODE Panel & Grace AI Companion */}
        <div className="space-y-4">
          {/* YOUR CODE */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 border-2 border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="font-['Outfit'] font-black text-sm text-white tracking-wide">
                    YOUR CODE
                  </h3>
                  <p className="text-[10px] text-purple-300 font-sans">
                    Your actions become code!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                  {executedCommands.length}{' '}
                  {executedCommands.length === 1 ? 'step' : 'steps'}
                </span>

                {executedCommands.length > 0 && (
                  <button
                    onClick={resetLevel}
                    title="Clear code"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Code Output Window */}
            <div className="font-mono text-xs space-y-1.5 min-h-[160px] bg-slate-900/90 rounded-xl p-3 border border-slate-800 overflow-y-auto">
              <div className="text-slate-500 text-[11px] select-none">
                // {profile.pet.name}'s program
              </div>

              {executedCommands.length === 0 ? (
                <div className="text-slate-500 italic text-xs py-6 text-center space-y-1 select-none">
                  <p>
                    {activeLevel.id === 'logic-3'
                      ? 'Press [ ◀ ▶ ] or [ SPACE ]'
                      : 'Press [ ◀ ▶ ] or [ ENTER ]'}
                  </p>
                  <p className="text-[11px] text-purple-400/80">
                    Your code will trace here live!
                  </p>
                </div>
              ) : (
                executedCommands.map((cmd, idx) => {
                  const codeStr = commandToCode(cmd);
                  const isLast = idx === executedCommands.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start space-x-2.5 py-1 px-2 rounded transition-all ${
                        isLast
                          ? 'bg-purple-500/25 text-white border-l-2 border-pink-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-500 select-none text-[11px] w-4 text-right">
                        {idx + 1}
                      </span>

                      <span className="text-emerald-400 flex-1 whitespace-pre-wrap font-mono">
                        {codeStr}
                      </span>

                      {isLast && (
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping mt-1" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Language indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                Goal:{' '}
                {activeLevel.id === 'logic-1'
                  ? 'Reach steak & eat'
                  : activeLevel.id === 'logic-2'
                  ? 'Reach tennis ball & play'
                  : activeLevel.goal}
              </span>

              <span className="font-mono text-pink-300 font-bold">
                JavaScript
              </span>
            </div>
          </div>

          {/* GRACE AI COMPANION CARD */}
          {!showGrace ? (
            <div className="bg-gradient-to-br from-[#FDF5FF] to-[#FFF8FA] rounded-2xl p-4 border-2 border-purple-200 shadow-2xs space-y-2.5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="font-['Outfit'] font-black text-xs text-purple-950 flex items-center space-x-1.5">
                    <span>Grace</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[9px] uppercase font-bold">
                      AI Companion
                    </span>
                  </div>

                  <p className="text-[11px] text-purple-700/90 font-medium">
                    Need a gentle hint or coding guidance?
                  </p>
                </div>
              </div>

              <button
                id="logic-ask-grace-btn"
                onClick={() => setShowGrace(true)}
                className="w-full py-2 bg-white hover:bg-purple-50 text-purple-900 font-black text-xs rounded-xl border-2 border-purple-200 transition-all flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>Ask Grace for a Hint 💡</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setShowGrace(false)}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-950 underline cursor-pointer"
                >
                  Hide Grace
                </button>
              </div>

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
                    learnerAttempt: executedCommands
                      .map(commandToCode)
                      .join('\n'),
                    misconceptionCategory: decision.misconceptionCategory,
                    hintLevel: decision.hintLevel,
                    teachingDecision: decision.hintMessage,
                    hintDelivered: decision.hintMessage,
                    outcome: 'in_progress',
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* VICTORY MODAL */}
      {resultModal && resultModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-emerald-300 text-center space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header with celebration icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl shadow-inner border border-emerald-300">
              🎉
            </div>

            <div className="flex justify-center space-x-1.5 text-2xl text-amber-400">
              {Array.from({ length: resultModal.stars }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>

            <div>
              <h2 className="font-['Outfit'] font-black text-2xl text-slate-950">
                {resultModal.conceptTitle}
              </h2>
              <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mt-0.5">
                MISSION COMPLETE! ✨
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left space-y-2">
              <p className="text-sm font-bold text-emerald-950">
                {resultModal.conceptExplanation}
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {resultModal.logicDeepDive}
              </p>
            </div>

            {/* Generated Code Window */}
            <div className="text-left bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>The JavaScript code you wrote:</span>
                <span className="text-pink-400 font-bold">JavaScript</span>
              </div>

              <pre className="font-mono text-xs text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded-lg">
                {resultModal.jsCodeSnippet}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={resetLevel}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Replay Level
              </button>

              <button
                onClick={handleNextLevel}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition-all cursor-pointer"
              >
                Next Challenge ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
