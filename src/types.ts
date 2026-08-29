export type PetType = 'cat' | 'dog' | 'hamster' | 'turtle' | 'bunny';

export interface PetConfig {
  type: PetType;
  defaultName: string;
  species: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  favoriteTreat: string;
  personality?: string;
  traits?: string[];
  personalitySummary?: string;
  activity?: string;
}

export interface PetState {
  hunger: number; // 0 (full) - 100 (starving)
  energy: number; // 0 (exhausted) - 100 (energetic)
  cleanliness: number; // 0 (dirty) - 100 (clean)
  happiness: number; // 0 - 100
  position: number; // 0 to 4
  starsCollected: number;
  treatsCollected?: number;
  correctDecisions?: number;
  decisionIndex?: number;
  currentAction?: string | null;
  mood?: 'happy' | 'hungry' | 'sleeping' | 'celebrating' | 'bathing' | 'playing' | 'eating' | 'thinking' | 'idle' | 'confused';
}

export interface AttemptRecord {
  id: string;
  levelId: string;
  game: 'pet-logic' | 'code-pet';
  attemptNumber: number;
  timestamp: number;
  codeOrSequence: string[];
  success: boolean;
  errorType?: string;
  hintLevelGiven?: number;
  tutorHint?: string;
}

export interface LearnerProfile {
  concepts: {
    sequences: 'not_started' | 'learning' | 'mastered';
    ordering: 'not_started' | 'learning' | 'mastered';
    conditions: 'not_started' | 'learning' | 'mastered';
    loops: 'not_started' | 'learning' | 'mastered';
    combined_logic: 'not_started' | 'learning' | 'mastered';
    variables: 'not_started' | 'learning' | 'mastered';
    data_types: 'not_started' | 'learning' | 'mastered';
    if_statements: 'not_started' | 'learning' | 'mastered';
    js_loops: 'not_started' | 'learning' | 'mastered';
    functions: 'not_started' | 'learning' | 'mastered';
    js_capstone: 'not_started' | 'learning' | 'mastered';
  };
  commonMistakes: string[];
  hintPreference: 'visual' | 'conceptual' | 'structural';
  attemptHistory: AttemptRecord[];
  practiceOffered: boolean;
  totalHintsRequested: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  pet: {
    type: PetType;
    name: string;
  };
  stars: number;
  completedLevels: string[];
  unlockedLevels: string[];
  levelStars: Record<string, number>;
  badges: string[];
  attemptsByLevel: Record<string, number>;
  learningProfile: LearnerProfile;
  currentScreen: 'welcome' | 'hub' | 'level-map' | 'pet-logic' | 'code-pet' | 'evaluation' | 'trajectories';
  activeLevelId: string | null;
  activeGame: 'pet-logic' | 'code-pet' | null;
  lastPlayedAt: number;
}

export type CommandType =
  | 'MOVE'
  | 'MOVE_BACK'
  | 'JUMP'
  | 'EAT'
  | 'PLAY'
  | 'BATH'
  | 'SLEEP'
  | 'COLLECT'
  | 'COLLECT_TREAT'
  | 'IF_HUNGRY'
  | 'IF_NOT_HUNGRY'
  | 'REPEAT_3';

export interface CommandBlock {
  id: string;
  type: CommandType;
  label: string;
  iconName: string;
  color: string;
  description: string;
  conditionBlock?: {
    check: string;
    subCommand: CommandType;
  };
  loopBlock?: {
    count: number;
    subCommand: CommandType;
  };
}

export interface PetLogicLevel {
  id: string;
  number: number;
  title: string;
  concept: string;
  conceptKey: keyof LearnerProfile['concepts'];
  story: string;
  goal: string;
  foodBowlPosition?: number;
  puddlePosition?: number;
  homePosition?: number;
  targetObjectType?: 'steak' | 'ball' | 'star' | 'puddle_home' | 'home' | 'treat' | 'food_bowl';
  targetPosition?: number;

  // Level 4: Treat Hunt
  treatPositions?: number[];
  totalTreats?: number;

  // Level 5: Smart Decisions
  decisionHungerValues?: number[];
  requiredCorrectDecisions?: number;

  initialPetState: PetState;
  targetPetStateGoal: (
    finalState: PetState,
    commands: CommandType[]
  ) => { success: boolean; stars: number; feedback: string };
  availableCommands: CommandBlock[];
  idealSequenceLength: number;
  explanationSuccess: {
    title: string;
    body: string;
    conceptPill: string;
  };
}

export interface CodePetLevel {
  id: string;
  number: number;
  title: string;
  concept: string;
  conceptKey: keyof LearnerProfile['concepts'];
  story: string;
  instructions: string;
  starterCode: string;
  solutionTemplate: string;
  availableSnippets?: string[];
  expectedKeywords: string[];
  badgeReward?: string;
  explanationSuccess: {
    title: string;
    body: string;
    conceptPill: string;
  };
}

export interface TutorObservation {
  player: string;
  ageBand: string;
  currentConcept: string;
  challenge: string;
  expectedSkill: string;
  attempt: string;
  attemptNumber: number;
  previousErrors: string[];
  conceptsMastered: string[];
  conceptsLearning: string[];
  hintLevel: 1 | 2 | 3;
}

export interface TutorDecision {
  hintLevel: 1 | 2 | 3;
  misconceptionCategory: string;
  learnerUnderstands: string;
  hintMessage: string;
  conceptualExplanation: string;
  shouldOfferPractice: boolean;
  encouragement: string;
  isCorrect: boolean;
}

export interface AgentTrajectoryLog {
  id: string;
  timestamp: number;
  playerName: string;
  levelId: string;
  levelTitle: string;
  concept: string;
  attemptNumber: number;
  learnerAttempt: string;
  misconceptionCategory: string;
  hintLevel: 1 | 2 | 3;
  teachingDecision: string;
  hintDelivered: string;
  outcome: 'in_progress' | 'solved' | 'practice_offered';
}

export interface EvaluationScenario {
  id: string;
  title: string;
  description: string;
  concept: string;
  levelType: 'pet-logic' | 'code-pet';
  learnerCode: string;
  attemptNumber: number;
  previousErrors: string[];
  expectedMisconception: string;
  correctSolutionSnippet: string;
}

export interface EvaluationResult {
  scenarioId: string;
  scenarioTitle: string;
  baseline: {
    hint: string;
    score: number; // 0 - 3
    revealsSolutionEarly: boolean;
    addressesMisconception: boolean;
    encouraging: boolean;
    latencyMs: number;
  };
  agenticTutor: {
    hint: string;
    hintLevel: 1 | 2 | 3;
    misconceptionCategory: string;
    score: number; // 0 - 3
    revealsSolutionEarly: boolean;
    addressesMisconception: boolean;
    encouraging: boolean;
    latencyMs: number;
  };
}

