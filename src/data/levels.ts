import { PetConfig, PetType, PetLogicLevel, CodePetLevel } from '../types';

export const PETS: Record<PetType, PetConfig> = {
  cat: {
    type: 'cat',
    defaultName: 'Luna',
    species: 'Ginger Cat',
    personality: 'Cold but Clingy Once Comfortable',
    traits: ['Independent & Smart', 'Cold at First', 'Clingy Once Close', 'Loves Naps & Fish'],
    tagline: 'Cold but clingy once she gets comfortable. Shy, smart, and needs her own space, but becomes super loving and cuddly once she trusts you.',
    primaryColor: '#FB923C', // orange-400
    secondaryColor: '#FFEDD5', // orange-100
    accentColor: '#EA580C', // orange-600
    favoriteTreat: 'Fresh Fish 🐟',
    activity: 'Curled up taking a cozy nap 💤',
  },
  dog: {
    type: 'dog',
    defaultName: 'Manchu',
    species: 'Dalmatian Dog',
    personality: 'Extrovert, Loud & Energetic',
    traits: ['Playful Rascal', 'Loyal & Spoiled', 'Loves Meat & Park Runs', 'Fearless Explorer'],
    tagline: 'Extrovert, loud, and full of energy! A lovable playful rascal who loves meat, running in the park, and playing with friends.',
    primaryColor: '#F43F5E', // rose-500
    secondaryColor: '#FFF1F2', // rose-100
    accentColor: '#BE123C', // rose-700
    favoriteTreat: 'Juicy Meat 🥩',
    activity: 'Wagging tail and ready to run 🎾',
  },
  hamster: {
    type: 'hamster',
    defaultName: 'Wendy',
    species: 'Cute Hamster',
    personality: 'Quiet, Shy & Bold',
    traits: ['Sweet & Friendly', 'Loves Cheese', 'Long Naps & Explorations', 'Puffy Cheeks'],
    tagline: 'Quiet, shy, and bold! Friendly little explorer who loves yummy cheese, long naps, and bursts of joyful curiosity.',
    primaryColor: '#FBBF24', // amber-400
    secondaryColor: '#FEF3C7', // amber-100
    accentColor: '#D97706', // amber-600
    favoriteTreat: 'Golden Cheese 🧀',
    activity: 'Nibbling yummy cheese with puffy cheeks 🧀',
  },
  turtle: {
    type: 'turtle',
    defaultName: 'Shelly',
    species: 'Wise Turtle',
    personality: 'Smart, Cautious & Reserved',
    traits: ['Solitary Thinker', 'Loves Lettuce', 'Gentle Swimmer', 'Careful Explorer'],
    tagline: 'Smart, cautious, and reserved! A solitary thinker who loves crisp lettuce, peaceful swimming, and exploring step by step.',
    primaryColor: '#34D399', // emerald-400
    secondaryColor: '#D1FAE5', // emerald-100
    accentColor: '#059669', // emerald-600
    favoriteTreat: 'Crisp Lettuce 🥬',
    activity: 'Swimming peacefully and munching lettuce 🥬',
  },
  bunny: {
    type: 'bunny',
    defaultName: 'Tokki',
    species: 'Bouncy Bunny',
    personality: 'Independent, Energetic & Bold',
    traits: ['Quiet Observer', 'Fearless Explorer', 'Loves Carrots & Chewing', 'Tunnel Digger'],
    tagline: 'Independent, bold, and energetic! A fearless explorer who loves crunchy carrots, digging tunnels, and hopping through code.',
    primaryColor: '#A78BFA', // purple-400
    secondaryColor: '#EDE9FE', // purple-100
    accentColor: '#7C3AED', // purple-600
    favoriteTreat: 'Crunchy Carrot 🥕',
    activity: 'Bouncing high and chewing carrots 🥕',
  },
};

