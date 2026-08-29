import { TutorObservation, TutorDecision } from '../types';

export async function requestGraceTutorHint(observation: TutorObservation): Promise<TutorDecision> {
  try {
    const res = await fetch('/api/tutor/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Network error requesting tutor hint:', err);
  }

  // Graceful client fallback
  return {
    hintLevel: observation.hintLevel || 1,
    misconceptionCategory: 'general_logic',
    learnerUnderstands: 'You have a great start!',
    hintMessage: `Take a look at the goal: "${observation.challenge}". Think about the step-by-step instructions.`,
    conceptualExplanation: 'In computer programming, instructions execute in exact sequence.',
    shouldOfferPractice: observation.attemptNumber >= 3,
    encouragement: `${observation.player}, keep going! Programmers solve puzzles one step at a time. ⭐`,
    isCorrect: false,
  };
}

// Backward compatibility alias
export const requestNovaTutorHint = requestGraceTutorHint;

export async function requestBaselineHint(challenge: string, attempt: string): Promise<string> {
  try {
    const res = await fetch('/api/tutor/baseline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge, attempt }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.hint || 'Check your code and compare it to the problem description.';
    }
  } catch (err) {
    console.warn('Network error requesting baseline hint:', err);
  }

  return `Look at the exercise: "${challenge}". Make sure your code matches the expected pattern.`;
}
