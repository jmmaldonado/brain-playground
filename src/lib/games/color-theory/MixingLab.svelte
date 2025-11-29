<script lang="ts">
    import { COLORS, MIXING_RECIPES, type ColorDef } from './data';
    import { RefreshCw, Beaker } from 'lucide-svelte';
    import { fly, fade, scale } from 'svelte/transition';

    interface Props {
        onComplete: (score: number) => void;
    }
    let { onComplete }: Props = $props();

    let targetColor: ColorDef = $state(COLORS['green']); // Default, will change
    let currentMix: string[] = $state([]);
    let mixResult: string | null = $state(null);
    let message = $state('Mix the colors to make the target!');
    let streak = $state(0);

    function startRound() {
        // Pick a random secondary color
        const secondaries = Object.values(COLORS).filter(c => c.type === 'secondary');
        targetColor = secondaries[Math.floor(Math.random() * secondaries.length)];
        currentMix = [];
        mixResult = null;
        message = `Can you make ${targetColor.name}?`;
    }

    function addColor(colorId: string) {
        if (currentMix.length >= 2 || mixResult) return;
        currentMix = [...currentMix, colorId];
        
        if (currentMix.length === 2) {
            checkMix();
        }
    }

    function checkMix() {
        const recipe = MIXING_RECIPES.find(r => 
            (r.inputs[0] === currentMix[0] && r.inputs[1] === currentMix[1]) ||
            (r.inputs[0] === currentMix[1] && r.inputs[1] === currentMix[0])
        );

        if (recipe) {
            mixResult = recipe.output;
            if (mixResult === targetColor.id) {
                message = 'Perfect! You are a Color Wizard! 🧙‍♂️';
                streak++;
                setTimeout(() => {
                    onComplete(10 * streak);
                    startRound();
                }, 1500);
            } else {
                message = `Oops! That made ${COLORS[mixResult].name}. Try again!`;
                streak = 0;
                setTimeout(() => {
                    currentMix = [];
                    mixResult = null;
                }, 1500);
            }
        } else {
            // Should theoretically not happen with only 3 primaries unless we add more later
            mixResult = 'mud'; // Conceptual brown/mud
            message = 'Yuck! That made a mess. 🧹';
            streak = 0;
             setTimeout(() => {
                currentMix = [];
                mixResult = null;
            }, 1500);
        }
    }

    startRound();
</script>

<div class="flex flex-col items-center gap-4 md:gap-8 max-w-lg mx-auto p-4">
    <div class="text-center space-y-1 md:space-y-2">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">Mixing Lab 🧪</h2>
        <p class="text-sm md:text-base text-gray-600 h-6">{message}</p>
    </div>

    <!-- The Cauldron / Mix Result -->
    <div class="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
        <!-- Beaker Container -->
        <div class="absolute inset-0 bg-gray-200 rounded-full border-4 border-gray-300 shadow-inner overflow-hidden">
             <!-- Liquid -->
             {#if currentMix.length > 0}
                <div 
                    class="absolute inset-0 transition-colors duration-500 flex items-end justify-center"
                    style="background-color: {mixResult ? COLORS[mixResult]?.hex || '#5D4037' : COLORS[currentMix[0]].hex}"
                >
                    <!-- Bubbles animation could go here -->
                    <div class="w-full h-full opacity-30 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
             {/if}
        </div>

        <!-- Target Hint (Floating above) -->
        <div class="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-white p-1.5 md:p-2 rounded-full shadow-lg border border-gray-100 z-10">
            <div class="text-[10px] md:text-xs text-gray-500 font-bold mb-1 text-center">Make</div>
            <div 
                class="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-gray-100"
                style="background-color: {targetColor.hex}"
            ></div>
        </div>
        
        <Beaker size={48} class="text-gray-400 z-10 opacity-20 md:w-16 md:h-16" />
    </div>

    <!-- Primary Colors (Ingredients) -->
    <div class="flex gap-4 md:gap-6 mt-4 md:mt-8">
        {#each Object.values(COLORS).filter(c => c.type === 'primary') as color}
            <button
                onclick={() => addColor(color.id)}
                disabled={currentMix.length >= 2}
                class="group relative flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div 
                    class="w-14 h-14 md:w-20 md:h-20 rounded-full shadow-lg border-4 border-white ring-2 ring-gray-100 transition-shadow group-hover:shadow-xl"
                    style="background-color: {color.hex}"
                ></div>
                <span class="font-bold text-sm md:text-base text-gray-700">{color.name}</span>
            </button>
        {/each}
    </div>

    <!-- Current Mix Indicators -->
    <div class="flex gap-2 h-8">
        {#each currentMix as mixId}
            <div in:scale class="w-6 h-6 rounded-full border border-white shadow-sm" style="background-color: {COLORS[mixId].hex}"></div>
        {/each}
        {#if currentMix.length === 0}
            <span class="text-gray-400 text-sm italic">Add 2 colors...</span>
        {/if}
    </div>
</div>
