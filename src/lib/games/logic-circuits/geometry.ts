import type { CircuitOutput, CircuitPort, GateType, PlacedGate, TerminalRef } from './types';

export interface Point {
    x: number;
    y: number;
}

export const GATE_WIDTH = 86;
export const GATE_HEIGHT = 82;
export const PORT_WIDTH = 92;
export const PORT_HEIGHT = 56;

export function getGateInputOffsets(type: GateType): Point[] {
    if (type === 'NOT') return [{ x: -6, y: 35 }];
    return [
        { x: -6, y: 21 },
        { x: -6, y: 49 },
    ];
}

export function getGateOutputOffset(type: GateType): Point {
    if (type === 'NOT' || type === 'NAND' || type === 'NOR') return { x: 92, y: 35 };
    if (type === 'XOR') return { x: 88, y: 35 };
    return { x: 86, y: 35 };
}

export function getTerminalPosition(
    ref: TerminalRef,
    gates: PlacedGate[],
    inputs: CircuitPort[],
    outputs: CircuitOutput[],
): Point {
    const input = inputs.find((candidate) => candidate.id === ref.nodeId);
    if (input) return { x: input.x + PORT_WIDTH + 12, y: input.y + PORT_HEIGHT / 2 };

    const output = outputs.find((candidate) => candidate.id === ref.nodeId);
    if (output) return { x: output.x - 12, y: output.y + PORT_HEIGHT / 2 };

    const gate = gates.find((candidate) => candidate.id === ref.nodeId);
    if (gate) {
        const offset = ref.role === 'sink' ? getGateInputOffsets(gate.type)[ref.index] : getGateOutputOffset(gate.type);
        return { x: gate.x + offset.x, y: gate.y + offset.y };
    }

    return { x: 0, y: 0 };
}

export function getWirePath(from: Point, to: Point): string {
    const distance = Math.max(48, Math.abs(to.x - from.x) * 0.45);
    return `M ${from.x} ${from.y} C ${from.x + distance} ${from.y}, ${to.x - distance} ${to.y}, ${to.x} ${to.y}`;
}

export function getLevelBounds(inputs: CircuitPort[], outputs: CircuitOutput[]) {
    const points = [
        ...inputs.map((input) => ({ x: input.x, y: input.y })),
        ...outputs.map((output) => ({ x: output.x + PORT_WIDTH, y: output.y + PORT_HEIGHT })),
    ];

    return {
        minX: Math.min(...points.map((point) => point.x), 0),
        minY: Math.min(...points.map((point) => point.y), 0),
        maxX: Math.max(...points.map((point) => point.x), 520),
        maxY: Math.max(...points.map((point) => point.y), 360),
    };
}
