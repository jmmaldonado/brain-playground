<script lang="ts">
    import { generateEquation, createPuzzle, type PuzzleItem } from './logic';
    import { onMount } from 'svelte';
    import { Trophy, CheckCircle, XCircle, ArrowRight } from 'lucide-svelte';
    import { slide, scale, fade } from 'svelte/transition';
    import { StorageService } from '$lib/services/storage';

    interface GameState {
        score: number;
        highScore: number;
        level: number;
        failures: number;
    }

    let gameState: GameState = $state({
        score: 0,
        highScore: 0,
        level: 1,
        failures: 0
    });

    let puzzle: PuzzleItem[] = $state([]);
    let options: (string | number)[] = $state([]);
    let selectedBoxIndex: number | null = $state(null);
    let feedback: 'correct' | 'wrong' | null = $state(null);
    let streak = $state(0);

    onMount(() => {
        const saved = StorageService.load<GameState>('math-fill');
        if (saved) {
            gameState.highScore = saved.highScore;
            gameState.level = saved.level || 1; // Restore level or start at 1
            gameState.failures = saved.failures || 0; // Restore failures or start at 0
        }
        startRound();
    });

    function startRound() {
        const eq = generateEquation(Math.ceil(gameState.level / 2)); // Increase math difficulty slower than puzzle difficulty
        const p = createPuzzle(eq, gameState.level);
        puzzle = p.puzzle.map(item => ({...item, userValue: null}));
        options = p.options;
        selectedBoxIndex = puzzle.findIndex(i => i.isHidden); // Auto-select first hidden
        feedback = null;
    }

    function handleBoxClick(index: number) {
        if (!puzzle[index].isHidden || feedback) return;
        selectedBoxIndex = index;
    }

    function isOptionUsed(option: string | number): boolean {
        return puzzle.some(p => p.isHidden && p.userValue === option);
    }

    function handleOptionClick(option: string | number) {
        if (selectedBoxIndex === null || feedback || isOptionUsed(option)) return;
        
        puzzle[selectedBoxIndex].userValue = option;
        
        // Auto-advance selection if multiple blanks
        const nextHidden = puzzle.findIndex((item, idx) => item.isHidden && item.userValue === null && idx > selectedBoxIndex!);
        if (nextHidden !== -1) {
            selectedBoxIndex = nextHidden;
        } else {
             // If loop back or just stay, let's find *any* empty
             const anyEmpty = puzzle.findIndex(item => item.isHidden && item.userValue === null);
             selectedBoxIndex = anyEmpty !== -1 ? anyEmpty : selectedBoxIndex;
        }
    }

    function checkAnswer() {
        // Check if fully filled
        if (puzzle.some(i => i.isHidden && i.userValue === null)) return;

        // Retrieve values to evaluate the equation
        const val = (index: number) => {
            const p = puzzle[index];
            return p.isHidden ? p.userValue : p.value;
        };

        const num1 = Number(val(0));
        const op = String(val(1));
        const num2 = Number(val(2));
        const res = Number(val(3));

        let calcResult = 0;
        switch(op) {
            case '+': calcResult = num1 + num2; break;
            case '-': calcResult = num1 - num2; break;
            case '×': calcResult = num1 * num2; break;
            case '÷': calcResult = num1 / num2; break;
            default: calcResult = NaN;
        }

        // Allow for minor floating point diffs if division is involved, though we target integers
        const isCorrect = Math.abs(calcResult - res) < 0.001;

        if (isCorrect) {
            feedback = 'correct';
            streak++;
            const points = 10 * gameState.level + (streak * 5);
            gameState.score += points;
            
            if (gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
            }
            StorageService.save('math-fill', gameState);

            // Level up logic
            if (streak % 3 === 0 && gameState.level < 10) {
                gameState.level++;
            }

            setTimeout(startRound, 1500);
        } else {
            feedback = 'wrong';
            streak = 0;
            gameState.failures++;
            StorageService.save('math-fill', gameState);
            // Clear wrong answers after delay
            setTimeout(() => {
                feedback = null;
                puzzle = puzzle.map(item => item.isHidden ? {...item, userValue: null} : item);
                selectedBoxIndex = puzzle.findIndex(i => i.isHidden);
            }, 1000);
        }
    }
