<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Box, Hand, PlayCircle, History, Clock, Trash2 } from 'lucide-svelte';
    import confetti from 'canvas-confetti';
    import { StorageService } from '$lib/services/storage';

    interface HistoryItem {
        time: number;
        date: string;
    }

    let startTime = $state(0);
    let currentTime = $state(0);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let isRunning = $state(false);
    let leftActive = $state(false);
    let rightActive = $state(false);
    let wakeLock: WakeLockSentinel | null = null;
    let history = $state<HistoryItem[]>([]);
    let showResult = $state(false);
    let isNewRecord = $state(false);

    // Derived state
    let bestTime = $derived(history.length > 0 ? Math.min(...history.map(h => h.time)) : Infinity);
    let displayTime = $derived(isRunning ? currentTime : (showResult ? currentTime : 0)); // Determine what to show

    // Constants
    const STORAGE_KEY = 'cube-timer-history';

    onMount(() => {
        const savedHistory = StorageService.load<HistoryItem[]>(STORAGE_KEY);
        if (savedHistory) {
            history = savedHistory;
        }

        // Re-acquire wake lock on visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
        releaseWakeLock();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    const handleVisibilityChange = async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    };

    // Time formatting
    function formatTime(ms: number): string {
        if (ms === Infinity) return "00.000";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);

        const mStr = minutes > 0 ? `${minutes}:` : '';
        const sStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString().padStart(2, '0');
        const msStr = milliseconds.toString().padStart(3, '0');

        return `${mStr}${sStr}.${msStr}`;
    }

    // Wake Lock
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.error(`Wake Lock error: ${err}`);
            }
        }
    }

    function releaseWakeLock() {
        if (wakeLock !== null) {
            wakeLock.release();
            wakeLock = null;
        }
    }

    // Timer Logic
    function updateDisplay() {
        currentTime = Date.now() - startTime;
    }

    async function startTimer() {
        if (isRunning) return;
        isRunning = true;
        showResult = false;
        startTime = Date.now();
        currentTime = 0;
        
        await requestWakeLock();
        
        timerInterval = setInterval(updateDisplay, 10);
    }

    function stopTimer() {
        if (!isRunning) return;
        
        if (timerInterval) clearInterval(timerInterval);
        isRunning = false;
        releaseWakeLock();

        const finalMs = currentTime; // Current time is already updated
        
        const currentBest = bestTime;
        isNewRecord = finalMs < currentBest;

        showResult = true;

        if (isNewRecord && history.length > 0) {
            confetti({
                particleCount: 200,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#EAB308', '#FFFFFF', '#3B82F6']
            });
        }
        
        saveResult(finalMs);
    }

    function saveResult(ms: number) {
        const entry: HistoryItem = {
            time: ms,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        // Use spread to trigger reactivity if needed, though $state handles array mutation better in Svelte 5
        history = [entry, ...history];
        StorageService.save(STORAGE_KEY, history);
    }

    function resetApp() {
        showResult = false;
        isNewRecord = false;
        currentTime = 0;
        leftActive = false;
        rightActive = false;
    }

    function clearAllData() {
        if (confirm("¿Deseas eliminar permanentemente todo el historial y récords?")) {
            StorageService.save(STORAGE_KEY, []); // Or clear specific key
            history = [];
            resetApp();
        }
    }

    // Touch/Interaction Logic
    function handleTouchStart(hand: 'left' | 'right', e: Event) {
        // e.preventDefault(); // Prevent default if needed, but handled by touch-action: none usually
        if (isRunning) return;
        if (hand === 'left') leftActive = true;
        if (hand === 'right') rightActive = true;
    }

    function handleTouchEnd(e: Event) {
        if (isRunning) return;
        
        // If both hands were active and one is lifted, start!
        if (leftActive && rightActive) {
            leftActive = false;
            rightActive = false;
            startTimer();
        } else {
            // Just reset if not ready
            leftActive = false;
            rightActive = false;
        }
    }

    function handleStopInteraction(e: Event) {
        if (isRunning) {
            e.preventDefault();
            stopTimer();
        }
    }

</script>

<div class="bg-gray-900 text-white min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden font-mono select-none">
    <!-- Header -->
    <header class="p-4 flex justify-between items-center border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm z-20">
        <h1 class="text-lg font-bold flex items-center gap-2">
            <Box class="text-blue-500" /> CubeTimer <span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">V2.0</span>
        </h1>
        <div class="text-right">
            <p class="text-[10px] text-gray-500 uppercase tracking-widest">Mejor Tiempo (PB)</p>
            <p class="text-lg font-bold text-yellow-500">{formatTime(bestTime)}</p>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center relative p-6">
        
        {#if !showResult}
            <!-- Timer View -->
            <div class="flex flex-col items-center justify-center w-full text-center">
                <div class="text-7xl md:text-9xl font-bold mb-4 transition-colors {leftActive && rightActive ? 'text-[#22c55e]' : ''}">
                    {formatTime(currentTime)}
                </div>
                <div class="text-gray-500 text-sm mb-12 h-6 font-medium">
                    {#if isRunning}
                        ¡SUELTA EL CUBO PARA PARAR!
                    {:else if leftActive && rightActive}
                        ¡LISTO! LEVANTA PARA EMPEZAR
                    {:else if leftActive || rightActive}
                        ESPERANDO OTRA MANO...
                    {:else}
                        MANTÉN AMBAS MANOS PARA COMENZAR
                    {/if}
                </div>

                <!-- Touch Zones -->
                <div class="w-full max-w-xl grid grid-cols-2 gap-6 h-56 md:h-72 transition-opacity duration-200 {isRunning ? 'opacity-0 pointer-events-none' : 'opacity-100'}">
                    <!-- Left Zone -->
                    <div 
                        class="touch-zone border-2 border-dashed border-gray-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-gray-800/20 transition-all duration-100 {leftActive ? 'bg-green-500/40 border-green-500 scale-95' : ''}"
                        onmousedown={(e) => handleTouchStart('left', e)}
                        ontouchstart={(e) => handleTouchStart('left', e)}
                        onmouseup={handleTouchEnd}
                        ontouchend={handleTouchEnd}
                        role="button"
                        tabindex="0"
                        aria-label="Left hand zone"
                    >
                        <Hand class="w-12 h-12 text-gray-600" />
                        <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Izquierda</span>
                    </div>
                    
                    <!-- Right Zone -->
                    <div 
                        class="touch-zone border-2 border-dashed border-gray-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-gray-800/20 transition-all duration-100 {rightActive ? 'bg-green-500/40 border-green-500 scale-95' : ''}"
                        onmousedown={(e) => handleTouchStart('right', e)}
                        ontouchstart={(e) => handleTouchStart('right', e)}
                        onmouseup={handleTouchEnd}
                        ontouchend={handleTouchEnd}
                        role="button"
                        tabindex="0"
                        aria-label="Right hand zone"
                    >
                        <Hand class="w-12 h-12 text-gray-600" />
                        <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Derecha</span>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Result View -->
            <div class="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-30 p-6">
                {#if isNewRecord}
                    <div class="bg-yellow-500 text-gray-900 text-[10px] font-black px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase animate-pulse">
                        🏆 ¡NUEVO RÉCORD PERSONAL! 🏆
                    </div>
                {/if}
                <p class="text-gray-500 uppercase tracking-widest text-xs mb-2 font-bold">Tiempo de Resolución</p>
                <div class="text-7xl md:text-9xl font-bold text-white mb-12 tabular-nums">{formatTime(currentTime)}</div>
                
                <button 
                    onclick={resetApp}
                    class="flex items-center gap-3 bg-white text-gray-900 hover:bg-gray-200 px-12 py-5 rounded-2xl font-black transition-all active:scale-95 shadow-2xl"
                >
                    <PlayCircle /> SIGUIENTE RONDA
                </button>
            </div>
        {/if}

        <!-- Stop Overlay -->
        {#if isRunning}
            <div 
                class="fixed inset-0 z-50 bg-transparent cursor-pointer"
                onmousedown={handleStopInteraction}
                ontouchstart={handleStopInteraction}
                role="button"
                tabindex="0"
                aria-label="Stop timer overlay"
            ></div>
        {/if}
    </main>

    <!-- History Panel -->
    <div class="h-1/3 border-t border-gray-800 bg-black/40 p-6 overflow-y-auto no-scrollbar">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xs font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                <History class="w-4 h-4" /> Últimos Tiempos
            </h2>
            <button 
                onclick={clearAllData}
                class="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold uppercase flex items-center gap-1"
            >
                <Trash2 size={12} /> Limpiar Todo
            </button>
        </div>
        <div class="space-y-3 pb-12">
            {#if history.length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-gray-700">
                    <Clock class="w-8 h-8 mb-2 opacity-20" />
                    <p class="text-xs italic uppercase tracking-widest">Sin registros</p>
                </div>
            {:else}
                {#each history as item, idx (item.date + idx)}
                    {@const isBest = item.time === bestTime}
                    <div class="flex justify-between items-center bg-gray-800/40 p-4 rounded-2xl border {isBest ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-gray-800/50'}">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-black {isBest ? 'text-yellow-500' : 'text-gray-600'}">#{history.length - idx}</span>
                            <span class="text-xl font-bold font-mono {isBest ? 'text-yellow-500' : 'text-blue-400'}">{formatTime(item.time)}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-gray-600 block leading-tight font-bold">{item.date}</span>
                            {#if isBest}
                                <span class="text-[8px] text-yellow-500 uppercase font-black">Record</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>
