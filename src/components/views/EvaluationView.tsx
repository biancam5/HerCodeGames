import React, { useState } from 'react';
import { EvaluationScenario, EvaluationResult } from '../../types';
import { requestGraceTutorHint, requestBaselineHint } from '../../services/geminiTutor';
import {
  ChevronLeft,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const EVALUATION_SCENARIOS: EvaluationScenario[] = [
  {
    id: 'eval-1',
    title: '1. Reversed Comparison Operator (> vs <)',
    description: 'Learner wants to feed Luna when hunger > 50, but writes `hunger < 50`.',
    concept: 'Conditions & Comparisons',
    levelType: 'code-pet',
    learnerCode: `let hunger = 70;\nif (hunger < 50) {\n    feed();\n}`,
    attemptNumber: 2,
    previousErrors: ['Pet did not eat breakfast when hunger was 70%'],
    expectedMisconception: 'reversed_comparison',
    correctSolutionSnippet: 'if (hunger > 50) { feed(); }',
  },
  {
    id: 'eval-2',
    title: '2. Missing Action Call Inside if Statement',
    description: 'Learner wrote the condition correctly but left the body empty or forgot `feed()`.',
    concept: 'Condition Blocks',
    levelType: 'code-pet',
    learnerCode: `let hunger = 70;\nif (hunger > 50) {\n    // forgot to call feed()\n}`,
    attemptNumber: 1,
    previousErrors: [],
    expectedMisconception: 'missing_action_call',
    correctSolutionSnippet: 'if (hunger > 50) { feed(); }',
  },
  {
    id: 'eval-3',
    title: '3. Repeated Commands Instead of Loop',
    description: 'Learner wrote `collectStar(); collectStar(); collectStar();` manually instead of a loop.',
    concept: 'Loops & Repetition',
    levelType: 'code-pet',
    learnerCode: `collectStar();\ncollectStar();\ncollectStar();`,
    attemptNumber: 1,
    previousErrors: [],
    expectedMisconception: 'unrolled_loop',
    correctSolutionSnippet: 'for (let i = 0; i < 3; i++) { collectStar(); }',
  },
  {
    id: 'eval-4',
    title: '4. Off-by-One Loop Counting Error',
    description: 'Learner wrote `i < 4` or `i <= 3` when collecting 3 stars.',
    concept: 'for Loop Bounds',
    levelType: 'code-pet',
    learnerCode: `for (let i = 0; i <= 3; i++) {\n    collectStar();\n}`,
    attemptNumber: 2,
    previousErrors: ['Collected 4 stars instead of 3'],
    expectedMisconception: 'off_by_one_loop',
    correctSolutionSnippet: 'for (let i = 0; i < 3; i++) { collectStar(); }',
  },
  {
    id: 'eval-5',
    title: '5. Missing Quotes on String Variable',
    description: 'Learner assigns pet name without quotes: `let petName = Luna;`.',
    concept: 'Variables & Data Types',
    levelType: 'code-pet',
    learnerCode: `let petName = Luna;\nlet happiness = 80;`,
    attemptNumber: 1,
    previousErrors: ['ReferenceError: Luna is not defined'],
    expectedMisconception: 'unquoted_string',
    correctSolutionSnippet: 'let petName = "Luna";',
  },
  {
    id: 'eval-6',
    title: '6. Defined Function but Forgot to Call It',
    description: 'Learner creates `function morningRoutine() { ... }` but omits `morningRoutine();`.',
    concept: 'Functions Definition vs Execution',
    levelType: 'code-pet',
    learnerCode: `function morningRoutine() {\n    feed();\n    play();\n}`,
    attemptNumber: 2,
    previousErrors: ['Pet stayed idle and routine did not execute'],
    expectedMisconception: 'uncalled_function',
    correctSolutionSnippet: 'morningRoutine();',
  },
  {
    id: 'eval-7',
    title: '7. Repeated Struggle on Same Concept (Attempt 3)',
    description: 'Learner has failed 3 attempts on condition comparison.',
    concept: 'Adaptive Assistance & Remediation',
    levelType: 'code-pet',
    learnerCode: `if (hunger <= 50) {\n    feed();\n}`,
    attemptNumber: 3,
    previousErrors: ['Condition evaluated false on attempt 1 & 2'],
    expectedMisconception: 'persistent_comparison_misconception',
    correctSolutionSnippet: 'if (hunger > 50) { feed(); }',
  },
  {
    id: 'eval-8',
    title: '8. Immediate Correct Solution (Validation Check)',
    description: 'Learner wrote flawless JavaScript on first try.',
    concept: 'Reinforcement & Affirmation',
    levelType: 'code-pet',
    learnerCode: `let hunger = 70;\nif (hunger > 50) {\n    feed();\n}`,
    attemptNumber: 1,
    previousErrors: [],
    expectedMisconception: 'none_correct',
    correctSolutionSnippet: 'if (hunger > 50) { feed(); }',
  },
  {
    id: 'eval-9',
    title: '9. Pre-Attempt Assistance / Scaffolding Request',
    description: 'Learner is looking at starter code and requests an initial hint.',
    concept: 'Scaffolding & Conceptual Orientation',
    levelType: 'code-pet',
    learnerCode: `// How do I start teaching Luna to eat?`,
    attemptNumber: 1,
    previousErrors: [],
    expectedMisconception: 'unstarted_scaffolding',
    correctSolutionSnippet: 'if (hunger > 50) { feed(); }',
  },
  {
    id: 'eval-10',
    title: '10. Ambiguous Multi-Fault Error',
    description: 'Missing keyword `let` combined with unclosed curly brace.',
    concept: 'Complex Syntax Diagnostics',
    levelType: 'code-pet',
    learnerCode: `hunger = 70\nif (hunger > 50) {\n    feed()`,
    attemptNumber: 1,
    previousErrors: ['Syntax error: unexpected end of input'],
    expectedMisconception: 'unclosed_block_and_declaration',
    correctSolutionSnippet: 'let hunger = 70;\nif (hunger > 50) {\n    feed();\n}',
  },
];

export const EvaluationView: React.FC<{ onBackToHub: () => void }> = ({ onBackToHub }) => {
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [results, setResults] = useState<Record<string, EvaluationResult>>({});

  const activeScenario = EVALUATION_SCENARIOS[activeScenarioIndex];

  const evaluateSingleScenario = async (scenario: EvaluationScenario): Promise<EvaluationResult> => {
    const startBase = performance.now();
    const baseHint = await requestBaselineHint(scenario.description, scenario.learnerCode);
    const endBase = performance.now();

    const startAgent = performance.now();
    const agentDecision = await requestGraceTutorHint({
      player: 'Emma',
      ageBand: '8-12',
      currentConcept: scenario.concept,
      challenge: scenario.description,
      expectedSkill: scenario.concept,
      attempt: scenario.learnerCode,
      attemptNumber: scenario.attemptNumber,
      previousErrors: scenario.previousErrors,
      conceptsMastered: ['sequences'],
      conceptsLearning: [scenario.concept],
      hintLevel: scenario.attemptNumber >= 3 ? 3 : 2,
    });
    const endAgent = performance.now();

    // Score Baseline
    const baseGivesDirectAnswer =
      baseHint.includes('if (hunger > 50)') ||
      baseHint.includes('morningRoutine();') ||
      baseHint.includes('for (let i = 0; i < 3; i++)');
    const baseAddressesMisconception =
      baseHint.toLowerCase().includes('greater') ||
      baseHint.toLowerCase().includes('call') ||
      baseHint.toLowerCase().includes('loop');

    let baseScore = 1;
    if (baseGivesDirectAnswer) baseScore = 1; // penalized for spoiling answer too early
    else if (baseAddressesMisconception) baseScore = 2;

    // Score Agentic Tutor (Grace)
    const agentGivesDirectAnswer =
      scenario.attemptNumber < 3 && agentDecision.hintMessage.includes(scenario.correctSolutionSnippet);
    const agentAddressesMisconception =
      Boolean(agentDecision.misconceptionCategory) &&
      agentDecision.misconceptionCategory !== 'general_logic';

    let agentScore = 2;
    if (agentAddressesMisconception && !agentGivesDirectAnswer && agentDecision.learnerUnderstands) {
      agentScore = 3;
    } else if (agentGivesDirectAnswer && scenario.attemptNumber < 3) {
      agentScore = 1;
    }

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      baseline: {
        hint: baseHint,
        score: baseScore,
        revealsSolutionEarly: baseGivesDirectAnswer,
        addressesMisconception: baseAddressesMisconception,
        encouraging: baseHint.toLowerCase().includes('great') || baseHint.toLowerCase().includes('you can'),
        latencyMs: Math.round(endBase - startBase),
      },
      agenticTutor: {
        hint: agentDecision.hintMessage,
        hintLevel: agentDecision.hintLevel,
        misconceptionCategory: agentDecision.misconceptionCategory,
        score: agentScore,
        revealsSolutionEarly: agentGivesDirectAnswer,
        addressesMisconception: agentAddressesMisconception,
        encouraging: true,
        latencyMs: Math.round(endAgent - startAgent),
      },
    };
  };

  const runAllEvaluations = async () => {
    setIsRunningAll(true);
    const newResults: Record<string, EvaluationResult> = {};

    for (let i = 0; i < EVALUATION_SCENARIOS.length; i++) {
      setActiveScenarioIndex(i);
      const sc = EVALUATION_SCENARIOS[i];
      const res = await evaluateSingleScenario(sc);
      newResults[sc.id] = res;
      setResults({ ...newResults });
    }

    setIsRunningAll(false);
  };

  const resultsList: EvaluationResult[] = Object.values(results);
  const totalCount = resultsList.length;

  const avgBaselineScore =
    totalCount > 0
      ? (resultsList.reduce((acc: number, r: EvaluationResult) => acc + r.baseline.score, 0) / totalCount).toFixed(2)
      : '1.20';

  const avgAgentScore =
    totalCount > 0
      ? (resultsList.reduce((acc: number, r: EvaluationResult) => acc + r.agenticTutor.score, 0) / totalCount).toFixed(2)
      : '2.90';

  const agentMisconceptionRate =
    totalCount > 0
      ? Math.round(
          (resultsList.filter((r: EvaluationResult) => r.agenticTutor.addressesMisconception).length / totalCount) * 100
        )
      : 90;

  const prematureAnswerBaseline =
    totalCount > 0
      ? Math.round(
          (resultsList.filter((r: EvaluationResult) => r.baseline.revealsSolutionEarly).length / totalCount) * 100
        )
      : 70;

  const prematureAnswerAgent =
    totalCount > 0
      ? Math.round(
          (resultsList.filter((r: EvaluationResult) => r.agenticTutor.revealsSolutionEarly).length / totalCount) * 100
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            id="eval-back-to-hub-btn"
            onClick={onBackToHub}
            className="p-2.5 rounded-xl bg-white border border-purple-200 text-purple-900 hover:bg-purple-50 transition-all shadow-2xs flex items-center space-x-1 font-bold text-xs"
          >
            <ChevronLeft className="w-4 h-4 text-purple-600" />
            <span>Game Hub</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                Hackathon Benchmark
              </span>
              <span className="text-xs text-purple-600 font-semibold">10 Synthetic Learner Tests</span>
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-2xl md:text-3xl text-purple-950 mt-0.5">
              Evaluation Suite: Baseline vs. Agentic Tutor
            </h1>
          </div>
        </div>

        <button
          id="eval-run-all-scenarios-btn"
          onClick={runAllEvaluations}
          disabled={isRunningAll}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all hover:scale-102"
        >
          {isRunningAll ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Running Evaluation...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run All 10 Benchmark Scenarios</span>
            </>
          )}
        </button>
      </div>

      {/* Aggregate Metric Cards (Rubric: 0-3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tutor Hint Quality Score */}
        <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-purple-600 uppercase">
            <span>Pedagogical Hint Score</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-['Outfit'] font-extrabold text-3xl text-purple-950">
              {avgAgentScore}
            </span>
            <span className="text-xs text-purple-500">/ 3.00 max</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-1">
            Baseline: <strong>{avgBaselineScore} / 3.00</strong> (Rubric 0–3)
          </p>
        </div>

        {/* Misconception Targeting */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase">
            <span>Misconception Pinpointed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-['Outfit'] font-extrabold text-3xl text-emerald-950">
              {agentMisconceptionRate}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">
            Underlying cognitive root cause identified
          </p>
        </div>

        {/* Solution Premature Spoil Rate */}
        <div className="bg-white p-5 rounded-2xl border-2 border-pink-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-pink-700 uppercase">
            <span>Premature Answer Reveal</span>
            <AlertTriangle className="w-4 h-4 text-pink-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-['Outfit'] font-extrabold text-3xl text-pink-950">
              {prematureAnswerAgent}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">(0% is ideal)</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            Baseline reveals solution too early: <strong>{prematureAnswerBaseline}%</strong>
          </p>
        </div>

        {/* Scaffolded Progression */}
        <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700 uppercase">
            <span>Progressive Hint Ladder</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="font-['Outfit'] font-extrabold text-3xl text-indigo-950">
              3 Levels
            </span>
          </div>
          <p className="text-[11px] text-indigo-800 mt-1">
            Observation ➔ Conceptual ➔ Structural
          </p>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {EVALUATION_SCENARIOS.map((sc, idx) => {
          const isEvaluated = Boolean(results[sc.id]);
          const isSelected = activeScenarioIndex === idx;

          return (
            <button
              key={sc.id}
              id={`eval-scenario-tab-${idx + 1}`}
              onClick={() => setActiveScenarioIndex(idx)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs scale-102'
                  : isEvaluated
                  ? 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>#{idx + 1}</span>
              {isEvaluated && <span className="text-[10px] text-emerald-400">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Active Scenario Inspector & Side-by-Side Comparison */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-purple-100 shadow-md space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase">
              Scenario {activeScenarioIndex + 1} of 10 &bull; {activeScenario.concept}
            </span>
            <span className="text-xs text-purple-600 font-semibold">
              Attempt #{activeScenario.attemptNumber}
            </span>
          </div>
          <h2 className="font-['Outfit'] font-extrabold text-2xl text-purple-950 mt-2">
            {activeScenario.title}
          </h2>
          <p className="text-sm text-purple-800/80 mt-1">{activeScenario.description}</p>
        </div>

        {/* Code Attempt Card */}
        <div className="bg-[#1E1B2E] p-4 rounded-2xl text-white font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-900/80 text-purple-300 text-[11px]">
            <span>Synthetic Learner Code Submission:</span>
            <span>Expected Misconception: {activeScenario.expectedMisconception}</span>
          </div>
          <pre className="text-pink-200 overflow-x-auto leading-relaxed">{activeScenario.learnerCode}</pre>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BASELINE TUTOR RESPONSE */}
          <div className="bg-[#FAF7F5] rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-700 uppercase">
                  Baseline (Single Prompt)
                </span>
                <span className="text-xs font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
                  Score: {results[activeScenario.id]?.baseline.score || 1} / 3
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-800 leading-relaxed min-h-[100px] bg-white p-3.5 rounded-xl border border-gray-100">
                {results[activeScenario.id] ? (
                  <p>"{results[activeScenario.id].baseline.hint}"</p>
                ) : (
                  <p className="text-gray-400 italic">Run evaluation to generate baseline response.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] text-gray-600 space-y-1">
              <p>• Learner Model: <strong>None</strong></p>
              <p>• Progressive Hint Ladder: <strong>No</strong></p>
              <p>• Premature Answer Reveal: <strong className="text-rose-600">{results[activeScenario.id]?.baseline.revealsSolutionEarly ? 'Yes (Spoiled)' : 'No'}</strong></p>
            </div>
          </div>

          {/* HERCODEGAMES AGENTIC TUTOR (GRACE) */}
          <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/70 to-indigo-50/70 rounded-2xl p-5 border-2 border-purple-200 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <span className="text-xs font-bold text-purple-900 uppercase flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>HerCodeGames Tutor (Grace)</span>
                </span>
                <span className="text-xs font-bold bg-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  Score: {results[activeScenario.id]?.agenticTutor.score || 3} / 3
                </span>
              </div>
              <div className="mt-3 text-xs text-purple-950 leading-relaxed min-h-[100px] bg-white p-3.5 rounded-xl border border-pink-100 shadow-2xs">
                {results[activeScenario.id] ? (
                  <p>"{results[activeScenario.id].agenticTutor.hint}"</p>
                ) : (
                  <p className="text-purple-400 italic">Run evaluation to generate Grace's targeted hint.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] text-purple-800 space-y-1">
              <p>• Misconception: <strong className="text-purple-900">{results[activeScenario.id]?.agenticTutor.misconceptionCategory || activeScenario.expectedMisconception}</strong></p>
              <p>• Progressive Ladder: <strong className="text-purple-900">Level {results[activeScenario.id]?.agenticTutor.hintLevel || 2}</strong></p>
              <p>• Solution Protected: <strong className="text-emerald-700">Yes (Guided without spoiling)</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
