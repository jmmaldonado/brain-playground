<script lang="ts">
    import { onMount } from 'svelte';
    import { levels, evaluateCircuit } from './logic';
    import type { Gate, Connection, Level, GateType } from './types';
    import GateComponent from './components/Gate.svelte';
    import { ArrowLeft, Play, RefreshCw, CheckCircle, HelpCircle, Menu, X } from 'lucide-svelte';

    // State
    let currentLevelIndex = $state(0);
    let gates = $state<Gate[]>([]);
    let connections = $state<Connection[]>([]);
    let draggingGateId = $state<string | null>(null);
    // selectedNode tracks the first node tapped in a connection pair
    // type 'source' = Gate Output or Level Input
    // type 'sink' = Gate Input or Level Output
    let selectedNode = $state<{ id: string, type: 'source' | 'sink', index?: number, x: number, y: number } | null>(null); 
    let mouseX = $state(0);
    let mouseY = $state(0);
    let simulationResults = $state<{ correct: boolean, inputs: boolean[], outputs: boolean[], expected: boolean[] }[] | null>(null);
    let showSuccessModal = $state(false);
    let showSidebar = $state(false); // For mobile sidebar

    let currentLevel = $derived(levels[currentLevelIndex]);

    // Interaction Logic
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let gameArea: HTMLDivElement | null = null;

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
        mouseX = coords.clientX - rect.left;
        mouseY = coords.clientY - rect.top;
        
        if (draggingGateId) {
            e.preventDefault(); // Prevent scrolling while dragging
            const gate = gates.find(g => g.id === draggingGateId);
            if (gate) {
                gate.x = mouseX - dragOffsetX;
                gate.y = mouseY - dragOffsetY;
            }
        }
    }

    function handlePointerUp() {
        draggingGateId = null;
    }

    function addGate(type: GateType) {
        const id = crypto.randomUUID();
        gates = [...gates, { 
            id, 
            type, 
            x: 100 + Math.random() * 50, 
            y: 100 + Math.random() * 50, 
            inputs: [] 
        }];
    }

    function removeGate(id: string) {
        gates = gates.filter(g => g.id !== id);
        connections = connections.filter(c => c.from !== id && c.to !== id);
    }
    
    // Connection Logic - Bidirectional Tap to Connect
    
    // Called when clicking a Signal Source (Gate Output or Level Input)
    // type is 'gate' (gate output) or 'input' (level input) - kept for logic compatibility but treated as 'source' role
    function handleSourceClick(id: string, clientX: number, clientY: number) {
        if (!gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (selectedNode) {
            if (selectedNode.type === 'sink') {
                // Complete connection: Source (this) -> Sink (selected)
                // Source: id
                // Sink: selectedNode.id, selectedNode.index
                createConnection(id, selectedNode.id, selectedNode.index || 0);
                selectedNode = null;
            } else {
                // Was highlighting another source, switch to this one
                selectedNode = { id, type: 'source', x, y };
            }
        } else {
            // Select this source
            selectedNode = { id, type: 'source', x, y };
        }
    }

    // Called when clicking a Signal Sink (Gate Input or Level Output)
    function handleSinkClick(id: string, index: number, clientX: number, clientY: number) {
        if (!gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (selectedNode) {
            if (selectedNode.type === 'source') {
                // Complete connection: Source (selected) -> Sink (this)
                // Source: selectedNode.id
                // Sink: id, index
                createConnection(selectedNode.id, id, index);
                selectedNode = null;
            } else {
                // Was highlighting another sink, switch to this one
                selectedNode = { id, type: 'sink', index, x, y };
            }
        } else {
            // Select this sink
            selectedNode = { id, type: 'sink', index, x, y };
        }
    }

    function createConnection(fromId: string, toId: string, toInputIndex: number) {
        // Prevent self-connection (basic check)
        if (fromId === toId) return;

        // Remove existing connection to this input if any
        connections = connections.filter(c => !(c.to === toId && c.toInputIndex === toInputIndex));

        connections = [...connections, {
            from: fromId,
            to: toId,
            toInputIndex: toInputIndex
        }];
    }

    // Drawing connections
    function getConnectorPos(id: string, isInput: boolean, index: number = 0): { x: number, y: number } {
        // Check if it's a level input (Source)
        const levelInput = currentLevel.inputs.find(i => i.id === id);
        if (levelInput) return { x: levelInput.x + 20, y: levelInput.y }; 

        // Check if it's a level output (Sink)
        const levelOutput = currentLevel.outputs.find(o => o.id === id);
        if (levelOutput) return { x: levelOutput.x, y: levelOutput.y };

        // Check if it's a gate
        const gate = gates.find(g => g.id === id);
        if (gate) {
            if (isInput) { // Gate Input (Sink)
                if (gate.type === 'NOT') return { x: gate.x + 15, y: gate.y + 30 };
                return { x: gate.x + 10, y: gate.y + (index === 0 ? 15 : 45) };
            } else { // Gate Output (Source)
                const hasBubble = ['NOT', 'NAND', 'NOR'].includes(gate.type);
                if (hasBubble) return { x: gate.x + 68, y: gate.y + 30 };
                if (gate.type === 'XOR') return { x: gate.x + 62, y: gate.y + 30 };
                return { x: gate.x + 60, y: gate.y + 30 };
            }
        }
        
        return { x: 0, y: 0 };
    }

    function runSimulation() {
        if (!currentLevel.truthTable) return;

        const results = currentLevel.truthTable.map(testCase => {
            const actualOutputs = evaluateCircuit(currentLevel, gates, connections, testCase.inputs);
            
            // Compare actual vs expected
            const isCorrect = actualOutputs.every((val, i) => val === testCase.outputs[i]);
            return {
                correct: isCorrect,
                inputs: testCase.inputs,
                outputs: actualOutputs,
                expected: testCase.outputs
            };
        });

        simulationResults = results;
        
        if (results.every(r => r.correct)) {
            showSuccessModal = true;
        }
    }

    function nextLevel() {
        if (currentLevelIndex < levels.length - 1) {
            currentLevelIndex++;
            resetLevel();
        }
    }

    function resetLevel() {
        gates = [];
        connections = [];
        simulationResults = null;
        showSuccessModal = false;
    }

</script>

    <div 
        class="flex flex-col h-[calc(100vh-80px)] bg-slate-50 relative overflow-hidden"
        onpointerdown={(e) => { 
            // Close sidebar if clicking outside
            if (showSidebar && gameArea && !e.composedPath().some(el => (el as HTMLElement).classList?.contains('sidebar'))) {
                showSidebar = false;
            }
            // Deselect if clicking on empty space
            if (e.target === gameArea || (e.target as Element).tagName === 'svg') {
                selectedNode = null;
            }
        }}
    >
    <!-- Header -->
        <div class="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm z-10 sm:px-6 sm:py-4">
            <div class="flex items-center gap-2">
                <!-- Toggle button visible only on small screens -->
                <button class="md:hidden p-2 -ml-2 rounded-md text-gray-700 hover:bg-gray-100" onclick={() => showSidebar = !showSidebar}>
                    {#if showSidebar}
                        <X size={24} />
                    {:else}
                        <Menu size={24} />
                    {/if}
                </button>
                <div>
                    <h1 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Level {currentLevel.id}: {currentLevel.title}
                    </h1>
                    <p class="text-gray-600 text-xs sm:text-sm">{currentLevel.description}</p>
                </div>
            </div>
            <div class="flex gap-2 sm:gap-4">
                 <button class="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 text-sm" onclick={resetLevel}>
                    <RefreshCw size={16} /> <span class="hidden sm:inline">Reset</span>
                </button>
                <button class="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 sm:px-6 sm:py-2 rounded-lg flex items-center gap-2 shadow-lg text-sm" onclick={runSimulation}>
                    <Play size={16} /> <span class="hidden sm:inline">Test Circuit</span>
                </button>
            </div>
        </div>

        <!-- Game Area -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Sidebar - Component Palette -->
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
                        <div class="w-12 h-10 relative">
                            <!-- Preview (Simplified) -->
                            <div class="text-xs font-bold text-center mt-2">{gateType}</div>
                        </div>
                        <span class="text-sm font-medium text-gray-600">Add {gateType}</span>
                    </button>
                {/each}
            </div>

        <!-- Canvas -->
        <div 
            class="flex-1 bg-slate-50 relative cursor-crosshair overflow-hidden"
            bind:this={gameArea}
            onpointermove={updatePointerPos}
            onpointerup={handlePointerUp}
            onpointerleave={handlePointerUp}
            role="application"
        >
             <!-- Grid Background -->
            <div class="absolute inset-0 opacity-10 pointer-events-none" 
                 style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px;">
            </div>

            <svg class="w-full h-full pointer-events-none">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                </defs>

                <!-- Connections -->
                {#each connections as conn}
                    {@const fromPos = (currentLevel.inputs.find(i => i.id === conn.from)) 
                        ? getConnectorPos(conn.from, false) // Level input is a source (output for connection purposes)
                        : getConnectorPos(conn.from, false) // Gate output is a source
                    }
                    {@const toPos = (currentLevel.outputs.find(o => o.id === conn.to)) 
                        ? getConnectorPos(conn.to, true, conn.toInputIndex) // Level output is a sink (input for connection purposes)
                        : getConnectorPos(conn.to, true, conn.toInputIndex) // Gate input is a sink
                    }
                    <path 
                        d={`M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                        fill="none" 
                        stroke="#64748b" 
                        stroke-width="3"
                        marker-end="url(#arrowhead)"
                    />
                {/each}

                <!-- Active Selection Highlight -->
                {#if selectedNode}
                    <!-- Calculate position for highlight -->
                    {@const pos = {x: selectedNode.x, y: selectedNode.y}}
                    
                    <!-- Pulse effect on selected node -->
                    <circle 
                        cx={pos.x} 
                        cy={pos.y} 
                        r="12" 
                        fill="none" 
                        stroke={selectedNode.type === 'source' ? '#3b82f6' : '#ec4899'} 
                        stroke-width="3" 
                        class="animate-pulse pointer-events-none" 
                    />
                    
                    <!-- Optional guide line to cursor/finger (visual aid) -->
                    <path 
                        d={`M ${pos.x} ${pos.y} C ${pos.x + (selectedNode.type === 'source' ? 50 : -50)} ${pos.y}, ${mouseX + (selectedNode.type === 'source' ? -50 : 50)} ${mouseY}, ${mouseX} ${mouseY}`}
                        fill="none" 
                        stroke={selectedNode.type === 'source' ? '#3b82f6' : '#ec4899'}
                        stroke-width="2" 
                        stroke-dasharray="5,5"
                        class="pointer-events-none opacity-40"
                    />
                {/if}
            </svg>
            
            <!-- Interactive Elements Layer (HTML/Svelte over SVG) -->
            <div class="absolute inset-0 pointer-events-none">
                <!-- Level Inputs -->
                {#each currentLevel.inputs as input}
                    <div 
                        class="absolute pointer-events-auto transform -translate-y-1/2"
                        style="left: {input.x}px; top: {input.y}px;"
                    >
                         <div class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-white border-2 border-gray-800 rounded flex items-center justify-center font-bold text-lg shadow-sm">
                                {input.label}
                            </div>
                            <div 
                                class={`w-8 h-8 sm:w-5 sm:h-5 border-2 rounded-full cursor-pointer pointer-events-auto transition-colors ${selectedNode?.id === input.id ? 'bg-blue-200 border-blue-500' : 'bg-gray-200 border-gray-400 hover:border-blue-500'}`}
                                onpointerdown={(e) => { e.stopPropagation(); handleSourceClick(input.id, e.clientX, e.clientY); }}
                                role="button"
                                tabindex="0"
                            ></div>
                        </div>
                    </div>
                {/each}

                 <!-- Level Outputs -->
                 {#each currentLevel.outputs as output}
                    <div 
                        class="absolute pointer-events-auto transform -translate-y-1/2 -translate-x-full"
                        style="left: {output.x}px; top: {output.y}px;"
                    >
                         <div class="flex items-center gap-2 flex-row-reverse">
                            <div class="w-10 h-10 bg-white border-2 border-gray-800 rounded flex items-center justify-center font-bold text-lg shadow-sm">
                                {output.label}
                                {#if output.required}
                                    <span class="absolute -top-2 -right-2 text-xs bg-yellow-400 text-yellow-900 px-1 rounded-full border border-yellow-500">Req</span>
                                {/if}
                            </div>
                            <div 
                                class="w-8 h-8 sm:w-5 sm:h-5 bg-gray-200 border-2 border-gray-400 rounded-full cursor-pointer pointer-events-auto hover:bg-blue-200 hover:border-blue-500 transition-colors"
                                onpointerdown={(e) => { e.stopPropagation(); handleSinkClick(output.id, 0, e.clientX, e.clientY); }}
                                role="button"
                                tabindex="0"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Gates SVG Layer -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none">
                {#each gates as gate (gate.id)}
                    <GateComponent 
                        type={gate.type} 
                        x={gate.x} 
                        y={gate.y}
                        onPointerDown={(e: PointerEvent) => {
                             if(e.button === 2) { // Right click for context menu (e.g., delete)
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
                        onInputClick={(idx, e: PointerEvent) => handleSinkClick(gate.id, idx, e.clientX, e.clientY)}
                        onOutputClick={(e: PointerEvent) => handleSourceClick(gate.id, e.clientX, e.clientY)}
                    />
                {/each}
            </svg>

        </div>
    </div>

    <!-- Truth Table / Results Panel -->
    <div class="bg-white border-t p-4 h-48 overflow-y-auto sm:h-60">
        <h3 class="font-bold text-gray-800 mb-2 text-lg">Truth Table</h3>
        {#if simulationResults}
            <div class="flex flex-wrap gap-3 sm:gap-4">
                {#each simulationResults as res, i}
                    <div class={`flex flex-col items-center p-2 rounded border ${res.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-xs sm:text-sm`}>
                        <div class="font-mono mb-1 text-gray-500">Case {i+1}</div>
                        <div class="flex gap-2 font-bold">
                             <div class="flex flex-col items-center">
                                <span class="text-xs text-gray-400">IN</span>
                                <span>{res.inputs.map(b => b ? '1' : '0').join(' ')}</span>
                            </div>
                            <div class="text-gray-300">→</div>
                            <div class="flex flex-col items-center">
                                <span class="text-xs text-gray-400">OUT</span>
                                <span class={res.correct ? 'text-green-700' : 'text-red-700'}>{res.outputs.map(b => b ? '1' : '0').join(' ')}</span>
                            </div>
                        </div>
                        <div class="text-xs mt-1 {res.correct ? 'text-green-600' : 'text-red-600'}">
                            {res.correct ? 'Match' : `Expected ${res.expected.map(b => b ? '1' : '0').join(' ')}`}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-gray-400 italic text-sm">Run simulation to see results.</div>
             <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2 opacity-50">
                 <!-- Preview of truth table requirements -->
                 {#if currentLevel.truthTable}
                     {#each currentLevel.truthTable as row}
                        <div class="border rounded p-1 text-xs text-center bg-gray-50">
                            {row.inputs.map(i=>i?'1':'0').join(' ')} → {row.outputs.map(o=>o?'1':'0').join(' ')}
                        </div>
                     {/each}
                 {/if}
             </div>
        {/if}
    </div>

    <!-- Success Modal -->
    {#if showSuccessModal}
        <div class="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform scale-100 transition-transform">
                <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Level Complete!</h2>
                <p class="text-gray-600 mb-6">You've successfully built the circuit!</p>
                <div class="flex justify-center gap-4">
                     <button class="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg" onclick={() => showSuccessModal = false}>
                        Stay Here
                    </button>
                    {#if currentLevelIndex < levels.length - 1}
                        <button class="btn bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg" onclick={nextLevel}>
                            Next Level <ArrowLeft class="rotate-180" size={18} />
                        </button>
                    {:else}
                         <button class="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg" onclick={() => alert("You finished all levels! Great job!")}>
                            Finish Game
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>
