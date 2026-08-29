import React, { useEffect, useState, useCallback } from 'react';
import { PetState, PetType } from '../../types';
import { PetAvatar } from './PetAvatar';
import {
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Gamepad2,
  Utensils,
  Heart,
  Zap,
  Droplets,
} from 'lucide-react';

interface PetStageProps {
  petType: PetType;
  petName: string;
  petState: PetState;
  foodBowlPosition?: number;
  puddlePosition?: number;
  homePosition?: number;
  targetObjectType?: 'steak' | 'ball' | 'star' | 'puddle_home' | 'home' | 'treat' | 'food_bowl';
  targetPosition?: number;
  currentTreatPosition?: number;
  totalTreats?: number;
  highlightTile?: number;
  totalTiles?: number;
  showMeters?: boolean;
  stageTitle?: string;
  starsGoal?: number;
  onManualMove?: (dir: 'left' | 'right') => void;
  onManualEat?: () => void;
  onManualPlay?: () => void;
  onManualJump?: () => void;
  onManualCollectTreat?: () => void;
  interactiveGameMode?: boolean;
}

export const PetStage: React.FC<PetStageProps> = ({
  petType,
  petName,
  petState: externalPetState,
  foodBowlPosition = 2,
  puddlePosition,
  homePosition,
  targetObjectType = 'steak',
  targetPosition,
  currentTreatPosition,
  totalTreats = 6,
  highlightTile,
  totalTiles = 5,
  showMeters = true,
  stageTitle,
  starsGoal = 0,
  onManualMove,
  onManualEat,
  onManualPlay,
  onManualJump,
  onManualCollectTreat,
  interactiveGameMode = true,
}) => {
  const [internalState, setInternalState] = useState<PetState>(externalPetState);
  const [walkDirection, setWalkDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isEatingAnim, setIsEatingAnim] = useState(false);
  const [activeKeyPressed, setActiveKeyPressed] = useState<string | null>(null);
  const [speechBubble, setSpeechBubble] = useState<{ text: string; type: 'happy' | 'confused' | 'yummy' } | null>(null);

  useEffect(() => {
    setInternalState(externalPetState);
  }, [externalPetState]);

  const activeState = externalPetState || internalState;
  const isTreatTarget = targetObjectType === 'treat';
  const isFoodBowlTarget = targetObjectType === 'food_bowl';
  const effectiveTargetPos =
    isTreatTarget && currentTreatPosition !== undefined
      ? currentTreatPosition
      : targetPosition !== undefined
      ? targetPosition
      : foodBowlPosition;
  const isBallTarget = targetObjectType === 'ball';
  const isPuddleMission = puddlePosition !== undefined || targetObjectType === 'puddle_home';

  const showReaction = (text: string, type: 'happy' | 'confused' | 'yummy') => {
    setSpeechBubble({ text, type });
    setTimeout(() => {
      setSpeechBubble(null);
    }, 1400);
  };

  const handleMove = useCallback(
    (dir: 'left' | 'right') => {
      // Check if puddle blocks forward walk
      if (dir === 'right' && puddlePosition !== undefined && activeState.position === puddlePosition - 1) {
        showReaction("Oops! Manchu can't walk through the puddle.", 'confused');
        if (onManualMove) {
          onManualMove('right');
        } else {
          setInternalState((prev) => ({
            ...prev,
            currentAction: 'thinking',
            mood: 'confused',
          }));
          setTimeout(() => {
            setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
          }, 800);
        }
        return;
      }

      setWalkDirection(dir);
      setIsWalking(true);
      setTimeout(() => setIsWalking(false), 320);

      if (onManualMove) {
        onManualMove(dir);
      } else {
        setInternalState((prev) => {
          const nextPos = dir === 'right' ? Math.min(totalTiles - 1, prev.position + 1) : Math.max(0, prev.position - 1);
          return {
            ...prev,
            position: nextPos,
            energy: Math.max(10, prev.energy - 2),
            currentAction: 'walking',
          };
        });
        setTimeout(() => {
          setInternalState((p) => ({ ...p, currentAction: undefined }));
        }, 350);
      }

      showReaction(dir === 'right' ? 'Walking forward! 🐾' : 'Walking back! 🐾', 'happy');
    },
    [activeState.position, onManualMove, puddlePosition, totalTiles]
  );

  const handleJump = useCallback(() => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 550);

    if (onManualJump) {
      onManualJump();
    } else {
      setInternalState((prev) => {
        const nextPos = puddlePosition !== undefined && prev.position === puddlePosition - 1
          ? puddlePosition + 1
          : Math.min(totalTiles - 1, prev.position + 1);
        return {
          ...prev,
          position: nextPos,
          currentAction: 'jumping',
          mood: 'celebrating',
        };
      });
      setTimeout(() => {
        setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
      }, 600);
    }
    showReaction('Nice jump! 🐾', 'happy');
  }, [onManualJump, puddlePosition, totalTiles]);

  const handleEatOrInteract = useCallback(() => {
    const isAtTarget = isTreatTarget
      ? activeState.position === effectiveTargetPos
      : activeState.position >= effectiveTargetPos;

    if (isTreatTarget) {
      if (isAtTarget) {
        if (onManualCollectTreat) {
          onManualCollectTreat();
        }
        showReaction('Crunch! Treat collected! 🍪', 'yummy');
      } else {
        showReaction('Find the biscuit first! Look around the garden. 🐾', 'confused');
      }
      return;
    }

    if (isAtTarget) {
      if (isBallTarget) {
        if (onManualPlay) {
          onManualPlay();
        } else {
          setInternalState((prev) => ({
            ...prev,
            happiness: Math.min(100, prev.happiness + 25),
            energy: Math.max(10, prev.energy - 10),
            currentAction: 'playing',
            mood: 'playing',
          }));
          setTimeout(() => {
            setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
          }, 900);
        }
        showReaction('Playing with the ball! 🎾', 'happy');
      } else {
        setIsEatingAnim(true);
        setTimeout(() => setIsEatingAnim(false), 900);

        if (onManualEat) {
          onManualEat();
        } else {
          setInternalState((prev) => ({
            ...prev,
            hunger: Math.max(0, prev.hunger - 60),
            happiness: Math.min(100, prev.happiness + 20),
            currentAction: 'eating',
            mood: 'eating',
          }));
          setTimeout(() => {
            setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
          }, 900);
        }
        showReaction(isFoodBowlTarget ? 'Dinner time! So much kibble! 😋' : 'Yummy breakfast! 😋', 'yummy');
      }
    } else {
      if (isBallTarget) {
        if (onManualPlay) {
          onManualPlay();
        } else {
          setInternalState((prev) => ({
            ...prev,
            currentAction: 'thinking',
            mood: 'confused',
          }));
          setTimeout(() => {
            setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
          }, 800);
        }
        showReaction('Walk to the tennis ball first! 🐾', 'confused');
      } else {
        if (onManualEat) {
          onManualEat();
        } else {
          setInternalState((prev) => ({
            ...prev,
            currentAction: 'thinking',
            mood: 'confused',
          }));
          setTimeout(() => {
            setInternalState((p) => ({ ...p, currentAction: undefined, mood: 'happy' }));
          }, 800);
        }
        showReaction(isFoodBowlTarget ? 'Reach the dinner bowl first! 🐾' : "There's no food here yet! 🐾", 'confused');
      }
    }
  }, [
    activeState.position,
    effectiveTargetPos,
    isBallTarget,
    isFoodBowlTarget,
    isTreatTarget,
    onManualCollectTreat,
    onManualEat,
    onManualPlay,
  ]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveKeyPressed('right');
        handleMove('right');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setActiveKeyPressed('left');
        handleMove('left');
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setActiveKeyPressed('space');
        if (isPuddleMission) {
          handleJump();
        } else {
          handleEatOrInteract();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setActiveKeyPressed('enter');
        handleEatOrInteract();
      }
    };

    const handleKeyUp = () => {
      setActiveKeyPressed(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMove, handleEatOrInteract, handleJump, isPuddleMission]);

  const getPetMood = () => {
    if (isJumping || activeState.currentAction === 'jumping') return 'celebrating';
    if (isEatingAnim || activeState.currentAction === 'eating') return 'eating';
    if (activeState.currentAction === 'sleeping') return 'sleeping';
    if (activeState.currentAction === 'bathing') return 'bathing';
    if (activeState.currentAction === 'playing') return 'playing';
    if (activeState.currentAction === 'celebrating') return 'celebrating';
    if (activeState.hunger > 60) return 'hungry';
    if (activeState.happiness > 70) return 'happy';
    return activeState.mood || 'idle';
  };

  const tiles = Array.from({ length: totalTiles }, (_, i) => i);
  const displayTitle = stageTitle || `${petName}'s Garden`;

  return (
    <div
      id="storybook-game-world-container"
      className="w-full rounded-3xl p-3 sm:p-5 border-2 border-purple-200/80 shadow-lg relative overflow-hidden bg-gradient-to-b from-[#FAF5FF] via-[#FFF8FA] to-[#F5F3FF] select-none"
    >
      {/* WORLD TOP HEADER: Clean Title & Controls hint */}
      <div className="relative z-20 flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-purple-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 border border-pink-200 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-black text-base sm:text-lg text-slate-900 leading-tight">
              {displayTitle}
            </h2>
            {isTreatTarget && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-black text-amber-800">
                <span>🍪 Treats</span>
                <span>{Math.min(activeState.treatsCollected ?? activeState.starsCollected, totalTreats)}/{totalTreats}</span>
              </div>
            )}
          </div>
        </div>

        {/* Minimal keyboard indicator */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Keys:</span>
          <kbd className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-300 font-bold">
            ←
          </kbd>
          <kbd className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-300 font-bold">
            →
          </kbd>
          {isPuddleMission ? (
            <kbd className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-300 font-bold">
              SPACE (Jump)
            </kbd>
          ) : (
            <kbd className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-300 font-bold">
              ENTER
            </kbd>
          )}
        </div>
      </div>

      {/* =========================================================================
          2D VECTOR STORYBOOK GAME WORLD CANVAS
          ========================================================================= */}
      <div
        id="storybook-garden-stage"
        className="relative rounded-2xl border-2 border-emerald-300/80 shadow-md select-none h-72 sm:h-80 md:h-84 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 38%, #FEF08A 40%, #86EFAC 52%, #4ADE80 70%, #22C55E 100%)',
        }}
      >
        {/* SKY LAYER: Storybook Radiant Sun & Drifting Soft Clouds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Handcrafted Storybook Sun */}
          <div className="absolute top-3 right-8 w-20 h-20 animate-sun-pulse pointer-events-none">
            <StorybookSunSVG />
          </div>

          {/* Drifting Clouds */}
          <div className="absolute top-4 left-6 animate-cloud-drift-1 pointer-events-none opacity-90">
            <StorybookCloudSVG width={76} height={42} />
          </div>
          <div className="absolute top-10 right-1/3 animate-cloud-drift-2 pointer-events-none opacity-75">
            <StorybookCloudSVG width={94} height={50} />
          </div>

          {/* Gentle Flying Fluttering Butterfly */}
          <div className="absolute top-16 left-1/3 animate-butterfly pointer-events-none z-15">
            <StorybookButterflySVG />
          </div>
        </div>

        {/* DISTANT BACKGROUND: Pastel Rolling Hills & Distant Trees */}
        <div className="absolute top-20 inset-x-0 h-24 pointer-events-none flex justify-between items-end opacity-60">
          <div className="w-56 h-18 bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t-full -ml-8" />
          <div className="w-72 h-22 bg-gradient-to-t from-green-400 to-emerald-300 rounded-t-full -mx-6" />
          <div className="w-60 h-18 bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t-full -mr-8" />
        </div>

        {/* SCENIC STORYBOOK PROPS: Cozy Cottage (Left) & Garden Fountain (Right) */}
        {/* Left Side: Cozy Storybook Cottage */}
        <div className="absolute top-10 left-3 sm:left-5 z-10 pointer-events-none">
          <StorybookHouseSVG />
        </div>

        {/* Storybook Tree near Cottage */}
        <div className="absolute top-14 left-24 sm:left-28 z-10 pointer-events-none hidden sm:block">
          <StorybookTreeSVG />
        </div>

        {/* Right Side: Storybook Stone Garden Fountain */}
        <div className="absolute top-12 right-3 sm:right-6 z-10 pointer-events-none">
          <StorybookFountainSVG />
        </div>

        {/* Swaying Flowers in Midground Grass */}
        <div className="absolute top-36 left-44 z-12 pointer-events-none animate-flower-sway hidden md:block">
          <StorybookFlowerPatchSVG variant="pink" />
        </div>
        <div className="absolute top-38 right-28 z-12 pointer-events-none animate-flower-sway-alt hidden md:block">
          <StorybookFlowerPatchSVG variant="yellow" />
        </div>

        {/* =========================================================================
            GARDEN PATH (Natural Cobblestone Stepping Stones, No Developer Labels)
            ========================================================================= */}
        <div className="absolute bottom-0 inset-x-0 h-26 z-20">
          {/* Ground Turf & Soil with Grass blades */}
          <div
            className="absolute inset-0 border-t-2 border-emerald-400/90"
            style={{
              background: 'linear-gradient(180deg, #15803D 0%, #166534 22%, #854D0E 25%, #713F12 60%, #451A03 100%)',
            }}
          >
            {/* Soft Grass Blades along border */}
            <div className="absolute -top-2 inset-x-0 h-3 flex items-center justify-around overflow-hidden px-2 opacity-90">
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-emerald-300 font-black text-xs select-none ${
                    i % 2 === 0 ? 'animate-flower-sway' : 'animate-flower-sway-alt'
                  }`}
                >
                  ▲
                </span>
              ))}
            </div>
          </div>

          {/* Stepping Stones Path Layout */}
          <div className="relative h-full flex items-center justify-between px-4 sm:px-12 md:px-16 pb-3 z-30">
            {tiles.map((tileIndex) => {
              const isPetHere = activeState.position === tileIndex;
              const isPuddleTile = puddlePosition !== undefined && tileIndex === puddlePosition;
              const isTargetObject = tileIndex === effectiveTargetPos;
              const isHomeTile = isPuddleMission && isTargetObject;
              const isCollectStar = tileIndex === 1 || tileIndex === 3 || tileIndex === 4;

              return (
                <div
                  key={tileIndex}
                  className="flex flex-col items-center justify-center relative cursor-pointer group"
                  onClick={() => {
                    if (tileIndex > activeState.position) {
                      handleMove('right');
                    } else if (tileIndex < activeState.position) {
                      handleMove('left');
                    } else if (isTargetObject) {
                      handleEatOrInteract();
                    }
                  }}
                >
                  {/* PUDDLE OBSTACLE ON PATH */}
                  {isPuddleTile && (
                    <div className="absolute -top-6 flex flex-col items-center z-35 pointer-events-none">
                      <StorybookPuddleSVG isNear={isPetHere} />
                    </div>
                  )}
                  {/* TARGET OBJECT */}
                  {isTargetObject && !isPuddleTile && !isHomeTile && (
                    <div className="absolute -top-16 flex flex-col items-center z-35 pointer-events-none">
                      <div className="animate-bowl-sparkle">
                        {isTreatTarget ? (
                          <StorybookDogBiscuitSVG isNear={isPetHere} />
                        ) : isFoodBowlTarget ? (
                          <StorybookFullDogBowlSVG isNear={isPetHere} />
                        ) : isBallTarget ? (
                          <StorybookTennisBallSVG isNear={isPetHere} />
                        ) : (
                          <StorybookSteakSVG isNear={isPetHere} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* OPTIONAL STAR BERRIES (For higher level collection) */}
                  {isCollectStar && starsGoal > 0 && !isTargetObject && !isPuddleTile && (
                    <div className="absolute -top-14 flex flex-col items-center z-30 pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-amber-400/30 flex items-center justify-center animate-bounce">
                        <StorybookStarBerrySVG collected={tileIndex <= activeState.starsCollected} />
                      </div>
                    </div>
                  )}

                  {/* NATURAL ORGANIC STEPPING STONE */}
                  <div className="relative">
                    {/* Active Golden Glow under Pet */}
                    {isPetHere && (
                      <div className="absolute -inset-2 rounded-full bg-amber-300/40 blur-sm animate-pulse pointer-events-none" />
                    )}

                    {/* Stepping Stone SVG */}
                    <div
                      className={`transition-transform duration-200 ${
                        isPetHere ? 'scale-108 -translate-y-1' : 'group-hover:scale-103'
                      }`}
                    >
                      <StorybookSteppingStoneSVG isCurrent={isPetHere} index={tileIndex} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            MANCHU / PET CHARACTER (Smooth Walking & Jumping Transition)
            ========================================================================= */}
        <div
          id="pet-character-runner"
          className="absolute bottom-12 z-40 flex flex-col items-center pointer-events-none"
          style={{
            left: `calc(${8 + activeState.position * 20.8}% - 34px)`,
            transition: isJumping
              ? 'left 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s ease-in-out'
              : 'left 0.35s cubic-bezier(0.34, 1.25, 0.64, 1), transform 0.2s ease-out',
          }}
        >
          {/* Reaction / Speech Bubble */}
          {speechBubble && (
            <div
              className={`absolute -top-12 z-50 font-black text-xs px-3.5 py-1.5 rounded-2xl bg-white border-2 shadow-xl whitespace-nowrap animate-bounce ${
                speechBubble.type === 'confused'
                  ? 'border-amber-400 text-amber-900 bg-amber-50'
                  : speechBubble.type === 'yummy'
                  ? 'border-emerald-400 text-emerald-900 bg-emerald-50'
                  : 'border-pink-400 text-pink-900'
              }`}
            >
              <span>{speechBubble.text}</span>
            </div>
          )}

          {/* Pet Character Body with Orientation & Walking/Jumping Bob */}
          <div
            className={`transition-all duration-300 ${
              isJumping
                ? '-translate-y-14 scale-110'
                : isWalking
                ? '-translate-y-4 scale-105 rotate-2'
                : isEatingAnim
                ? 'translate-y-2'
                : 'translate-y-0'
            } ${walkDirection === 'left' ? 'scale-x-[-1]' : 'scale-x-100'}`}
          >
            <PetAvatar type={petType} mood={getPetMood()} size="lg" />
          </div>

          {/* Subtle Pet Name Tag (Well-spaced, no label collision) */}
          <div className="mt-0.5 px-2.5 py-0.5 bg-white/95 border border-purple-200 rounded-full text-[10px] font-black text-purple-950 shadow-xs flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span>{petName}</span>
          </div>

          {/* Soft Ground Contact Shadow */}
          <div
            className={`w-14 h-2.5 bg-black/25 rounded-full blur-2xs mt-0.5 transition-all duration-300 ${
              isJumping
                ? 'scale-40 opacity-20 translate-y-12'
                : isWalking
                ? 'scale-75 opacity-40'
                : 'scale-100 opacity-70'
            }`}
          />
        </div>
      </div>

      {/* =========================================================================
          ARCADE PLAY CONTROLS: Light Cream / Lavender Palette
          ========================================================================= */}
      {interactiveGameMode && (
        <div className="mt-3.5 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shadow-2xs shrink-0">
              <Gamepad2 className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h4 className="font-['Outfit'] font-black text-xs sm:text-sm text-slate-900">
                PLAY CONTROLS
              </h4>
              <p className="text-[11px] text-slate-600 font-medium">
                Click buttons or use keyboard keys
              </p>
            </div>
          </div>

          {/* Tactile Arcade Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
            {/* Move Left Button */}
            <button
              id="arcade-btn-left"
              onClick={() => handleMove('left')}
              disabled={activeState.position === 0}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                activeKeyPressed === 'left'
                  ? 'bg-purple-600 text-white shadow-inner scale-95'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-purple-200 shadow-xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-pink-600" />
              <div className="flex flex-col text-left leading-tight">
                <span>Move Left</span>
                <span className="text-[9px] font-mono text-purple-700 font-normal">moveBack()</span>
              </div>
            </button>

            {/* Move Right Button */}
            <button
              id="arcade-btn-right"
              onClick={() => handleMove('right')}
              disabled={activeState.position === totalTiles - 1}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                activeKeyPressed === 'right'
                  ? 'bg-purple-600 text-white shadow-inner scale-95'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-purple-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col text-left leading-tight">
                <span>Move Right</span>
                <span className="text-[9px] font-mono text-pink-600 font-normal">move()</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-pink-600" />
            </button>

            {/* Action / Jump Button (SPACE on Puddle mission, ENTER on others) */}
            {isPuddleMission ? (
              <button
                id="arcade-btn-jump"
                onClick={handleJump}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${
                  activeKeyPressed === 'space'
                    ? 'bg-amber-600 text-white shadow-inner scale-95'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border border-amber-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <div className="flex flex-col text-left leading-tight">
                  <span>Jump 🐾</span>
                  <span className="text-[9px] font-mono text-amber-100 font-normal">jump() [SPACE]</span>
                </div>
              </button>
            ) : (
              <button
                id="arcade-btn-eat"
                onClick={handleEatOrInteract}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${
                  activeKeyPressed === 'enter'
                    ? 'bg-pink-600 text-white shadow-inner scale-95'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border border-pink-400'
                }`}
              >
                <CornerDownLeft className="w-3.5 h-3.5 text-white" />
                <div className="flex flex-col text-left leading-tight">
                  <span>
                    {isTreatTarget
                      ? activeState.position === effectiveTargetPos
                        ? 'Collect 🍪'
                        : 'Search ⏎'
                      : activeState.position >= effectiveTargetPos
                      ? isBallTarget
                        ? 'Play 🎾'
                        : isFoodBowlTarget
                        ? 'Eat Dinner 🥣'
                        : 'Eat 🥩'
                      : 'Action ⏎'}
                  </span>
                  <span className="text-[9px] font-mono text-pink-100 font-normal">
                    {isTreatTarget
                      ? activeState.position === effectiveTargetPos
                        ? 'collectTreat()'
                        : 'action()'
                      : activeState.position >= effectiveTargetPos
                      ? isBallTarget
                        ? 'play()'
                        : 'eat()'
                      : 'action()'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SIMPLIFIED PET VITALS (Centered, Harmonious, 3 Equal Status Blocks)
          ========================================================================= */}
      {showMeters && (
        <div className="mt-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto">
            {/* 1. Hunger Status */}
            <div className="bg-rose-50/70 border border-rose-100/90 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center">
              <div className="flex items-center space-x-1 sm:space-x-1.5 mb-0.5">
                <Utensils className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700">Hunger</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-rose-600 font-mono">
                {activeState.hunger}%
              </span>
              <div className="w-full h-1.5 bg-rose-200/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeState.hunger)}%` }}
                />
              </div>
            </div>

            {/* 2. Happiness Status */}
            <div className="bg-pink-50/70 border border-pink-100/90 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center">
              <div className="flex items-center space-x-1 sm:space-x-1.5 mb-0.5">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700">Happy</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-pink-600 font-mono">
                {activeState.happiness}%
              </span>
              <div className="w-full h-1.5 bg-pink-200/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeState.happiness)}%` }}
                />
              </div>
            </div>

            {/* 3. Energy Status */}
            <div className="bg-amber-50/70 border border-amber-100/90 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center">
              <div className="flex items-center space-x-1 sm:space-x-1.5 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700">Energy</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-amber-600 font-mono">
                {activeState.energy}%
              </span>
              <div className="w-full h-1.5 bg-amber-200/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, activeState.energy)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   STORYBOOK 2D VECTOR ASSET COMPONENTS
   ========================================================================= */

// 1. Storybook Cottage SVG
const StorybookHouseSVG: React.FC = () => (
  <svg width="74" height="68" viewBox="0 0 74 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
    {/* Chimney with soft puff */}
    <rect x="52" y="8" width="8" height="16" fill="#F43F5E" stroke="#BE123C" strokeWidth="1.2" rx="1" />
    <rect x="50" y="6" width="12" height="4" fill="#FDA4AF" stroke="#BE123C" strokeWidth="1.2" rx="1" />
    <circle cx="56" cy="2" r="3" fill="#FFFFFF" opacity="0.8" />
    <circle cx="59" cy="-3" r="2.2" fill="#FFFFFF" opacity="0.5" />

    {/* Main Wooden Wall */}
    <rect x="14" y="28" width="46" height="34" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" rx="2" />
    {/* Wood horizontal clapboard lines */}
    <line x1="15" y1="36" x2="59" y2="36" stroke="#FDE68A" strokeWidth="1" />
    <line x1="15" y1="44" x2="59" y2="44" stroke="#FDE68A" strokeWidth="1" />
    <line x1="15" y1="52" x2="59" y2="52" stroke="#FDE68A" strokeWidth="1" />

    {/* Cozy Storybook Roof with Scalloped Shingles */}
    <polygon points="37,4 6,28 68,28" fill="#FB7185" stroke="#E11D48" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M 12 28 Q 18 22 24 28 Q 30 22 36 28 Q 42 22 48 28 Q 54 22 60 28" stroke="#FDA4AF" strokeWidth="1.5" fill="none" />

    {/* Front Wooden Door */}
    <path d="M 30 62 V 42 A 7 7 0 0 1 44 42 V 62 Z" fill="#B45309" stroke="#78350F" strokeWidth="1.2" />
    <circle cx="41" cy="52" r="1.5" fill="#FDE68A" />

    {/* Heart Window on upper wall */}
    <circle cx="37" cy="20" r="5" fill="#FEF08A" stroke="#E11D48" strokeWidth="1" />
    <path d="M 35 19 C 35 18 36 18 37 19 C 38 18 39 18 39 19 C 39 20 37 22 37 22 C 37 22 35 20 35 19 Z" fill="#F43F5E" />

    {/* Small Window with Flower Box */}
    <rect x="18" y="38" width="8" height="8" rx="1" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
    <line x1="22" y1="38" x2="22" y2="46" stroke="#D97706" strokeWidth="0.8" />
    <line x1="18" y1="42" x2="26" y2="42" stroke="#D97706" strokeWidth="0.8" />
    {/* Flower Box */}
    <rect x="16" y="46" width="12" height="3" rx="1" fill="#854D0E" />
    <circle cx="18" cy="45" r="1.5" fill="#F43F5E" />
    <circle cx="22" cy="45" r="1.5" fill="#FB7185" />
    <circle cx="26" cy="45" r="1.5" fill="#F43F5E" />
  </svg>
);

// 2. Storybook Garden Fountain SVG
const StorybookFountainSVG: React.FC = () => (
  <svg width="68" height="64" viewBox="0 0 68 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
    {/* Lower Tier Pool */}
    <ellipse cx="34" cy="54" rx="28" ry="8" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
    <ellipse cx="34" cy="52" rx="24" ry="6" fill="#38BDF8" />
    <ellipse cx="34" cy="51" rx="20" ry="4" fill="#7DD3FC" />

    {/* Stone Column Pedestal */}
    <path d="M 30 32 L 28 52 L 40 52 L 38 32 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.2" />

    {/* Upper Basin */}
    <ellipse cx="34" cy="32" rx="18" ry="6" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
    <ellipse cx="34" cy="30" rx="15" ry="4" fill="#38BDF8" />

    {/* Water Fountain Jets */}
    <path d="M 34 30 Q 34 14 26 22" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 34 30 Q 34 10 34 18" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M 34 30 Q 34 14 42 22" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Tiny Water Droplets */}
    <circle cx="26" cy="18" r="1.2" fill="#E0F2FE" />
    <circle cx="34" cy="8" r="1.5" fill="#E0F2FE" />
    <circle cx="42" cy="18" r="1.2" fill="#E0F2FE" />
  </svg>
);

// 3. Storybook Tree SVG
const StorybookTreeSVG: React.FC = () => (
  <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    {/* Trunk */}
    <rect x="21" y="32" width="6" height="24" fill="#92400E" rx="2" />
    {/* Foliage Blobs */}
    <circle cx="24" cy="22" r="18" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
    <circle cx="16" cy="24" r="12" fill="#86EFAC" />
    <circle cx="32" cy="22" r="13" fill="#22C55E" />
    <circle cx="24" cy="14" r="12" fill="#86EFAC" />
    {/* Sweet Blossom Apples */}
    <circle cx="18" cy="18" r="2.5" fill="#F43F5E" />
    <circle cx="28" cy="16" r="2.2" fill="#F43F5E" />
    <circle cx="23" cy="26" r="2.2" fill="#F43F5E" />
  </svg>
);

// 4. Storybook Steak SVG (Juicy seared steak with bone and savory steam)
const StorybookSteakSVG: React.FC<{ isNear: boolean }> = ({ isNear }) => (
  <svg width="66" height="46" viewBox="0 0 66 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    {/* Savory Aroma Steam Puffs */}
    <g className="animate-gentle-float">
      <path d="M 28 8 Q 25 3 29 0" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M 36 9 Q 39 4 35 0" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 44 8 Q 46 3 42 0" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>

    {/* Ground Shadow under Steak */}
    <ellipse cx="34" cy="40" rx="24" ry="5" fill="#14532D" opacity="0.4" />

    {/* Main Steak Body - Thick Seared Meat Cutlet */}
    {/* Bottom Seared Depth Layer */}
    <path
      d="M 15 28 C 13 21, 20 14, 34 15 C 48 16, 57 21, 55 31 C 53 37, 43 40, 29 39 C 18 38, 16 33, 15 28 Z"
      fill="#881337"
    />

    {/* Top Tender Juicy Steak Surface */}
    <path
      d="M 16 26 C 14 19, 21 13, 35 14 C 48 15, 56 20, 54 29 C 52 35, 42 38, 29 37 C 19 36, 17 31, 16 26 Z"
      fill="#E11D48"
      stroke="#9F1239"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />

    {/* Marbled Meat Rich Color Accent */}
    <path
      d="M 23 23 C 24 18, 32 16, 42 18 C 49 20, 50 25, 46 29 C 40 33, 31 33, 25 30 C 22 28, 22 25, 23 23 Z"
      fill="#F43F5E"
    />

    {/* Juicy Fat Rim Accent along top/side */}
    <path
      d="M 32 14.5 C 42 15.5, 53 19, 54 27"
      stroke="#FFE4E6"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
      opacity="0.9"
    />

    {/* Authentic T-Bone / Round Bone Notch */}
    <ellipse cx="23" cy="20" rx="4.5" ry="4" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.2" />
    <ellipse cx="23" cy="20" rx="2" ry="1.8" fill="#FDE68A" />

    {/* Delicious Diagonal Grill Sear Marks */}
    <line x1="30" y1="19" x2="39" y2="28" stroke="#881337" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="37" y1="18" x2="47" y2="27" stroke="#881337" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="26" y1="26" x2="33" y2="33" stroke="#881337" strokeWidth="1.6" strokeLinecap="round" />

    {/* Tender Glistening Glaze Highlights */}
    <path d="M 32 16 Q 44 16 47 21" stroke="#FECDD3" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
    <circle cx="44" cy="23" r="1" fill="#FFFFFF" opacity="0.9" />

    {/* Subtle Sparkle */}
    <path
      d="M 52 10 L 53.5 13 L 56.5 14.5 L 53.5 16 L 52 19 L 50.5 16 L 47.5 14.5 L 50.5 13 Z"
      fill="#FDE047"
      opacity="0.9"
    />
  </svg>
);

// 4b. Storybook Tennis Ball SVG (Vibrant felt tennis ball with classic curved seams, depth, and shine)
const StorybookTennisBallSVG: React.FC<{ isNear: boolean }> = ({ isNear }) => (
  <div className="relative flex flex-col items-center">
    {/* Subtle interactive target glow */}
    <div
      className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 ${
        isNear ? 'bg-amber-300/60 blur-md scale-125' : 'bg-lime-300/35 blur-sm animate-pulse'
      }`}
    />

    <svg
      width="60"
      height="54"
      viewBox="0 0 60 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md select-none overflow-visible"
    >
      <defs>
        {/* Tennis Ball Radial Gradient (Felt chartreuse green with soft light falloff) */}
        <radialGradient id="tennisBallGrad" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#F7FEE7" />
          <stop offset="25%" stopColor="#D9F99D" />
          <stop offset="60%" stopColor="#84CC16" />
          <stop offset="85%" stopColor="#4D7C0F" />
          <stop offset="100%" stopColor="#365314" />
        </radialGradient>
      </defs>

      {/* Floating Gentle Star Sparkles */}
      <g className="animate-gentle-float">
        <path
          d="M 46 7 L 47.5 10 L 50.5 11.5 L 47.5 13 L 46 16 L 44.5 13 L 41.5 11.5 L 44.5 10 Z"
          fill="#FEF08A"
          opacity="0.9"
        />
        <circle cx="12" cy="11" r="1.5" fill="#FEF08A" opacity="0.85" />
      </g>

      {/* Ground Shadow underneath */}
      <ellipse cx="30" cy="48" rx="20" ry="4.5" fill="#14532D" opacity="0.35" />

      {/* Tennis Ball Core Sphere */}
      <circle
        cx="30"
        cy="27"
        r="20"
        fill="url(#tennisBallGrad)"
        stroke="#3F6212"
        strokeWidth="1.2"
      />

      {/* Classic Curved Tennis Ball Seams (White rubber groove lines with inset depth) */}
      {/* Left Seam Inset Groove Shadow */}
      <path
        d="M 17 11 C 27 17.5, 27 36.5, 17 43"
        stroke="#365314"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      {/* Left Seam White Line */}
      <path
        d="M 17 11 C 27 17.5, 27 36.5, 17 43"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Right Seam Inset Groove Shadow */}
      <path
        d="M 43 11 C 33 17.5, 33 36.5, 43 43"
        stroke="#365314"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      {/* Right Seam White Line */}
      <path
        d="M 43 11 C 33 17.5, 33 36.5, 43 43"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Top-left Specular Highlight Sheen */}
      <path
        d="M 21 14 Q 29 10 38 14"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <circle cx="23" cy="17" r="2.2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  </div>
);

// 4c. Storybook Dog Biscuit SVG — chunky cartoon biscuit with paw stamp
const StorybookDogBiscuitSVG: React.FC<{ isNear: boolean }> = ({ isNear }) => (
  <div className="relative flex flex-col items-center">
    <div
      className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 ${
        isNear ? 'bg-amber-300/60 blur-md scale-125' : 'bg-yellow-200/35 blur-sm animate-pulse'
      }`}
    />
    <svg width="64" height="52" viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg overflow-visible">
      <defs>
        <linearGradient id="dogBiscuitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="45" rx="22" ry="4" fill="#14532D" opacity="0.28" />
      <path
        d="M13 17 C9 12,3 14,4 20 C-1 23,1 31,7 31 C6 37,13 40,17 35 L47 35 C51 40,58 37,57 31 C63 31,65 23,60 20 C61 14,55 12,51 17 L47 20 L17 20 Z"
        fill="url(#dogBiscuitGrad)"
        stroke="#78350F"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect x="17" y="20" width="30" height="15" rx="7.5" fill="#F59E0B" opacity="0.9" />
      <ellipse cx="32" cy="29" rx="4.2" ry="3.6" fill="#92400E" opacity="0.72" />
      <circle cx="25.8" cy="24.8" r="2" fill="#92400E" opacity="0.72" />
      <circle cx="30.1" cy="23.4" r="2" fill="#92400E" opacity="0.72" />
      <circle cx="34.4" cy="23.4" r="2" fill="#92400E" opacity="0.72" />
      <circle cx="38.7" cy="24.8" r="2" fill="#92400E" opacity="0.72" />
      <circle cx="20" cy="29" r="1" fill="#78350F" opacity="0.45" />
      <circle cx="44" cy="27" r="1.1" fill="#78350F" opacity="0.45" />
      <circle cx="42" cy="32" r="0.8" fill="#78350F" opacity="0.38" />
      <circle cx="54" cy="12" r="1.6" fill="#D97706" />
      <circle cx="58" cy="9" r="1" fill="#F59E0B" />
      <circle cx="8" cy="11" r="1.2" fill="#D97706" />
    </svg>
  </div>
);

