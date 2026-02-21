export type DetectiveLayout = 'Tidy Room' | 'Messy Room';
export type DetectiveMode = 'Emoji Match' | 'Semantic Hunt';

export interface EmojiItem {
    id: string;
    emoji: string;
    isTarget: boolean;
    isFound: boolean;
    isWrong: boolean;
    x?: number; // For messy layout
    y?: number; // For messy layout
    rotation?: number; // For messy layout
}

export const GAME_DURATION = 45;
export const TOTAL_EMOJIS = 60;
export const TARGET_RATIO = 0.2; // 20% of emojis are targets

// BASE LISTS
const ANIMALS = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
    '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
    '🐌', '🐞', '🐜', '🕷', '🐢', '🐍', '🐙', '🦑', '🦐', '🦀',
    '🐡', '🐠', '🐬', '🐳', '🐘', '🦒', '🦓', '🦘', '🦥', '🦦'
];

const FRUITS = [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑'
];

const FOOD_MEALS = [
    '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥚', '🍳', '🧇', '🥞',
    '🍞', '🥐', '🥨', '🥯', '🥖', '🌮', '🌯', '🥗', '🥘', '🍜',
    '🍝', '🥪', '🍱', '🍣', '🍤', '🍙', '🍚', '🍛', '🥟', '🍢'
];

const SWEETS = [
    '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫',
    '🍬', '🍭', '🍮', '🍯'
];

const VEGETABLES = [
    '🥦', '🥬', '🥒', '🌽', '🥕', '🫑', '🥔', '🍠', '🍆'
];

export const CATEGORIES: Record<string, string[]> = {
    'Animals': ANIMALS,
    'Fruits': FRUITS,
    'Something to Eat': [...FRUITS, ...FOOD_MEALS, ...SWEETS, ...VEGETABLES],
    'Sweets & Treats': SWEETS,
    'Veggies': VEGETABLES
};

const ALL_EMOJIS = Array.from(new Set(Object.values(CATEGORIES).flat()));

export function generateBoard(layout: DetectiveLayout, mode: DetectiveMode): { targets: string[], board: EmojiItem[], categoryName?: string } {
    let targets: string[] = [];
    let distractors: string[] = [];
    let categoryName: string | undefined;

    if (mode === 'Emoji Match') {
        const numTargets = Math.random() > 0.5 ? 2 : 1;
        const shuffledPool = [...ALL_EMOJIS].sort(() => Math.random() - 0.5);
        targets = shuffledPool.slice(0, numTargets);
        distractors = shuffledPool.slice(numTargets);
    } else {
        // Semantic mode
        const categoryKeys = Object.keys(CATEGORIES);
        categoryName = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        targets = CATEGORIES[categoryName];
        distractors = ALL_EMOJIS.filter(e => !targets.includes(e));
    }

    // 2. Populate board
    const board: EmojiItem[] = [];
    const numTargetItems = Math.floor(TOTAL_EMOJIS * TARGET_RATIO);

    for (let i = 0; i < TOTAL_EMOJIS; i++) {
        const isTarget = i < numTargetItems;
        const emoji = isTarget
            ? targets[Math.floor(Math.random() * targets.length)]
            : distractors[Math.floor(Math.random() * distractors.length)];

        const item: EmojiItem = {
            id: `emoji-${i}`,
            emoji,
            isTarget,
            isFound: false,
            isWrong: false
        };

        if (layout === 'Messy Room') {
            let x = 0, y = 0, tooClose = false;
            let attempts = 0;
            const minDistance = 8; // % distance
            do {
                x = 5 + Math.random() * 80; // Stay away from edges
                y = 5 + Math.random() * 80;
                tooClose = board.some(other => {
                    if (other.x === undefined || other.y === undefined) return false;
                    const dx = x - other.x;
                    const dy = y - other.y;
                    return Math.sqrt(dx * dx + dy * dy) < minDistance;
                });
                attempts++;
            } while (tooClose && attempts < 50);

            item.x = x;
            item.y = y;
            item.rotation = (Math.random() - 0.5) * 60; // -30 to 30 deg
        }

        board.push(item);
    }

    // Shuffle board
    return {
        targets: mode === 'Emoji Match' ? targets : [], // Targets as emojis only for match mode
        board: board.sort(() => Math.random() - 0.5),
        categoryName
    };
}
