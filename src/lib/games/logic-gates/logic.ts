import type { GateType, Gate, Connection, Level } from './types';

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
    level: Level, 
    gates: Gate[], 
    connections: Connection[], 
    levelInputs: boolean[]
): boolean[] {
    // 1. Map input values to their IDs
    const values: Record<string, boolean> = {};
    level.inputs.forEach((input, index) => {
        values[input.id] = levelInputs[index];
    });

    // 2. Topologically sort gates or just evaluate iteratively until stable (simplified approach for now: iterative max depth)
    // For a game, we might prevent cycles or just timeout.
    // Let's do a simple iterative propagation.
    
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 50; // Prevent infinite loops

    while (changed && iterations < MAX_ITERATIONS) {
        changed = false;
        iterations++;

        gates.forEach(gate => {
            // Find inputs for this gate
            const gateInputs: boolean[] = [];
            
            // Expected number of inputs
            const inputCount = gate.type === 'NOT' ? 1 : 2;

            for (let i = 0; i < inputCount; i++) {
                // Find connection to this input index
                const conn = connections.find(c => c.to === gate.id && c.toInputIndex === i);
                if (conn && values[conn.from] !== undefined) {
                    gateInputs.push(values[conn.from]);
                } else {
                    gateInputs.push(false); // Default to false if unconnected
                }
            }

            const newValue = evaluateGate(gate.type, gateInputs);
            if (values[gate.id] !== newValue) {
                values[gate.id] = newValue;
                changed = true;
            }
        });
    }

    // 3. Get output values
    return level.outputs.map(output => {
        // Find connection to this output
        // Outputs are treated as "sinks" that connect FROM a gate or input
        const conn = connections.find(c => c.to === output.id);
        if (conn && values[conn.from] !== undefined) {
            return values[conn.from];
        }
        return false;
    });
}

export const levels: Level[] = [
    {
        id: 1,
        title: "The NOT Gate",
        description: "Invert the signal! If the input is ON (1), the output should be OFF (0), and vice versa.",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 150 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['NOT'],
        truthTable: [
            { inputs: [false], outputs: [true] },
            { inputs: [true], outputs: [false] }
        ]
    },
    {
        id: 2,
        title: "The AND Gate",
        description: "Both inputs must be ON for the output to be ON.",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 100 }, { id: 'in2', label: 'B', x: 30, y: 200 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['AND'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [false] },
            { inputs: [true, false], outputs: [false] },
            { inputs: [true, true], outputs: [true] }
        ]
    },
    {
        id: 3,
        title: "The OR Gate",
        description: "If ANY input is ON, the output is ON.",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 100 }, { id: 'in2', label: 'B', x: 30, y: 200 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['OR'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [true] }
        ]
    },
    {
        id: 4,
        title: "NAND Logic",
        description: "It's NOT AND. The output is OFF only if both inputs are ON.",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 100 }, { id: 'in2', label: 'B', x: 30, y: 200 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['NAND'],
        truthTable: [
            { inputs: [false, false], outputs: [true] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] }
        ]
    },
     {
        id: 5,
        title: "XOR Logic",
        description: "Exclusive OR. The output is ON if the inputs are DIFFERENT.",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 100 }, { id: 'in2', label: 'B', x: 30, y: 200 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['XOR'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] }
        ]
    },
    {
        id: 6,
        title: "Combine Gates",
        description: "Make an OR gate using only NAND gates? (Just kidding, try to match the truth table)",
        inputs: [{ id: 'in1', label: 'A', x: 30, y: 100 }, { id: 'in2', label: 'B', x: 30, y: 200 }],
        outputs: [{ id: 'out1', label: 'Q', x: 320, y: 150, required: true }],
        availableGates: ['AND', 'OR', 'NOT'],
        truthTable: [ // XOR created from AND, OR, NOT
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] }
        ]
    }
];
