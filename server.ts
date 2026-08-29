import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize Google GenAI client if API key is available
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// ==========================================
// 1. ADAPTIVE TUTOR AGENT (NOVA)
// ==========================================
app.post('/api/tutor/feedback', async (req, res) => {
  const {
    player = 'Learner',
    ageBand = '8-12',
    currentConcept = 'conditions',
    challenge = '',
    expectedSkill = '',
    attempt = '',
    attemptNumber = 1,
    previousErrors = [],
    conceptsMastered = [],
    conceptsLearning = [],
    hintLevel = 1,
  } = req.body;

  try {
    const client = getGeminiClient();
    if (client) {
      const prompt = `You are Grace, an encouraging, intelligent, supportive, and playful AI Tutor Agent named in honor of Grace Hopper in HerCodeGames.
HerCodeGames is an educational coding game for girls aged 8-12 learning programming fundamentals (Sequences, Conditions, Loops, Variables, Functions, and JavaScript).

TUTOR PRINCIPLES:
1. NEVER reveal the complete final code or direct solution right away unless it is Hint Level 3 after repeated failed attempts.
2. Teach the underlying concept, never just say "Wrong" or "Try again".
3. Validate what the learner got right first, then pinpoint the specific misconception.
4. Adapt to the requested Hint Level:
   - Hint Level 1 (Observation): Guide them to look at a key variable, value, or action.
   - Hint Level 2 (Conceptual Guide): Explain the concept rule (e.g. difference between > and <, or why a function needs parentheses to run).
   - Hint Level 3 (Structural Hint): Give a concrete hint about the syntax or structure without solving the whole puzzle.
5. Tone: Warm, empowering, friendly, clear, approachable, no condescending or over-simplifying language.

CURRENT CONTEXT:
- Learner Name: ${player} (Age band: ${ageBand})
- Current Concept: ${currentConcept}
- Challenge Goal: ${challenge}
- Expected Skill: ${expectedSkill}
- Learner Attempt:
\`\`\`javascript
${attempt}
\`\`\`
- Attempt Number: ${attemptNumber}
- Previous Errors: ${previousErrors.join(', ') || 'None'}
- Mastered Concepts: ${conceptsMastered.join(', ') || 'Sequences'}
- Concepts Learning: ${conceptsLearning.join(', ') || currentConcept}
- Requested Hint Level: ${hintLevel} (1: Observation, 2: Conceptual, 3: Structural)

Respond strictly in JSON matching the specified schema.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are Grace, the expert adaptive AI tutor agent in HerCodeGames for girls aged 8-12. Deliver targeted progressive pedagogical hints in JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hintLevel: { type: Type.INTEGER, description: '1, 2, or 3' },
              misconceptionCategory: { type: Type.STRING, description: 'e.g. reversed_comparison, uncalled_function, off_by_one_loop, syntax_error, order_mismatch' },
              learnerUnderstands: { type: Type.STRING, description: 'What the learner successfully grasped in their attempt' },
              hintMessage: { type: Type.STRING, description: 'The spoken pedagogical hint for the child' },
              conceptualExplanation: { type: Type.STRING, description: '1 sentence explaining why this concept works this way in programming' },
              shouldOfferPractice: { type: Type.BOOLEAN, description: 'True if learner struggled 3+ times with this same misconception' },
              encouragement: { type: Type.STRING, description: 'A warm, uplifting 1-sentence motivation' },
              isCorrect: { type: Type.BOOLEAN, description: 'True if the attempt is already correct' },
            },
            required: ['hintLevel', 'misconceptionCategory', 'learnerUnderstands', 'hintMessage', 'conceptualExplanation', 'shouldOfferPractice', 'encouragement', 'isCorrect'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, source: 'gemini', data: parsed });
      }
    }
  } catch (err: any) {
    console.warn('Gemini Tutor call fallback triggered:', err.message);
  }

  // Resilient heuristic pedagogical fallback
  const fallback = generateHeuristicNovaFeedback({
    player,
    currentConcept,
    challenge,
    attempt,
    attemptNumber,
    hintLevel,
  });

  return res.json({ success: true, source: 'heuristic_agent', data: fallback });
});

// ==========================================
// 2. BASELINE TUTOR (NAIVE SINGLE PROMPT)
// ==========================================
app.post('/api/tutor/baseline', async (req, res) => {
  const { challenge = '', attempt = '' } = req.body;

  try {
    const client = getGeminiClient();
    if (client) {
      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Help this child correct their answer to this beginner programming exercise.\n\nExercise: ${challenge}\nChild's code:\n${attempt}`,
      });

      if (response.text) {
        return res.json({ success: true, source: 'gemini_baseline', hint: response.text });
      }
    }
  } catch (err: any) {
    console.warn('Baseline Gemini call fallback triggered:', err.message);
  }

  return res.json({
    success: true,
    source: 'heuristic_baseline',
    hint: `Your code needs to match the goal: "${challenge}". Check your syntax or try: ${attempt.includes('>') ? 'change > to < or adjust the number' : 'review the instructions'}.`,
  });
});

