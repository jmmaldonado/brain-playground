<script lang="ts">
    import { onMount } from 'svelte';
    import { Zap, RefreshCw, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-svelte';
    import { StorageService } from '$lib/services/storage';
    import { evaluateCircuit, getTerminalPosition } from './simulation';
    import type { Component, Connection, CircuitState, Resistor, Battery } from './types';
    
    // UI Components
    import Meter from './components/Meter.svelte';
    import Slider from './components/Slider.svelte';
    
    // Component Renderers
    import BatteryComp from './components/Battery.svelte';
    import ResistorComp from './components/Resistor.svelte';

    // Scenarios
    const scenarios = [
        {
            id: 'ohms-law',
            title: "Ohm's Law",
            description: "Explore the relationship between Voltage, Current, and Resistance.",
            setup: () => {
                const battery: Component = { 
                    id: 'bat1', type: 'battery', x: 100, y: 200, 
                    voltage: 5 
                } as Battery;
                const resistor: Component = { 
                    id: 'res1', type: 'resistor', x: 300, y: 200, 
                    resistance: 500, maxPower: 0.5, currentPower: 0 
                } as Resistor;
                
                const components = [battery, resistor];
                const connections: Connection[] = [
                    { id: 'c1', from: 'bat1', fromTerminal: 'pos', to: 'res1', toTerminal: 'terminal1' },
                    { id: 'c2', from: 'res1', fromTerminal: 'terminal2', to: 'bat1', toTerminal: 'neg' }
                ];
                
                return { components, connections };
            }
        }
    ];

    let currentScenarioIndex = $state(0);
    let currentScenario = $derived(scenarios[currentScenarioIndex]);
    
    let components = $state<Component[]>([]);
    let connections = $state<Connection[]>([]);
    
    // Circuit State
    let circuitState = $state<CircuitState>({
        nodeVoltages: {},
        componentCurrents: {},
        componentVoltages: {},
        warnings: []
    });

    // Scenario 1 State
    let ohmsLawVoltage = $state(5);
    let ohmsLawResistance = $state(500);

    function loadScenario(index: number) {
        const scenario = scenarios[index];
        const setup = scenario.setup();
        components = setup.components;
        connections = setup.connections;
        
        // Reset scenario specific state
        if (scenario.id === 'ohms-law') {
            ohmsLawVoltage = 5;
            ohmsLawResistance = 500;
        }
        
        updateCircuit();
    }

    function updateCircuit() {
        // Update component values from state
        if (currentScenario.id === 'ohms-law') {
            const bat = components.find(c => c.id === 'bat1') as Battery;
            const res = components.find(c => c.id === 'res1') as Resistor;
            if (bat) bat.voltage = ohmsLawVoltage;
            if (res) res.resistance = ohmsLawResistance;
        }

        circuitState = evaluateCircuit(components, connections);
    }

    onMount(() => {
        loadScenario(0);
    });

    // Derived values for display
    const currentAmps = $derived(circuitState.componentCurrents['res1'] || 0);
    const resistorVoltage = $derived(circuitState.componentVoltages['res1'] || 0);

</script>

<div class="flex flex-col h-[calc(100vh-80px)] bg-slate-50">
    <!-- Header -->
    <div class="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Zap class="text-orange-500" />
                {currentScenario.title}
            </h1>
            <p class="text-gray-600">{currentScenario.description}</p>
        </div>
        <div class="flex gap-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg" onclick={() => loadScenario(currentScenarioIndex)}>
                <RefreshCw size={20} />
            </button>
        </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
        <!-- Left Panel: Controls & Meters -->
        <div class="w-80 bg-white border-r p-6 flex flex-col gap-8 overflow-y-auto shadow-lg z-10">
            
            <!-- Meters Section -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 class="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Measurements</h3>
                <div class="flex flex-col gap-4">
                    <Meter value={currentAmps} type="current" label="Current (I)" />
                    <Meter value={resistorVoltage} type="voltage" label="Voltage (V)" />
                </div>
            </div>

            <!-- Controls Section -->
            <div>
                <h3 class="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Controls</h3>
                <div class="flex flex-col gap-6">
                    <Slider 
                        label="Battery Voltage" 
                        value={ohmsLawVoltage} 
                        min={1} max={12} step={0.1} unit="V"
                        onChange={(v) => { ohmsLawVoltage = v; updateCircuit(); }}
                    />
                    <Slider 
                        label="Resistance" 
                        value={ohmsLawResistance} 
                        min={100} max={2000} step={10} unit="Ω"
                        onChange={(v) => { ohmsLawResistance = v; updateCircuit(); }}
                    />
                </div>
            </div>

            <!-- Explanation -->
            <div class="mt-auto bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900">
                <h4 class="font-bold mb-2">Ohm's Law: I = V / R</h4>
                <p>
                    Current ({currentAmps.toFixed(3)}A) equals Voltage ({resistorVoltage.toFixed(1)}V) 
                    divided by Resistance ({ohmsLawResistance}Ω).
                </p>
            </div>
        </div>

        <!-- Right Panel: Circuit Visualization -->
        <div class="flex-1 relative bg-slate-50">
            <svg class="w-full h-full" viewBox="0 0 600 400">
                <!-- Grid -->
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="#cbd5e1" opacity="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <!-- Wires -->
                {#each connections as conn}
                    {@const fromComp = components.find(c => c.id === conn.from)}
                    {@const toComp = components.find(c => c.id === conn.to)}
                    {#if fromComp && toComp}
                        {@const fromPos = getTerminalPosition(fromComp, conn.fromTerminal)}
                        {@const toPos = getTerminalPosition(toComp, conn.toTerminal)}
                        {@const current = circuitState.componentCurrents[conn.from] || 0}
                        
                        <path 
                            d={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                            fill="none" 
                            stroke={current > 0.0001 ? '#f97316' : '#94a3b8'} 
                            stroke-width="3"
                            stroke-linecap="round"
                            class="transition-colors duration-300"
                        />
                        
                        {#if current > 0.0001}
                            <circle r="3" fill="#fbbf24">
                                <animateMotion
                                    dur={`${Math.max(0.2, 2 - current * 50)}s`}
                                    repeatCount="indefinite"
                                    path={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                                />
                            </circle>
                        {/if}
                    {/if}
                {/each}

                <!-- Components -->
                {#each components as component}
                    <g transform="scale(1.5)" transform-origin="{component.x} {component.y}">
                        {#if component.type === 'battery'}
                            <BatteryComp battery={component as Battery} />
                        {:else if component.type === 'resistor'}
                            <ResistorComp resistor={component as Resistor} heatLevel={0} />
                        {/if}
                    </g>
                {/each}
            </svg>
        </div>
    </div>
</div>
