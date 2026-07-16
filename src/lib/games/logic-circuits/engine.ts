import type { CircuitLevel, Connection, GateType, PlacedGate, TerminalRef, TruthTableRow } from './types';

export function getGateInputCount(type: GateType): number {
    return type === 'NOT' ? 1 : 2;
}

export function evaluateGate(type: GateType, inputs: boolean[]): boolean {
    switch (type) {
        case 'AND':
            return inputs.every(Boolean);
        case 'OR':
            return inputs.some(Boolean);
        case 'NOT':
            return !inputs[0];
        case 'NAND':
            return !inputs.every(Boolean);
        case 'NOR':
            return !inputs.some(Boolean);
        case 'XOR':
            return inputs.reduce((previous, current) => previous !== current, false);
    }
}

export function makeTerminalId(ref: TerminalRef): string {
    return `${ref.nodeId}:${ref.role}:${ref.index}`;
}

export function makeConnectionId(from: TerminalRef, to: TerminalRef): string {
    return `${makeTerminalId(from)}>${makeTerminalId(to)}`;
}

export function sameTerminal(a: TerminalRef, b: TerminalRef): boolean {
    return a.nodeId === b.nodeId && a.role === b.role && a.index === b.index;
}

export function normalizeConnection(first: TerminalRef, second: TerminalRef): { from: TerminalRef; to: TerminalRef } | null {
    if (first.role === 'source' && second.role === 'sink') return { from: first, to: second };
    if (first.role === 'sink' && second.role === 'source') return { from: second, to: first };
    return null;
}

export function isGateNode(nodeId: string, gates: PlacedGate[]): boolean {
    return gates.some((gate) => gate.id === nodeId);
}

function hasPathBetweenGates(startGateId: string, targetGateId: string, connections: Connection[]): boolean {
    const nextByGate = new Map<string, string[]>();

    for (const connection of connections) {
        if (connection.from.role !== 'source' || connection.to.role !== 'sink') continue;
        const fromGate = connection.from.nodeId;
        const toGate = connection.to.nodeId;
        if (!nextByGate.has(fromGate)) nextByGate.set(fromGate, []);
        nextByGate.get(fromGate)?.push(toGate);
    }

    const seen = new Set<string>();
    const queue = [startGateId];

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || seen.has(current)) continue;
        if (current === targetGateId) return true;
        seen.add(current);
        queue.push(...(nextByGate.get(current) ?? []));
    }

    return false;
}

export function canCreateConnection(
    first: TerminalRef,
    second: TerminalRef,
    gates: PlacedGate[],
    connections: Connection[],
): boolean {
    const normalized = normalizeConnection(first, second);
    if (!normalized) return false;
    const { from, to } = normalized;
    if (from.nodeId === to.nodeId) return false;

    const fromIsGate = isGateNode(from.nodeId, gates);
    const toIsGate = isGateNode(to.nodeId, gates);
    if (fromIsGate && toIsGate && hasPathBetweenGates(to.nodeId, from.nodeId, connections)) {
        return false;
    }

    return true;
}

export function addOrReplaceConnection(
    connections: Connection[],
    first: TerminalRef,
    second: TerminalRef,
    gates: PlacedGate[],
): Connection[] {
    if (!canCreateConnection(first, second, gates, connections)) return connections;
    const normalized = normalizeConnection(first, second);
    if (!normalized) return connections;

    const { from, to } = normalized;
    const nextConnection: Connection = {
        id: makeConnectionId(from, to),
        from,
        to,
    };

    return [
        ...connections.filter((connection) => !(connection.to.nodeId === to.nodeId && connection.to.index === to.index)),
        nextConnection,
    ];
}

export function removeGateConnections(connections: Connection[], gateId: string): Connection[] {
    return connections.filter((connection) => connection.from.nodeId !== gateId && connection.to.nodeId !== gateId);
}

export interface CircuitEvaluation {
    gateStates: Record<string, boolean>;
    outputStates: Record<string, boolean>;
}

export function evaluateCircuit(
    level: Pick<CircuitLevel, 'inputs' | 'outputs'>,
    gates: PlacedGate[],
    connections: Connection[],
    inputValues: Record<string, boolean>,
): CircuitEvaluation {
    const values: Record<string, boolean> = {};

    for (const input of level.inputs) {
        values[input.id] = inputValues[input.id] ?? false;
    }

    for (const gate of gates) {
        values[gate.id] = false;
    }

    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
        changed = false;
        iterations += 1;

        for (const gate of gates) {
            const gateInputs: boolean[] = [];
            for (let index = 0; index < getGateInputCount(gate.type); index += 1) {
                const connection = connections.find((candidate) => candidate.to.nodeId === gate.id && candidate.to.index === index);
                gateInputs.push(connection ? values[connection.from.nodeId] ?? false : false);
            }

            const nextValue = evaluateGate(gate.type, gateInputs);
            if (values[gate.id] !== nextValue) {
                values[gate.id] = nextValue;
                changed = true;
            }
        }
    }

    const outputStates: Record<string, boolean> = {};
    for (const output of level.outputs) {
        const connection = connections.find((candidate) => candidate.to.nodeId === output.id);
        outputStates[output.id] = connection ? values[connection.from.nodeId] ?? false : false;
    }

    return {
        gateStates: Object.fromEntries(gates.map((gate) => [gate.id, values[gate.id] ?? false])),
        outputStates,
    };
}

export function evaluateTruthTable(level: CircuitLevel, gates: PlacedGate[], connections: Connection[]) {
    return level.truthTable.map((row: TruthTableRow) => {
        const inputValues = Object.fromEntries(level.inputs.map((input, index) => [input.id, row.inputs[index] ?? false]));
        const evaluation = evaluateCircuit(level, gates, connections, inputValues);
        const outputs = level.outputs.map((output) => evaluation.outputStates[output.id] ?? false);

        return {
            correct: outputs.every((output, index) => output === row.outputs[index]),
            inputs: row.inputs,
            outputs,
            expected: row.outputs,
        };
    });
}
