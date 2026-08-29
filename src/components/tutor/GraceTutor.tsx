import React, { useState } from 'react';
import { TutorDecision, TutorObservation } from '../../types';
import { requestGraceTutorHint } from '../../services/geminiTutor';
import { Sparkles, Lightbulb, Compass, Award, RefreshCw, Bot, CheckCircle, ArrowRight, Info } from 'lucide-react';

interface GraceTutorProps {
  observation: TutorObservation;
  onHintReceived?: (decision: TutorDecision) => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const GraceTutor: React.FC<GraceTutorProps> = ({
  observation,
  onHintReceived,
  isOpen = true,
  className = '',
}) => {
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(observation.hintLevel || 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [decision, setDecision] = useState<TutorDecision | null>(null);

  const fetchHint = async (level: 1 | 2 | 3) => {
    setIsLoading(true);
    setCurrentLevel(level);
    try {
      const res = await requestGraceTutorHint({
        ...observation,
        hintLevel: level,
      });
      setDecision(res);
      if (onHintReceived) onHintReceived(res);
    } catch (err) {
      console.error('Error fetching tutor hint:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHintLevelBadge = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          title: 'Hint 1: Look Closer',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          desc: 'Observing the mission',
        };
      case 2:
        return {
          title: 'Hint 2: Concept Rule',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          desc: 'How this logic works',
        };
      case 3:
        return {
          title: 'Hint 3: Code Structure',
          color: 'bg-pink-50 text-pink-700 border-pink-200',
          desc: 'Action guidance',
        };
      default:
        return { title: 'Hint', color: 'bg-gray-50 text-gray-700 border-gray-200', desc: '' };
    }
  };

  const badge = getHintLevelBadge(currentLevel);

  return (
    <div className={`bg-gradient-to-br from-[#FFF8FA] via-[#FDF5FF] to-[#F5FAFF] rounded-2xl border-2 border-purple-200/80 p-4 md:p-5 shadow-md relative ${className}`}>
      {/* Tutor Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          {/* Grace Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-300 flex items-center justify-center text-white shadow-sm ring-2 ring-purple-200">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 text-xs animate-spin">✨</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-['Outfit'] font-black text-base text-purple-950">
                Grace <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Companion</span>
              </h3>
              <span className="text-xs text-pink-600 font-bold">Coding Guide</span>
            </div>
            <p className="text-xs text-purple-700/80 font-medium">
              Here to help {observation.player} solve puzzles step-by-step!
            </p>
          </div>
        </div>

        {/* Attempt counter pill */}
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 bg-white border border-purple-100 rounded-full text-xs font-semibold text-purple-800 shadow-2xs">
            Attempt #{observation.attemptNumber}
          </span>
        </div>
      </div>

      {/* Progressive Hint Ladder Control */}
      <div className="mt-3 flex items-center space-x-1.5 bg-white/70 p-1.5 rounded-xl border border-purple-100/80">
        <span className="text-[11px] font-bold text-purple-800 uppercase px-2">Hint Level:</span>
        {([1, 2, 3] as const).map((lvl) => (
          <button
            key={lvl}
            id={`grace-hint-ladder-${lvl}`}
            onClick={() => fetchHint(lvl)}
            disabled={isLoading}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLevel === lvl
                ? 'bg-purple-600 text-white shadow-xs scale-102'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Level {lvl}
          </button>
        ))}
      </div>

      {/* Main Hint Body */}
      <div className="mt-3.5 space-y-2.5">
        {isLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2 bg-white/60 rounded-xl border border-purple-50">
            <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-xs font-medium text-purple-700">Grace is thinking about a gentle hint for you...</p>
          </div>
        ) : decision ? (
          <>
            {/* Hint level & badge banner */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                <Lightbulb className="w-3 h-3" />
                <span>{badge.title}</span>
              </span>
              <span className="text-[11px] text-purple-600 italic">{badge.desc}</span>
            </div>

            {/* Learner Understands Affirmation */}
            {decision.learnerUnderstands && (
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-2.5 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">What you did well:</p>
                  <p className="text-xs text-emerald-800">{decision.learnerUnderstands}</p>
                </div>
              </div>
            )}

            {/* Targeted Conceptual Hint */}
            <div className="bg-white rounded-xl p-3.5 border border-pink-200/80 shadow-2xs">
              <p className="text-sm font-medium text-purple-950 leading-relaxed">
                "{decision.hintMessage}"
              </p>

              {decision.conceptualExplanation && (
                <div className="mt-2.5 pt-2.5 border-t border-purple-100 text-xs text-purple-700/90 flex items-start space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                  <span>
                    <strong className="font-semibold text-purple-900">Concept Note:</strong> {decision.conceptualExplanation}
                  </span>
                </div>
              )}
            </div>

            {/* Encouragement */}
            {decision.encouragement && (
              <div className="flex items-center space-x-1.5 px-2 text-xs font-semibold text-pink-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{decision.encouragement}</span>
              </div>
            )}

            {/* Extra Practice Recommendation if Struggling */}
            {decision.shouldOfferPractice && (
              <div className="mt-2 bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Adaptive Practice Available</p>
                    <p className="text-[11px] text-amber-800">Would you like a mini practice puzzle for {observation.currentConcept}?</p>
                  </div>
                </div>
                <button
                  id="grace-practice-challenge-btn"
                  onClick={() => alert(`Grace created an extra mini practice scenario for ${observation.currentConcept}!`)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <span>Try It</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white/80 rounded-xl p-4 text-center border border-purple-100">
            <p className="text-xs text-purple-800 mb-3 font-medium">
              Need a gentle nudge? Grace can review your journey and give you a progressive hint without giving away the answer!
            </p>
            <button
              id="grace-ask-hint-primary-btn"
              onClick={() => fetchHint(currentLevel)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-102 inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Grace for a Hint 💡</span>
            </button>
          </div>
        )}
      </div>

      {/* Grace Hopper inspirational footer note */}
      <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center space-x-1.5 text-[11px] text-purple-600/90 font-medium">
        <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Grace is named after Grace Hopper, a pioneering computer scientist who helped shape modern programming.</span>
      </div>
    </div>
  );
};
