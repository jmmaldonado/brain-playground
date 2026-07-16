<script lang="ts">
    import { tick } from 'svelte';
    import { ArrowRight, CheckCircle, Menu, Play, RefreshCw, Trash2, X } from 'lucide-svelte';
    import { StorageService } from '$lib/services/storage';
    import GateShape from '../logic-circuits/GateShape.svelte';
    import {
        addOrReplaceConnection,
        canCreateConnection,
        getGateInputCount,
        removeGateConnections,
        sameTerminal,
    } from '../logic-circuits/engine';
    import { GATE_HEIGHT, GATE_WIDTH, PORT_HEIGHT, PORT_WIDTH, getLevelBounds, getTerminalPosition, getWirePath } from '../logic-circuits/geometry';
    import { evaluateTruthTable, levels } from './logic';
    import type { Connection, GateType, PlacedGate, TerminalRef } from '../logic-circuits/types';

    interface Progress {
        unlockedLevelId: number;
        completedLevelIds: number[];
    }

    type SimulationResult = ReturnType<typeof evaluateTruthTable>[number];

    let currentLevelIndex = $state(0);
    let gates = $state<PlacedGate[]>([]);
    let connections = $state<Connection[]>([]);
    let selectedTerminal = $state<TerminalRef | null>(null);
    let selectedConnectionId = $state<string | null>(null);
    let selectedGateId = $state<string | null>(null);
    let draggingGateId = $state<string | null>(null);
    let simulationResults = $state<SimulationResult[] | null>(null);
    let showSuccessModal = $state(false);
    let showSidebar = $state(false);
    let progress = $state<Progress>({ unlockedLevelId: 1, completedLevelIds: [] });
    let panX = $state(0);
    let panY = $state(0);
    let zoom = $state(1);
    let isPanning = $state(false);
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let loadedLevelIndex = -1;
    let gameArea: HTMLDivElement | null = null;

    const currentLevel = $derived(levels[currentLevelIndex]);

    $effect(() => {
        const index = currentLevelIndex;
        if (loadedLevelIndex !== index) loadLevel(index);
    });

    function loadLevel(index: number) {
        loadedLevelIndex = index;
        gates = [];
        connections = [];
        selectedTerminal = null;
        selectedConnectionId = null;
        selectedGateId = null;
        simulationResults = null;
        showSuccessModal = false;
        void tick().then(frameBoard);
    }

    function loadProgress() {
        const saved = StorageService.load<Progress>('logic-gates', { unlockedLevelId: 1, completedLevelIds: [] });
        progress = saved ?? { unlockedLevelId: 1, completedLevelIds: [] };
        currentLevelIndex = Math.max(0, Math.min(levels.length - 1, (progress.unlockedLevelId ?? 1) - 1));
    }

    loadProgress();

    function saveProgress(nextProgress: Progress) {
        progress = nextProgress;
        StorageService.save('logic-gates', nextProgress);
    }

    function completeLevel() {
        const completedLevelIds = Array.from(new Set([...progress.completedLevelIds, currentLevel.id]));
        saveProgress({
            completedLevelIds,
            unlockedLevelId: Math.max(progress.unlockedLevelId, Math.min(levels.length, currentLevel.id + 1)),
        });
    }

    function runSimulation() {
        const results = evaluateTruthTable(currentLevel, gates, connections);
        simulationResults = results;
        showSuccessModal = results.every((result) => result.correct);
        if (showSuccessModal) {
            completeLevel();
            if (currentLevelIndex < levels.length - 1) {
                window.setTimeout(nextLevel, 750);
            }
        }
    }

    function frameBoard() {
        if (!gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        const bounds = getLevelBounds(currentLevel.inputs, currentLevel.outputs);
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;
        zoom = Math.max(0.58, Math.min(1, (rect.width - 32) / boundsWidth, (rect.height - 32) / boundsHeight));
        panX = (rect.width - boundsWidth * zoom) / 2 - bounds.minX * zoom;
        panY = Math.max(12, (rect.height - boundsHeight * zoom) / 2 - bounds.minY * zoom);
    }

    function setZoom(nextZoom: number) {
        const clamped = Math.max(0.5, Math.min(1.25, nextZoom));
        if (!gameArea) {
            zoom = clamped;
            return;
        }
        const rect = gameArea.getBoundingClientRect();
        const center = {
            x: (rect.width / 2 - panX) / zoom,
            y: (rect.height / 2 - panY) / zoom,
        };
        zoom = clamped;
        panX = rect.width / 2 - center.x * zoom;
        panY = rect.height / 2 - center.y * zoom;
    }

    function getWorldPoint(event: PointerEvent) {
        if (!gameArea) return { x: 0, y: 0 };
        const rect = gameArea.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left - panX) / zoom,
            y: (event.clientY - rect.top - panY) / zoom,
        };
    }

    function handleBoardPointerDown(event: PointerEvent) {
        const target = event.target as HTMLElement;
        if (target.closest('button,[role="button"]')) return;
        selectedTerminal = null;
        selectedConnectionId = null;
        selectedGateId = null;
        isPanning = true;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
    }

    function handlePointerMove(event: PointerEvent) {
        if (draggingGateId) {
            event.preventDefault();
            const point = getWorldPoint(event);
            gates = gates.map((gate) =>
                gate.id === draggingGateId
                    ? { ...gate, x: point.x - dragOffsetX, y: point.y - dragOffsetY }
                    : gate,
            );
            simulationResults = null;
            showSuccessModal = false;
            return;
        }

        if (isPanning) {
            event.preventDefault();
            panX += event.clientX - lastPointerX;
            panY += event.clientY - lastPointerY;
            lastPointerX = event.clientX;
            lastPointerY = event.clientY;
        }
    }

    function handlePointerUp() {
        draggingGateId = null;
        isPanning = false;
    }

    function addGate(type: GateType) {
        if (!gameArea) return;
        const rect = gameArea.getBoundingClientRect();
        const id = crypto.randomUUID();
        gates = [
            ...gates,
            {
                id,
                type,
                x: (rect.width / 2 - panX) / zoom - GATE_WIDTH / 2,
                y: (rect.height / 2 - panY) / zoom - GATE_HEIGHT / 2,
            },
        ];
        selectedGateId = id;
        selectedConnectionId = null;
        simulationResults = null;
        showSuccessModal = false;
        showSidebar = false;
    }

    function removeGate(id: string) {
        gates = gates.filter((gate) => gate.id !== id);
        connections = removeGateConnections(connections, id);
        selectedGateId = null;
        selectedTerminal = null;
        simulationResults = null;
        showSuccessModal = false;
    }

    function startGateDrag(event: PointerEvent, gate: PlacedGate) {
        if (event.button === 2) {
            event.preventDefault();
            removeGate(gate.id);
            return;
        }

        event.stopPropagation();
        const point = getWorldPoint(event);
        dragOffsetX = point.x - gate.x;
        dragOffsetY = point.y - gate.y;
        selectedGateId = gate.id;
        selectedConnectionId = null;
        draggingGateId = gate.id;
    }

    function tapTerminal(ref: TerminalRef) {
        selectedConnectionId = null;
        selectedGateId = null;

        if (!selectedTerminal) {
            selectedTerminal = ref;
            return;
        }

        if (sameTerminal(selectedTerminal, ref)) {
            selectedTerminal = null;
            return;
        }

        if (canCreateConnection(selectedTerminal, ref, gates, connections)) {
            connections = addOrReplaceConnection(connections, selectedTerminal, ref, gates);
            selectedTerminal = null;
            simulationResults = null;
            showSuccessModal = false;
            return;
        }

        selectedTerminal = ref;
    }

    function terminalIsSelected(ref: TerminalRef) {
        return selectedTerminal ? sameTerminal(selectedTerminal, ref) : false;
    }

    function terminalIsCompatible(ref: TerminalRef) {
        return !selectedTerminal || canCreateConnection(selectedTerminal, ref, gates, connections);
    }

    function terminalClass(ref: TerminalRef) {
        const selected = terminalIsSelected(ref);
        const compatible = terminalIsCompatible(ref);
        const base = ref.role === 'source' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-pink-500 bg-pink-50 text-pink-700';
        if (selected) return `${base} ring-4 ring-sky-200`;
        if (!compatible) return 'border-slate-200 bg-slate-100 text-slate-300 opacity-45';
        return `${base} hover:scale-105`;
    }

    function sourceRef(nodeId: string): TerminalRef {
        return { nodeId, role: 'source', index: 0 };
    }

    function sinkRef(nodeId: string, index = 0): TerminalRef {
        return { nodeId, role: 'sink', index };
    }

    function terminalPosition(ref: TerminalRef) {
        return getTerminalPosition(ref, gates, currentLevel.inputs, currentLevel.outputs);
    }

    function removeSelectedConnection() {
        if (!selectedConnectionId) return;
        connections = connections.filter((connection) => connection.id !== selectedConnectionId);
        selectedConnectionId = null;
        simulationResults = null;
        showSuccessModal = false;
    }

    function resetLevel() {
        loadLevel(currentLevelIndex);
    }

    function nextLevel() {
        if (currentLevelIndex < levels.length - 1) currentLevelIndex += 1;
    }
