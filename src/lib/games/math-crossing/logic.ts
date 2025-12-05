export type Operator = '+' | '-' | '×' | '÷';

export interface Cell {
    id: string;
    row: number;
    col: number;
    value: string | number; // The actual value (number or operator or '=')
    displayValue: string | number | null; // What is shown to the user (null if hidden)
    isInput: boolean; // True if this is a cell the user needs to fill
    isCorrect?: boolean; // For feedback
    isWrong?: boolean; // For feedback
    type: 'number' | 'operator' | 'equals' | 'empty';
}

export interface Grid {
    cells: Cell[];
    rows: number;
    cols: number;
    options: (string | number)[]; // The bank of items to place
    equations: EquationMetadata[]; // Metadata for validation
}

export interface EquationMetadata {
    cells: { row: number, col: number }[]; // Ordered list of cells in this equation
}

export interface Equation {
    num1: number;
    op: Operator;
    num2: number;
    result: number;
    orientation: 'horizontal' | 'vertical';
    startRow: number;
    startCol: number;
}

// Difficulty settings
interface Difficulty {
    maxNumber: number;
    operators: Operator[];
    gridSize: number; // roughly how many equations
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export function getDifficultySettings(level: DifficultyLevel): Difficulty {
    switch (level) {
        case 'Easy':
            return { maxNumber: 10, operators: ['+'], gridSize: 2 };
        case 'Medium':
            return { maxNumber: 20, operators: ['+', '-'], gridSize: 3 };
        case 'Hard':
            return { maxNumber: 50, operators: ['+', '-', '×'], gridSize: 4 };
        case 'Expert':
            return { maxNumber: 99, operators: ['+', '-', '×', '÷'], gridSize: 5 };
        default:
            return { maxNumber: 10, operators: ['+'], gridSize: 2 };
    }
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOperator(operators: Operator[]): Operator {
    return operators[Math.floor(Math.random() * operators.length)];
}

function calculate(n1: number, op: Operator, n2: number): number {
    switch (op) {
        case '+': return n1 + n2;
        case '-': return n1 - n2;
        case '×': return n1 * n2;
        case '÷': return n1 / n2;
    }
}

// Generate a valid equation: num1 op num2 = result
function generateEquation(difficulty: Difficulty): { num1: number, op: Operator, num2: number, result: number } {
    let num1, num2, result;
    let op = getRandomOperator(difficulty.operators);

    // Safety break to prevent infinite loops
    let attempts = 0;
    do {
        attempts++;
        num1 = getRandomInt(1, difficulty.maxNumber);
        num2 = getRandomInt(1, difficulty.maxNumber);

        // Adjust for division to ensure integer result
        if (op === '÷') {
            num2 = getRandomInt(1, 10); // Keep divisor small for easier mental math
            num1 = num2 * getRandomInt(1, 10);
        }

        // Adjust for subtraction to avoid negatives (optional, but good for early levels)
        if (op === '-' && num1 < num2) {
            [num1, num2] = [num2, num1];
        }

        result = calculate(num1, op, num2);

    } while ((result < 0 || result > difficulty.maxNumber * 2 || !Number.isInteger(result)) && attempts < 100);

    return { num1, op, num2, result };
}

export function generateGrid(difficulty: DifficultyLevel): Grid {
    const diff = getDifficultySettings(difficulty);

    let numericLevel = 1;
    switch (difficulty) {
        case 'Medium': numericLevel = 4; break;
        case 'Hard': numericLevel = 8; break;
        case 'Expert': numericLevel = 12; break;
    }
    const cells: Cell[] = [];
    // We'll use a map for easier coordinate access during generation
    const gridMap = new Map<string, Cell>();

    // Start with one horizontal equation
    const startEq = generateEquation(diff);
    // Center it roughly


    const placeEquation = (eq: { num1: number, op: Operator, num2: number, result: number }, row: number, col: number, orientation: 'horizontal' | 'vertical') => {
        const parts = [eq.num1, eq.op, eq.num2, '=', eq.result];

        for (let i = 0; i < parts.length; i++) {
            const r = orientation === 'horizontal' ? row : row + i;
            const c = orientation === 'horizontal' ? col + i : col;
            const key = `${r},${c}`;

            let type: Cell['type'] = 'number';
            if (parts[i] === '=') type = 'equals';
            else if (['+', '-', '×', '÷'].includes(String(parts[i]))) type = 'operator';

            const cell: Cell = {
                id: key,
                row: r,
                col: c,
                value: parts[i],
                displayValue: parts[i], // Initially show all
                isInput: false,
                type
            };
            gridMap.set(key, cell);
        }
    };

    // Place first equation
    placeEquation(startEq, 0, 0, 'horizontal');

    // Try to add more equations intersecting existing numbers
    // This is a simplified generation strategy:
    // 1. Find a number cell in the grid
    // 2. Try to build a perpendicular equation using that number as one of its components

    let equationsAdded = 1;
    let attempts = 0;
    const maxEquations = diff.gridSize;

    while (equationsAdded < maxEquations && attempts < 50) {
        attempts++;

        // Get all existing cells
        const existingCells = Array.from(gridMap.values());
        // Filter for numbers that can be intersection points
        const candidates = existingCells.filter(c => c.type === 'number');

        if (candidates.length === 0) break;

        const intersectionCell = candidates[Math.floor(Math.random() * candidates.length)];
        const isHorizontal = Math.random() > 0.5; // Desired orientation for NEW equation

        // We need to check if we can place an equation here.
        // Simplified: We only support intersecting at num1, num2, or result.
        // And we need to make sure the new equation is perpendicular to the existing flow at that cell?
        // Actually, we don't track flow per cell, but we can check neighbors.

        // Check if occupied neighbors suggest an orientation
        const hasHorizNeighbor = gridMap.has(`${intersectionCell.row},${intersectionCell.col - 1}`) || gridMap.has(`${intersectionCell.row},${intersectionCell.col + 1}`);
        const hasVertNeighbor = gridMap.has(`${intersectionCell.row - 1},${intersectionCell.col}`) || gridMap.has(`${intersectionCell.row + 1},${intersectionCell.col}`);

        let newOrientation: 'horizontal' | 'vertical' = 'horizontal';
        if (hasHorizNeighbor && !hasVertNeighbor) newOrientation = 'vertical';
        else if (!hasHorizNeighbor && hasVertNeighbor) newOrientation = 'horizontal';
        else continue; // Already crossed or isolated (unlikely)

        // Generate a new equation that *contains* the intersection value
        // The intersection value could be num1, num2, or result of the new equation.
        const targetVal = Number(intersectionCell.value);
        const positionInNewEq = Math.floor(Math.random() * 3); // 0: num1, 1: num2, 2: result

        // We need to reverse-engineer an equation or just generate random ones until one fits?
        // Reverse-engineering is better.

        let newEqParts: { num1: number, op: Operator, num2: number, result: number } | null = null;
        const op = getRandomOperator(diff.operators);

        if (positionInNewEq === 0) { // target is num1
            // target op ? = ?
            const num2 = getRandomInt(1, diff.maxNumber);
            const res = calculate(targetVal, op, num2);
            if (res > 0 && Number.isInteger(res) && res <= diff.maxNumber * 2) {
                newEqParts = { num1: targetVal, op, num2, result: res };
            }
        } else if (positionInNewEq === 1) { // target is num2
            // ? op target = ?
            // For division: num1 / target = res => num1 = res * target
            // For subtraction: num1 - target = res => num1 = res + target
            const num1 = getRandomInt(targetVal, diff.maxNumber * 2); // rough guess
            // Actually let's pick the other operand or result and solve
            // Easier: pick num1, check if valid
            const n1 = getRandomInt(1, diff.maxNumber);
            const res = calculate(n1, op, targetVal);
            if (res > 0 && Number.isInteger(res)) {
                newEqParts = { num1: n1, op, num2: targetVal, result: res };
            }
        } else { // target is result
            // ? op ? = target
            // This is partitioning the target
            // Simple approach: generate random num1, calculate num2
            let n1 = getRandomInt(1, targetVal);
            if (op === '×' || op === '÷') n1 = getRandomInt(1, 10); // smaller for mult/div

            // Inverse operations to find n2
            let n2;
            if (op === '+') n2 = targetVal - n1;
            else if (op === '-') n2 = n1 - targetVal; // Wait, n1 - n2 = target => n2 = n1 - target
            else if (op === '×') n2 = targetVal / n1;
            else if (op === '÷') n2 = n1 / targetVal; // n1 / n2 = target => n2 = n1 / target

            if (n2 && n2 > 0 && Number.isInteger(n2)) {
                // Check if n1 op n2 = target is actually true (floating point safety)
                if (Math.abs(calculate(n1, op, n2) - targetVal) < 0.001) {
                    newEqParts = { num1: n1, op, num2: n2, result: targetVal };
                }
            }
        }

        if (newEqParts) {
            // Determine placement coordinates
            // Equation structure: [num1, op, num2, =, result]
            // Indices: 0, 1, 2, 3, 4
            // positionInNewEq maps to indices: 0->0, 1->2, 2->4
            const indexInEq = positionInNewEq === 0 ? 0 : (positionInNewEq === 1 ? 2 : 4);

            const startRow = newOrientation === 'horizontal' ? intersectionCell.row : intersectionCell.row - indexInEq;
            const startCol = newOrientation === 'horizontal' ? intersectionCell.col - indexInEq : intersectionCell.col;

            // Check for collisions
            let collision = false;
            const parts = [newEqParts.num1, newEqParts.op, newEqParts.num2, '=', newEqParts.result];

            for (let i = 0; i < parts.length; i++) {
                if (i === indexInEq) continue; // Skip the intersection point itself, it's allowed to match (it must match)

                const r = newOrientation === 'horizontal' ? startRow : startRow + i;
                const c = newOrientation === 'horizontal' ? startCol + i : startCol;
                const key = `${r},${c}`;

                if (gridMap.has(key)) {
                    collision = true; // Simple collision check: don't overwrite anything else
                    break;
                }
            }

            if (!collision) {
                placeEquation(newEqParts, startRow, startCol, newOrientation);
                equationsAdded++;
            }
        }
    }

    // Normalize coordinates to 0,0
    let minRow = Infinity, minCol = Infinity, maxRow = -Infinity, maxCol = -Infinity;
    for (const cell of gridMap.values()) {
        minRow = Math.min(minRow, cell.row);
        minCol = Math.min(minCol, cell.col);
        maxRow = Math.max(maxRow, cell.row);
        maxCol = Math.max(maxCol, cell.col);
    }

    const normalizedCells = Array.from(gridMap.values()).map(cell => ({
        ...cell,
        row: cell.row - minRow,
        col: cell.col - minCol
    }));

    // Masking logic: Hide some cells
    // Strategy: Hide 40-60% of numbers/operators, but never '='
    const options: (string | number)[] = [];

    normalizedCells.forEach(cell => {
        // NEVER mask equals or operators. Only numbers.
        if (cell.type === 'equals' || cell.type === 'operator') return;

        // Higher level -> more hidden
        // Higher level -> more hidden
        const hideChance = 0.3 + (Math.min(numericLevel, 10) * 0.03);
        if (Math.random() < hideChance) {
            cell.isInput = true;
            options.push(cell.value); // Add correct value to options
            cell.displayValue = null;
        }
    });

    // Add distractors (Numbers only)
    const numDistractors = Math.min(3 + Math.floor(numericLevel / 3), 8);
    for (let i = 0; i < numDistractors; i++) {
        options.push(getRandomInt(1, diff.maxNumber));
    }

    // Extract equation metadata for validation
    const equations: EquationMetadata[] = [];

    // Scan Horizontal
    for (let r = 0; r <= maxRow - minRow; r++) {
        let currentRun: { row: number, col: number }[] = [];
        for (let c = 0; c <= maxCol - minCol; c++) {
            const cell = normalizedCells.find(cell => cell.row === r && cell.col === c);
            if (cell) {
                currentRun.push({ row: r, col: c });
            } else {
                if (currentRun.length >= 3) { // Min equation length 3 (e.g. 1+1) - actually usually 5 (1+1=2)
                    // Check if it looks like an equation (contains =)
                    const hasEquals = currentRun.some(pos => {
                        const c = normalizedCells.find(cl => cl.row === pos.row && cl.col === pos.col);
                        return c?.type === 'equals';
                    });
                    if (hasEquals) equations.push({ cells: [...currentRun] });
                }
                currentRun = [];
            }
        }
        if (currentRun.length >= 3) {
            const hasEquals = currentRun.some(pos => {
                const c = normalizedCells.find(cl => cl.row === pos.row && cl.col === pos.col);
                return c?.type === 'equals';
            });
            if (hasEquals) equations.push({ cells: [...currentRun] });
        }
    }

    // Scan Vertical
    for (let c = 0; c <= maxCol - minCol; c++) {
        let currentRun: { row: number, col: number }[] = [];
        for (let r = 0; r <= maxRow - minRow; r++) {
            const cell = normalizedCells.find(cell => cell.row === r && cell.col === c);
            if (cell) {
                currentRun.push({ row: r, col: c });
            } else {
                if (currentRun.length >= 3) {
                    const hasEquals = currentRun.some(pos => {
                        const c = normalizedCells.find(cl => cl.row === pos.row && cl.col === pos.col);
                        return c?.type === 'equals';
                    });
                    if (hasEquals) equations.push({ cells: [...currentRun] });
                }
                currentRun = [];
            }
        }
        if (currentRun.length >= 3) {
            const hasEquals = currentRun.some(pos => {
                const c = normalizedCells.find(cl => cl.row === pos.row && cl.col === pos.col);
                return c?.type === 'equals';
            });
            if (hasEquals) equations.push({ cells: [...currentRun] });
        }
    }

    return {
        cells: normalizedCells,
        rows: maxRow - minRow + 1,
        cols: maxCol - minCol + 1,
        options: shuffleArray(options),
        equations
    };
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function validateEquation(cells: Cell[]): boolean {
    // Parse the equation string from cells
    try {
        const parts = cells.map(c => c.displayValue);
        if (parts.some(p => p === null || p === '')) return false; // Incomplete

        const cleanParts = parts as (string | number)[];

        const equalsIndex = cleanParts.indexOf('=');
        if (equalsIndex === -1) return false;

        const leftSide = cleanParts.slice(0, equalsIndex);
        const rightSide = cleanParts.slice(equalsIndex + 1);

        // Helper to parse number or operator
        const parseVal = (v: string | number) => {
            if (['+', '-', '×', '÷'].includes(String(v))) return String(v);
            return Number(v);
        };

        const evalLeft = evaluateExpression(leftSide.map(parseVal));
        const evalRight = evaluateExpression(rightSide.map(parseVal));

        return Math.abs(evalLeft - evalRight) < 0.001;

    } catch (e) {
        return false;
    }
}

function evaluateExpression(tokens: (string | number)[]): number {
    // Simple left-to-right evaluator for now, or handle precedence if needed.
    // Given our generator, we usually have [num, op, num].
    // If we have [num, op, num, op, num], standard math rules apply.

    // Let's handle standard precedence: *, / first, then +, -
    // 1. Pass for * and /
    let ops = [...tokens];

    // Handle * and /
    for (let i = 1; i < ops.length - 1; i += 2) {
        const op = ops[i];
        if (op === '×' || op === '÷') {
            const n1 = Number(ops[i - 1]);
            const n2 = Number(ops[i + 1]);
            let res = 0;
            if (op === '×') res = n1 * n2;
            else res = n1 / n2;

            // Replace n1, op, n2 with res
            ops.splice(i - 1, 3, res);
            i -= 2; // Backtrack
        }
    }

    // Handle + and -
    let result = Number(ops[0]);
    for (let i = 1; i < ops.length; i += 2) {
        const op = ops[i];
        const nextVal = Number(ops[i + 1]);
        if (op === '+') result += nextVal;
        else if (op === '-') result -= nextVal;
    }

    return result;
}