// 4d. Very Full Cartoon Dog Food Bowl — overflowing kibble
const StorybookFullDogBowlSVG: React.FC<{ isNear: boolean }> = ({ isNear }) => (
  <div className="relative flex flex-col items-center">
    <div
      className={`absolute -inset-3 rounded-full pointer-events-none transition-all duration-300 ${
        isNear ? 'bg-orange-300/55 blur-md scale-125' : 'bg-amber-200/35 blur-sm animate-pulse'
      }`}
    />
    <svg width="82" height="62" viewBox="0 0 82 62" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg overflow-visible">
      <defs>
        <linearGradient id="fullBowlRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <radialGradient id="kibblePile" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>
      </defs>

      <ellipse cx="41" cy="56" rx="29" ry="5" fill="#14532D" opacity="0.3" />

      {/* Giant pile so the bowl looks VERY full, like a cartoon */}
      <path
        d="M19 28 C20 16,29 9,41 11 C48 5,60 12,61 21 C68 20,72 27,66 33 L16 33 C12 29,14 25,19 28 Z"
        fill="url(#kibblePile)"
        stroke="#78350F"
        strokeWidth="1.5"
      />

      <circle cx="24" cy="25" r="3.3" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="31" cy="18" r="3.4" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="39" cy="21" r="3.2" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="47" cy="15" r="3.5" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="55" cy="21" r="3.3" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="60" cy="27" r="3" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="29" cy="29" r="3.2" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="37" cy="27" r="3.4" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="45" cy="30" r="3.1" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="53" cy="27" r="3.4" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="34" cy="13" r="2.6" fill="#D97706" stroke="#78350F" strokeWidth="0.6" />
      <circle cx="51" cy="10" r="2.4" fill="#B45309" stroke="#78350F" strokeWidth="0.6" />

      {/* Pieces spilling out */}
      <circle cx="13" cy="38" r="3" fill="#B45309" stroke="#78350F" strokeWidth="0.7" />
      <circle cx="69" cy="37" r="2.8" fill="#D97706" stroke="#78350F" strokeWidth="0.7" />
      <circle cx="65" cy="44" r="2.3" fill="#B45309" stroke="#78350F" strokeWidth="0.7" />

      <ellipse cx="41" cy="34" rx="29" ry="8" fill="#FDA4AF" stroke="#9F1239" strokeWidth="1.6" />
      <ellipse cx="41" cy="33" rx="24" ry="5.2" fill="#7C2D12" />

      {/* More food visible inside the rim */}
      <ellipse cx="41" cy="31.5" rx="21" ry="4.3" fill="#92400E" />
      <circle cx="27" cy="30.5" r="3.2" fill="#D97706" />
      <circle cx="35" cy="31" r="3.5" fill="#B45309" />
      <circle cx="43" cy="30" r="3.4" fill="#D97706" />
      <circle cx="51" cy="31" r="3.2" fill="#B45309" />
      <circle cx="58" cy="30.5" r="2.8" fill="#D97706" />

      <path
        d="M13 35 C15 51,22 55,41 55 C60 55,67 51,69 35 C60 39,22 39,13 35 Z"
        fill="url(#fullBowlRed)"
        stroke="#9F1239"
        strokeWidth="1.7"
      />

      {/* Bone badge */}
      <g transform="translate(31 41)">
        <path
          d="M2 4 C0 2,0 0,2 0 C3 0,4 1,5 2 L15 2 C16 1,17 0,18 0 C20 0,20 2,18 4 C20 6,20 8,18 8 C17 8,16 7,15 6 L5 6 C4 7,3 8,2 8 C0 8,0 6,2 4 Z"
          fill="#FFF7ED"
          stroke="#9F1239"
          strokeWidth="0.8"
        />
      </g>

      <path d="M20 42 Q24 47 31 48" stroke="#FFE4E6" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    </svg>
  </div>
);

