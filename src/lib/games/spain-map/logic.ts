import { writable, get } from 'svelte/store';
import { communities, provinces } from './data';
import { browser } from '$app/environment';

export type Level = 'communities' | 'provinces' | 'capitals';
export type Mode = 'locate' | 'identify' | 'learning';

export interface Region {
  id: string;
  name: string;
  capital?: string;
}

interface GameState {
  level: Level;
  mode: Mode;
  isPlaying: boolean;
  currentQuestion: Region | null;
  options: Region[];
  focusedRegion: string | null;
  status: 'playing' | 'correct' | 'incorrect' | 'idle';
  history: { region: Region; correct: boolean }[];
  mistakes: Record<string, { errors: number; correct: number }>;
}

const STORAGE_KEY = 'spain-map-mistakes';

function loadMistakes() {
  if (!browser) return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function saveMistakes(mistakes: Record<string, { errors: number; correct: number }>) {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
}

function createGameStore() {
  const { subscribe, set, update } = writable<GameState>({
    level: 'communities',
    mode: 'locate',
    isPlaying: false,
    currentQuestion: null,
    options: [],
    focusedRegion: null,
    status: 'idle',
    history: [],
    mistakes: loadMistakes()
  });

  function getPool(level: Level): Region[] {
    return level === 'communities' ? communities : provinces;
  }

  function pickRandom<T>(array: T[], exclude?: T): T {
    let result = array[Math.floor(Math.random() * array.length)];
    if (exclude && result === exclude && array.length > 1) {
      return pickRandom(array, exclude);
    }
    return result;
  }

  function generateOptions(correctRegion: Region, pool: Region[]) {
    const opts = [correctRegion];
    while (opts.length < 4 && opts.length < pool.length) {
      const candidate = pickRandom(pool);
      if (!opts.find(o => o.id === candidate.id)) {
        opts.push(candidate);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  }

  return {
    subscribe,
    set,
    update,
    startGame: (level: Level, mode: Mode) => {
      const pool = getPool(level);
      
      if (mode === 'learning') {
        set({
          level,
          mode,
          isPlaying: true,
          currentQuestion: null,
          options: [],
          focusedRegion: null,
          status: 'playing',
          history: [],
          mistakes: loadMistakes()
        });
        return;
      }

      // Try to pick a question that has more errors
      const mistakes = get(gameStore).mistakes;
      let questionPool = [...pool];
      
      // 30% chance to force a mistake if available
      if (Math.random() < 0.3) {
        const mistakeIds = Object.entries(mistakes)
          .filter(([_, stats]) => stats.errors > stats.correct)
          .map(([id]) => id);
          
        if (mistakeIds.length > 0) {
          const candidates = pool.filter(p => mistakeIds.includes(p.id));
          if (candidates.length > 0) {
            questionPool = candidates;
          }
        }
      }

      const currentQuestion = pickRandom(questionPool);
      const options = mode === 'identify' ? generateOptions(currentQuestion, pool) : [];

      set({
        level,
        mode,
        isPlaying: true,
        currentQuestion,
        options,
        focusedRegion: mode === 'identify' ? currentQuestion.id : null,
        status: 'playing',
        history: [],
        mistakes: loadMistakes()
      });
    },
    
    nextQuestion: () => {
      update(state => {
        const pool = getPool(state.level);
        const currentQuestion = pickRandom(pool, state.currentQuestion || undefined);
        const options = state.mode === 'identify' ? generateOptions(currentQuestion, pool) : [];
        
        return {
          ...state,
          currentQuestion,
          options,
          focusedRegion: state.mode === 'identify' ? currentQuestion.id : null,
          status: 'playing'
        };
      });
    },

    guess: (answerId: string) => {
      update(state => {
        if (state.mode === 'learning') {
            const pool = getPool(state.level);
            const region = pool.find(p => p.id === answerId);
            return {
                ...state,
                currentQuestion: region || null,
                focusedRegion: answerId
            };
        }
        
        if (!state.currentQuestion || state.status !== 'playing') return state;

        const isCorrect = state.currentQuestion.id === answerId;
        const newMistakes = { ...state.mistakes };
        
        if (!newMistakes[state.currentQuestion.id]) {
          newMistakes[state.currentQuestion.id] = { errors: 0, correct: 0 };
        }
        
        if (isCorrect) {
          newMistakes[state.currentQuestion.id].correct++;
        } else {
          newMistakes[state.currentQuestion.id].errors++;
        }
        
        saveMistakes(newMistakes);

        return {
          ...state,
          status: isCorrect ? 'correct' : 'incorrect',
          focusedRegion: isCorrect ? state.currentQuestion.id : answerId,
          mistakes: newMistakes,
          history: [...state.history, { region: state.currentQuestion, correct: isCorrect }]
        };
      });
      
      const state = get(gameStore);
      if (state.mode === 'learning') return;
      
      if (state.status === 'correct') {
         setTimeout(() => {
            gameStore.nextQuestion();
         }, 1000);
      } else {
         setTimeout(() => {
            update(s => ({
               ...s,
               status: 'playing',
               focusedRegion: s.mode === 'identify' ? s.currentQuestion!.id : null
            }));
         }, 1500);
      }
    },
    stopGame: () => {
      update(state => ({ ...state, isPlaying: false, status: 'idle', currentQuestion: null, focusedRegion: null }));
    }
  };
}

export const gameStore = createGameStore();
