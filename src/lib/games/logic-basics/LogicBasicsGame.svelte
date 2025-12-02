<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { levels, evaluateCircuit } from './logic';
    import type { Gate, Switch, Output, Connection, Level, GateType } from './types';
    import GateComponent from './components/Gate.svelte';
    import SwitchComponent from './components/Switch.svelte';
    import OutputComponent from './components/Output.svelte';
    import { ArrowLeft, RefreshCw, CheckCircle, Menu, X, Zap } from 'lucide-svelte';

    // State
    let currentLevelIndex = $state(0);
    let gates = $state<Gate[]>([]);
    let switches = $state<Switch[]>([]);
    let outputs = $state<Output[]>([]);
    let connections = $state<Connection[]>([]);
    let draggingGateId = $state<string | null>(null);
    let gateStates = $state<Record<string, boolean>>({});
    
    // Connection State
    let selectedNode = $state<{ id: string, type: 'source' | 'sink', index?: number } | null>(null);
    let mouseX = $state(0);
    let mouseY = $state(0);
    let isLevelComplete = $state(false);
    let showSidebar = $state(false);
    let gameArea: HTMLDivElement | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    // Pan/Zoom State
    let panX = $state(0);
    let panY = $state(0);
    let isPanning = $state(false);
    let lastPanX = 0;
    let lastPanY = 0;

    let currentLevel = $derived(levels[currentLevelIndex]);

    $effect(() => {
        // Initialize level when index changes
        // We track currentLevelIndex, but untrack the loading logic to avoid 
        // infinite loops since loadLevel modifies state that it also reads (via updateCircuit)
        const idx = currentLevelIndex;
        untrack(() => loadLevel(idx));
    });

    function loadLevel(index: number) {
        const lvl = levels[index];
        gates = [];
        connections = [];
        
        // Deep copy switches and outputs to reset their state
        switches = lvl.switches.map(s => ({ ...s, state: false }));
        outputs = lvl.outputs.map(o => ({ ...o, state: false }));
        
        gateStates = {};
        isLevelComplete = false;
        selectedNode = null;
        
        updateCircuit();
    }

    function updateCircuit() {
        const result = evaluateCircuit(gates, switches, outputs, connections);
        gateStates = result.gateStates;
        
        // Update output states
        outputs = outputs.map(o => ({
            ...o,
            state: result.outputStates[o.id] || false
        }));

        // Check win condition
        if (!isLevelComplete && currentLevel.goal(switches, outputs)) {
            isLevelComplete = true;
        }
    }

    function toggleSwitch(id: string) {
        const sw = switches.find(s => s.id === id);
        if (sw) {
            if (sw.type === 'toggle') {
                sw.state = !sw.state;
            } else {
                // Pulse handled via mouse events separately if needed, 
                // but simpler for now: Click = Toggle for 'toggle', Hold not implemented yet
                // Let's implement Pulse logic here roughly: click = momentary 1?
                // Actually 'pulse' usually means press-hold-release.
                // For touch devices, toggle is easier. Let's make pulse act like a toggle for now or fix it.
                // Re-reading requirements: "push buttons with temporary behavior - 1 when pressing, 0 when released"
                // This requires mousedown/mouseup listeners on the switch component.
            }
            updateCircuit();
        }
    }
    
    // Pulse Switch Handlers
    function startPulse(id: string) {
         const sw = switches.find(s => s.id === id);
         if (sw && sw.type === 'pulse') {
             sw.state = true;
             updateCircuit();
         } else if (sw && sw.type === 'toggle') {
             toggleSwitch(id);
         }
    }
    
    function endPulse(id: string) {
         const sw = switches.find(s => s.id === id);
         if (sw && sw.type === 'pulse') {
             sw.state = false;
             updateCircuit();
         }
    }

    function addGate(type: GateType) {
        const id = crypto.randomUUID();
        gates = [...gates, { 
            id, 
            type, 
            x: 200 + Math.random() * 50, 
            y: 200 + Math.random() * 50 
        }];
        updateCircuit();
    }

    function removeGate(id: string) {
        gates = gates.filter(g => g.id !== id);
        connections = connections.filter(c => c.from !== id && c.to !== id);
        updateCircuit();
    }

    // --- Interaction ---

    function getCoords(e: MouseEvent | TouchEvent) {
        if (e instanceof MouseEvent) {
            return { clientX: e.clientX, clientY: e.clientY };
        } else if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: 0, clientY: 0 };
    }

    function updatePointerPos(e: MouseEvent | TouchEvent) {
        if (!gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        const coords = getCoords(e);
        
        // Raw mouse position relative to canvas container
        const rawX = coords.clientX - rect.left;
        const rawY = coords.clientY - rect.top;

        // Logical mouse position in the world (accounting for pan)
        mouseX = rawX - panX;
        mouseY = rawY - panY;
        
        if (draggingGateId) {
            e.preventDefault(); 
            const gate = gates.find(g => g.id === draggingGateId);
            if (gate) {
                gate.x = mouseX - dragOffsetX;
                gate.y = mouseY - dragOffsetY;
            }
        } else if (isPanning) {
            e.preventDefault();
            const dx = coords.clientX - lastPanX;
            const dy = coords.clientY - lastPanY;
            panX += dx;
            panY += dy;
            lastPanX = coords.clientX;
            lastPanY = coords.clientY;
        }
    }

    function handlePointerDown(e: MouseEvent | TouchEvent) {
         if (showSidebar && gameArea && !e.composedPath().some(el => (el as HTMLElement).classList?.contains('sidebar'))) {
            showSidebar = false;
        }
        
        // If clicking on background, start panning
        if (e.target === gameArea || (e.target as Element).tagName === 'svg') {
            selectedNode = null;
            isPanning = true;
            const coords = getCoords(e);
            lastPanX = coords.clientX;
            lastPanY = coords.clientY;
        }
    }

    function handlePointerUp() {
        draggingGateId = null;
        isPanning = false;
        
        // Also handle end of pulse if mouse up anywhere
        switches.forEach(s => {
            if (s.type === 'pulse' && s.state) {
                s.state = false;
                updateCircuit();
            }
        });
    }

    // Connection Logic
    function handleSourceClick(id: string) {
        if (selectedNode) {
            if (selectedNode.type === 'sink') {
                createConnection(id, selectedNode.id, selectedNode.index || 0);
                selectedNode = null;
            } else {
                selectedNode = { id, type: 'source' };
            }
        } else {
            selectedNode = { id, type: 'source' };
        }
    }

    function handleSinkClick(id: string, index: number) {
        if (selectedNode) {
            if (selectedNode.type === 'source') {
                createConnection(selectedNode.id, id, index);
                selectedNode = null;
            } else {
                selectedNode = { id, type: 'sink', index };
            }
        } else {
            selectedNode = { id, type: 'sink', index };
        }
    }

    function createConnection(fromId: string, toId: string, toInputIndex: number) {
        if (fromId === toId) return;
        // Remove existing connection to this input
        connections = connections.filter(c => !(c.to === toId && c.toInputIndex === toInputIndex));
        connections = [...connections, { from: fromId, to: toId, toInputIndex }];
        updateCircuit();
    }

    // Helpers for rendering connections
    // Helper to snap to grid if needed, or just return pos
    function getConnectorPos(id: string, isInput: boolean, index: number = 0): { x: number, y: number } {
        const sw = switches.find(s => s.id === id);
        if (sw) return { x: sw.x + 90, y: sw.y + 20 }; // Switch output

        const out = outputs.find(o => o.id === id);
        if (out) return { x: out.x - 10, y: out.y + 25 }; // Output input

        const gate = gates.find(g => g.id === id);
        if (gate) {
            if (isInput) {
                if (gate.type === 'NOT') return { x: gate.x + 15, y: gate.y + 30 };
                return { x: gate.x + 10, y: gate.y + (index === 0 ? 15 : 45) };
            } else {
                 const hasBubble = ['NOT', 'NAND', 'NOR'].includes(gate.type);
                 let offsetX = 60;
                 if (hasBubble) offsetX = 68;
                 else if (gate.type === 'XOR') offsetX = 62;
                 return { x: gate.x + offsetX, y: gate.y + 30 };
            }
        }
        return { x: 0, y: 0 };
    }
    
    function resetLevel() {
        loadLevel(currentLevelIndex);
    }
    
    function nextLevel() {
        if (currentLevelIndex < levels.length - 1) {
            currentLevelIndex++;
        }
    }

</script>

<div class="flex flex-col h-[calc(100vh-80px)] bg-slate-50 relative overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm z-10 sm:px-6 sm:py-4">
        <div class="flex items-center gap-2">
            <button class="md:hidden p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100" onclick={() => showSidebar = !showSidebar}>
                {#if showSidebar} <X size={24} /> {:else} <Menu size={24} /> {/if}
            </button>
            <div>
                <h1 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    Level {currentLevel.id}: {currentLevel.title}
                </h1>
                <p class="text-gray-600 text-xs sm:text-sm">{currentLevel.description}</p>
            </div>
        </div>
        <div class="flex gap-2">
            <button class="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm" onclick={resetLevel}>
                <RefreshCw size={16} /> <span class="hidden sm:inline">Reset</span>
            </button>
            {#if currentLevelIndex < levels.length - 1}
                <button 
                    class="btn px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 {isLevelComplete ? 'bg-green-600 hover:bg-green-700 text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}" 
                    onclick={nextLevel}
                    disabled={!isLevelComplete}
                >
                    <span class="hidden sm:inline">Next Level</span> <ArrowLeft class="rotate-180" size={16} />
                </button>
            {:else if isLevelComplete}
                 <button class="btn bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm shadow-md" onclick={() => alert("You are a Logic Master!")}>
                    <span class="hidden sm:inline">Finish</span> <CheckCircle size={16} />
                </button>
            {/if}
        </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <div 
            class="{`sidebar w-48 bg-white border-r p-4 flex-col gap-4 overflow-y-auto z-20 shadow-inner 
                    fixed h-full top-0 left-0 transition-transform duration-300 ease-in-out md:relative md:flex md:translate-x-0
                    ${showSidebar ? 'flex translate-x-0' : 'hidden -translate-x-full'}`}"
        >
            <h3 class="font-bold text-gray-700 mb-2">Components</h3>
            {#each currentLevel.availableGates as gateType}
                <button 
                    class="p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 text-sm"
                    onclick={() => addGate(gateType)}
                >
                    <div class="font-bold text-blue-600">{gateType}</div>
                    <span class="text-xs text-gray-500">Gate</span>
                </button>
            {/each}
            {#if currentLevel.availableGates.length === 0}
                <div class="text-gray-400 text-sm text-center italic mt-4">No components needed for this level. Just connect the wires!</div>
            {/if}
        </div>

        <!-- Canvas -->
        <div 
            class="flex-1 bg-slate-50 relative cursor-move overflow-hidden touch-none"
            bind:this={gameArea}
            onpointerdown={handlePointerDown}
            onpointermove={updatePointerPos}
            onpointerup={handlePointerUp}
            onpointerleave={handlePointerUp}
        >
             <!-- Grid Background (Static or Moving? Moving gives better feel of infinite canvas) -->
            <div class="absolute inset-0 opacity-10 pointer-events-none" 
                 style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px; background-position: {panX}px {panY}px;">
            </div>
            
            <!-- Panning Container -->
            <div style="transform: translate({panX}px, {panY}px); width: 100%; height: 100%; pointer-events: none;">

            <!-- SVG Layer for Wires -->
            <svg class="w-full h-full pointer-events-none absolute inset-0 overflow-visible">
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
                    </marker>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {#each connections as conn}
                    {@const fromPos = getConnectorPos(conn.from, false)}
                    {@const toPos = getConnectorPos(conn.to, true, conn.toInputIndex)}
                    {@const isActive = (switches.find(s=>s.id===conn.from)?.state) || (gateStates[conn.from])}
                    
                    <!-- Wire Glow -->
                    {#if isActive}
                         <path 
                            d={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                            fill="none" 
                            stroke="#60a5fa" 
                            stroke-width="6"
                            class="opacity-50"
                            filter="url(#glow)"
                        />
                    {/if}

                    <!-- Wire Line -->
                    <path 
                        d={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                        fill="none" 
                        stroke={isActive ? "#3b82f6" : "#94a3b8"}
                        stroke-width="3"
                        marker-end={isActive ? "" : "url(#arrowhead)"}
                    />
                {/each}

                <!-- Active Selection -->
                {#if selectedNode}
                    {@const pos = getConnectorPos(selectedNode.id, selectedNode.type === 'sink', selectedNode.index)}
                    
                    <!-- Highlight Ring (Subtle) -->
                    <circle cx={pos.x} cy={pos.y} r="8" fill="none" stroke={selectedNode.type === 'source' ? '#3b82f6' : '#ec4899'} stroke-width="3" class="opacity-80" />
                {/if}
            </svg>
            
            <!-- Components Layer -->
            <div class="absolute inset-0 w-full h-full pointer-events-none">
                <svg class="w-full h-full overflow-visible">
                    {#each switches as sw (sw.id)}
                         <SwitchComponent 
                            label={sw.label}
                            type={sw.type}
                            x={sw.x}
                            y={sw.y}
                            state={sw.state}
                            onToggle={() => startPulse(sw.id)}
                            onOutputClick={() => handleSourceClick(sw.id)}
                         />
                    {/each}

                    {#each outputs as out (out.id)}
                        <OutputComponent 
                            label={out.label}
                            x={out.x}
                            y={out.y}
                            state={out.state}
                            onInputClick={() => handleSinkClick(out.id, 0)}
                        />
                    {/each}

                    {#each gates as gate (gate.id)}
                        <GateComponent 
                            type={gate.type} 
                            x={gate.x} 
                            y={gate.y}
                            state={gateStates[gate.id]}
                            onPointerDown={(e: PointerEvent) => {
                                 if(e.button === 2) { 
                                    e.preventDefault();
                                    removeGate(gate.id);
                                    return;
                                 }
                                 const rect = (e.target as Element).closest('svg')?.getBoundingClientRect();
                                 if(rect) {
                                    const coords = getCoords(e);
                                    dragOffsetX = coords.clientX - rect.left - gate.x;
                                    dragOffsetY = coords.clientY - rect.top - gate.y;
                                 }
                                 draggingGateId = gate.id; 
                            }}
                            onInputClick={(idx) => handleSinkClick(gate.id, idx)}
                            onOutputClick={() => handleSourceClick(gate.id)}
                        />
                    {/each}
                </svg>
            </div>
            
            </div> <!-- End Panning Container -->
        </div>
    </div>

    <!-- Visual Celebration (Non-blocking) -->
    {#if isLevelComplete}
        <div class="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
            <div class="bg-green-100 border-2 border-green-500 text-green-700 px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-500">
                <CheckCircle size={20} />
                <span class="font-bold">Level Complete!</span>
            </div>
        </div>
    {/if}
</div>