// 5. Storybook Radiant Sun SVG
const StorybookSunSVG: React.FC = () => (
  <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer soft rays */}
    <g stroke="#FDE047" strokeWidth="3" strokeLinecap="round">
      <line x1="34" y1="4" x2="34" y2="12" />
      <line x1="34" y1="56" x2="34" y2="64" />
      <line x1="4" y1="34" x2="12" y2="34" />
      <line x1="56" y1="34" x2="64" y2="34" />
      <line x1="13" y1="13" x2="19" y2="19" />
      <line x1="49" y1="49" x2="55" y2="55" />
      <line x1="13" y1="55" x2="19" y2="49" />
      <line x1="49" y1="19" x2="55" y2="13" />
    </g>
    {/* Sun Core Disc with Warm Gradient */}
    <circle cx="34" cy="34" r="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
    <circle cx="34" cy="34" r="15" fill="#FEF08A" />
    {/* Cute smiling face */}
    <circle cx="29" cy="32" r="1.8" fill="#78350F" />
    <circle cx="39" cy="32" r="1.8" fill="#78350F" />
    <path d="M 30 36 Q 34 40 38 36" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="26" cy="35" r="2" fill="#FB7185" opacity="0.6" />
    <circle cx="42" cy="35" r="2" fill="#FB7185" opacity="0.6" />
  </svg>
);