</script>

<div class="flex h-[calc(100vh-80px)] flex-col overflow-hidden bg-slate-50">
    <div class="z-20 flex items-center justify-between gap-3 border-b bg-white px-3 py-3 shadow-sm sm:px-5">
        <div class="flex min-w-0 items-center gap-2">
            <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
                aria-label="Toggle components"
                onclick={() => (showSidebar = !showSidebar)}>
                {#if showSidebar}<X size={22} />{:else}<Menu size={22} />{/if}
            </button>
            <div class="min-w-0">
                <h1 class="truncate text-lg font-black text-slate-900 sm:text-2xl">Level {currentLevel.id}: {currentLevel.title}</h1>
                <p class="line-clamp-2 text-xs text-slate-600 sm:text-sm">{currentLevel.description}</p>
            </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
            <select
                class="hidden rounded-md border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-700 sm:block"
                bind:value={currentLevelIndex}
                aria-label="Select level">
                {#each levels as level, index}
                    <option value={index}>Level {level.id}</option>
                {/each}
            </select>
            <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300" aria-label="Reset level" onclick={resetLevel}>
                <RefreshCw size={17} />
            </button>
            <button type="button" class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-black text-white hover:bg-blue-700" onclick={runSimulation}>
                <Play size={17} /><span class="hidden sm:inline">Test</span>
            </button>
        </div>
    </div>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
        <aside
            class={`sidebar absolute inset-y-0 left-0 z-30 w-52 border-r bg-white p-3 shadow-xl transition-transform md:relative md:block md:translate-x-0 md:shadow-none ${
                showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
            <h2 class="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Components</h2>
            <div class="grid gap-2">
                {#each currentLevel.availableGates as gateType}
                    <button
                        type="button"
                        class="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-left font-black text-slate-700 hover:border-blue-500 hover:bg-blue-50"
                        onclick={() => addGate(gateType)}>
                        Add {gateType}
                    </button>
                {/each}
            </div>
        </aside>

        <div
            class="relative min-w-0 flex-1 touch-none overflow-hidden bg-slate-50"
            bind:this={gameArea}
            onpointerdown={handleBoardPointerDown}
            onpointermove={handlePointerMove}
            onpointerup={handlePointerUp}
            onpointercancel={handlePointerUp}
            onpointerleave={handlePointerUp}
            role="application">
            <div
                class="absolute inset-0 pointer-events-none opacity-20"
                style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px; background-position: {panX}px {panY}px;">
            </div>

            <div class="absolute left-0 top-0 h-[560px] w-[760px]" style="transform: translate({panX}px, {panY}px) scale({zoom}); transform-origin: 0 0;">
                <svg class="absolute inset-0 h-full w-full overflow-visible">
                    {#each connections as connection}
                        {@const from = terminalPosition(connection.from)}
                        {@const to = terminalPosition(connection.to)}
                        <path
                            d={getWirePath(from, to)}
                            fill="none"
                            stroke={selectedConnectionId === connection.id ? '#0f172a' : '#64748b'}
                            stroke-width={selectedConnectionId === connection.id ? '5' : '3'}
                        />
                        <path
                            d={getWirePath(from, to)}
                            fill="none"
                            stroke="transparent"
                            stroke-width="24"
                            class="cursor-pointer"
                            role="button"
                            tabindex="0"
                            aria-label="Select wire"
                            onkeydown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    selectedConnectionId = connection.id;
                                    selectedTerminal = null;
                                    selectedGateId = null;
                                }
                            }}
                            onclick={() => {
                                selectedConnectionId = connection.id;
                                selectedTerminal = null;
                                selectedGateId = null;
                            }}
                        />
                    {/each}
                </svg>

                {#each currentLevel.inputs as input}
                    <div class="absolute" style="left: {input.x}px; top: {input.y}px; width: {PORT_WIDTH}px; height: {PORT_HEIGHT}px;">
                        <div class="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-sm font-black text-slate-700 shadow-sm">
                            <span>{input.label}</span>
                            <span class="text-xs text-slate-500">INPUT</span>
                        </div>
                    </div>
                    {@const ref = sourceRef(input.id)}
                    {@const pos = terminalPosition(ref)}
                    <button
                        type="button"
                        class={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm transition ${terminalClass(ref)}`}
                        style="left: {pos.x}px; top: {pos.y}px;"
                        aria-label={`${input.label} output terminal`}
                        onclick={() => tapTerminal(ref)}>
                        <span class="h-2 w-2 rounded-full bg-current opacity-70"></span>
                    </button>
                {/each}

                {#each currentLevel.outputs as output}
                    <div class="absolute" style="left: {output.x}px; top: {output.y}px; width: {PORT_WIDTH}px; height: {PORT_HEIGHT}px;">
                        <div class="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-slate-300 bg-white text-sm font-black text-slate-700 shadow-sm">
                            <span>{output.label}</span>
                            <span class="text-xs text-slate-500">OUTPUT</span>
                        </div>
                    </div>
                    {@const ref = sinkRef(output.id)}
                    {@const pos = terminalPosition(ref)}
                    <button
                        type="button"
                        class={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm transition ${terminalClass(ref)}`}
                        style="left: {pos.x}px; top: {pos.y}px;"
                        aria-label={`${output.label} input terminal`}
                        onclick={() => tapTerminal(ref)}>
                        <span class="h-2 w-2 rounded-full bg-current opacity-70"></span>
                    </button>
                {/each}

                {#each gates as gate (gate.id)}
                    <div
                        class={`absolute cursor-grab rounded-lg p-1 active:cursor-grabbing ${selectedGateId === gate.id ? 'ring-4 ring-sky-200' : ''}`}
                        style="left: {gate.x}px; top: {gate.y}px; width: {GATE_WIDTH}px; height: {GATE_HEIGHT}px;"
                        onpointerdown={(event) => startGateDrag(event, gate)}
                        oncontextmenu={(event) => event.preventDefault()}
                        role="button"
                        tabindex="0"
                        aria-label={`${gate.type} gate`}>
                        <GateShape type={gate.type} />
                    </div>
                    {#each Array.from({ length: getGateInputCount(gate.type) }) as _, index}
                        {@const ref = sinkRef(gate.id, index)}
                        {@const pos = terminalPosition(ref)}
                        <button
                            type="button"
                            class={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm transition ${terminalClass(ref)}`}
                            style="left: {pos.x}px; top: {pos.y}px;"
                            aria-label={`${gate.type} input ${index + 1}`}
                            onclick={() => tapTerminal(ref)}>
                            <span class="h-2 w-2 rounded-full bg-current opacity-70"></span>
                        </button>
                    {/each}
                    {@const ref = sourceRef(gate.id)}
                    {@const pos = terminalPosition(ref)}
                    <button
                        type="button"
                        class={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-sm transition ${terminalClass(ref)}`}
                        style="left: {pos.x}px; top: {pos.y}px;"
                        aria-label={`${gate.type} output`}
                        onclick={() => tapTerminal(ref)}>
                        <span class="h-2 w-2 rounded-full bg-current opacity-70"></span>
                    </button>
                {/each}

                {#if selectedGateId}
                    {@const gate = gates.find((candidate) => candidate.id === selectedGateId)}
                    {#if gate}
                        <button
                            type="button"
                            class="absolute inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-3 text-sm font-black text-white shadow-lg hover:bg-red-700"
                            style="left: {gate.x}px; top: {gate.y - 48}px;"
                            onclick={() => removeGate(gate.id)}>
                            <Trash2 size={16} /> Gate
                        </button>
                    {/if}
                {/if}

                {#if selectedConnectionId}
                    {@const connection = connections.find((candidate) => candidate.id === selectedConnectionId)}
                    {#if connection}
                        {@const from = terminalPosition(connection.from)}
                        {@const to = terminalPosition(connection.to)}
                        <button
                            type="button"
                            class="absolute inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-3 text-sm font-black text-white shadow-lg hover:bg-red-700"
                            style="left: {(from.x + to.x) / 2 - 48}px; top: {(from.y + to.y) / 2 - 48}px;"
                            onclick={removeSelectedConnection}>
                            <Trash2 size={16} /> Wire
                        </button>
                    {/if}
                {/if}
            </div>

            {#if selectedTerminal}
                <div class="absolute bottom-3 left-3 right-3 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-md sm:left-auto sm:right-3 sm:w-80">
                    Select a compatible {selectedTerminal.role === 'source' ? 'input' : 'output'} terminal to connect, or tap the board to cancel.
                </div>
            {/if}
            <div class="absolute right-3 top-3 z-20 flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button type="button" class="h-9 w-9 text-lg font-black text-slate-700 hover:bg-slate-50" aria-label="Zoom out" onclick={() => setZoom(zoom - 0.12)}>-</button>
                <div class="min-w-12 border-x border-slate-200 px-2 text-center text-xs font-black text-slate-600">{Math.round(zoom * 100)}%</div>
                <button type="button" class="h-9 w-9 text-lg font-black text-slate-700 hover:bg-slate-50" aria-label="Zoom in" onclick={() => setZoom(zoom + 0.12)}>+</button>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-2 border-t bg-white p-2 md:hidden">
        {#each currentLevel.availableGates as gateType}
            <button type="button" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-700" onclick={() => addGate(gateType)}>
                Add {gateType}
            </button>
        {/each}
    </div>

    <div class="h-44 overflow-y-auto border-t bg-white p-3 sm:h-52">
        <div class="mb-2 flex items-center justify-between gap-3">
            <h2 class="text-base font-black text-slate-900">Truth Table</h2>
            {#if showSuccessModal}
                <div class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                    <CheckCircle size={16} /> Complete
                </div>
            {/if}
        </div>
        <div class="flex flex-wrap gap-2">
            {#if simulationResults}
                {#each simulationResults as result, index}
                    <div class={`rounded-lg border px-3 py-2 text-sm ${result.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                        <div class="font-mono text-xs text-slate-500">Case {index + 1}</div>
                        <div class="font-black text-slate-800">{result.inputs.map((value) => (value ? '1' : '0')).join(' ')} -> {result.outputs.map((value) => (value ? '1' : '0')).join(' ')}</div>
                        <div class={`text-xs font-bold ${result.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                            {result.correct ? 'Match' : `Expected ${result.expected.map((value) => (value ? '1' : '0')).join(' ')}`}
                        </div>
                    </div>
                {/each}
            {:else}
                {#each currentLevel.truthTable as row}
                    <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        <span class="font-mono text-slate-700">{row.inputs.map((value) => (value ? '1' : '0')).join(' ')} -> {row.outputs.map((value) => (value ? '1' : '0')).join(' ')}</span>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>
