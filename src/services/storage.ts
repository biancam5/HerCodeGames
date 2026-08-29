import { PlayerProfile, PetType, AgentTrajectoryLog } from '../types';

const STORAGE_KEY_PROFILES = 'hercodegames_profiles_v1';
const STORAGE_KEY_ACTIVE_ID = 'hercodegames_active_id_v1';
const STORAGE_KEY_TRAJECTORIES = 'hercodegames_trajectories_v1';

export function createInitialProfile(name: string, petType: PetType = 'cat', petName: string = 'Luna'): PlayerProfile {
  const id = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    name: name.trim() || 'Hero Coder',
    pet: {
      type: petType,
      name: petName.trim() || 'Luna',
    },
    stars: 0,
    completedLevels: [],
    unlockedLevels: ['logic-1'],
    levelStars: {},
    badges: ['Welcome Explorer ✨'],
    attemptsByLevel: {},
    learningProfile: {
      concepts: {
        sequences: 'not_started',
        ordering: 'not_started',
        conditions: 'not_started',
        loops: 'not_started',
        combined_logic: 'not_started',
        variables: 'not_started',
        if_statements: 'not_started',
        js_loops: 'not_started',
        functions: 'not_started',
        js_capstone: 'not_started',
      },
      commonMistakes: [],
      hintPreference: 'visual',
      attemptHistory: [],
      practiceOffered: false,
      totalHintsRequested: 0,
    },
    currentScreen: 'hub',
    activeLevelId: 'logic-1',
    activeGame: 'pet-logic',
    lastPlayedAt: Date.now(),
  };
}

export const createPlayerProfile = createInitialProfile;

export function createJudgeDemoProfile(): PlayerProfile {
  const profile = createInitialProfile('Emma', 'cat', 'Luna');
  profile.id = 'player_demo_judge_emma';
  profile.stars = 14;
  profile.completedLevels = ['logic-1', 'logic-2', 'logic-3', 'logic-4', 'logic-5', 'code-1'];
  profile.unlockedLevels = ['logic-1', 'logic-2', 'logic-3', 'logic-4', 'logic-5', 'code-1', 'code-2', 'code-3', 'code-4', 'code-5'];
  profile.levelStars = {
    'logic-1': 3,
    'logic-2': 3,
    'logic-3': 3,
    'logic-4': 3,
    'logic-5': 3,
    'code-1': 3,
  };
  profile.badges = [
    'Welcome Explorer ✨',
    'Computational Logic 🏆',
    'Variable Explorer 📦',
  ];
  profile.learningProfile.concepts.sequences = 'mastered';
  profile.learningProfile.concepts.ordering = 'mastered';
  profile.learningProfile.concepts.conditions = 'mastered';
  profile.learningProfile.concepts.loops = 'mastered';
  profile.learningProfile.concepts.combined_logic = 'mastered';
  profile.learningProfile.concepts.variables = 'mastered';
  profile.learningProfile.concepts.if_statements = 'learning';
  profile.currentScreen = 'hub';
  profile.activeLevelId = 'code-2';
  profile.activeGame = 'code-pet';
  return profile;
}

export const getSeedProfile = createJudgeDemoProfile;

export function loadAllProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) return [];
    const parsed: PlayerProfile[] = JSON.parse(raw);
    const validPets: PetType[] = ['cat', 'dog', 'hamster', 'turtle', 'bunny'];
    return parsed.map((p) => {
      if (!p.pet || !validPets.includes(p.pet.type)) {
        return {
          ...p,
          pet: {
            type: 'cat',
            name: p.pet?.name || 'Luna',
          },
        };
      }
      return p;
    });
  } catch (err) {
    console.error('Failed to load profiles:', err);
    return [];
  }
}

export function loadActiveProfile(): PlayerProfile | null {
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    const profiles = loadAllProfiles();
    if (activeId) {
      const match = profiles.find((p) => p.id === activeId);
      if (match) return match;
    }
    return profiles.length > 0 ? profiles[0] : null;
  } catch (err) {
    console.error('Failed to load active profile:', err);
    return null;
  }
}

export function saveActiveProfile(profile: PlayerProfile): void {
  try {
    profile.lastPlayedAt = Date.now();
    const profiles = loadAllProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, profile.id);

    // Notify listeners for auto-save feedback
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hercode_saved', { detail: { profileId: profile.id } }));
    }
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function deleteProfile(id: string): void {
  const profiles = loadAllProfiles().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  if (activeId === id) {
    if (profiles.length > 0) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, profiles[0].id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  }
}

export function loadTrajectoryLogs(): AgentTrajectoryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRAJECTORIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveTrajectoryLog(log: AgentTrajectoryLog): void {
  try {
    const current = loadTrajectoryLogs();
    current.unshift(log);
    // Keep last 50
    if (current.length > 50) current.length = 50;
    localStorage.setItem(STORAGE_KEY_TRAJECTORIES, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save trajectory log:', err);
  }
}