// 6. Storybook Soft Cloud SVG
const StorybookCloudSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <svg width={width} height={height} viewBox="0 0 80 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xs">
    <path
      d="M 18 36 C 8 36 0 28 0 18 C 0 8 10 2 20 6 C 26 -2 40 -2 48 4 C 56 0 68 4 72 14 C 80 18 80 30 72 36 Z"
      fill="#FFFFFF"
      fillOpacity="0.92"
    />
  </svg>
);

// 7. Storybook Butterfly SVG
const StorybookButterflySVG: React.FC = () => (
  <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    {/* Wings */}
    <ellipse cx="6" cy="7" rx="6" ry="5" fill="#F472B6" stroke="#DB2777" strokeWidth="0.8" />
    <ellipse cx="6" cy="14" rx="4" ry="3.5" fill="#FDA4AF" stroke="#DB2777" strokeWidth="0.8" />
    <ellipse cx="18" cy="7" rx="6" ry="5" fill="#F472B6" stroke="#DB2777" strokeWidth="0.8" />
    <ellipse cx="18" cy="14" rx="4" ry="3.5" fill="#FDA4AF" stroke="#DB2777" strokeWidth="0.8" />
    {/* Body */}
    <ellipse cx="12" cy="10" rx="1.5" ry="6" fill="#831843" />
  </svg>
);

