import type { Level, CircuitState, Component } from './types';

/**
 * Level definitions for Analog Basics game
 * Progressive learning from simple LED circuit to oscillators
 */

export const levels: Level[] = [
    {
        id: 1,
        title: "First Light",
        description: "Connect a battery to an LED",
        objective: "Light up the LED (but watch out!)",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 5 } },
            { type: 'led', count: 1, defaultValue: { color: 'red' } }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            // LED should be lit, but this will burn it without a resistor
            const led = components.find(c => c.type === 'led');
            if (!led) return false;
            const current = state.componentCurrents[led.id] || 0;
            return current > 0;
        },
        hint: "Try connecting the battery directly to the LED. What happens?",
        enableOscilloscope: false
    },
    {
        id: 2,
        title: "Safe Current",
        description: "Protect your LED with a resistor",
        objective: "Light the LED safely using a current-limiting resistor",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 5 } },
            { type: 'led', count: 1, defaultValue: { color: 'red' } },
            { type: 'resistor', count: -1, defaultValue: { resistance: 220 } }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            const led = components.find(c => c.type === 'led');
            const resistor = components.find(c => c.type === 'resistor');
            if (!led || !resistor) return false;

            const ledCurrent = state.componentCurrents[led.id] || 0;
            const resistorCurrent = state.componentCurrents[resistor.id] || 0;

            // LED should be lit with safe current
            const hasCriticalWarning = state.warnings.some(w =>
                w.componentId === led.id && w.severity === 'critical'
            );

            // Check that resistor is actually in the circuit (has current)
            // and LED has safe current
            return ledCurrent > 0.001 && ledCurrent < 0.030 && resistorCurrent > 0.001 && !hasCriticalWarning;
        },
        hint: "Add a resistor in series with the LED to limit current. Try 220Ω or 470Ω.",
        enableOscilloscope: false
    },
    {
        id: 3,
        title: "Take Control",
        description: "Add a switch to control the LED",
        objective: "Build a circuit where you can turn the LED on and off",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 5 } },
            { type: 'led', count: 1, defaultValue: { color: 'green' } },
            { type: 'resistor', count: -1, defaultValue: { resistance: 220 } },
            { type: 'switch', count: 1 }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            const led = components.find(c => c.type === 'led');
            const switchComp = components.find(c => c.type === 'switch');
            if (!led || !switchComp) return false;

            const current = state.componentCurrents[led.id] || 0;
            const switchState = (switchComp as any).state;

            // When switch is on, LED should light up
            // When off, LED should be off
            return (switchState && current > 0) || (!switchState && current === 0);
        },
        hint: "Connect the switch in series with the battery, resistor, and LED.",
        enableOscilloscope: false
    },
    {
        id: 4,
        title: "Transistor Switch",
        description: "Use a transistor as an electronic switch",
        objective: "Control an LED using a transistor",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 9 } },
            { type: 'led', count: 1, defaultValue: { color: 'blue' } },
            { type: 'resistor', count: -1, defaultValue: { resistance: 220 } },
            { type: 'transistor', count: 1 },
            { type: 'switch', count: 1 }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            const led = components.find(c => c.type === 'led');
            const transistor = components.find(c => c.type === 'transistor');
            if (!led || !transistor) return false;

            const ledCurrent = state.componentCurrents[led.id] || 0;

            // Transistor should control the LED
            return ledCurrent > 0 && state.componentCurrents[transistor.id] !== undefined;
        },
        hint: "Connect the LED to the transistor's collector. Use the switch to control the base current.",
        enableOscilloscope: false
    },
    {
        id: 5,
        title: "Saturation Station",
        description: "Learn about transistor saturation",
        objective: "Fully saturate the transistor for maximum LED brightness",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 9 } },
            { type: 'led', count: 1, defaultValue: { voltage: 'yellow' } },
            { type: 'resistor', count: -1, defaultValue: { resistance: 220 } },
            { type: 'transistor', count: 1 }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            const transistor = components.find(c => c.type === 'transistor');
            if (!transistor) return false;

            const t = transistor as any;
            return t.currentState === 'saturation';
        },
        hint: "Provide enough base current to fully saturate the transistor. Try adjusting the base resistor value.",
        enableOscilloscope: false
    },
    {
        id: 6,
        title: "Blinky Lights",
        description: "Build an astable multivibrator (oscillator)",
        objective: "Create a circuit that makes the LED blink automatically",
        availableComponents: [
            { type: 'battery', count: 1, defaultValue: { voltage: 9 } },
            { type: 'led', count: 2, defaultValue: { color: 'red' } },
            { type: 'resistor', count: -1, defaultValue: { resistance: 1000 } },
            { type: 'transistor', count: 2 },
            { type: 'capacitor', count: 2, defaultValue: { capacitance: 0.00001 } }
        ],
        goalCheck: (state: CircuitState, components: Component[]) => {
            // For oscillator, we'd need time-domain simulation
            // Simplified: check if circuit has capacitors and transistors connected properly
            const hasCapacitors = components.filter(c => c.type === 'capacitor').length >= 2;
            const hasTransistors = components.filter(c => c.type === 'transistor').length >= 2;
            const hasLEDs = components.filter(c => c.type === 'led').length >= 1;

            return hasCapacitors && hasTransistors && hasLEDs;
        },
        hint: "This is an advanced circuit! Look up 'astable multivibrator' for a circuit diagram. It uses two transistors that alternately turn on and off.",
        enableOscilloscope: true
    }
];

export function getLevelById(id: number): Level | undefined {
    return levels.find(l => l.id === id);
}

export function getNextLevel(currentId: number): Level | undefined {
    return levels.find(l => l.id === currentId + 1);
}

export function getTotalLevels(): number {
    return levels.length;
}
