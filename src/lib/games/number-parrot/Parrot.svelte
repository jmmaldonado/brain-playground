<script lang="ts">
    import { Bird } from "lucide-svelte";
    import { bounceInOut } from "svelte/easing";
    import { scale, fly } from "svelte/transition";

    let { isSpeaking = false, isCorrect = false, isWrong = false } = $props();
</script>

<div class="relative flex flex-col items-center justify-center p-8">
    <!-- Speech Bubble -->
    {#if isSpeaking}
        <div
            in:fly={{ y: 20, duration: 400 }}
            out:scale={{ duration: 200 }}
            class="absolute -top-12 bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-indigo-100 font-bold text-2xl text-indigo-600 animate-bounce">
            ?
        </div>
    {/if}

    <!-- Parrot Body -->
    <div
        class="relative transition-all duration-300"
        class:scale-110={isSpeaking}
        class:rotate-12={isCorrect}
        class:-rotate-12={isWrong}>
        <!-- Glow Effect -->
        {#if isCorrect}
            <div
                in:scale={{ duration: 500, easing: bounceInOut }}
                class="absolute inset-0 bg-green-400/20 blur-2xl rounded-full">
            </div>
        {:else if isWrong}
            <div
                in:scale={{ duration: 500, easing: bounceInOut }}
                class="absolute inset-0 bg-red-400/20 blur-2xl rounded-full">
            </div>
        {/if}

        <Bird
            size={120}
            strokeWidth={1.5}
            class={`transition-colors duration-300 ${isCorrect ? "text-green-500" : isWrong ? "text-red-500" : "text-indigo-500"}`} />

        <!-- Eyes -->
        <div class="absolute top-1/3 left-1/4 flex gap-4 w-full justify-center">
            <div
                class={`w-2 h-2 rounded-full bg-slate-800 ${isSpeaking ? "animate-ping" : ""}`}>
            </div>
            <div
                class={`w-2 h-2 rounded-full bg-slate-800 ${isSpeaking ? "animate-ping" : ""}`}>
            </div>
        </div>
    </div>

    <!-- Feedback Text -->
    <div class="h-8 mt-4">
        {#if isCorrect}
            <span in:fly={{ y: 10 }} class="text-green-600 font-black text-xl"
                >AMAZING! 🌟</span>
        {:else if isWrong}
            <span in:fly={{ y: 10 }} class="text-red-500 font-black text-xl"
                >OOPS! 🦜</span>
        {/if}
    </div>
</div>

<style>
    @keyframes bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    .animate-bounce {
        animation: bounce 2s infinite ease-in-out;
    }
</style>
