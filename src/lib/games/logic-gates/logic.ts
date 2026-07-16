import { evaluateCircuit as evaluateSharedCircuit, evaluateGate, evaluateTruthTable } from '../logic-circuits/engine';
import type { CircuitLevel, Connection, PlacedGate } from '../logic-circuits/types';

export { evaluateGate, evaluateTruthTable };

export function evaluateCircuit(level: CircuitLevel, gates: PlacedGate[], connections: Connection[], levelInputs: boolean[]): boolean[] {
    const inputValues = Object.fromEntries(level.inputs.map((input, index) => [input.id, levelInputs[index] ?? false]));
    const evaluation = evaluateSharedCircuit(level, gates, connections, inputValues);
    return level.outputs.map((output) => evaluation.outputStates[output.id] ?? false);
}

const x = {
    input: 40,
    output: 380,
};

const twoInputRows = (outputs: [boolean, boolean, boolean, boolean]) => [
    { inputs: [false, false], outputs: [outputs[0]] },
    { inputs: [false, true], outputs: [outputs[1]] },
    { inputs: [true, false], outputs: [outputs[2]] },
    { inputs: [true, true], outputs: [outputs[3]] },
];

export const levels: CircuitLevel[] = [
    {
        id: 1,
        title: 'The NOT Gate',
        description: 'Invert the signal.',
        inputs: [{ id: 'a', label: 'A', x: x.input, y: 160 }],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 160, required: true }],
        availableGates: ['NOT'],
        truthTable: [
            { inputs: [false], outputs: [true] },
            { inputs: [true], outputs: [false] },
        ],
    },
    {
        id: 2,
        title: 'The AND Gate',
        description: 'Output 1 only when both inputs are 1.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['AND'],
        truthTable: twoInputRows([false, false, false, true]),
    },
    {
        id: 3,
        title: 'The OR Gate',
        description: 'Output 1 when either input is 1.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['OR'],
        truthTable: twoInputRows([false, true, true, true]),
    },
    {
        id: 4,
        title: 'NAND Logic',
        description: 'Output 0 only when both inputs are 1.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['NAND'],
        truthTable: twoInputRows([true, true, true, false]),
    },
    {
        id: 5,
        title: 'XOR Logic',
        description: 'Output 1 only when inputs are different.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['XOR'],
        truthTable: twoInputRows([false, true, true, false]),
    },
    {
        id: 6,
        title: 'NOR Logic',
        description: 'Output 1 only when both inputs are 0.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['NOR'],
        truthTable: twoInputRows([true, false, false, false]),
    },
    {
        id: 7,
        title: 'XNOR Builder',
        description: 'Build equality: output 1 when A and B match.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'EQ', x: x.output, y: 170, required: true }],
        availableGates: ['XOR', 'NOT'],
        truthTable: twoInputRows([true, false, false, true]),
    },
    {
        id: 8,
        title: 'AND From NAND',
        description: 'Build an AND gate using only NAND gates.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['NAND'],
        truthTable: twoInputRows([false, false, false, true]),
    },
    {
        id: 9,
        title: 'OR From NAND',
        description: 'Build an OR gate using only NAND gates.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['NAND'],
        truthTable: twoInputRows([false, true, true, true]),
    },
    {
        id: 10,
        title: 'NOR From OR',
        description: 'Build NOR by combining OR and NOT.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['OR', 'NOT'],
        truthTable: twoInputRows([true, false, false, false]),
    },
    {
        id: 11,
        title: 'XOR From Basics',
        description: 'Build XOR using AND, OR, and NOT.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['AND', 'OR', 'NOT'],
        truthTable: twoInputRows([false, true, true, false]),
    },
    {
        id: 12,
        title: 'Half Adder',
        description: 'Build SUM and CARRY for adding one-bit inputs.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [
            { id: 'sum', label: 'SUM', x: x.output, y: 120, required: true },
            { id: 'carry', label: 'CARRY', x: x.output, y: 220, required: true },
        ],
        availableGates: ['XOR', 'AND'],
        truthTable: [
            { inputs: [false, false], outputs: [false, false] },
            { inputs: [false, true], outputs: [true, false] },
            { inputs: [true, false], outputs: [true, false] },
            { inputs: [true, true], outputs: [false, true] },
        ],
    },
    {
        id: 13,
        title: 'Selector 2:1',
        description: 'If S is 0, output A. If S is 1, output B.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 80 },
            { id: 'b', label: 'B', x: x.input, y: 170 },
            { id: 's', label: 'S', x: x.input, y: 260 },
        ],
        outputs: [{ id: 'q', label: 'Q', x: x.output, y: 170, required: true }],
        availableGates: ['AND', 'OR', 'NOT'],
        truthTable: [
            { inputs: [false, false, false], outputs: [false] },
            { inputs: [false, false, true], outputs: [false] },
            { inputs: [false, true, false], outputs: [false] },
            { inputs: [false, true, true], outputs: [true] },
            { inputs: [true, false, false], outputs: [true] },
            { inputs: [true, false, true], outputs: [false] },
            { inputs: [true, true, false], outputs: [true] },
            { inputs: [true, true, true], outputs: [true] },
        ],
    },
    {
        id: 14,
        title: 'Alarm Control',
        description: 'Output alarm when armed and door or motion is active.',
        inputs: [
            { id: 'door', label: 'Door', x: x.input, y: 80 },
            { id: 'motion', label: 'Motion', x: x.input, y: 170 },
            { id: 'armed', label: 'Armed', x: x.input, y: 260 },
        ],
        outputs: [{ id: 'alarm', label: 'Alarm', x: x.output, y: 170, required: true }],
        availableGates: ['AND', 'OR'],
        truthTable: [
            { inputs: [false, false, false], outputs: [false] },
            { inputs: [false, false, true], outputs: [false] },
            { inputs: [false, true, false], outputs: [false] },
            { inputs: [false, true, true], outputs: [true] },
            { inputs: [true, false, false], outputs: [false] },
            { inputs: [true, false, true], outputs: [true] },
            { inputs: [true, true, false], outputs: [false] },
            { inputs: [true, true, true], outputs: [true] },
        ],
    },
    {
        id: 15,
        title: 'Comparator',
        description: 'Build EQ and NE outputs for two inputs.',
        inputs: [
            { id: 'a', label: 'A', x: x.input, y: 120 },
            { id: 'b', label: 'B', x: x.input, y: 220 },
        ],
        outputs: [
            { id: 'eq', label: 'EQ', x: x.output, y: 120, required: true },
            { id: 'ne', label: 'NE', x: x.output, y: 220, required: true },
        ],
        availableGates: ['XOR', 'NOT'],
        truthTable: [
            { inputs: [false, false], outputs: [true, false] },
            { inputs: [false, true], outputs: [false, true] },
            { inputs: [true, false], outputs: [false, true] },
            { inputs: [true, true], outputs: [true, false] },
        ],
    },
];
