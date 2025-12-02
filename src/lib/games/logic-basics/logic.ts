import type { GateType, Gate, Switch, Output, Connection, Level } from './types';

export function evaluateGate(type: GateType, inputs: boolean[]): boolean {
    switch (type) {
        case 'AND': return inputs.every(i => i);
        case 'OR': return inputs.some(i => i);
        case 'NOT': return !inputs[0];
        case 'NAND': return !inputs.every(i => i);
        case 'NOR': return !inputs.some(i => i);
        case 'XOR': return inputs.reduce((a, b) => a !== b, false);
        default: return false;
    }
}

export function evaluateCircuit(
    gates: Gate[],
    switches: Switch[],
    outputs: Output[],
    connections: Connection[]
): { gateStates: Record<string, boolean>; outputStates: Record<string, boolean> } {
    const values: Record<string, boolean> = {};

    // 1. Initialize values from switches
    switches.forEach(s => {
        values[s.id] = s.state;
    });

    // 2. Propagate signals iteratively
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 50;

    // Initialize gate outputs to false initially if unknown
    gates.forEach(g => {
        if (values[g.id] === undefined) values[g.id] = false;
    });

    while (changed && iterations < MAX_ITERATIONS) {
        changed = false;
        iterations++;

        gates.forEach(gate => {
            const gateInputs: boolean[] = [];
            const inputCount = gate.type === 'NOT' ? 1 : 2;

            for (let i = 0; i < inputCount; i++) {
                const conn = connections.find(c => c.to === gate.id && c.toInputIndex === i);
                if (conn && values[conn.from] !== undefined) {
                    gateInputs.push(values[conn.from]);
                } else {
                    gateInputs.push(false);
                }
            }

            const newValue = evaluateGate(gate.type, gateInputs);
            if (values[gate.id] !== newValue) {
                values[gate.id] = newValue;
                changed = true;
            }
        });
    }

    // 3. Determine Output states
    const newOutputStates: Record<string, boolean> = {};
    outputs.forEach(out => {
        const conn = connections.find(c => c.to === out.id);
        if (conn && values[conn.from] !== undefined) {
            newOutputStates[out.id] = values[conn.from];
        } else {
            newOutputStates[out.id] = false;
        }
    });

    return {
        gateStates: values,
        outputStates: newOutputStates
    };
}

export const levels: Level[] = [
    {
        id: 1,
        title: "Power On",
        description: "Connect the switch to the light bulb to turn it on.",
        switches: [{ id: 'sw1', label: 'Power', type: 'toggle', x: 50, y: 150 }],
        outputs: [{ id: 'out1', label: 'Lamp', x: 550, y: 150 }],
        availableGates: [],
        goal: (switches, outputs) => outputs.find(o => o.id === 'out1')?.state === true
    },
    {
        id: 2,
        title: "Door Bell",
        description: "Use the push button to ring the bell (light the lamp).",
        switches: [{ id: 'btn1', label: 'Bell', type: 'pulse', x: 50, y: 150 }],
        outputs: [{ id: 'out1', label: 'Bell', x: 550, y: 150 }],
        availableGates: [],
        goal: (switches, outputs) => outputs.find(o => o.id === 'out1')?.state === true
    },
    {
        id: 3,
        title: "The Inverter",
        description: "Turn the light ON when the switch is OFF.",
        switches: [{ id: 'sw1', label: 'Input', type: 'toggle', x: 50, y: 150 }],
        outputs: [{ id: 'out1', label: 'Result', x: 550, y: 150 }],
        availableGates: ['NOT'],
        goal: (switches, outputs) => {
            const sw = switches.find(s => s.id === 'sw1');
            const out = outputs.find(o => o.id === 'out1');
            return sw?.state === false && out?.state === true;
        }
    },
    {
        id: 4,
        title: "Safety Lock (AND)",
        description: "Both switches must be ON to activate the machine.",
        switches: [
            { id: 'sw1', label: 'Key 1', type: 'toggle', x: 50, y: 100 },
            { id: 'sw2', label: 'Key 2', type: 'toggle', x: 50, y: 200 }
        ],
        outputs: [{ id: 'out1', label: 'Machine', x: 550, y: 150 }],
        availableGates: ['AND'],
        goal: (switches, outputs) => {
            const s1 = switches.find(s => s.id === 'sw1')?.state;
            const s2 = switches.find(s => s.id === 'sw2')?.state;
            const out = outputs.find(o => o.id === 'out1')?.state;
            return s1 === true && s2 === true && out === true;
        }
    },
    {
        id: 5,
        title: "Emergency Override (OR)",
        description: "Turn on the alarm if EITHER sensor is active.",
        switches: [
            { id: 'sw1', label: 'Sensor A', type: 'toggle', x: 50, y: 100 },
            { id: 'sw2', label: 'Sensor B', type: 'toggle', x: 50, y: 200 }
        ],
        outputs: [{ id: 'out1', label: 'Alarm', x: 550, y: 150 }],
        availableGates: ['OR'],
        goal: (switches, outputs) => {
            // Success if we can demonstrate OR behavior (just turning it on once is usually enough for a simple game)
            // But let's just say "Turn it on" is the goal.
            return outputs.find(o => o.id === 'out1')?.state === true;
        }
    },
    {
        id: 6,
        title: "Exclusive Access (XOR)",
        description: "The light should be ON only if the switches are DIFFERENT.",
        switches: [
            { id: 'sw1', label: 'A', type: 'toggle', x: 50, y: 100 },
            { id: 'sw2', label: 'B', type: 'toggle', x: 50, y: 200 }
        ],
        outputs: [{ id: 'out1', label: 'Light', x: 550, y: 150 }],
        availableGates: ['XOR'],
        goal: (switches, outputs) => {
             const s1 = switches.find(s => s.id === 'sw1')?.state;
             const s2 = switches.find(s => s.id === 'sw2')?.state;
             const out = outputs.find(o => o.id === 'out1')?.state;
             return s1 !== s2 && out === true;
        }
    }
];
