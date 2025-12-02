export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';

export interface Gate {
    id: string;
    type: GateType;
    x: number;
    y: number;
    inputs: string[]; // IDs of connected nodes (can be inputs or other gates)
}

export interface Level {
    id: number;
    title: string;
    description: string;
    inputs: { id: string; label: string; x: number; y: number }[];
    outputs: { id: string; label: string; x: number; y: number; required: boolean }[];
    availableGates: GateType[];
    solution?: (inputs: boolean[]) => boolean[]; // Optional logic to check correctness programmatically
    truthTable?: { inputs: boolean[]; outputs: boolean[] }[];
}

export interface Connection {
    from: string;
    to: string;
    toInputIndex: number;
}
