<script lang="ts">
    import { StorageService } from '$lib/services/storage';
    import { onMount } from 'svelte';
    import { ArrowLeft, RefreshCw, Trophy } from 'lucide-svelte';

    // Game Types
    type Operator = '+' | '-' | '×';
    interface Question {
        num1: number;
        num2: number;
        operator: Operator;
        answer: number;
    }

    interface GameState {
        score: number;
        highScore: number;
        streak: number;
    }

    // State
    let currentQuestion: Question | null = $state(null);
    let userAnswer = $state('');
    let feedback: 'correct' | 'wrong' | null = $state(null);
    let gameState: GameState = $state({
        score: 0,
        highScore: 0,
        streak: 0
    });
    
    // Load high score on mount
    onMount(() => {
        const savedState = StorageService.load<GameState>('math-game');
        if (savedState) {
            gameState.highScore = savedState.highScore;
        }
        generateQuestion();
    });

    function generateQuestion() {
        const operators: Operator[] = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;

        // Simplify subtraction to avoid negatives for kids
        if (operator === '-' && num1 < num2) {
            [num1, num2] = [num2, num1];
        }

        // Simplify multiplication to single digits
        if (operator === '×') {
             num1 = Math.floor(Math.random() * 9) + 1;
             num2 = Math.floor(Math.random() * 9) + 1;
        }

        let answer = 0;
        switch (operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '×': answer = num1 * num2; break;
        }

        currentQuestion = { num1, num2, operator, answer };
        userAnswer = '';
        feedback = null;
    }

    function checkAnswer() {
        if (!currentQuestion) return;
        
        const num = parseInt(userAnswer);
        if (isNaN(num)) return;

        if (num === currentQuestion.answer) {
            feedback = 'correct';
            gameState.score += 10 + (gameState.streak * 2);
            gameState.streak++;
            if (gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
                StorageService.save('math-game', { highScore: gameState.highScore });
            }
            setTimeout(generateQuestion, 1000);
        } else {
            feedback = 'wrong';
            gameState.streak = 0;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') checkAnswer();
    }
</script>

<div class="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="bg-green-500 p-4 text-white flex justify-between items-center">
        <div class="flex items-center gap-2">
            <Trophy size={20} />
            <span class="font-bold">Score: {gameState.score}</span>
        </div>
        <div class="text-sm opacity-90">Best: {gameState.highScore}</div>
    </div>

    <!-- Game Area -->
    <div class="p-8 flex flex-col items-center gap-8">
        {#if currentQuestion}
            <div class="flex items-center gap-4 text-6xl font-bold text-gray-700">
                <span>{currentQuestion.num1}</span>
                <span class="text-green-500">{currentQuestion.operator}</span>
                <span>{currentQuestion.num2}</span>
                <span>=</span>
                <div class="relative w-24">
                    <input 
                        type="number" 
                        bind:value={userAnswer}
                        onkeydown={handleKeydown}
                        class="w-full text-center border-b-4 border-gray-300 focus:border-green-500 outline-none p-2 bg-transparent"
                        autofocus
                    />
                </div>
            </div>

            <!-- Feedback -->
            <div class="h-8">
                {#if feedback === 'correct'}
                    <span class="text-green-600 font-bold text-xl animate-bounce block">Awesome! 🎉</span>
                {:else if feedback === 'wrong'}
                    <span class="text-red-500 font-bold text-xl block">Try again! 💪</span>
                {/if}
            </div>

            <button 
                onclick={checkAnswer}
                class="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95"
            >
                Check Answer
            </button>
        {/if}
    </div>
</div>
