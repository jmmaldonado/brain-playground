<script lang="ts">
    import { COLORS, type ColorDef } from './data';
    import { scale, fade } from 'svelte/transition';

    interface Props {
        onComplete: (score: number) => void;
    }
    let { onComplete }: Props = $props();

    let targetColor: ColorDef = $state(COLORS['red']);
    let message = $state('Find the opposite!');
    let streak = $state(0);
    let selectedId: string | null = $state(null);
    let showResult = $state(false);

    // Wheel ordering for visuals
    const wheelOrder = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    function startRound() {
        targetColor = Object.values(COLORS)[Math.floor(Math.random() * Object.values(COLORS).length)];
        message = `What is the opposite of ${targetColor.name}?`;
        selectedId = null;
        showResult = false;
    }

    function handleSelect(id: string) {
        if (showResult) return;
        selectedId = id;
        showResult = true;

        if (id === targetColor.complementary) {
            message = 'Correct! Harmony Achieved! ☯️';
            streak++;
             setTimeout(() => {
                onComplete(10 * streak);
                startRound();
            }, 1500);
        } else {
            message = 'Not quite! Opposites are across the wheel.';
            streak = 0;
            setTimeout(() => {
                showResult = false;
                selectedId = null;
            }, 1500);
        }
    }
    
    startRound();
</script>

<div class="flex flex-col items-center gap-4 md:gap-8 max-w-lg mx-auto p-4 overflow-hidden">
    <div class="text-center space-y-1 md:space-y-2">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">Harmony Wheel ☯️</h2>
        <p class="text-sm md:text-base text-gray-600 h-6">{message}</p>
    </div>

    <!-- Container with scale for mobile -->
    <div class="transform scale-[0.65] sm:scale-75 md:scale-100 origin-center">
        <div class="relative w-64 h-64">
            <!-- Center Target -->
            <div class="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full z-20 flex items-center justify-center shadow-lg border-4"
                 style="border-color: {targetColor.hex}">
                 <div class="text-center">
                     <span class="block text-xs text-gray-400 font-bold uppercase">Find</span>
                     <span class="block font-bold" style="color: {targetColor.hex}">Opposite</span>
                 </div>
            </div>

        <!-- Wheel Segments -->
        <div class="w-full h-full rounded-full overflow-hidden relative shadow-2xl border-4 border-white">
            {#each wheelOrder as colorId, i}
                {@const color = COLORS[colorId]}
                <!-- 
                    Creating wedges using conic-gradient or clip-path is tricky for interactivity.
                    Instead, we'll place absolute positioned buttons rotated around the center.
                -->
                <button
                    onclick={() => handleSelect(colorId)}
                    class="absolute w-24 h-24 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black/20"
                    style="
                        background-color: {color.hex};
                        top: 50%;
                        left: 50%;
                        margin-top: -3rem; 
                        margin-left: -3rem;
                        transform: rotate({i * 60}deg) translate(8rem) rotate(-{i * 60}deg);
                    "
                    aria-label={color.name}
                >
                    {#if showResult && (colorId === targetColor.complementary || colorId === selectedId)}
                         {#if colorId === targetColor.complementary}
                             <span in:scale class="text-2xl">✅</span>
                         {:else}
                             <span in:scale class="text-2xl">❌</span>
                         {/if}
                    {/if}
                </button>
            {/each}
            
            <!-- Connector Line (Visual Aid on success) -->
            {#if showResult && selectedId === targetColor.complementary}
                 <!-- Ideally we'd draw a line here, but simple UI feedback is enough for now -->
            {/if}
        </div>
    </div>
    </div>
    
    <div class="mt-12 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 max-w-xs text-center">
        💡 Tip: Opposite colors make each other look brighter when side-by-side!
    </div>
</div>