// 8. Storybook Flower Patch SVG
const StorybookFlowerPatchSVG: React.FC<{ variant: 'pink' | 'yellow' }> = ({ variant }) => (
  <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 28 Q 14 18 10 12" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="10" r="4" fill={variant === 'pink' ? '#F472B6' : '#FBBF24'} />
    <circle cx="10" cy="10" r="1.5" fill="#FEF08A" />

    <path d="M 20 28 Q 18 16 22 14" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="22" cy="12" r="3.5" fill={variant === 'pink' ? '#FB7185' : '#F59E0B'} />
    <circle cx="22" cy="12" r="1.2" fill="#FFFFFF" />
  </svg>
);

// 9. Storybook Natural Cobblestone Stepping Stone SVG (No developer labels)
const StorybookSteppingStoneSVG: React.FC<{ isCurrent: boolean; index: number }> = ({ isCurrent, index }) => (
  <svg width="64" height="28" viewBox="0 0 64 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
    {/* Stone Base Shadow */}
    <ellipse cx="32" cy="17" rx="28" ry="9" fill="#334155" opacity="0.3" />

    {/* Main Rounded Cobblestone Stone */}
    <ellipse
      cx="32"
      cy="13"
      rx="26"
      ry="8"
      fill={isCurrent ? '#FDE68A' : index % 2 === 0 ? '#E2E8F0' : '#F1F5F9'}
      stroke={isCurrent ? '#F59E0B' : '#94A3B8'}
      strokeWidth={isCurrent ? '2' : '1.2'}
    />

    {/* Top Stone Bevel Texture / Highlights */}
    <ellipse cx="30" cy="11" rx="20" ry="5" fill={isCurrent ? '#FEF08A' : '#FFFFFF'} opacity="0.8" />

    {/* Subtle Cute Stepping Paw Mark or Moss Speckle */}
    {isCurrent ? (
      <g opacity="0.6">
        <circle cx="32" cy="12" r="1.5" fill="#B45309" />
        <circle cx="29" cy="9.5" r="0.8" fill="#B45309" />
        <circle cx="32" cy="8.5" r="0.8" fill="#B45309" />
        <circle cx="35" cy="9.5" r="0.8" fill="#B45309" />
      </g>
    ) : (
      <g opacity="0.4">
        <circle cx="28" cy="12" r="1" fill="#64748B" />
        <circle cx="36" cy="13" r="1.2" fill="#64748B" />
      </g>
    )}
  </svg>
);

