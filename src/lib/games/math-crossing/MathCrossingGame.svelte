<script lang="ts">
    import {
        generateGrid,
        validateEquation,
        type Grid,
        type Cell,
        type DifficultyLevel,
    } from "./logic";
    import { onMount } from "svelte";
    import {
        Trophy,
        XCircle,
        Lightbulb,
        Check,
        Zap,
        X,
        Delete,
        RotateCcw,
    } from "lucide-svelte";
    import { slide, scale, fade, fly } from "svelte/transition";
    import { StorageService } from "$lib/services/storage";

    interface DifficultyProgress {
        score: number;
        highScore: number;
        puzzlesSolved: number;
        failures: number;
    }

    interface GameState {
        difficulty: DifficultyLevel;
        hints: number;
        instantMode: boolean;
        progress: Record<DifficultyLevel, DifficultyProgress>;
    }

    const defaultProgress: DifficultyProgress = {
        score: 0,
        highScore: 0,
        puzzlesSolved: 0,
        failures: 0,
    };

    let gameState: GameState = $state({
        difficulty: "Easy",
        hints: 3,
        instantMode: false,
        progress: {
            Easy: { ...defaultProgress },
            Medium: { ...defaultProgress },
            Hard: { ...defaultProgress },
            Expert: { ...defaultProgress },
        },
    });

    let grid: Grid | null = $state(null);
    let selectedCellId: string | null = $state(null);
    let feedback: "correct" | "wrong" | null = $state(null);
    let showDelayedFeedback = $state(false);

    interface OptionItem {
        id: string;
        value: string | number;
        isUsed: boolean;
    }
    let options: OptionItem[] = $state([]);

    onMount(() => {
        const saved = StorageService.load<any>("math-crossing");
        if (saved) {
            // Check if it's the old format (has 'score' at top level)
            // Check if it's the old format (has 'score' at top level)
            if ("score" in saved) {
                // Migrate old data to 'Easy' slot (or whatever difficulty was saved, default Easy)
                let oldDiff = saved.difficulty || "Easy";
                if (!["Easy", "Medium", "Hard", "Expert"].includes(oldDiff)) {
                    oldDiff = "Easy";
                }
                const validDiff = oldDiff as DifficultyLevel;

                gameState.difficulty = validDiff;
                gameState.hints = saved.hints ?? 3;
                gameState.instantMode = saved.instantMode || false;

                gameState.progress[validDiff] = {
                    score: saved.score || 0,
                    highScore: saved.highScore || 0,
                    puzzlesSolved: saved.puzzlesSolved || 0,
                    failures: saved.failures || 0,
                };
            } else {
                // New format
                let savedDiff = saved.difficulty || "Easy";
                if (!["Easy", "Medium", "Hard", "Expert"].includes(savedDiff)) {
                    savedDiff = "Easy";
                }
                gameState.difficulty = savedDiff as DifficultyLevel;

                gameState.hints = saved.hints ?? 3;
                gameState.instantMode = saved.instantMode || false;
                if (saved.progress) {
                    gameState.progress = {
                        ...gameState.progress,
                        ...saved.progress,
                    };
                }
            }
        }
        startLevel();
    });

    function startLevel() {
        const g = generateGrid(gameState.difficulty);
        grid = g;
        options = g.options.map((val, i) => ({
            id: `opt-${i}`,
            value: val,
            isUsed: false,
        }));

        selectedCellId = null;
        feedback = null;
        showDelayedFeedback = false;
    }

    function restartLevel() {
        if (!grid) return;
        // Reset all inputs
        grid.cells.forEach((c) => {
            if (c.isInput) {
                c.displayValue = null;
                c.isCorrect = false;
                c.isWrong = false;
            }
        });
        // Reset options
        options.forEach((o) => (o.isUsed = false));
        selectedCellId = null;
        feedback = null;
        showDelayedFeedback = false;
    }

    function handleCellClick(cell: Cell) {
        if (!cell.isInput) return;
        selectedCellId = cell.id;
    }

    function handleOptionClick(option: OptionItem) {
        if (option.isUsed || !grid || !selectedCellId) return;

        const cellIndex = grid.cells.findIndex((c) => c.id === selectedCellId);
        if (cellIndex === -1) return;
        const cell = grid.cells[cellIndex];

        // Strict input restriction: Numbers only in number cells
        if (cell.type === "number" && typeof option.value !== "number") return;
        // Operators shouldn't be in the bank anymore, but just in case:
        if (cell.type === "operator" && typeof option.value !== "string")
            return;

        // If cell already had a value, return it to bank
        if (cell.displayValue !== null) {
            returnValueToBank(cell.displayValue);
        }

        // Place new value
        grid.cells[cellIndex].displayValue = option.value;
        option.isUsed = true;

        if (gameState.instantMode) {
            checkImmediate();
        } else {
            advanceSelection();
            // Auto-check if full
            if (
                grid.cells.every((c) => !c.isInput || c.displayValue !== null)
            ) {
                checkDelayed();
            }
        }
    }

    function returnValueToBank(value: string | number) {
        const opt = options.find(
            (o) => o.isUsed && String(o.value) === String(value),
        );
        if (opt) opt.isUsed = false;
    }

    function clearCell() {
        if (!grid || !selectedCellId) return;
        const cellIndex = grid.cells.findIndex((c) => c.id === selectedCellId);
        if (cellIndex === -1) return;

        const cell = grid.cells[cellIndex];
        if (!cell.isInput || cell.displayValue === null) return;

        returnValueToBank(cell.displayValue);
        grid.cells[cellIndex].displayValue = null;
        grid.cells[cellIndex].isWrong = false;
        grid.cells[cellIndex].isCorrect = false;
    }

    function checkImmediate() {
        if (!grid) return;

        let anyWrong = false;

        grid.equations.forEach((eq) => {
            const cells = eq.cells.map(
                (pos) =>
                    grid!.cells.find(
                        (c) => c.row === pos.row && c.col === pos.col,
                    )!,
            );
            const isFull = cells.every((c) => c.displayValue !== null);

            if (isFull) {
                const isValid = validateEquation(cells);
                cells.forEach((c) => {
                    if (c.isInput) {
                        if (isValid) {
                            c.isCorrect = true;
                            c.isWrong = false;
                        } else {
                            c.isWrong = true;
                            c.isCorrect = false;
                            anyWrong = true;
                        }
                    }
                });
            }
        });

        grid.cells.forEach((cell) => {
            if (!cell.isInput) return;

            const myEquations = grid!.equations.filter((eq) =>
                eq.cells.some(
                    (pos) => pos.row === cell.row && pos.col === cell.col,
                ),
            );
            const completedEquations = myEquations.filter((eq) => {
                const cells = eq.cells.map(
                    (pos) =>
                        grid!.cells.find(
                            (c) => c.row === pos.row && c.col === pos.col,
                        )!,
                );
                return cells.every((c) => c.displayValue !== null);
            });

            if (completedEquations.length > 0) {
                const anyInvalid = completedEquations.some((eq) => {
                    const cells = eq.cells.map(
                        (pos) =>
                            grid!.cells.find(
                                (c) => c.row === pos.row && c.col === pos.col,
                            )!,
                    );
                    return !validateEquation(cells);
                });

                if (anyInvalid) {
                    cell.isWrong = true;
                    cell.isCorrect = false;
                } else {
                    cell.isCorrect = true;
                    cell.isWrong = false;
                }
            } else {
                cell.isCorrect = false;
                cell.isWrong = false;
            }
        });

        if (anyWrong) {
            gameState.progress[gameState.difficulty].failures++;
            StorageService.save("math-crossing", gameState);
        }

        const allFilled = grid.cells.every(
            (c) => !c.isInput || c.displayValue !== null,
        );
        const noWrongs = grid.cells.every((c) => !c.isWrong);

        if (allFilled && noWrongs) {
            completeLevel();
        } else if (!anyWrong && allFilled) {
            completeLevel();
        } else {
            advanceSelection();
        }
    }

    function checkDelayed() {
        if (!grid) return;
        checkImmediate();
        showDelayedFeedback = true;
        const anyWrong = grid.cells.some((c) => c.isWrong);
        if (anyWrong) {
            feedback = "wrong";
            setTimeout(() => (feedback = null), 2000);
        }
    }

    function completeLevel() {
        feedback = "correct";

        let points = 50;
        if (gameState.difficulty === "Medium") points = 100;
        if (gameState.difficulty === "Hard") points = 200;
        if (gameState.difficulty === "Expert") points = 500;

        gameState.progress[gameState.difficulty].score += points;
        if (
            gameState.progress[gameState.difficulty].score >
            gameState.progress[gameState.difficulty].highScore
        )
            gameState.progress[gameState.difficulty].highScore =
                gameState.progress[gameState.difficulty].score;

        gameState.progress[gameState.difficulty].puzzlesSolved++;
        if (gameState.progress[gameState.difficulty].puzzlesSolved % 3 === 0)
            gameState.hints++;

        StorageService.save("math-crossing", gameState);
        setTimeout(() => startLevel(), 2000);
    }

    function advanceSelection() {
        if (!grid || !selectedCellId) return;
        const currentIdx = grid.cells.findIndex((c) => c.id === selectedCellId);
        const nextInput = grid.cells.find(
            (c, i) => i > currentIdx && c.isInput && c.displayValue === null,
        );

        if (nextInput) {
            selectedCellId = nextInput.id;
        } else {
            const firstInput = grid.cells.find(
                (c) => c.isInput && c.displayValue === null,
            );
            if (firstInput) selectedCellId = firstInput.id;
            else selectedCellId = null; // Deselect if full
        }
    }

    function useHint() {
        if (gameState.hints <= 0 || !selectedCellId || !grid) return;
        const cellIndex = grid.cells.findIndex((c) => c.id === selectedCellId);
        if (cellIndex === -1) return;
        const cell = grid.cells[cellIndex];

        if (cell.displayValue !== null) returnValueToBank(cell.displayValue);

        const trueVal = cell.value;
        const opt = options.find(
            (o) => !o.isUsed && String(o.value) === String(trueVal),
        );

        if (opt) {
            opt.isUsed = true;
            grid.cells[cellIndex].displayValue = trueVal;
            grid.cells[cellIndex].isCorrect = true;
            grid.cells[cellIndex].isWrong = false;
            gameState.hints--;
            StorageService.save("math-crossing", gameState);
            if (gameState.instantMode) checkImmediate();
        }
    }

    function toggleInstantMode() {
        gameState.instantMode = !gameState.instantMode;
        StorageService.save("math-crossing", gameState);
    }

    function closeDrawer() {
        selectedCellId = null;
    }
