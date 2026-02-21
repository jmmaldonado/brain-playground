export type ParrotMode = 'Copycat' | 'Rewind' | 'Small to Tall';

export interface ParrotGameState {
    mode: ParrotMode;
    sequenceLength: number;
    currentSequence: number[];
    consecutiveCorrect: number;
    consecutiveWrong: number;
    score: number;
    isFinished: boolean;
}

export const INITIAL_SEQUENCE_LENGTH = 2;

/**
 * Generates a random sequence of numbers from 1 to 9.
 */
export function generateSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }
    return sequence;
}

/**
 * Returns the expected answer based on the game mode.
 */
export function getExpectedAnswer(sequence: number[], mode: ParrotMode): number[] {
    switch (mode) {
        case 'Copycat':
            return [...sequence];
        case 'Rewind':
            return [...sequence].reverse();
        case 'Small to Tall':
            return [...sequence].sort((a, b) => a - b);
        default:
            return sequence;
    }
}

/**
 * Validates the user's input against the expected sequence.
 */
export function validateResponse(userInput: number[], expected: number[]): boolean {
    if (userInput.length !== expected.length) return false;
    return userInput.every((val, index) => val === expected[index]);
}

/**
 * Handles the difficulty curve logic.
 */
export function updateDifficulty(state: ParrotGameState, isCorrect: boolean): Partial<ParrotGameState> {
    let { sequenceLength, consecutiveCorrect, consecutiveWrong, isFinished } = state;

    if (isCorrect) {
        consecutiveCorrect++;
        consecutiveWrong = 0;
        if (consecutiveCorrect >= 2) {
            sequenceLength++;
            consecutiveCorrect = 0;
        }
    } else {
        consecutiveWrong++;
        consecutiveCorrect = 0;
        if (consecutiveWrong >= 2) {
            isFinished = true;
        }
    }

    return { sequenceLength, consecutiveCorrect, consecutiveWrong, isFinished };
}
