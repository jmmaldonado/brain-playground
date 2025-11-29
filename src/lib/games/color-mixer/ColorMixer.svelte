<script lang="ts">
    import { StorageService } from '$lib/services/storage';
    import { onMount } from 'svelte';
    import { Trophy, RefreshCw } from 'lucide-svelte';

    interface GameState {
        score: number;
        highScore: number;
    }

    let targetColor = $state({ r: 0, g: 0, b: 0 });
    let userColor = $state({ r: 128, g: 128, b: 128 });
    let gameState: GameState = $state({
        score: 0,
        highScore: 0
    });
    let feedback = $state('');
    let showResult = $state(false);
    let matchPercentage = $state(0);

    onMount(() => {
        const savedState = StorageService.load<GameState>('color-mixer');
        if (savedState) {
            gameState.highScore = savedState.highScore;
        }
        generateTarget();
    });

    function generateTarget() {
        targetColor = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
        // Reset user color slightly randomized but neutral
        userColor = { r: 128, g: 128, b: 128 };
        showResult = false;
        feedback = '';
    }

    function calculateMatch() {
        const diffR = Math.abs(targetColor.r - userColor.r);
        const diffG = Math.abs(targetColor.g - userColor.g);
        const diffB = Math.abs(targetColor.b - userColor.b);
        
        // Max difference is 255 * 3 = 765
        const totalDiff = diffR + diffG + diffB;
        const maxDiff = 765;
        
        const accuracy = Math.max(0, 100 - (totalDiff / maxDiff * 100));
        return Math.round(accuracy);
    }

    function checkMatch() {
        matchPercentage = calculateMatch();
        showResult = true;

        if (matchPercentage >= 95) {
            feedback = 'Perfect Match! 🎨';
            gameState.score += 100;
        } else if (matchPercentage >= 90) {
            feedback = 'Excellent! 🌟';
            gameState.score += 50;
        } else if (matchPercentage >= 80) {
            feedback = 'Great Job! 👍';
            gameState.score += 25;
        } else {
            feedback = 'Keep Trying! 💪';
            gameState.score += 5;
        }

        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            StorageService.save('color-mixer', { highScore: gameState.highScore });
        }
    }
</script>

<div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div class="flex items-center gap-2 text-purple-600 font-bold">
            <Trophy size={20} />
            <span>Score: {gameState.score}</span>
        </div>
        <div class="text-sm text-gray-500">Best: {gameState.highScore}</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Target Color -->
        <div class="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4">
            <h2 class="text-xl font-bold text-gray-700">Target Color</h2>
            <div 
                class="w-32 h-32 rounded-full shadow-inner border-4 border-gray-100"
                style="background-color: rgb({targetColor.r}, {targetColor.g}, {targetColor.b})"
            ></div>
            <p class="text-gray-400 text-sm">Match this color!</p>
        </div>

        <!-- User Color -->
        <div class="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4">
            <h2 class="text-xl font-bold text-gray-700">Your Mix</h2>
            <div 
                class="w-32 h-32 rounded-full shadow-inner border-4 border-gray-100"
                style="background-color: rgb({userColor.r}, {userColor.g}, {userColor.b})"
            ></div>
            {#if showResult}
                <div class="text-center animate-fade-in">
                    <p class="text-2xl font-bold {matchPercentage >= 90 ? 'text-green-500' : 'text-blue-500'}">
                        {matchPercentage}% Match
                    </p>
                    <p class="text-gray-600 font-medium">{feedback}</p>
                </div>
            {/if}
        </div>
    </div>

    <!-- Controls -->
    <div class="bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <!-- Red Slider -->
        <div class="space-y-2">
            <div class="flex justify-between text-sm font-bold text-red-500">
                <label for="red">Red</label>
                <span>{userColor.r}</span>
            </div>
            <input 
                type="range" 
                id="red" 
                min="0" 
                max="255" 
                bind:value={userColor.r}
                disabled={showResult}
                class="w-full h-3 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
        </div>

        <!-- Green Slider -->
        <div class="space-y-2">
            <div class="flex justify-between text-sm font-bold text-green-500">
                <label for="green">Green</label>
                <span>{userColor.g}</span>
            </div>
            <input 
                type="range" 
                id="green" 
                min="0" 
                max="255" 
                bind:value={userColor.g}
                disabled={showResult}
                class="w-full h-3 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
        </div>

        <!-- Blue Slider -->
        <div class="space-y-2">
            <div class="flex justify-between text-sm font-bold text-blue-500">
                <label for="blue">Blue</label>
                <span>{userColor.b}</span>
            </div>
            <input 
                type="range" 
                id="blue" 
                min="0" 
                max="255" 
                bind:value={userColor.b}
                disabled={showResult}
                class="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>

        <div class="pt-4">
            {#if !showResult}
                <button 
                    onclick={checkMatch}
                    class="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95"
                >
                    Mix It!
                </button>
            {:else}
                <button 
                    onclick={generateTarget}
                    class="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <RefreshCw /> Next Color
                </button>
            {/if}
        </div>
    </div>
</div>
