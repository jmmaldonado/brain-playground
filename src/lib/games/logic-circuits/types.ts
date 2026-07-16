export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';

export type TerminalRole = 'source' | 'sink';

export interface TerminalRef {
    nodeId: string;
    role: TerminalRole;
    index: number;
}

export interface Connection {
    id: string;
    from: TerminalRef;
    to: TerminalRef;
}

export interface PlacedGate {
    id: string;
    type: GateType;
    x: number;
    y: number;
}

export interface CircuitPort {
    id: string;
    label: string;
    x: number;
    y: number;
}

export interface CircuitOutput extends CircuitPort {
    required?: boolean;
    kind?: 'lamp' | 'bell' | 'indicator';
}

export interface TruthTableRow {
    inputs: boolean[];
    outputs: boolean[];
}

export interface CircuitLevel {
    id: number;
    title: string;
    description: string;
    inputs: CircuitPort[];
    outputs: CircuitOutput[];
    availableGates: GateType[];
    truthTable: TruthTableRow[];
}