</script>

<div class="flex flex-col h-full w-full bg-gray-50 relative overflow-hidden">
    <!-- Note: h-full assumes parent has height. -->

    <!-- Top Bar -->
    <div
        class="w-full bg-white border-b border-gray-200 px-4 py-2 flex flex-col items-center justify-between shadow-sm z-10 shrink-0">
        <div class="flex items-center justify-between gap-3 w-full">
            <div class="flex items-center gap-2 bg-indigo-50 rounded-lg p-1">
                <!-- Removed Level Indicator -->
                <select
                    bind:value={gameState.difficulty}
                    onchange={() => startLevel()}
                    class="bg-transparent text-xs font-bold text-indigo-700 border-none focus:ring-0 cursor-pointer py-0 pl-1 pr-6">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>

            <button
                onclick={toggleInstantMode}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${gameState.instantMode ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                <Zap
                    size={14}
                    class={gameState.instantMode ? "fill-indigo-700" : ""} />
                <span class="hidden sm:inline">Instant</span>
            </button>

            <button
                onclick={restartLevel}
                class="flex items-center gap-1.5 text-gray-500 font-bold hover:bg-gray-100 px-2.5 py-1 rounded-lg transition-colors text-sm"
                title="Restart Level">
                <RotateCcw size={16} />
                <span class="hidden sm:inline">Restart</span>
            </button>
        </div>

        <div class="flex items-center gap-6">
            {#if gameState.progress[gameState.difficulty].failures > 0}
                <div
                    class="flex items-center gap-1 text-gray-500 font-medium text-sm">
                    <XCircle size={16} class="text-red-400" />
                    <span
                        >{gameState.progress[gameState.difficulty]
                            .failures}</span>
                </div>
            {/if}

            <button
                onclick={useHint}
                disabled={gameState.hints <= 0}
                class="flex items-center gap-1 text-yellow-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-50 px-2 py-1 rounded-lg transition-colors text-sm">
                <Lightbulb size={16} class="fill-yellow-600" />
                <span>{gameState.hints}</span>
            </button>

            <div
                class="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                <Trophy size={16} />
                <span>{gameState.progress[gameState.difficulty].score}</span>
            </div>
        </div>
    </div>

    <!-- Main Content Area (Grid) -->
    <div
        class="flex-1 overflow-auto relative flex flex-col items-center justify-center p-2 pb-32">
        <!-- Reduced padding -->
        <!-- Feedback Banner -->
        {#if feedback}
            <div
                in:slide
                class={`absolute top-2 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${feedback === "correct" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {#if feedback === "correct"}
                    Outstanding! 🎉
                {:else}
                    Check your math! 💪
                {/if}
            </div>
        {/if}

        {#if grid}
            <div class="flex items-center justify-center">
                <div
                    class="grid gap-px bg-gray-300 border-2 border-gray-300 shadow-lg"
                    style={`grid-template-columns: repeat(${grid.cols}, minmax(32px, 48px)); grid-template-rows: repeat(${grid.rows}, minmax(32px, 48px));`}>
                    {#each grid.cells as cell (cell.id)}
                        <div
                            class="relative bg-white"
                            style={`grid-column: ${cell.col + 1}; grid-row: ${cell.row + 1};`}>
                            {#if cell.isInput}
                                <button
                                    onclick={() => handleCellClick(cell)}
                                    class={`w-full h-full text-lg sm:text-xl font-bold flex items-center justify-center transition-all
                                        ${selectedCellId === cell.id ? "bg-indigo-50 inset-0 ring-2 ring-indigo-500 z-10" : "hover:bg-gray-50"}
                                        ${cell.isCorrect ? "bg-green-50 text-green-700" : ""}
                                        ${cell.isWrong ? "bg-red-50 text-red-700" : ""}
                                    `}>
                                    {cell.displayValue ?? ""}
                                </button>
                            {:else}
                                <div
                                    class={`w-full h-full flex items-center justify-center text-lg sm:text-xl font-bold
                                    ${cell.type === "operator" ? "text-indigo-500" : ""}
                                    ${cell.type === "equals" ? "text-gray-400" : "text-gray-700"}
                                `}>
                                    {cell.value}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <!-- Bottom Drawer (Bank) -->
    {#if selectedCellId}
        <div
            transition:fly={{ y: 200, duration: 300 }}
            class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50 rounded-t-3xl">
            <div class="max-w-4xl mx-auto flex flex-col gap-3">
                <div class="flex justify-between items-center">
                    <span
                        class="text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >Select Number</span>
                    <button
                        onclick={closeDrawer}
                        class="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                <div class="flex flex-wrap justify-center gap-2">
                    {#each options as option (option.id)}
                        {#if !option.isUsed}
                            <button
                                in:scale
                                onclick={() => handleOptionClick(option)}
                                class="bg-white hover:bg-indigo-50 active:bg-indigo-100 p-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm border-2 border-gray-200 active:border-indigo-400 active:translate-y-0.5 transition-all text-lg font-bold text-gray-700 flex items-center justify-center">
                                {option.value}
                            </button>
                        {/if}
                    {/each}

                    <button
                        onclick={clearCell}
                        class="bg-red-50 hover:bg-red-100 active:bg-red-200 w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm border-2 border-red-200 active:border-red-300 active:translate-y-0.5 transition-all text-red-600 flex items-center justify-center"
                        title="Clear Cell">
                        <Delete size={18} />
                    </button>
                </div>

                {#if options.every((o) => o.isUsed)}
                    <div
                        in:fade
                        class="text-center text-xs text-gray-400 font-medium">
                        All numbers placed!
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