// Helper for Heuristic Nova Rule-Based Engine
function generateHeuristicNovaFeedback(ctx: {
  player: string;
  currentConcept: string;
  challenge: string;
  attempt: string;
  attemptNumber: number;
  hintLevel: number;
}) {
  const code = ctx.attempt.toLowerCase();
  let misconception = 'general_logic';
  let understands = 'You have the general layout in mind!';
  let hint1 = `Take a close look at what Luna needs to do for "${ctx.challenge}".`;
  let hint2 = 'Think about the order of operations and the symbols you are using.';
  let hint3 = 'Review the keywords and make sure all required action parentheses like feed() are present.';
  let conceptExpl = 'Programs follow instructions step-by-step in exact logical order.';

  // Check reversed comparison
  if (code.includes('hunger < 50') || (code.includes('<') && ctx.challenge.includes('greater than'))) {
    misconception = 'reversed_comparison';
    understands = 'Your if statement and feed() command are formatted nicely!';
    hint1 = "You're super close! Look at Luna's hunger level and the comparison symbol.";
    hint2 = "Luna eats when hunger is HIGHER than 50. The '>' symbol means greater than, while '<' means less than.";
    hint3 = 'Switch the `<` to a `>` so your test reads: `if (hunger > 50)`!';
    conceptExpl = "In programming, the open mouth of '>' points to the bigger number.";
  } else if (code.includes('if') && !code.includes('feed()') && ctx.challenge.includes('feed')) {
    misconception = 'missing_action_call';
    understands = 'You wrote the if condition correctly!';
    hint1 = 'Great decision check! Now, what action should happen inside the curly braces?';
    hint2 = 'Inside { and }, call the feed() function so Luna can eat!';
    hint3 = 'Put `feed();` inside your `{ ... }` block.';
    conceptExpl = 'An if statement tests a condition, and the code inside { } tells the computer what action to take when true.';
  } else if (code.includes('for') && (code.includes('i < 4') || code.includes('i <= 3') || code.includes('i = 1'))) {
    misconception = 'off_by_one_loop';
    understands = 'You constructed the for loop statement structure!';
    hint1 = 'Count how many stars are on the path.';
    hint2 = 'Starting from 0, `i < 3` runs 3 times: for 0, 1, and 2.';
    hint3 = 'Use `for (let i = 0; i < 3; i++)` to repeat exactly 3 times.';
    conceptExpl = 'Loops repeat instructions so programmers do not have to write identical lines again and again.';
  } else if (code.includes('function') && !code.includes('morningroutine()') && !code.includes('();')) {
    misconception = 'uncalled_function';
    understands = 'You created a clean, organized function definition!';
    hint1 = 'You gave your pet a great routine recipe! Has Luna started executing it yet?';
    hint2 = 'Writing `function morningRoutine() { ... }` only teaches the computer the recipe. To run it, you must call it by name!';
    hint3 = 'Add `morningRoutine();` at the bottom of your code to run the function.';
    conceptExpl = 'Defining a function is like writing a recipe in a book; calling it is like actually cooking the meal!';
  } else if (code.includes('petname') || code.includes('happiness')) {
    misconception = 'variable_syntax';
    understands = 'You are declaring variables with the `let` keyword!';
    hint1 = 'Check the quotes around your pet’s name.';
    hint2 = 'Text values need quotation marks like `"Luna"`, while numbers like `80` do not have quotes.';
    hint3 = 'Set your variable like: `let petName = "Luna";` and `let happiness = 80;`.';
    conceptExpl = 'Variables are labeled containers that store data like words (strings) and numbers.';
  }

  const selectedHint = ctx.hintLevel === 1 ? hint1 : ctx.hintLevel === 2 ? hint2 : hint3;

  return {
    hintLevel: ctx.hintLevel || 1,
    misconceptionCategory: misconception,
    learnerUnderstands: understands,
    hintMessage: selectedHint,
    conceptualExplanation: conceptExpl,
    shouldOfferPractice: ctx.attemptNumber >= 3,
    encouragement: `${ctx.player}, you're thinking just like a real engineer! Every try brings you closer. 💡✨`,
    isCorrect: false,
  };
}

// ==========================================
// 3. VITE MIDDLEWARE & SERVER BOOT
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HerCodeGames full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