// 10. Storybook Star Berry SVG
const StorybookStarBerrySVG: React.FC<{ collected: boolean }> = ({ collected }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8"
      fill={collected ? '#FBBF24' : '#CBD5E1'}
      stroke={collected ? '#D97706' : '#94A3B8'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// 11. Storybook Garden Puddle SVG
const StorybookPuddleSVG: React.FC<{ isNear?: boolean }> = ({ isNear }) => (
  <div className="relative flex flex-col items-center select-none">
    <div
      className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 ${
        isNear ? 'bg-cyan-300/40 blur-md scale-110' : 'bg-cyan-200/20 blur-sm'
      }`}
    />

    <svg
      width="98"
      height="50"
      viewBox="0 0 98 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md overflow-visible"
    >
      <defs>
        <radialGradient id="puddleWaterGradNew" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="30%" stopColor="#A5F3FC" />
          <stop offset="65%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>

        <linearGradient id="puddleEdgeGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C4A1D" />
          <stop offset="100%" stopColor="#4A2C12" />
        </linearGradient>
      </defs>

      {/* Mud border */}
      <path
        d="M 10 27 C 8 14, 25 6, 47 8 C 71 5, 90 15, 88 28 C 86 40, 66 45, 46 43 C 24 45, 10 39, 10 27 Z"
        fill="url(#puddleEdgeGradNew)"
        opacity="0.8"
      />

      {/* Water */}
      <path
        d="M 13 26 C 11 16, 27 10, 47 11 C 69 9, 85 17, 84 27 C 82 36, 64 40, 46 39 C 28 40, 14 35, 13 26 Z"
        fill="url(#puddleWaterGradNew)"
        stroke="#38BDF8"
        strokeWidth="1.6"
      />

      {/* Ripples */}
      <ellipse
        cx="49"
        cy="26"
        rx="26"
        ry="9"
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="1.4"
        opacity="0.85"
      />
      <ellipse
        cx="48"
        cy="27"
        rx="16"
        ry="5.5"
        fill="none"
        stroke="#BAE6FD"
        strokeWidth="1.1"
        opacity="0.75"
      />

      {/* Reflection */}
      <path
        d="M 31 18 C 37 15, 53 15, 62 18"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <ellipse cx="28" cy="22" rx="2.5" ry="1.6" fill="#FFFFFF" opacity="0.9" />
      <ellipse cx="68" cy="21" rx="2" ry="1.3" fill="#FFFFFF" opacity="0.75" />

      {/* Tiny grass details */}
      <path d="M 17 34 Q 15 28 18 24" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 20 34 Q 19 29 22 25" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 79 35 Q 82 30 80 25" stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 76 35 Q 78 30 76 26" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </div>
);

// 12. Storybook Home Goal SVG
const StorybookHomeGoalSVG: React.FC<{ isNear?: boolean }> = ({ isNear }) => (
  <div className="relative flex flex-col items-center select-none">
    {/* Subtle welcoming lantern glow */}
    <div
      className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 ${
        isNear ? 'bg-amber-300/60 blur-md scale-125' : 'bg-amber-200/30 blur-sm animate-pulse'
      }`}
    />

    <svg
      width="68"
      height="66"
      viewBox="0 0 68 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md overflow-visible"
    >
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      {/* Soft Ground Shadow */}
      <ellipse cx="34" cy="60" rx="24" ry="5" fill="#14532D" opacity="0.4" />

      {/* Cozy Cottage Gate / Arch */}
      <path
        d="M 14 58 L 14 26 C 14 14, 54 14, 54 26 L 54 58"
        stroke="#78350F"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Warm Wooden Doorway Arch */}
      <path
        d="M 18 58 L 18 28 C 18 18, 50 18, 50 28 L 50 58 Z"
        fill="#FDF2F8"
        stroke="#D97706"
        strokeWidth="1.5"
      />

      {/* Welcoming Door Pattern & Heart Motif */}
      <rect x="22" y="26" width="24" height="30" rx="4" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1.2" />
      {/* Little Heart on Door */}
      <path
        d="M 34 38 C 32 35, 28 35, 28 38 C 28 42, 34 45, 34 45 C 34 45, 40 42, 40 38 C 40 35, 36 35, 34 38 Z"
        fill="#EC4899"
      />

      {/* Hanging Golden Lantern */}
      <line x1="34" y1="14" x2="34" y2="20" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="34" cy="22" r="4.5" fill="url(#lanternGlow)" stroke="#78350F" strokeWidth="1" />
      <circle cx="34" cy="22" r="1.5" fill="#FFFFFF" />

      {/* "HOME" Cute Wooden Signboard */}
      <rect x="18" y="4" width="32" height="12" rx="3.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
      <text
        x="34"
        y="13"
        textAnchor="middle"
        fontSize="8"
        fontWeight="900"
        fontFamily="sans-serif"
        fill="#78350F"
      >
        HOME 🏠
      </text>

      {/* Welcome Mat */}
      <rect x="18" y="56" width="32" height="5" rx="2.5" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
    </svg>
  </div>
);
