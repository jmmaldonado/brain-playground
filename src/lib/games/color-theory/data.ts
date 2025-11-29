// Color Definitions
export type ColorType = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'tint' | 'shade';

export interface ColorDef {
    id: string;
    name: string;
    hex: string;
    type: ColorType;
    components?: string[]; // For secondary colors, what primaries make it?
    complementary?: string; // ID of the opposite color
}

export const COLORS: Record<string, ColorDef> = {
    // Primaries
    red: { id: 'red', name: 'Red', hex: '#EF4444', type: 'primary', complementary: 'green' },
    blue: { id: 'blue', name: 'Blue', hex: '#3B82F6', type: 'primary', complementary: 'orange' },
    yellow: { id: 'yellow', name: 'Yellow', hex: '#EAB308', type: 'primary', complementary: 'purple' },
    
    // Neutrals
    white: { id: 'white', name: 'White', hex: '#FFFFFF', type: 'neutral' },
    black: { id: 'black', name: 'Black', hex: '#1F2937', type: 'neutral' },

    // Secondaries
    purple: { id: 'purple', name: 'Purple', hex: '#A855F7', type: 'secondary', components: ['red', 'blue'], complementary: 'yellow' },
    green: { id: 'green', name: 'Green', hex: '#22C55E', type: 'secondary', components: ['blue', 'yellow'], complementary: 'red' },
    orange: { id: 'orange', name: 'Orange', hex: '#F97316', type: 'secondary', components: ['red', 'yellow'], complementary: 'blue' },

    // Tertiaries (Primary + Secondary)
    vermilion: { id: 'vermilion', name: 'Vermilion', hex: '#F87171', type: 'tertiary' }, // Red-Orange
    amber: { id: 'amber', name: 'Amber', hex: '#FBBF24', type: 'tertiary' }, // Yellow-Orange
    lime: { id: 'lime', name: 'Lime', hex: '#84CC16', type: 'tertiary' }, // Yellow-Green
    teal: { id: 'teal', name: 'Teal', hex: '#14B8A6', type: 'tertiary' }, // Blue-Green
    indigo: { id: 'indigo', name: 'Indigo', hex: '#6366F1', type: 'tertiary' }, // Blue-Purple
    magenta: { id: 'magenta', name: 'Magenta', hex: '#D946EF', type: 'tertiary' }, // Red-Purple

    // Tints (Color + White) & Shades (Color + Black)
    pink: { id: 'pink', name: 'Pink', hex: '#FBCFE8', type: 'tint' },
    skyblue: { id: 'skyblue', name: 'Sky Blue', hex: '#BAE6FD', type: 'tint' },
    cream: { id: 'cream', name: 'Cream', hex: '#FEF3C7', type: 'tint' },
    gray: { id: 'gray', name: 'Gray', hex: '#9CA3AF', type: 'shade' },
    navy: { id: 'navy', name: 'Navy', hex: '#1E3A8A', type: 'shade' },
    brown: { id: 'brown', name: 'Brown', hex: '#78350F', type: 'shade' } // Often Orange + Black
};

export const MIXING_RECIPES = [
    // Level 1: Secondaries
    { inputs: ['red', 'blue'], output: 'purple', level: 1 },
    { inputs: ['blue', 'yellow'], output: 'green', level: 1 },
    { inputs: ['red', 'yellow'], output: 'orange', level: 1 },

    // Level 2: Tints & Shades (Intro to Neutrals)
    { inputs: ['red', 'white'], output: 'pink', level: 2 },
    { inputs: ['blue', 'white'], output: 'skyblue', level: 2 },
    { inputs: ['yellow', 'white'], output: 'cream', level: 2 },
    { inputs: ['black', 'white'], output: 'gray', level: 2 },
    { inputs: ['blue', 'black'], output: 'navy', level: 2 },
    { inputs: ['orange', 'black'], output: 'brown', level: 2 },

    // Level 3: Tertiaries (Primary + Secondary)
    { inputs: ['orange', 'red'], output: 'vermilion', level: 3 },
    { inputs: ['orange', 'yellow'], output: 'amber', level: 3 },
    { inputs: ['green', 'yellow'], output: 'lime', level: 3 },
    { inputs: ['green', 'blue'], output: 'teal', level: 3 },
    { inputs: ['purple', 'blue'], output: 'indigo', level: 3 },
    { inputs: ['purple', 'red'], output: 'magenta', level: 3 }
];