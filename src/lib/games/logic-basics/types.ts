export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';
export type SwitchType = 'toggle' | 'pulse';

export interface Gate {
    id: string;
    type: GateType;
    x: number;
    y: number;
}

export interface Switch {
    id: string;
    label: string;
    type: SwitchType;
    x: number;
    y: number;
    state: boolean; // true = ON, false = OFF
}

export interface Output {
    id: string;
    label: string;
    x: number;
    y: number;
    state: boolean; // true = LIT, false = OFF
}

export interface Connection {
    from: string;
    to: string;
    toInputIndex: number;
}

export interface Level {
    id: number;
    title: string;
    description: string;
    switches: { id: string; label: string; type: SwitchType; x: number; y: number }[];
    outputs: { id: string; label: string; x: number; y: number }[];
    availableGates: GateType[];
    // goal: Returns true if the current state satisfies the victory condition
    goal: (switches: Switch[], outputs: Output[]) => boolean;
}
