<script lang="ts">
    import { onMount } from 'svelte';
    import { RefreshCw, Trophy, HelpCircle, X } from 'lucide-svelte';
    import { StorageService } from '$lib/services/storage';

    // Constants
    const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']; // Red, Blue, Green, Yellow, Purple, Pink
    const CODE_LENGTH = 4;
    const MAX_ATTEMPTS = 10;

    // Types
    type Color = string;
    type Feedback = {
        exact: number; // Correct color and position (Black peg)
        color: number; // Correct color, wrong position (White peg)
    };
    type Attempt = {
        guess: Color[];
        feedback: Feedback;
    };
    type GameState = {
        highScore: number; // Fewest attempts to win
        gamesPlayed: number;
        gamesWon: number;
    };

    // State
    let secretCode: Color[] = $state([]);
    let attempts: Attempt[] = $state([]);
    let currentGuess: Color[] = $state(Array(CODE_LENGTH).fill(''));
    let gameStatus: 'playing' | 'won' | 'lost' = $state('playing');
    let selectedColorIndex: number = $state(0);
    let showHelp = $state(false);
    let gameState: GameState = $state({
        highScore: 0,
        gamesPlayed: 0,
        gamesWon: 0
    });

    onMount(() => {
        const savedState = StorageService.load<GameState>('code-breaker');
        if (savedState) {
            gameState = savedState;
        }
        startNewGame();
    });

    function startNewGame() {
        // Generate secret code
        secretCode = Array(CODE_LENGTH).fill(0).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        attempts = [];
        currentGuess = Array(CODE_LENGTH).fill('');
        gameStatus = 'playing';
        selectedColorIndex = 0;
        
        // Debug
        console.log('Secret Code:', secretCode);
    }

    function selectColor(color: Color) {
        if (gameStatus !== 'playing') return;
        
        // Find first empty slot or replace current selection
        const emptyIndex = currentGuess.findIndex(c => c === '');
        if (emptyIndex !== -1) {
            currentGuess[emptyIndex] = color;
        } else {
            // If full, maybe just replace the last one or do nothing? 
            // Let's implement a selection cursor logic later if needed. 
            // For now, simple fill logic.
        }
    }

    function removeColor(index: number) {
        if (gameStatus !== 'playing') return;
        currentGuess[index] = '';
    }

    function submitGuess() {
        if (currentGuess.some(c => c === '')) return; // Incomplete guess

        const feedback = calculateFeedback(currentGuess, secretCode);
        attempts = [...attempts, { guess: [...currentGuess], feedback }];
        
        if (feedback.exact === CODE_LENGTH) {
            gameStatus = 'won';
            handleWin();
        } else if (attempts.length >= MAX_ATTEMPTS) {
            gameStatus = 'lost';
            gameState.gamesPlayed++;
            StorageService.save('code-breaker', gameState);
        }

        currentGuess = Array(CODE_LENGTH).fill('');
    }

    function handleWin() {
        gameState.gamesPlayed++;
        gameState.gamesWon++;
        const score = attempts.length;
        if (gameState.highScore === 0 || score < gameState.highScore) {
            gameState.highScore = score;
        }
        StorageService.save('code-breaker', gameState);
    }

    function calculateFeedback(guess: Color[], code: Color[]): Feedback {
        let exact = 0;
        let color = 0;
        const codeCopy = [...code];
        const guessCopy = [...guess];

        // Check exact matches first
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (guessCopy[i] === codeCopy[i]) {
                exact++;
                guessCopy[i] = null as any;
                codeCopy[i] = null as any;
            }
        }

        // Check color matches
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (guessCopy[i] === null) continue;
            const index = codeCopy.indexOf(guessCopy[i]);
            if (index !== -1) {
                color++;
                codeCopy[index] = null as any;
            }
        }

        return { exact, color };
    }
</script>

