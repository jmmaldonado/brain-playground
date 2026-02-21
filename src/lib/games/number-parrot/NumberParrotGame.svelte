<script lang="ts">
    import { onMount } from "svelte";
    import { fade, scale, fly } from "svelte/transition";
    import {
        type ParrotMode,
        type ParrotGameState,
        INITIAL_SEQUENCE_LENGTH,
        generateSequence,
        getExpectedAnswer,
        validateResponse,
        updateDifficulty,
    } from "./logic";
    import Parrot from "./Parrot.svelte";
    import { StorageService } from "$lib/services/storage";
    import {
        Trophy,
        ArrowLeft,
        RotateCcw,
        Play,
        Delete,
        Check,
    } from "lucide-svelte";

    let gameState: ParrotGameState = $state({
        mode: "Copycat",
        sequenceLength: INITIAL_SEQUENCE_LENGTH,
        currentSequence: [],
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        score: 0,
        isFinished: false,
    });

    let phase: "setup" | "listening" | "input" | "feedback" | "results" =
        $state("setup");
    let userInput: number[] = $state([]);
    let isSpeaking = $state(false);
    let feedback: "correct" | "wrong" | null = $state(null);
    let highScores: Record<ParrotMode, number> = $state({
        Copycat: 0,
        Rewind: 0,
        "Small to Tall": 0,
    });

    onMount(() => {
        const saved = StorageService.load<any>("number-parrot");
        if (saved && saved.highScores) {
            highScores = saved.highScores;
        }
    });

    async function playSequence() {
        phase = "listening";
        userInput = [];
        gameState.currentSequence = generateSequence(gameState.sequenceLength);

        for (const num of gameState.currentSequence) {
            isSpeaking = true;
            speak(num.toString());
            await new Promise((r) => setTimeout(r, 1000));
            isSpeaking = false;
            await new Promise((r) => setTimeout(r, 200)); // Small gap
        }

        phase = "input";
    }

    function speak(text: string) {
        if (!("speechSynthesis" in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.2; // Parrot-like pitch
        window.speechSynthesis.speak(utterance);
    }

    function handleNumber(num: number) {
        if (phase !== "input") return;
        userInput.push(num);
        if (userInput.length === gameState.sequenceLength) {
            checkAnswer();
        }
    }

    function deleteNumber() {
        userInput.pop();
    }

    function checkAnswer() {
        const expected = getExpectedAnswer(
            gameState.currentSequence,
            gameState.mode,
        );
        const isCorrect = validateResponse(userInput, expected);

        feedback = isCorrect ? "correct" : "wrong";
        phase = "feedback";

        if (isCorrect) {
            gameState.score += gameState.sequenceLength * 10;
        }

        const updates = updateDifficulty(gameState, isCorrect);
        Object.assign(gameState, updates);

        if (gameState.isFinished) {
            if (gameState.score > highScores[gameState.mode]) {
                highScores[gameState.mode] = gameState.score;
                StorageService.save("number-parrot", { highScores });
            }
            setTimeout(() => {
                phase = "results";
            }, 1500);
        } else {
            setTimeout(() => {
                feedback = null;
                playSequence();
            }, 1500);
        }
    }

    function startGame(mode: ParrotMode) {
        gameState = {
            mode,
            sequenceLength: INITIAL_SEQUENCE_LENGTH,
            currentSequence: [],
            consecutiveCorrect: 0,
            consecutiveWrong: 0,
            score: 0,
            isFinished: false,
        };
        playSequence();
    }

    function resetGame() {
        phase = "setup";
    }
</script>

<div
    class="max-w-xl mx-auto flex flex-col bg-gradient-to-b from-sky-400 to-indigo-500 text-white rounded-[2rem] shadow-2xl overflow-hidden p-6 relative min-h-[600px] h-[70vh]">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8 shrink-0">
        <button
            onclick={resetGame}
            class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <ArrowLeft size={24} />
        </button>

        <div class="flex flex-col items-center">
            <h1
                class="text-2xl font-black tracking-tight flex items-center gap-2">
                NUMBER PARROT
            </h1>
            {#if phase !== "setup"}
                <span
                    class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest"
                    >{gameState.mode}</span>
            {/if}
        </div>

        <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl">
            <Trophy size={20} class="text-yellow-300 fill-yellow-300" />
            <span class="font-black text-xl">{gameState.score}</span>
        </div>
    </div>

    <!-- Game Area -->
    <div
        class="flex-1 flex flex-col items-center justify-center overflow-y-auto min-h-0 min-w-0 p-2">
        {#if phase === "setup"}
            <div in:scale class="flex flex-col gap-4 w-full max-w-xs">
                <h2 class="text-center text-xl font-bold mb-4">Pick a Game!</h2>
                {#each ["Copycat", "Rewind", "Small to Tall"] as mode}
                    <button
                        onclick={() => startGame(mode as ParrotMode)}
                        class="bg-white text-indigo-600 p-6 rounded-3xl shadow-xl font-black text-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-1">
                        {mode}
                        <span class="text-xs font-bold text-slate-400"
                            >Best: {highScores[mode as ParrotMode]}</span>
                    </button>
                {/each}
            </div>
        {:else if phase === "results"}
            <div
                in:fly={{ y: 50 }}
                class="flex flex-col items-center gap-6 bg-white rounded-[3rem] p-10 text-indigo-600 shadow-2xl w-full max-w-sm text-center">
                <div class="bg-indigo-100 p-6 rounded-full">
                    <Trophy size={64} class="text-yellow-500" />
                </div>
                <div>
                    <h2 class="text-3xl font-black">GREAT JOB!</h2>
                    <p class="text-lg opacity-80">You're a math superstar!</p>
                </div>
                <div class="text-6xl font-black my-4">
                    {gameState.score}
                    <span
                        class="block text-sm uppercase tracking-widest opacity-50"
                        >Total Points</span>
                </div>
                <button
                    onclick={resetGame}
                    class="w-full bg-indigo-500 text-white p-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-600 active:scale-95 transition-all">
                    PLAY AGAIN
                </button>
            </div>
        {:else}
            <div class="shrink-0 scale-75 sm:scale-100">
                <Parrot
                    {isSpeaking}
                    isCorrect={feedback === "correct"}
                    isWrong={feedback === "wrong"} />
            </div>

            <div
                class="h-16 flex items-center justify-center gap-2 mb-4 shrink-0">
                {#if phase === "input"}
                    {#each userInput as num}
                        <div
                            in:scale
                            class="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center text-2xl font-black border-2 border-white/50">
                            {num}
                        </div>
                    {/each}
                    {#each Array(gameState.sequenceLength - userInput.length) as _}
                        <div
                            class="w-10 h-10 bg-white/10 rounded-xl border-2 border-white/20 border-dashed">
                        </div>
                    {/each}
                {:else if phase === "listening"}
                    <div class="flex gap-2">
                        <div
                            class="w-3 h-3 bg-white rounded-full animate-pulse">
                        </div>
                        <div
                            class="w-3 h-3 bg-white rounded-full animate-pulse delay-75">
                        </div>
                        <div
                            class="w-3 h-3 bg-white rounded-full animate-pulse delay-150">
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Number Pad -->
            <div
                class={`grid grid-cols-3 gap-2 w-full max-w-xs transition-opacity duration-300 shrink-0 ${phase !== "input" ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                {#each Array.from({ length: 9 }, (_, i) => i + 1) as num}
                    <button
                        onclick={() => handleNumber(num)}
                        class="bg-white text-indigo-600 h-16 rounded-2xl shadow-lg font-black text-2xl active:scale-90 active:bg-indigo-50 transition-all">
                        {num}
                    </button>
                {/each}
                <div class="col-start-2">
                    <button
                        onclick={() => handleNumber(0)}
                        class="w-full bg-white text-indigo-600 h-16 rounded-2xl shadow-lg font-black text-2xl active:scale-90 active:bg-indigo-50 transition-all">
                        0
                    </button>
                </div>
                <button
                    onclick={deleteNumber}
                    class="bg-red-400 text-white h-16 rounded-2xl shadow-lg font-black flex items-center justify-center active:scale-90 transition-all">
                    <Delete size={28} />
                </button>
            </div>
        {/if}
    </div>

    <!-- Instructions Overlay -->
    {#if phase === "listening"}
        <div
            transition:fade
            class="absolute inset-0 bg-sky-600/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
            <h2 class="text-4xl font-black mb-4 drop-shadow-lg">
                LISTEN CLOSELY! 👂
            </h2>
            <p class="text-xl font-bold opacity-90 max-w-xs leading-tight">
                The parrot is speaking the numbers! Can you remember them?
            </p>
        </div>
    {/if}
</div>

<style>
    .delay-75 {
        animation-delay: 75ms;
    }
    .delay-150 {
        animation-delay: 150ms;
    }
    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.5);
            opacity: 0.5;
        }
    }
    .animate-pulse {
        animation: pulse 1.5s infinite ease-in-out;
    }
</style>
