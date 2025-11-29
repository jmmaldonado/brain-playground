// Color Definitions
export type ColorType = 'primary' | 'secondary';

export interface ColorDef {
    id: string;
    name: string;
    hex: string;
    type: ColorType;
    components?: string[]; // For secondary colors, what primaries make it?
    complementary?: string; // ID of the opposite color
}

export const COLORS: Record<string, ColorDef> = {
    red: { id: 'red', name: 'Red', hex: '#EF4444', type: 'primary', complementary: 'green' },
    blue: { id: 'blue', name: 'Blue', hex: '#3B82F6', type: 'primary', complementary: 'orange' },
    yellow: { id: 'yellow', name: 'Yellow', hex: '#EAB308', type: 'primary', complementary: 'purple' },
    
    purple: { id: 'purple', name: 'Purple', hex: '#A855F7', type: 'secondary', components: ['red', 'blue'], complementary: 'yellow' },
    green: { id: 'green', name: 'Green', hex: '#22C55E', type: 'secondary', components: ['blue', 'yellow'], complementary: 'red' },
    orange: { id: 'orange', name: 'Orange', hex: '#F97316', type: 'secondary', components: ['red', 'yellow'], complementary: 'blue' }
};

export const MIXING_RECIPES = [
    { inputs: ['red', 'blue'], output: 'purple' },
    { inputs: ['blue', 'red'], output: 'purple' },
    { inputs: ['blue', 'yellow'], output: 'green' },
    { inputs: ['yellow', 'blue'], output: 'green' },
    { inputs: ['red', 'yellow'], output: 'orange' },
    { inputs: ['yellow', 'red'], output: 'orange' }
];