<div class="max-w-2xl mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl p-4 shadow-md flex justify-between items-center">
        <div class="flex items-center gap-2">
            <Trophy class="text-yellow-500" />
            <span class="font-bold text-gray-700">Best: {gameState.highScore === 0 ? '-' : gameState.highScore}</span>
        </div>
        <div class="flex gap-2">
            <button onclick={() => showHelp = true} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Help">
                <HelpCircle size={20} />
            </button>
            <button onclick={startNewGame} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Restart Game">
                <RefreshCw size={20} />
            </button>
        </div>
    </div>

    <!-- Game Board -->
    <div class="bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-4">
        
        <div class="space-y-2 min-h-[300px] flex flex-col">
             <!-- Current Input Row (Always at top if playing) -->
             {#if attempts.length < MAX_ATTEMPTS && gameStatus === 'playing'}
                <div class="flex items-center gap-4 p-2 bg-blue-50 rounded-xl border-2 border-blue-200 mb-4 shadow-sm">
                   <span class="text-blue-500 font-bold w-6">{attempts.length + 1}.</span>
                   <div class="flex gap-2 flex-1">
                       {#each Array(CODE_LENGTH) as _, i}
                           <button 
                               class="w-8 h-8 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 transition-colors"
                               style="background-color: {currentGuess[i]}"
                               onclick={() => removeColor(i)}
                           >
                           </button>
                       {/each}
                   </div>
                   <button 
                       onclick={submitGuess}
                       disabled={currentGuess.some(c => c === '')}
                       class="px-4 py-1 bg-blue-500 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                   >
                       Guess
                   </button>
               </div>
           {/if}

            <!-- Previous Attempts (Reversed) -->
            {#each [...attempts].reverse() as attempt, i}
                <div class="flex items-center gap-4 p-2 bg-gray-50 rounded-xl">
                    <span class="text-gray-400 font-mono w-6">{attempts.length - i}.</span>
                    <div class="flex gap-2 flex-1">
                        {#each attempt.guess as color}
                            <div class="w-8 h-8 rounded-full shadow-sm border border-gray-200" style="background-color: {color}"></div>
                        {/each}
                    </div>
                    <!-- Feedback Pegs -->
                    <div class="grid grid-cols-2 gap-1 w-8">
                        {#each Array(attempt.feedback.exact) as _}
                            <div class="w-3 h-3 rounded-full bg-black"></div>
                        {/each}
                        {#each Array(attempt.feedback.color) as _}
                            <div class="w-3 h-3 rounded-full bg-gray-300 border border-gray-400"></div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>

        <!-- Color Picker -->
        {#if gameStatus === 'playing'}
            <div class="pt-4 border-t border-gray-100">
                <div class="flex justify-center gap-3 flex-wrap">
                    {#each COLORS as color}
                        <button 
                            class="w-12 h-12 rounded-full shadow-md hover:scale-110 transition-transform active:scale-95 border-2 border-white ring-2 ring-transparent hover:ring-gray-200"
                            style="background-color: {color}"
                            onclick={() => selectColor(color)}
                            aria-label="Select color"
                        ></button>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="text-center py-4 space-y-4">
                {#if gameStatus === 'won'}
                    <h2 class="text-3xl font-bold text-green-500">You Cracked It! 🎉</h2>
                    <p class="text-gray-600">Found the code in {attempts.length} attempts.</p>
                {:else}
                    <h2 class="text-3xl font-bold text-red-500">Game Over 😔</h2>
                    <div class="flex justify-center gap-2 mt-2">
                        {#each secretCode as color}
                             <div class="w-8 h-8 rounded-full shadow-sm" style="background-color: {color}"></div>
                        {/each}
                    </div>
                {/if}
                <button 
                    onclick={startNewGame}
                    class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
                >
                    Play Again
                </button>
            </div>
        {/if}
    </div>
    
    <!-- Help Modal -->
    {#if showHelp}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <button 
                    onclick={() => showHelp = false}
                    class="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
                
                <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <HelpCircle class="text-blue-500" />
                    How to Play
                </h3>
                
                <ul class="space-y-3 text-gray-600">
                    <li class="flex gap-3">
                        <span class="font-bold text-blue-500">1.</span>
                        <span>Guess the 4-color secret code.</span>
                    </li>
                    <li class="flex gap-3">
                        <span class="font-bold text-blue-500">2.</span>
                        <span>
                            <span class="inline-block w-3 h-3 rounded-full bg-black align-middle"></span> 
                            Black peg means correct color in correct position.
                        </span>
                    </li>
                    <li class="flex gap-3">
                        <span class="font-bold text-blue-500">3.</span>
                        <span>
                            <span class="inline-block w-3 h-3 rounded-full bg-gray-300 border border-gray-400 align-middle"></span>
                            White peg means correct color but wrong position.
                        </span>
                    </li>
                    <li class="flex gap-3">
                        <span class="font-bold text-blue-500">4.</span>
                        <span>You have {MAX_ATTEMPTS} attempts to break the code!</span>
                    </li>
                </ul>
                
                <button 
                    onclick={() => showHelp = false}
                    class="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Got it!
                </button>
            </div>
        </div>
    {/if}
</div>
