import type { Component, Connection, CircuitState, ComponentWarning, LED, Resistor, Transistor, WaveformData, Battery, Switch } from './types';

/**
 * Improved circuit simulation with proper polarity checking and circuit validation
 */

export function evaluateCircuit(
    components: Component[],
    connections: Connection[]
): CircuitState {
    const warnings: ComponentWarning[] = [];
    const nodeVoltages: Record<string, number> = {};
    const componentCurrents: Record<string, number> = {};
    const componentVoltages: Record<string, number> = {};

    console.log('[Circuit] Evaluating with', components.length, 'components,', connections.length, 'connections');

    // Find battery
    const battery = components.find(c => c.type === 'battery') as Battery | undefined;
    if (!battery) {
        console.log('[Circuit] No battery found');
        return { nodeVoltages, componentCurrents, componentVoltages, warnings };
    }

    console.log('[Circuit] Battery:', battery.id, battery.voltage + 'V');

    // Find complete circuit paths from battery + to battery -
    const circuitPaths = findCompletePaths(battery, components, connections);

    console.log('[Circuit] Found', circuitPaths.length, 'complete circuit paths');

    // Analyze each path
    circuitPaths.forEach(path => {
        analyzePath(path, battery, components, connections, componentCurrents, componentVoltages, warnings);
    });

    console.log('[Circuit] Currents:', componentCurrents);
    console.log('[Circuit] Warnings:', warnings.length);

    return { nodeVoltages, componentCurrents, componentVoltages, warnings };
}

interface PathElement {
    componentId: string;
    fromTerminal: string;
    toTerminal: string;
}

function findCompletePaths(
    battery: Battery,
    components: Component[],
    connections: Connection[]
): PathElement[][] {
    const paths: PathElement[][] = [];

    console.log('[Circuit] Looking for connections from battery:', battery.id);
    console.log('[Circuit] All connections:', JSON.stringify(connections, null, 2));

    // Find all connections from battery positive terminal
    const startConnections = connections.filter(c => {
        const matches = c.from === battery.id && c.fromTerminal === 'pos';
        console.log(`[Circuit] Checking connection ${c.id}: from=${c.from}, fromTerminal=${c.fromTerminal}, matches=${matches}`);
        return matches;
    });

    console.log('[Circuit] Start connections:', startConnections.length);

    startConnections.forEach(startConn => {
        // Try to trace a path back to battery negative
        const path = tracePath(startConn, battery, components, connections, new Set());
        if (path && path.length > 0) {
            paths.push(path);
            console.log('[Circuit] Found path:', path.map(p => p.componentId).join(' → '));
        }
    });

    return paths;
}

function tracePath(
    currentConn: Connection,
    battery: Battery,
    components: Component[],
    connections: Connection[],
    visited: Set<string>
): PathElement[] | null {
    // Avoid infinite loops
    if (visited.has(currentConn.id)) return null;
    visited.add(currentConn.id);

    const currentComp = components.find(c => c.id === currentConn.to);
    if (!currentComp) return null;

    // Create path element for this component
    const pathElement: PathElement = {
        componentId: currentComp.id,
        fromTerminal: currentConn.toTerminal,
        toTerminal: '' // Will be filled when we find the exit connection
    };

    // Check if we've reached battery negative terminal
    const returnToBattery = connections.find(c =>
        c.from === currentComp.id &&
        c.to === battery.id &&
        c.toTerminal === 'neg'
    );

    if (returnToBattery) {
        // Complete circuit found!
        pathElement.toTerminal = returnToBattery.fromTerminal;
        return [pathElement];
    }

    // Continue tracing - find next connection
    const nextConnections = connections.filter(c =>
        c.from === currentComp.id &&
        !visited.has(c.id)
    );

    for (const nextConn of nextConnections) {
        pathElement.toTerminal = nextConn.fromTerminal;
        const restOfPath = tracePath(nextConn, battery, components, connections, new Set(visited));
        if (restOfPath) {
            return [pathElement, ...restOfPath];
        }
    }

    return null; // Dead end
}