export const PET_LOGIC_LEVELS: PetLogicLevel[] = [
  {
    id: 'logic-1',
    number: 1,
    title: 'Morning Breakfast Sequence',
    concept: 'Sequences',
    conceptKey: 'sequences',
    story: 'Your pet woke up hungry! Help them reach the food bowl down the garden path and eat breakfast.',
    goal: 'Reach the food bowl and eat breakfast.',
    foodBowlPosition: 2,
    initialPetState: {
      hunger: 80,
      energy: 70,
      cleanliness: 90,
      happiness: 60,
      position: 0,
      starsCollected: 0,
    },
    idealSequenceLength: 3,
    availableCommands: [
      { id: 'cmd-move', type: 'MOVE', label: 'move()', iconName: 'Footprints', color: 'bg-rose-100 text-rose-700 border-rose-200', description: 'Step forward one space' },
      { id: 'cmd-eat', type: 'EAT', label: 'eat()', iconName: 'Utensils', color: 'bg-pink-100 text-pink-700 border-pink-200', description: 'Eat yummy meal' },
      { id: 'cmd-play', type: 'PLAY', label: 'play()', iconName: 'Sparkles', color: 'bg-amber-100 text-amber-700 border-amber-200', description: 'Play with toy' },
    ],
    targetPetStateGoal: (finalState, commands) => {
      const reachedFood = finalState.position >= 2;
      const didEat = commands.includes('EAT');
      const hungerLow = finalState.hunger <= 30;

      if (reachedFood && didEat && hungerLow) {
        const stars = commands.length <= 3 ? 3 : 2;
        return { success: true, stars, feedback: 'Great job! Your pet reached the bowl and ate a hearty breakfast.' };
      }
      if (!reachedFood) {
        return { success: false, stars: 0, feedback: 'Your pet stopped before reaching the food bowl! Add more MOVE steps.' };
      }
      if (!didEat) {
        return { success: false, stars: 0, feedback: 'Your pet reached the food bowl, but forgot to EAT!' };
      }
      return { success: false, stars: 0, feedback: 'Check the order: MOVE first, then EAT.' };
    },
    explanationSuccess: {
      title: 'Sequences Mastered! 🎉',
      body: 'Programs follow instructions step-by-step from top to bottom. Programmers call this exact step-by-step order a sequence.',
      conceptPill: 'Concept: Sequence',
    },
  },
  {
    id: 'logic-2',
    number: 2,
    title: 'Playful Tennis Ball Sequence',
    concept: 'Step Sequences',
    conceptKey: 'ordering',
    story: 'Manchu is feeling playful! Help Manchu reach the tennis ball and play.',
    goal: 'Reach the tennis ball and play.',
    targetObjectType: 'ball',
    targetPosition: 3,
    initialPetState: {
      hunger: 100,
      energy: 85,
      cleanliness: 90,
      happiness: 65,
      position: 0,
      starsCollected: 0,
    },
    idealSequenceLength: 4,
    availableCommands: [
      { id: 'cmd-move', type: 'MOVE', label: 'move()', iconName: 'Footprints', color: 'bg-rose-100 text-rose-700 border-rose-200', description: 'Step forward one space' },
      { id: 'cmd-play', type: 'PLAY', label: 'play()', iconName: 'Sparkles', color: 'bg-pink-100 text-pink-700 border-pink-200', description: 'Play with the ball' },
    ],
    targetPetStateGoal: (finalState, commands) => {
      const reachedBall = finalState.position >= 3;
      const didPlay = commands.includes('PLAY');

      if (reachedBall && didPlay) {
        const stars = commands.length <= 4 ? 3 : 2;
        return { success: true, stars, feedback: 'Awesome! Manchu reached the ball and had a blast playing!' };
      }
      if (!reachedBall) {
        return { success: false, stars: 0, feedback: 'Manchu stopped before reaching the tennis ball! Take more steps forward.' };
      }
      if (!didPlay) {
        return { success: false, stars: 0, feedback: 'Manchu reached the tennis ball, but forgot to play! Press Action / Enter to play.' };
      }
      return { success: false, stars: 0, feedback: 'Check your sequence: step forward to the ball, then play!' };
    },
    explanationSuccess: {
      title: 'Mission Complete! 🎉',
      body: 'You built a longer sequence! Each step in your sequence helped Manchu reach the ball and play.',
      conceptPill: 'Concept: Step Sequences',
    },
  },
   {
  id: 'logic-3',
  number: 3,
  title: 'Jump Over the Puddle',
  concept: 'Variables & Algorithms',
  conceptKey: 'ordering',
  story: "A big puddle is blocking the path! Help Manchu jump over it and keep moving forward.",
  goal: 'Jump over the puddle and reach the end of the path.',
  targetObjectType: 'puddle_home',
  puddlePosition: 2,
  homePosition: 4,
  targetPosition: 4,
  initialPetState: {
    hunger: 100,
    energy: 90,
    cleanliness: 90,
    happiness: 90,
    position: 0,
    starsCollected: 0,
  },
  idealSequenceLength: 3,
  availableCommands: [
    {
      id: 'cmd-move',
      type: 'MOVE',
      label: 'move()',
      iconName: 'Footprints',
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      description: 'Step forward one space',
    },
    {
      id: 'cmd-jump',
      type: 'JUMP',
      label: 'jump()',
      iconName: 'Zap',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      description: 'Jump over obstacle',
    },
  ],
  targetPetStateGoal: (finalState, commands) => {
    const reachedEnd = finalState.position >= 4;
    const didJump = commands.includes('JUMP');

    if (reachedEnd && didJump) {
      const stars = commands.length <= 3 ? 3 : 2;
      return {
        success: true,
        stars,
        feedback: 'Amazing! Manchu jumped over the puddle and reached the end of the path!',
      };
    }

    if (!didJump) {
      return {
        success: false,
        stars: 0,
        feedback: 'Manchu needs to jump over the puddle. Try using jump()!',
      };
    }

    if (!reachedEnd) {
      return {
        success: false,
        stars: 0,
        feedback: 'Great jump! Now help Manchu keep moving to the end of the path.',
      };
    }

    return {
      success: false,
      stars: 0,
      feedback: 'Try this sequence: move(), jump(), move().',
    };
  },
  explanationSuccess: {
    title: 'Mission Complete! 🎉',
    body: 'You used information and a step-by-step plan to solve the obstacle. Variables store information, while algorithms organize the steps needed to solve a problem.',
    conceptPill: 'Concept: Variables & Algorithms',
  },
},
  {
    id: 'logic-4',
    number: 4,
    title: 'Manchu’s Treat Hunt',
    concept: 'Functions & Data Types',
    conceptKey: 'functions',
    story: 'Six crunchy dog biscuits are hidden around the garden! They appear one at a time in different places. Help Manchu move forward and backward to find every treat.',
    goal: 'Find and collect all 6 dog biscuits.',
    initialPetState: {
      hunger: 45,
      energy: 95,
      cleanliness: 90,
      happiness: 70,
      position: 2,
      starsCollected: 0,
    },
    idealSequenceLength: 14,
    availableCommands: [
      {
        id: 'cmd-move',
        type: 'MOVE',
        label: 'move()',
        iconName: 'Footprints',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        description: 'Move one space to the right',
      },
      {
        id: 'cmd-collect',
        type: 'COLLECT',
        label: 'collectTreat()',
        iconName: 'Cookie',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        description: 'Collect the treat when Manchu reaches it',
      },
    ],
    targetPetStateGoal: (finalState, commands) => {
      const allTreats = finalState.starsCollected >= 6;
      const collectedTreat = commands.includes('COLLECT');

      if (allTreats && collectedTreat) {
        const stars = commands.length <= 14 ? 3 : 2;
        return {
          success: true,
          stars,
          feedback: 'Amazing! Manchu found all 6 treats around the garden!',
        };
      }

      if (!collectedTreat) {
        return {
          success: false,
          stars: 0,
          feedback: 'Move Manchu to the treat, then collect it with collectTreat().',
        };
      }

      return {
        success: false,
        stars: 0,
        feedback: `Keep searching! Manchu has collected ${Math.min(finalState.starsCollected, 6)} of 6 treats.`,
      };
    },
    explanationSuccess: {
      title: 'Functions & Data Types! 🍪',
      body: 'collectTreat() is a function: a named piece of code that performs a task. Programs also work with different data types, like different candy flavors: numbers, text, and true/false values.',
      conceptPill: 'Concepts: Functions & Data Types',
    },
  },
  {
    id: 'logic-5',
    number: 5,
    title: 'Manchu’s Smart Dinner',
    concept: 'Conditions & if Statements',
    conceptKey: 'conditions',
    story: 'Manchu is back from his treat hunt. Now the program has to check how hungry he is before deciding whether he should eat dinner.',
    goal: 'Use an if condition to check Manchu’s hunger and feed him only when he is hungry.',
    foodBowlPosition: 3,
    targetPosition: 3,
    initialPetState: {
      hunger: 75,
      energy: 75,
      cleanliness: 80,
      happiness: 80,
      position: 0,
      starsCollected: 0,
    },
    idealSequenceLength: 4,
    availableCommands: [
      {
        id: 'cmd-move',
        type: 'MOVE',
        label: 'move()',
        iconName: 'Footprints',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        description: 'Move toward the dinner bowl',
      },
      {
        id: 'cmd-if-hungry',
        type: 'IF_HUNGRY',
        label: 'if (hunger > 50) { eat(); }',
        iconName: 'HelpCircle',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        description: 'Check hunger before eating',
      },
    ],
    targetPetStateGoal: (finalState, commands) => {
      const reachedBowl = finalState.position >= 3;
      const usedCondition = commands.includes('IF_HUNGRY');
      const hungerLow = finalState.hunger <= 25;

      if (reachedBowl && usedCondition && hungerLow) {
        const stars = commands.length <= 4 ? 3 : 2;
        return {
          success: true,
          stars,
          feedback: 'Perfect! Your program checked Manchu’s hunger and made a smart decision.',
        };
      }

      if (!reachedBowl) {
        return {
          success: false,
          stars: 0,
          feedback: 'First help Manchu reach his dinner bowl.',
        };
      }

      if (!usedCondition) {
        return {
          success: false,
          stars: 0,
          feedback: 'This level needs a decision. Check Manchu’s hunger with an if condition before feeding him.',
        };
      }

      return {
        success: false,
        stars: 0,
        feedback: 'Check the condition and make sure Manchu eats only when hunger is greater than 50.',
      };
    },
    explanationSuccess: {
      title: 'Smart Decisions with if! ⚡',
      body: 'A condition is a rule the computer checks. An if statement runs an action only when that condition is true.',
      conceptPill: 'Concepts: Condition & if',
    },
  },
];

