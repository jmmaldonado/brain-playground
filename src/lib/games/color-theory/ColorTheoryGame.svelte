<script lang="ts">
    import { StorageService } from "$lib/services/storage";
    import { onMount } from "svelte";
    import { Trophy, Palette, Zap, Sliders } from "lucide-svelte";
    import MixingLab from "./MixingLab.svelte";
    import HarmonyWheel from "./HarmonyWheel.svelte";
    import ColorMixer from "./ColorMixer.svelte";

    type GameMode = "mixing" | "harmony" | "mixer" | null;

    interface GameState {
        totalScore: number; // Kept for backward compatibility or grand total
        mixingScore: number;
        harmonyScore: number;
        matcherScore: number;
    }

    let mode: GameMode = $state(null);
    let gameState: GameState = $state({
        totalScore: 0,
        mixingScore: 0,
        harmonyScore: 0,
        matcherScore: 0,
    });

    onMount(() => {
        const saved = StorageService.load<GameState>("color-theory");
        if (saved) {
            // Migration/Safety check for new fields
            gameState = {
                totalScore: saved.totalScore || 0,
                mixingScore: saved.mixingScore || 0,
                harmonyScore: saved.harmonyScore || 0,
                matcherScore: saved.matcherScore || 0,
            };
        }
    });

    function updateScore(
        points: number,
        game: "mixing" | "harmony" | "matcher",
    ) {
        gameState.totalScore += points;
        if (game === "mixing") gameState.mixingScore += points;
        if (game === "harmony") gameState.harmonyScore += points;
        if (game === "matcher") gameState.matcherScore += points;

        StorageService.save("color-theory", gameState);
    }
</script>

<div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    {#if mode}
        <div
            class="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-xl shadow-lg text-white flex justify-between items-center">
            <h2 class="font-bold text-xl flex items-center gap-2">
                {#if mode === "mixing"}
                    <Zap /> Mixing Lab
                {:else if mode === "harmony"}
                    <span class="text-2xl">☯️</span> Harmony Wheel
                {:else if mode === "mixer"}
                    <Sliders /> Color Matcher
                {:else}
                    <Palette /> Chromatic Academy
                {/if}
            </h2>

            <div
                class="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                <Trophy size={18} />
                <span class="font-mono font-bold">
                    {#if mode === "mixing"}
                        {gameState.mixingScore} XP
                    {:else if mode === "harmony"}
                        {gameState.harmonyScore} XP
                    {:else if mode === "mixer"}
                        {gameState.matcherScore} XP
                    {/if}
                </span>
            </div>
        </div>
    {/if}

    <!-- Menu -->
    {#if mode === null}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <button
                onclick={() => (mode = "mixing")}
                class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center space-y-4 border-2 border-transparent hover:border-purple-200">
                <div
                    class="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Zap size={40} />
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">Mixing Lab</h3>
                    <p class="text-gray-500 mt-2">
                        Mix primary colors to create new ones!
                    </p>
                    <div
                        class="mt-3 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                        Score: {gameState.mixingScore}
                    </div>
                </div>
            </button>

            <button
                onclick={() => (mode = "harmony")}
                class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center space-y-4 border-2 border-transparent hover:border-blue-200">
                <div
                    class="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <span class="text-4xl">☯️</span>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">
                        Harmony Wheel
                    </h3>
                    <p class="text-gray-500 mt-2">
                        Find opposites and bring balance!
                    </p>
                    <div
                        class="mt-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        Score: {gameState.harmonyScore}
                    </div>
                </div>
            </button>

            <button
                onclick={() => (mode = "mixer")}
                class="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center space-y-4 border-2 border-transparent hover:border-green-200 md:col-span-2">
                <div
                    class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Sliders size={40} />
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800">
                        Color Matcher
                    </h3>
                    <p class="text-gray-500 mt-2">
                        Fine-tune your eyes by matching colors!
                    </p>
                    <div
                        class="mt-3 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        Score: {gameState.matcherScore}
                    </div>
                </div>
            </button>
        </div>
    {:else if mode !== null}
        <!-- Game Area -->
        <div
            class="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] relative">
            <button
                onclick={() => (mode = null)}
                class="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 z-50 hover:bg-gray-100 rounded-full">
                ← Back
            </button>

            <div class="pt-12 pb-8">
                {#if mode === "mixing"}
                    <MixingLab
                        onComplete={(pts) => updateScore(pts, "mixing")} />
                {:else if mode === "harmony"}
                    <HarmonyWheel
                        onComplete={(pts) => updateScore(pts, "harmony")} />
                {:else if mode === "mixer"}
                    <ColorMixer
                        embedded={true}
                        onScore={(pts) => updateScore(pts, "matcher")} />
                {/if}
            </div>
        </div>
    {/if}
</div>
