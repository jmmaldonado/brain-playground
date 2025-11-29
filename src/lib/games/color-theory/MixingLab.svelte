<script lang="ts">
    import { COLORS, MIXING_RECIPES, type ColorDef } from './data';
    import { RefreshCw, Beaker, Star, ArrowUpCircle } from 'lucide-svelte';
    import { scale, fade, slide } from 'svelte/transition';

    interface Props {
        onComplete: (score: number) => void;
    }
    let { onComplete }: Props = $props();

    let level = $state(1);
    let targetColor: ColorDef = $state(COLORS['green']); 
    let currentMix: string[] = $state([]);
    let mixResult: string | null = $state(null);
    let message = $state('Mix the colors to make the target!');
    let streak = $state(0);
    let showLevelUp = $state(false);

    // Dynamic Ingredients based on Level
    let ingredients = $derived.by(() => {
        let base = ['red', 'yellow', 'blue'];
        if (level >= 2) base.push('white', 'black');
        if (level >= 2) base.push('orange'); // Needed for Brown in L2
        if (level >= 3) base.push('green', 'purple');
        return base.map(id => COLORS[id]);
    });

    function startRound() {
        // Filter recipes for current level
        const levelRecipes = MIXING_RECIPES.filter(r => r.level === level);
        const recipe = levelRecipes[Math.floor(Math.random() * levelRecipes.length)];
        
        targetColor = COLORS[recipe.output];
        currentMix = [];
        mixResult = null;
        message = `Level ${level}: Make ${targetColor.name}`;
    }

    function addColor(colorId: string) {
        if (currentMix.length >= 2 || mixResult) return;
        currentMix = [...currentMix, colorId];
        
        if (currentMix.length === 2) {
            checkMix();
        }
    }

    function checkMix() {
        // Find matching recipe (order independent)
        const recipe = MIXING_RECIPES.find(r => 
            (r.inputs[0] === currentMix[0] && r.inputs[1] === currentMix[1]) ||
            (r.inputs[0] === currentMix[1] && r.inputs[1] === currentMix[0])
        );

        if (recipe) {
            mixResult = recipe.output;
            if (mixResult === targetColor.id) {
                message = 'Perfect! You are a Color Wizard! 🧙‍♂️';
                streak++;
                
                // Score based on difficulty
                const points = 10 * level + (streak * 2);
                
                setTimeout(() => {
                    onComplete(points);
                    checkLevelProgression();
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
            mixResult = 'mud'; // Fallback
            message = 'Yuck! That made a mess. 🧹';
            streak = 0;
             setTimeout(() => {
                currentMix = [];
                mixResult = null;
            }, 1500);
        }
    }

    function checkLevelProgression() {
        // Simple progression: 3 correct in a row or just random chance after some success
        // Let's do: every 3 points on streak, try to level up if not max
        if (streak % 3 === 0 && level < 3) {
            level++;
            showLevelUp = true;
            setTimeout(() => {
                showLevelUp = false;
                startRound();
            }, 2000);
        } else {
            startRound();
        }
    }

    startRound();
</script>

<div class="flex flex-col items-center gap-4 md:gap-8 max-w-lg mx-auto p-4 relative">
    
    <!-- Level Up Overlay -->
    {#if showLevelUp}
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl" in:fade>
            <div class="text-center transform animate-bounce">
                <ArrowUpCircle size={64} class="text-yellow-500 mx-auto mb-4" />
                <h2 class="text-4xl font-bold text-purple-600">Level Up!</h2>
                <p class="text-xl text-gray-600">New ingredients unlocked!</p>
            </div>
        </div>
    {/if}

    <div class="text-center space-y-1 md:space-y-2">
        <div class="flex items-center justify-center gap-2 mb-2">
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Level {level}</span>
            <div class="flex text-yellow-400">
                {#each Array(streak > 5 ? 5 : streak) as _}
                    <Star size={16} fill="currentColor" />
                {/each}
            </div>
        </div>
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
                    style="background-color: {mixResult && COLORS[mixResult] ? COLORS[mixResult].hex : (COLORS[currentMix[0]] ? COLORS[currentMix[0]].hex : '#5D4037')}"
                >
                    <div class="w-full h-full opacity-30 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
             {/if}
        </div>

        <!-- Target Hint (Floating above) -->
        <div class="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-white p-1.5 md:p-2 rounded-full shadow-lg border border-gray-100 z-10 animate-pulse">
            <div 
                class="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-gray-100 shadow-sm"
                style="background-color: {targetColor.hex}"
                title="Target: {targetColor.name}"
            ></div>
        </div>
        
        <Beaker size={48} class="text-gray-400 z-10 opacity-20 md:w-16 md:h-16" />
    </div>

    <!-- Ingredients Grid -->
    <div class="grid grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-8">
        {#each ingredients as color}
            <button
                onclick={() => addColor(color.id)}
                disabled={currentMix.length >= 2}
                class="group relative flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div 
                    class="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md border-2 border-white ring-1 ring-gray-200 transition-shadow group-hover:shadow-lg"
                    style="background-color: {color.hex}; border-color: {color.id === 'white' ? '#e5e7eb' : 'white'}"
                ></div>
                <span class="text-xs md:text-sm font-medium text-gray-600 truncate w-full text-center">{color.name}</span>
            </button>
        {/each}
    </div>

    <!-- Current Mix Indicators -->
    <div class="flex gap-2 h-8 items-center mt-4">
        {#each currentMix as mixId}
            <div in:scale class="w-8 h-8 rounded-full border-2 border-white shadow-md" style="background-color: {COLORS[mixId].hex}"></div>
            {#if currentMix.indexOf(mixId) === 0 && currentMix.length > 1}
                <span class="text-gray-400 font-bold">+</span>
            {/if}
        {/each}
        {#if currentMix.length === 0}
            <span class="text-gray-400 text-sm italic">Select 2 ingredients...</span>
        {/if}
    </div>
</div>