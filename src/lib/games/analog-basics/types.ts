// Component Types
export type ComponentType = 'battery' | 'led' | 'resistor' | 'transistor' | 'switch' | 'capacitor' | 'wire';

export type LEDColor = 'red' | 'green' | 'blue' | 'yellow' | 'white';

export type TransistorState = 'cutoff' | 'active' | 'saturation';

// Base component interface
export interface BaseComponent {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    rotation?: number; // 0, 90, 180, 270
}

export interface Battery extends BaseComponent {
    type: 'battery';
    voltage: number; // 3, 5, 9, 12
}

export interface LED extends BaseComponent {
    type: 'led';
    color: LEDColor;
    forwardVoltage: number; // ~2V for red, ~3V for blue/white
    maxCurrent: number; // Typically ~20mA
    currentBrightness: number; // 0-1, calculated during simulation
    isBurned: boolean;
}

export interface Resistor extends BaseComponent {
    type: 'resistor';
    resistance: number; // Ohms
    maxPower: number; // Watts, typically 0.25W
    currentPower: number; // Calculated
}

export interface Transistor extends BaseComponent {
    type: 'transistor';
    beta: number; // Current gain, typically 100-300
    vbe: number; // Base-emitter voltage when on, ~0.7V
    vce_sat: number; // Collector-emitter saturation voltage, ~0.2V
    maxCollectorCurrent: number; // Max Ic
    currentState: TransistorState;
}

export interface Switch extends BaseComponent {
    type: 'switch';
    state: boolean; // true = closed, false = open
}

export interface Capacitor extends BaseComponent {
    type: 'capacitor';
    capacitance: number; // Farads
    voltage: number; // Current voltage across capacitor
    maxVoltage: number; // Voltage rating
}

export type Component = Battery | LED | Resistor | Transistor | Switch | Capacitor;

// Connection between components
export interface Connection {
    id: string;
    from: string; // Component ID
    fromTerminal: string; // 'pos', 'neg', 'collector', 'base', 'emitter', 'terminal1', 'terminal2'
    to: string; // Component ID
    toTerminal: string;
    current?: number; // Calculated current through connection
}

// Circuit analysis result
export interface CircuitState {
    nodeVoltages: Record<string, number>; // node ID -> voltage
    componentCurrents: Record<string, number>; // component ID -> current
    componentVoltages: Record<string, number>; // component ID -> voltage drop
    warnings: ComponentWarning[];
}

export interface ComponentWarning {
    componentId: string;
    type: 'overcurrent' | 'overvoltage' | 'overpower' | 'reverse_bias';
    message: string;
    severity: 'info' | 'warning' | 'critical';
}

// Level definition
export interface Level {
    id: number;
    title: string;
    description: string;
    objective: string;
    availableComponents: {
        type: ComponentType;
        count: number; // -1 for unlimited
        defaultValue?: any; // Default voltage, resistance, etc.
    }[];
    initialComponents?: Partial<Component>[]; // Pre-placed components
    initialConnections?: Omit<Connection, 'id'>[]; // Pre-made connections
    goalCheck: (state: CircuitState, components: Component[]) => boolean;
    hint?: string;
    enableOscilloscope?: boolean;
}

// Game state
export interface GameState {
    currentLevel: number;
    completedLevels: number[];
    levelScores: Record<number, number>; // level ID -> score (time or attempts)
    totalScore: number;
}

// Oscilloscope data
export interface WaveformData {
    time: number[];
    voltage: number[];
    frequency?: number; // Hz
    period?: number; // seconds
}