function analyzePath(
    path: PathElement[],
    battery: Battery,
    components: Component[],
    connections: Connection[],
    componentCurrents: Record<string, number>,
    componentVoltages: Record<string, number>,
    warnings: ComponentWarning[]
) {
    // Calculate total resistance and check for issues
    let totalResistance = 0;
    let effectiveVoltage = battery.voltage;
    let circuitValid = true;
    const pathComponents: Component[] = [];

    path.forEach(element => {
        const comp = components.find(c => c.id === element.componentId);
        if (!comp) return;

        pathComponents.push(comp);

        if (comp.type === 'resistor') {
            totalResistance += (comp as Resistor).resistance;
        } else if (comp.type === 'led') {
            const led = comp as LED;

            // CHECK POLARITY - anode must be on the "from" side (positive)
            // cathode must be on the "to" side (negative)
            const isCorrectPolarity = element.fromTerminal === 'anode' && element.toTerminal === 'cathode';

            if (!isCorrectPolarity) {
                // LED is reversed - blocks current
                circuitValid = false;
                warnings.push({
                    componentId: comp.id,
                    type: 'reverse_bias',
                    message: 'LED is connected backwards and will not light up',
                    severity: 'info'
                });
                return;
            }

            totalResistance += 10; // LED dynamic resistance when on
            effectiveVoltage -= led.forwardVoltage;
        } else if (comp.type === 'switch') {
            const sw = comp as Switch;
            if (!sw.state) {
                circuitValid = false; // Open switch
            }
        } else if (comp.type === 'transistor') {
            const transistor = comp as Transistor;
            if (transistor.currentState === 'cutoff') {
                circuitValid = false;
            } else {
                totalResistance += 1; // Low resistance when on
                effectiveVoltage -= transistor.vce_sat;
            }
        }
    });

    if (!circuitValid || totalResistance === 0) {
        // No current flows
        pathComponents.forEach(comp => {
            componentCurrents[comp.id] = 0;
        });
        return;
    }

    // Calculate current using Ohm's law
    const current = Math.max(0, effectiveVoltage / totalResistance);

    console.log('[Circuit] Path current:', current, 'A (', (current * 1000).toFixed(1), 'mA)');

    // Apply current to all components in path
    pathComponents.forEach(comp => {
        componentCurrents[comp.id] = current;

        if (comp.type === 'resistor') {
            componentVoltages[comp.id] = current * (comp as Resistor).resistance;
        } else if (comp.type === 'led') {
            componentVoltages[comp.id] = (comp as LED).forwardVoltage;
        }
    });

    // Check for component damage
    checkComponentHealth(pathComponents, componentCurrents, componentVoltages, warnings);
}

function checkComponentHealth(
    components: Component[],
    componentCurrents: Record<string, number>,
    componentVoltages: Record<string, number>,
    warnings: ComponentWarning[]
) {
    components.forEach(comp => {
        const current = componentCurrents[comp.id] || 0;

        if (comp.type === 'led') {
            const led = comp as LED;
            if (current > led.maxCurrent) {
                warnings.push({
                    componentId: comp.id,
                    type: 'overcurrent',
                    message: `LED current (${(current * 1000).toFixed(1)}mA) exceeds maximum (${led.maxCurrent * 1000}mA)! Use a resistor!`,
                    severity: 'critical'
                });
            }
        } else if (comp.type === 'resistor') {
            const resistor = comp as Resistor;
            const power = current * current * resistor.resistance;
            if (power > resistor.maxPower) {
                warnings.push({
                    componentId: comp.id,
                    type: 'overpower',
                    message: `Resistor is overheating! (${power.toFixed(2)}W / ${resistor.maxPower}W)`,
                    severity: 'warning'
                });
            }
        }
    });
}

/**
 * Get terminal position for rendering wires
 */
export function getTerminalPosition(comp: Component, terminal: string): { x: number, y: number } {
    const baseX = comp.x;
    const baseY = comp.y;

    if (comp.type === 'battery') {
        if (terminal === 'pos') return { x: baseX + 30, y: baseY + 10 };
        if (terminal === 'neg') return { x: baseX + 30, y: baseY + 50 };
    } else if (comp.type === 'led') {
        if (terminal === 'anode') return { x: baseX + 10, y: baseY + 30 };
        if (terminal === 'cathode') return { x: baseX + 50, y: baseY + 30 };
    } else if (comp.type === 'resistor') {
        if (terminal === 'terminal1') return { x: baseX + 5, y: baseY + 30 };
        if (terminal === 'terminal2') return { x: baseX + 75, y: baseY + 30 };
    } else if (comp.type === 'switch') {
        if (terminal === 'terminal1') return { x: baseX + 10, y: baseY + 30 };
        if (terminal === 'terminal2') return { x: baseX + 70, y: baseY + 30 };
    } else if (comp.type === 'transistor') {
        if (terminal === 'collector') return { x: baseX + 50, y: baseY + 15 };
        if (terminal === 'base') return { x: baseX + 10, y: baseY + 40 };
        if (terminal === 'emitter') return { x: baseX + 50, y: baseY + 65 };
    } else if (comp.type === 'capacitor') {
        if (terminal === 'terminal1') return { x: baseX + 5, y: baseY + 30 };
        if (terminal === 'terminal2') return { x: baseX + 65, y: baseY + 30 };
    }

    // Default to center
    return { x: baseX + 30, y: baseY + 30 };
}

export function calculateLEDBrightness(current: number, maxCurrent: number): number {
    if (current <= 0) return 0;
    if (current >= maxCurrent) return 1;
    return Math.min(current / maxCurrent, 1);
}

export function evaluateTransistorState(
    transistor: Transistor,
    baseCurrent: number,
    collectorCurrent: number
): 'cutoff' | 'active' | 'saturation' {
    if (baseCurrent < 0.0001) return 'cutoff';
    const expectedCollectorCurrent = baseCurrent * transistor.beta;
    if (collectorCurrent >= expectedCollectorCurrent * 0.9) return 'saturation';
    return 'active';
}

export function generateWaveform(
    frequency: number,
    amplitude: number,
    duration: number = 0.01
): WaveformData {
    const sampleRate = 10000;
    const samples = Math.floor(duration * sampleRate);
    const time: number[] = [];
    const voltage: number[] = [];

    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        time.push(t);
        voltage.push(amplitude * Math.sin(2 * Math.PI * frequency * t));
    }

    return { time, voltage, frequency, period: 1 / frequency };
}