export const CODE_PET_LEVELS: CodePetLevel[] = [
  {
    id: 'code-1',
    number: 1,
    title: 'Pet Profile Variables',
    concept: 'Variables',
    conceptKey: 'variables',
    story: 'Welcome to real JavaScript! A variable is like a labeled magic box that holds information. Let’s teach JavaScript your pet’s name and happiness score.',
    instructions: 'Create variables for petName and happiness. Set petName to your pet’s name in quotes, and happiness to 80.',
    starterCode: `// A variable stores information!
let petName = "Luna";
let happiness = 80;
`,
    solutionTemplate: `let petName = "___";\nlet happiness = 80;`,
    availableSnippets: ['let petName = "Luna";', 'let happiness = 80;', 'let hunger = 20;'],
    expectedKeywords: ['let', 'petName', 'happiness'],
    badgeReward: 'Variable Explorer 📦',
    explanationSuccess: {
      title: 'Variables Mastered! 📦',
      body: 'Variables use the keyword "let" to store names, numbers, and settings so your program can remember them and use them anytime.',
      conceptPill: 'JavaScript: let variables',
    },
  },
  {
    id: 'code-2',
    number: 2,
    title: 'Smart Decisions with if ()',
    concept: 'if Statements & Comparisons',
    conceptKey: 'if_statements',
    story: 'Your pet has hunger = 70. Let’s write a real JavaScript if statement that calls feed() when hunger is greater than (>) 50!',
    instructions: 'Complete the if statement: check if (hunger > 50), and call feed(); inside the curly braces {}.',
    starterCode: `let hunger = 70;

// Write an if statement to feed your pet when hungry!
if (hunger > 50) {
    feed();
}
`,
    solutionTemplate: `if (hunger > 50) {\n    feed();\n}`,
    availableSnippets: ['if (hunger > 50) {', 'feed();', '}'],
    expectedKeywords: ['if', 'hunger', '>', '50', 'feed()'],
    badgeReward: 'Condition Crafter ⚡',
    explanationSuccess: {
      title: 'if Statements Mastered! ⚡',
      body: 'An if statement evaluates a test condition inside (parentheses). If it is true, JavaScript runs the code inside {curly brackets}!',
      conceptPill: 'JavaScript: if (condition) { }',
    },
  },
  {
    id: 'code-3',
    number: 3,
    title: 'Collecting Stars with for Loops',
    concept: 'for Loops',
    conceptKey: 'js_loops',
    story: 'Your pet wants to collect 3 sparkling stars! In JavaScript, a for loop lets us repeat an action a set number of times.',
    instructions: 'Complete the loop: for (let i = 0; i < 3; i++) { collectStar(); } to collect all 3 stars!',
    starterCode: `// Loop 3 times to collect 3 stars!
for (let i = 0; i < 3; i++) {
    collectStar();
}
`,
    solutionTemplate: `for (let i = 0; i < 3; i++) {\n    collectStar();\n}`,
    availableSnippets: ['for (let i = 0; i < 3; i++) {', 'collectStar();', '}'],
    expectedKeywords: ['for', 'let', 'i', '<', '3', 'collectStar()'],
    badgeReward: 'Loop Champion 🔁',
    explanationSuccess: {
      title: 'for Loops Mastered! 🔁',
      body: 'for (let i = 0; i < 3; i++) counts from 0, 1, to 2 (which is 3 times total), executing your commands repeatedly!',
      conceptPill: 'JavaScript: for loops',
    },
  },
  {
    id: 'code-4',
    number: 4,
    title: 'Reusable Functions',
    concept: 'Functions',
    conceptKey: 'functions',
    story: 'A function groups several commands together under one name so you can reuse the whole routine anytime! Let’s create a morningRoutine() function.',
    instructions: 'Define the morningRoutine() function with feed() and play(), and then call morningRoutine(); at the bottom.',
    starterCode: `// Define a reusable routine function
function morningRoutine() {
    feed();
    play();
}

// Call the function to run it!
morningRoutine();
`,
    solutionTemplate: `function morningRoutine() {\n    feed();\n    play();\n}\n\nmorningRoutine();`,
    availableSnippets: ['function morningRoutine() {', 'feed();', 'play();', '}', 'morningRoutine();'],
    expectedKeywords: ['function', 'morningRoutine', 'feed()', 'play()'],
    badgeReward: 'Function Architect 🏗️',
    explanationSuccess: {
      title: 'Functions Mastered! 🏗️',
      body: 'Functions allow programmers to organize code into clean, reusable recipe blocks. Define once with function name(), then call it!',
      conceptPill: 'JavaScript: function name() { }',
    },
  },
  {
    id: 'code-5',
    number: 5,
    title: 'JavaScript Beginner Capstone',
    concept: 'Full Program Integration',
    conceptKey: 'js_capstone',
    story: 'Grand JavaScript Finale! Let’s write a complete program for your pet that uses variables, a loop to collect 3 stars, a condition to eat, and a celebration function!',
    instructions: 'Combine variables, for loop, if statement, and function call to complete your pet’s magical adventure!',
    starterCode: `let hunger = 65;

// 1. Loop to collect 3 stars
for (let i = 0; i < 3; i++) {
    collectStar();
}

// 2. Condition: feed if hungry
if (hunger > 50) {
    feed();
}

// 3. Celebrate!
play();
`,
    solutionTemplate: `let hunger = 65;\nfor (let i = 0; i < 3; i++) {\n    collectStar();\n}\nif (hunger > 50) {\n    feed();\n}\nplay();`,
    availableSnippets: ['for (let i = 0; i < 3; i++) {', 'collectStar();', 'if (hunger > 50) {', 'feed();', 'play();'],
    expectedKeywords: ['let', 'hunger', 'for', 'collectStar()', 'if', 'feed()', 'play()'],
    badgeReward: 'JAVASCRIPT BEGINNER 🌟',
    explanationSuccess: {
      title: 'You are officially a JavaScript Programmer! 🚀🎓',
      body: 'Congratulations! You have written real JavaScript code using Variables, Conditions, Loops, and Functions. You think and build like a software engineer!',
      conceptPill: 'Graduated: JavaScript Beginner',
    },
  },
];
