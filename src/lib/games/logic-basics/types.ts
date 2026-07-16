import type { CircuitLevel, CircuitPort, GateType } from '../logic-circuits/types';

export type SwitchType = 'toggle' | 'pulse';

export interface BasicSwitch extends CircuitPort {
    type: SwitchType;
}

export interface BasicLevel extends Omit<CircuitLevel, 'inputs'> {
    switches: BasicSwitch[];
    availableGates: GateType[];
}

export type { Connection, CircuitOutput as Output, GateType, PlacedGate as Gate } from '../logic-circuits/types';
