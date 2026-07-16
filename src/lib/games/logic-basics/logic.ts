import { evaluateCircuit as evaluateSharedCircuit, evaluateGate } from '../logic-circuits/engine';
import type { Connection, PlacedGate } from '../logic-circuits/types';
import type { BasicLevel } from './types';

export { evaluateGate };

export function evaluateCircuit(level: BasicLevel, gates: PlacedGate[], connections: Connection[], switchValues: Record<string, boolean>) {
    return evaluateSharedCircuit({ inputs: level.switches, outputs: level.outputs }, gates, connections, switchValues);
}

const x = {
    input: 40,
    output: 380,
};

export const levels: BasicLevel[] = [
    {
        id: 1,
        title: 'Power On',
        description: 'Connect the power switch to the lamp.',
        switches: [{ id: 'power', label: 'Power', type: 'toggle', x: x.input, y: 150 }],
        outputs: [{ id: 'lamp', label: 'Lamp', x: x.output, y: 150, kind: 'lamp' }],
        availableGates: [],
        truthTable: [
            { inputs: [false], outputs: [false] },
            { inputs: [true], outputs: [true] },
        ],
    },
    {
        id: 2,
        title: 'Door Bell',
        description: 'Use a push button to ring the bell only while it is pressed.',
        switches: [{ id: 'button', label: 'Button', type: 'pulse', x: x.input, y: 150 }],
        outputs: [{ id: 'bell', label: 'Bell', x: x.output, y: 150, kind: 'bell' }],
        availableGates: [],
        truthTable: [
            { inputs: [false], outputs: [false] },
            { inputs: [true], outputs: [true] },
        ],
    },
    {
        id: 3,
        title: 'The Inverter',
        description: 'Turn the lamp on when the switch is off.',
        switches: [{ id: 'input', label: 'Input', type: 'toggle', x: x.input, y: 150 }],
        outputs: [{ id: 'result', label: 'Result', x: x.output, y: 150, kind: 'lamp' }],
        availableGates: ['NOT'],
        truthTable: [
            { inputs: [false], outputs: [true] },
            { inputs: [true], outputs: [false] },
        ],
    },
    {
        id: 4,
        title: 'Safety Lock',
        description: 'Both keys must be on to activate the machine.',
        switches: [
            { id: 'key-a', label: 'Key A', type: 'toggle', x: x.input, y: 110 },
            { id: 'key-b', label: 'Key B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'machine', label: 'Machine', x: x.output, y: 160, kind: 'indicator' }],
        availableGates: ['AND'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [false] },
            { inputs: [true, false], outputs: [false] },
            { inputs: [true, true], outputs: [true] },
        ],
    },
    {
        id: 5,
        title: 'Emergency Override',
        description: 'Turn on the alarm if either sensor is active.',
        switches: [
            { id: 'sensor-a', label: 'Sensor A', type: 'toggle', x: x.input, y: 110 },
            { id: 'sensor-b', label: 'Sensor B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'alarm', label: 'Alarm', x: x.output, y: 160, kind: 'indicator' }],
        availableGates: ['OR'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [true] },
        ],
    },
    {
        id: 6,
        title: 'Exclusive Access',
        description: 'The light is on only when the switches are different.',
        switches: [
            { id: 'a', label: 'A', type: 'toggle', x: x.input, y: 110 },
            { id: 'b', label: 'B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'light', label: 'Light', x: x.output, y: 160, kind: 'lamp' }],
        availableGates: ['XOR'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] },
        ],
    },
    {
        id: 7,
        title: 'Quiet Room',
        description: 'The quiet light is on only when both noise sensors are off.',
        switches: [
            { id: 'noise-a', label: 'Noise A', type: 'toggle', x: x.input, y: 110 },
            { id: 'noise-b', label: 'Noise B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'quiet', label: 'Quiet', x: x.output, y: 160, kind: 'lamp' }],
        availableGates: ['NOR'],
        truthTable: [
            { inputs: [false, false], outputs: [true] },
            { inputs: [false, true], outputs: [false] },
            { inputs: [true, false], outputs: [false] },
            { inputs: [true, true], outputs: [false] },
        ],
    },
    {
        id: 8,
        title: 'Fail-Safe Alarm',
        description: 'The alarm is off only when both safety checks are active.',
        switches: [
            { id: 'safe-a', label: 'Safe A', type: 'toggle', x: x.input, y: 110 },
            { id: 'safe-b', label: 'Safe B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'alarm', label: 'Alarm', x: x.output, y: 160, kind: 'indicator' }],
        availableGates: ['NAND'],
        truthTable: [
            { inputs: [false, false], outputs: [true] },
            { inputs: [false, true], outputs: [true] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] },
        ],
    },
    {
        id: 9,
        title: 'Enable Button',
        description: 'The motor runs only while the button is pressed and the key is enabled.',
        switches: [
            { id: 'key', label: 'Key', type: 'toggle', x: x.input, y: 110 },
            { id: 'button', label: 'Button', type: 'pulse', x: x.input, y: 210 },
        ],
        outputs: [{ id: 'motor', label: 'Motor', x: x.output, y: 160, kind: 'indicator' }],
        availableGates: ['AND'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [false] },
            { inputs: [true, false], outputs: [false] },
            { inputs: [true, true], outputs: [true] },
        ],
    },
    {
        id: 10,
        title: 'Night Light',
        description: 'The lamp turns on only when enabled and daylight is off.',
        switches: [
            { id: 'enabled', label: 'Enabled', type: 'toggle', x: x.input, y: 100 },
            { id: 'daylight', label: 'Daylight', type: 'toggle', x: x.input, y: 220 },
        ],
        outputs: [{ id: 'lamp', label: 'Lamp', x: x.output, y: 160, kind: 'lamp' }],
        availableGates: ['AND', 'NOT'],
        truthTable: [
            { inputs: [false, false], outputs: [false] },
            { inputs: [false, true], outputs: [false] },
            { inputs: [true, false], outputs: [true] },
            { inputs: [true, true], outputs: [false] },
        ],
    },
    {
        id: 11,
        title: 'Armed Doors',
        description: 'Trigger the alarm when armed and either door is open.',
        switches: [
            { id: 'armed', label: 'Armed', type: 'toggle', x: x.input, y: 80 },
            { id: 'front', label: 'Front', type: 'toggle', x: x.input, y: 170 },
            { id: 'rear', label: 'Rear', type: 'toggle', x: x.input, y: 260 },
        ],
        outputs: [{ id: 'alarm', label: 'Alarm', x: x.output, y: 170, kind: 'indicator' }],
        availableGates: ['AND', 'OR'],
        truthTable: [
            { inputs: [false, false, false], outputs: [false] },
            { inputs: [false, false, true], outputs: [false] },
            { inputs: [false, true, false], outputs: [false] },
            { inputs: [false, true, true], outputs: [false] },
            { inputs: [true, false, false], outputs: [false] },
            { inputs: [true, false, true], outputs: [true] },
            { inputs: [true, true, false], outputs: [true] },
            { inputs: [true, true, true], outputs: [true] },
        ],
    },
    {
        id: 12,
        title: 'Safe / Unsafe Panel',
        description: 'Show green when both checks pass and red otherwise.',
        switches: [
            { id: 'check-a', label: 'Check A', type: 'toggle', x: x.input, y: 110 },
            { id: 'check-b', label: 'Check B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [
            { id: 'safe', label: 'Safe', x: x.output, y: 110, kind: 'indicator' },
            { id: 'unsafe', label: 'Unsafe', x: x.output, y: 210, kind: 'indicator' },
        ],
        availableGates: ['AND', 'NOT'],
        truthTable: [
            { inputs: [false, false], outputs: [false, true] },
            { inputs: [false, true], outputs: [false, true] },
            { inputs: [true, false], outputs: [false, true] },
            { inputs: [true, true], outputs: [true, false] },
        ],
    },
    {
        id: 13,
        title: 'Simple Security Panel',
        description: 'Sound the alarm when armed and a window or door is open.',
        switches: [
            { id: 'armed', label: 'Armed', type: 'toggle', x: x.input, y: 80 },
            { id: 'window', label: 'Window', type: 'toggle', x: x.input, y: 170 },
            { id: 'door', label: 'Door', type: 'toggle', x: x.input, y: 260 },
        ],
        outputs: [{ id: 'alarm', label: 'Alarm', x: x.output, y: 170, kind: 'indicator' }],
        availableGates: ['AND', 'OR'],
        truthTable: [
            { inputs: [false, false, false], outputs: [false] },
            { inputs: [false, false, true], outputs: [false] },
            { inputs: [false, true, false], outputs: [false] },
            { inputs: [false, true, true], outputs: [false] },
            { inputs: [true, false, false], outputs: [false] },
            { inputs: [true, false, true], outputs: [true] },
            { inputs: [true, true, false], outputs: [true] },
            { inputs: [true, true, true], outputs: [true] },
        ],
    },
    {
        id: 14,
        title: 'Dual Indicator Challenge',
        description: 'Light A for exactly one active sensor and B for both active.',
        switches: [
            { id: 'sensor-a', label: 'Sensor A', type: 'toggle', x: x.input, y: 110 },
            { id: 'sensor-b', label: 'Sensor B', type: 'toggle', x: x.input, y: 210 },
        ],
        outputs: [
            { id: 'exactly-one', label: 'A', x: x.output, y: 110, kind: 'indicator' },
            { id: 'both', label: 'B', x: x.output, y: 210, kind: 'indicator' },
        ],
        availableGates: ['AND', 'XOR'],
        truthTable: [
            { inputs: [false, false], outputs: [false, false] },
            { inputs: [false, true], outputs: [true, false] },
            { inputs: [true, false], outputs: [true, false] },
            { inputs: [true, true], outputs: [false, true] },
        ],
    },
];