</script>

<div class="max-w-lg mx-auto p-4 flex flex-col items-center gap-6 min-h-[500px]">
    
    <!-- Header -->
    <div class="w-full flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
        <div class="flex items-center gap-2">
            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Level {gameState.level}</span>
        </div>
        {#if gameState.failures > 0}
            <div class="flex items-center gap-1 text-gray-500 text-xs">
                <XCircle size={14} class="text-red-400" />
                <span>{gameState.failures}</span>
            </div>
        {/if}
        <div class="flex items-center gap-2 text-green-600 font-bold">
            <Trophy size={18} />
            <span>{gameState.score}</span>
        </div>
    </div>

    <!-- Feedback Banner -->
    {#if feedback}
        <div in:slide class={`w-full p-4 rounded-xl text-center font-bold text-lg shadow-md ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {#if feedback === 'correct'}
                Correct! Awesome! 🎉
            {:else}
                Oops! Try again. 💪
            {/if}
        </div>
    {/if}

    <!-- Equation Area -->
    <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-4 p-6 bg-white rounded-3xl shadow-lg w-full">
        <!-- Num 1 -->
        <div class="flex items-center justify-center">
            {#if puzzle[0]?.isHidden}
                <button 
                    onclick={() => handleBoxClick(0)}
                    class={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${selectedBoxIndex === 0 ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
                >
                    {puzzle[0].userValue ?? '?'}
                </button>
            {:else}
                <span class="text-3xl sm:text-5xl font-bold text-gray-700">{puzzle[0]?.value}</span>
            {/if}
        </div>

        <!-- Operator -->
        <div class="flex items-center justify-center">
             {#if puzzle[1]?.isHidden}
                <button 
                    onclick={() => handleBoxClick(1)}
                    class={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${selectedBoxIndex === 1 ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
                >
                    {puzzle[1].userValue ?? '?'}
                </button>
            {:else}
                <span class="text-3xl sm:text-5xl font-bold text-blue-500">{puzzle[1]?.value}</span>
            {/if}
        </div>

        <!-- Num 2 -->
        <div class="flex items-center justify-center">
             {#if puzzle[2]?.isHidden}
                <button 
                    onclick={() => handleBoxClick(2)}
                    class={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${selectedBoxIndex === 2 ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
                >
                    {puzzle[2].userValue ?? '?'}
                </button>
            {:else}
                <span class="text-3xl sm:text-5xl font-bold text-gray-700">{puzzle[2]?.value}</span>
            {/if}
        </div>

        <!-- Equals -->
        <span class="text-3xl sm:text-5xl font-bold text-gray-400">=</span>

        <!-- Result -->
         <div class="flex items-center justify-center">
             {#if puzzle[3]?.isHidden}
                <button 
                    onclick={() => handleBoxClick(3)}
                    class={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-4 text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all ${selectedBoxIndex === 3 ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200' : 'border-dashed border-gray-300 bg-gray-50'}`}
                >
                    {puzzle[3].userValue ?? '?'}
                </button>
            {:else}
                <span class="text-3xl sm:text-5xl font-bold text-purple-600">{puzzle[3]?.value}</span>
            {/if}
        </div>
    </div>

    <!-- Options Grid -->
    <div class="w-full grid grid-cols-4 gap-3 sm:gap-4 mt-auto">
        {#each options as option}
            <button
                onclick={() => handleOptionClick(option)}
                disabled={isOptionUsed(option)}
                class="bg-white hover:bg-gray-50 active:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-100 p-4 rounded-xl shadow-md border-b-4 border-gray-200 active:border-blue-300 active:translate-y-1 transition-all text-xl sm:text-2xl font-bold text-gray-700 flex items-center justify-center h-16 sm:h-20"
            >
                {option}
            </button>
        {/each}
    </div>

    <!-- Action Button -->
    <button 
        onclick={checkAnswer}
        disabled={puzzle.some(i => i.isHidden && i.userValue === null) || feedback !== null}
        class="w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Check <ArrowRight />
    </button>
</div>
