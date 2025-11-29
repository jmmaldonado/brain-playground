export type Operator = '+' | '-' | '×' | '÷';

export interface Equation {
    num1: number;
    num2: number;
    operator: Operator;
    result: number;
}

export interface PuzzleItem {
    value: string | number;
    type: 'number' | 'operator' | 'result';
    isHidden: boolean;
    userValue?: string | number | null;
}

export const generateEquation = (difficulty: number): Equation => {
    const operators: Operator[] = ['+', '-', '×'];
    if (difficulty > 2) operators.push('÷');

    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1 = 0, num2 = 0, result = 0;
    const maxNum = 10 + (difficulty * 5); // Increase range with difficulty

    switch (operator) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            result = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
            result = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * (maxNum / 2)) + 1; // Smaller factors
            num2 = Math.floor(Math.random() * 10) + 1;
            result = num1 * num2;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * 10) + 1;
            result = Math.floor(Math.random() * 10) + 1; // Result is small integer
            num1 = num2 * result; // Ensure clean division
            break;
    }

    return { num1, num2, operator, result };
};

export const createPuzzle = (equation: Equation, level: number): { puzzle: PuzzleItem[], options: (string | number)[] } => {
    // Determine how many items to hide based on level
    // Level 1: Hide Result
    // Level 2: Hide Operator
    // Level 3: Hide one operand
    // Level 4: Hide Result + One Operand
    // Level 5: Hide Operator + One Operand
    
    let itemsToHide: number[] = [];
    
    if (level === 1) itemsToHide = [3]; // Result
    else if (level === 2) itemsToHide = [1]; // Operator
    else if (level === 3) itemsToHide = Math.random() > 0.5 ? [0] : [2]; // num1 or num2
    else if (level === 4) itemsToHide = [3, Math.random() > 0.5 ? 0 : 2];
    else if (level >= 5) itemsToHide = [1, Math.random() > 0.5 ? 0 : 2]; // Operator + Operand

    const puzzle: PuzzleItem[] = [
        { value: equation.num1, type: 'number', isHidden: false },
        { value: equation.operator, type: 'operator', isHidden: false },
        { value: equation.num2, type: 'number', isHidden: false },
        { value: equation.result, type: 'result', isHidden: false }
    ];

    const options: (string | number)[] = [];

    itemsToHide.forEach(index => {
        puzzle[index].isHidden = true;
        options.push(puzzle[index].value);
    });

    // Add distractors
    const distractorCount = 2 + Math.floor(level / 2);
    for (let i = 0; i < distractorCount; i++) {
        const targetType = puzzle[itemsToHide[0]].type; // Base distractor on first hidden item type
        if (targetType === 'operator') {
            const ops: Operator[] = ['+', '-', '×', '÷'];
            const randomOp = ops[Math.floor(Math.random() * ops.length)];
            if (!options.includes(randomOp)) options.push(randomOp);
        } else {
            // Number distractor
            const baseVal = equation.result; // pivot around result size
            let dist = baseVal + Math.floor(Math.random() * 10) - 5;
            if (dist < 0) dist = Math.abs(dist) + 1;
            if (!options.includes(dist)) options.push(dist);
        }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return { puzzle, options };
};
