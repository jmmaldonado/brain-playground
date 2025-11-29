<script lang="ts">
    import { StorageService } from '$lib/services/storage';
    import { onMount } from 'svelte';
    import { Trophy, Palette, Zap } from 'lucide-svelte';
    import MixingLab from './MixingLab.svelte';
    import HarmonyWheel from './HarmonyWheel.svelte';

    type GameMode = 'mixing' | 'harmony' | null;

    interface GameState {
        totalScore: number;
        mixingLevel: number; // Just for prestige
        harmonyLevel: number;
    }

    let mode: GameMode = $state(null);
    let gameState: GameState = $state({
        totalScore: 0,
        mixingLevel: 1,
        harmonyLevel: 1
    });

    onMount(() => {
        const saved = StorageService.load<GameState>('color-theory');
        if (saved) gameState = saved;
    });

    function updateScore(points: number) {
        gameState.totalScore += points;
        StorageService.save('color-theory', gameState);
    }
</script>

<div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-xl shadow-lg text-white flex justify-between items-center">
        <h2 class="font-bold text-xl flex items-center gap-2">
            <Palette /> Chromatic Academy
        </h2>
        <div class="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
            <Trophy size={18} />
            <span class="font-mono font-bold">{gameState.totalScore} XP</span>
        </div>
    </div>

    <!-- Menu -->
    {#if mode === null}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <button
                onclick={() => mode = 'mixing'}
                class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center space-y-4 border-2 border-transparent hover:border-purple-200"
            >
                <div class="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Zap size={40} />
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">Mixing Lab</h3>
                    <p class="text-gray-500 mt-2">Mix primary colors to create new ones!</p>
                </div>
            </button>

            <button
                onclick={() => mode = 'harmony'}
                class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center space-y-4 border-2 border-transparent hover:border-blue-200"
            >
                <div class="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <span class="text-4xl">☯️</span>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">Harmony Wheel</h3>
                    <p class="text-gray-500 mt-2">Find opposites and bring balance!</p>
                </div>
            </button>
        </div>
    {:else}
        <!-- Game Area -->
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] relative">
            <button 
                onclick={() => mode = null}
                class="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 z-50 hover:bg-gray-100 rounded-full"
            >
                ← Back
            </button>

            <div class="pt-12 pb-8">
                {#if mode === 'mixing'}
                    <MixingLab onComplete={updateScore} />
                {:else if mode === 'harmony'}
                    <HarmonyWheel onComplete={updateScore} />
                {/if}
            </div>
        </div>
    {/if}
</div>
