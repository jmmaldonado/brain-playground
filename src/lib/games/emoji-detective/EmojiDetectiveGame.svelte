<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fade, scale, fly } from "svelte/transition";
    import {
        type DetectiveLayout,
        type DetectiveMode,
        type EmojiItem,
        GAME_DURATION,
        generateBoard,
    } from "./logic";
    import { StorageService } from "$lib/services/storage";
    import {
        Trophy,
        ArrowLeft,
        Clock,
        Search,
        Target,
        Sparkles,
    } from "lucide-svelte";

    let phase: "setup" | "playing" | "results" = $state("setup");
    let layout: DetectiveLayout = $state("Tidy Room");
    let mode: DetectiveMode = $state("Emoji Match");
    let timeLeft = $state(GAME_DURATION);
    let score = $state(0);
    let targets: string[] = $state([]);
    let categoryName: string | undefined = $state(undefined);
    let board: EmojiItem[] = $state([]);
    let timerInterval: any;
    let highScores: Record<string, number> = $state({
        "Tidy Room-Emoji Match": 0,
        "Messy Room-Emoji Match": 0,
        "Tidy Room-Semantic Hunt": 0,
        "Messy Room-Semantic Hunt": 0,
    });

    onMount(() => {
        const saved = StorageService.load<any>("emoji-detective");
        if (saved && saved.highScores) {
            highScores = { ...highScores, ...saved.highScores };
        }
    });

    onDestroy(() => {
        clearInterval(timerInterval);
    });

    function startGame(
        selectedLayout: DetectiveLayout,
        selectedMode: DetectiveMode,
    ) {
        layout = selectedLayout;
        mode = selectedMode;
        const generated = generateBoard(layout, mode);
        targets = generated.targets;
        categoryName = generated.categoryName;
        board = generated.board;
        score = 0;
        timeLeft = GAME_DURATION;
        phase = "playing";
        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function handleTap(item: EmojiItem) {
        if (phase !== "playing" || item.isFound || item.isWrong) return;

        if (item.isTarget) {
            item.isFound = true;
            score += 10;
            playTone(440, "sine"); // Ding
        } else {
            item.isWrong = true;
            score = Math.max(0, score - 5);
            playTone(150, "square"); // Bloop
            setTimeout(() => {
                item.isWrong = false;
            }, 500);
        }
    }

    function playTone(freq: number, type: OscillatorType) {
        try {
            const ctx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {}
    }

    function endGame() {
        clearInterval(timerInterval);
        phase = "results";
        const key = `${layout}-${mode}`;
        if (score > (highScores[key] || 0)) {
            highScores[key] = score;
            StorageService.save("emoji-detective", { highScores });
        }
    }

    function resetGame() {
        phase = "setup";
    }
</script>

<div
    class="max-w-2xl mx-auto flex flex-col bg-violet-50 text-slate-800 rounded-[2rem] shadow-xl overflow-hidden relative h-[75vh] min-h-[600px] border border-violet-100">
    <!-- Top Bar -->
    <div
        class="bg-white border-b border-violet-100 p-4 shadow-sm z-10 shrink-0">
        <div class="max-w-md mx-auto flex justify-between items-center">
            <button
                onclick={resetGame}
                class="p-2 hover:bg-violet-50 rounded-full transition-colors">
                <ArrowLeft size={24} class="text-violet-500" />
            </button>

            <div class="flex flex-col items-center">
                <div class="flex items-center gap-2 text-violet-600 font-black">
                    <Search size={20} />
                    <span>EMOJI DETECTIVE</span>
                </div>
                {#if phase === "playing"}
                    <span
                        class="text-[10px] uppercase tracking-widest font-bold text-slate-400"
                        >{layout} • {mode}</span>
                {/if}
            </div>

            <div class="flex items-center gap-4">
                <div
                    class={`flex items-center gap-1.5 font-black text-xl ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-slate-600"}`}>
                    <Clock size={20} />
                    <span class="tabular-nums">{timeLeft}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Play Area / Setup -->
    <div class="flex-1 relative overflow-y-auto bg-violet-50/50 min-h-0">
        {#if phase === "setup"}
            <div
                in:fade
                class="h-full flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                <div class="bg-violet-100 p-8 rounded-full mb-8">
                    <Search size={80} class="text-violet-500" />
                </div>
                <h2 class="text-3xl font-black text-slate-800 mb-2">
                    Ready, Detective?
                </h2>
                <p class="text-slate-500 mb-8 font-medium">
                    Find as many target emojis as you can before time runs out!
                </p>

                <div class="flex flex-col gap-6 w-full">
                    <div class="space-y-3">
                        <span
                            class="text-xs font-black text-slate-400 uppercase tracking-widest block text-left ml-2"
                            >Select Game Mode</span>
                        {#each ["Emoji Match", "Semantic Hunt"] as m}
                            <button
                                onclick={() => (mode = m as DetectiveMode)}
                                class={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${mode === m ? "bg-violet-600 border-violet-600 text-white shadow-md" : "bg-white border-violet-100 text-slate-600 hover:border-violet-300"}`}>
                                <div class="flex items-center gap-3">
                                    {#if m === "Emoji Match"}
                                        <Search size={20} />
                                    {:else}
                                        <Sparkles size={20} />
                                    {/if}
                                    <span class="font-bold">{m}</span>
                                </div>
                                {#if mode === m}
                                    <div
                                        in:scale
                                        class="w-2 h-2 rounded-full bg-white">
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>

                    <div class="space-y-3">
                        <span
                            class="text-xs font-black text-slate-400 uppercase tracking-widest block text-left ml-2"
                            >Select Layout</span>
                        {#each ["Tidy Room", "Messy Room"] as l}
                            <button
                                onclick={() =>
                                    startGame(l as DetectiveLayout, mode)}
                                class="bg-white border-2 border-violet-100 p-4 rounded-2xl shadow-sm text-lg font-bold hover:border-violet-400 hover:bg-violet-50 transition-all flex justify-between items-center group">
                                <span class="text-violet-700">{l}</span>
                                <span class="text-xs font-bold text-slate-400"
                                    >Best: {highScores[`${l}-${mode}`] ||
                                        0}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if phase === "playing"}
            <!-- Target Bar -->
            <div
                transition:fly={{ y: -50 }}
                class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border-2 border-green-200">
                <span
                    class="text-xs font-black uppercase text-green-600 tracking-widest flex items-center gap-1">
                    <Target size={14} /> Find:
                </span>
                <div class="flex gap-4">
                    {#if mode === "Emoji Match"}
                        {#each targets as t}
                            <span
                                class="text-3xl animate-bounce"
                                style="animation-delay: {Math.random()}s"
                                >{t}</span>
                        {/each}
                    {:else}
                        <span
                            class="text-xl font-black text-indigo-600 animate-pulse"
                            >{categoryName}</span>
                    {/if}
                </div>
                <div class="ml-4 pl-4 border-l-2 border-green-100">
                    <span class="text-2xl font-black text-violet-600"
                        >{score}</span>
                </div>
            </div>

            <!-- The Board -->
            <div class="h-full w-full p-4 pt-24 pb-8 min-h-0">
                {#if layout === "Tidy Room"}
                    <div
                        class="grid grid-cols-6 sm:grid-cols-8 gap-2 content-start justify-items-center">
                        {#each board as item (item.id)}
                            <button
                                onclick={() => handleTap(item)}
                                class={`w-12 h-12 flex items-center justify-center text-3xl rounded-xl transition-all
                                    ${
                                        item.isFound
                                            ? "bg-green-400 scale-90 rotate-12 shadow-inner"
                                            : item.isWrong
                                              ? "bg-red-400 animate-shake"
                                              : "bg-white shadow-sm active:scale-95"
                                    }`}>
                                {item.emoji}
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="relative w-full aspect-square sm:aspect-video min-h-[500px]">
                        {#each board as item (item.id)}
                            <button
                                onclick={() => handleTap(item)}
                                class={`absolute flex items-center justify-center text-3xl rounded-full p-2 transition-all
                                    ${
                                        item.isFound
                                            ? "bg-green-400 scale-75 rotate-12"
                                            : item.isWrong
                                              ? "bg-red-400 animate-shake"
                                              : "bg-white/40 active:scale-95"
                                    }`}
                                style={`left: ${item.x}%; top: ${item.y}%; transform: rotate(${item.rotation}deg)`}>
                                {item.emoji}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {:else if phase === "results"}
            <div
                in:scale
                class="h-full flex flex-col items-center justify-center p-8 max-w-sm mx-auto">
                <div
                    class="bg-white rounded-[3rem] p-10 shadow-2xl w-full text-center border-4 border-violet-100">
                    <div
                        class="bg-violet-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={48} class="text-yellow-500" />
                    </div>
                    <h3 class="text-3xl font-black text-slate-800 mb-2">
                        Awesome Work!
                    </h3>
                    <p class="text-slate-500 font-medium mb-8">
                        You found so many items!
                    </p>

                    <div class="bg-slate-50 rounded-3xl p-6 mb-8">
                        <span
                            class="block text-xs uppercase tracking-widest font-black text-slate-400 mb-1"
                            >Detective Score</span>
                        <span class="text-6xl font-black text-violet-600"
                            >{score}</span>
                        {#if score >= (highScores[`${layout}-${mode}`] || 0)}
                            <span
                                class="block text-xs font-bold text-green-500 mt-2"
                                >NEW PERSONAL BEST! 🏆</span>
                        {/if}
                    </div>

                    <button
                        onclick={resetGame}
                        class="w-full bg-violet-600 text-white p-5 rounded-3xl font-black text-xl shadow-lg hover:bg-violet-700 active:scale-95 transition-all">
                        PLAY AGAIN
                    </button>
                </div>
            </div>
        {/if}
    </div>

    <!-- Timer Progress Bar -->
    {#if phase === "playing"}
        <div class="h-2 w-full bg-slate-200">
            <div
                class={`h-full transition-all duration-1000 ${timeLeft < 10 ? "bg-red-500" : "bg-violet-500"}`}
                style={`width: ${(timeLeft / GAME_DURATION) * 100}%`}>
            </div>
        </div>
    {/if}
</div>

<style>
    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-4px);
        }
        75% {
            transform: translateX(4px);
        }
    }
    .animate-shake {
        animation: shake 0.2s 2;
    }
</style>
