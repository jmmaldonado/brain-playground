<script lang="ts">
    import { onMount } from "svelte";
    import { Check, Flag, Globe2, Heart, HelpCircle, Info, Lightbulb, Mic, RotateCcw, Trophy, X } from "lucide-svelte";
    import { base } from "$app/paths";
    import { StorageService } from "$lib/services/storage";
    import { CONTINENTS, countries, type ContinentId, type Country } from "./data";
    import {
        buildChoiceOptions,
        difficulties,
        flagUrl,
        gameModes,
        getContinentLabel,
        getCountryPool,
        getTierForLevel,
        isCorrectCountryAnswer,
        pickCountry,
        type ChoiceDifficulty,
        type GameMode,
    } from "./logic";

    interface SaveState {
        highScores: Record<string, number>;
        bestStreaks: Record<string, number>;
    }

    type Phase = "setup" | "playing" | "results";
    type Feedback = "correct" | "wrong" | null;

    const storageKey = "world-flags";
    const defaultSave: SaveState = {
        highScores: { learn: 0, write: 0, choice_easy: 0, choice_normal: 0, choice_hard: 0 },
        bestStreaks: { learn: 0, write: 0, choice_easy: 0, choice_normal: 0, choice_hard: 0 },
    };
    const hintOptions = [
        { id: "continent", label: "Continente", penalty: 2 },
        { id: "first", label: "Primera letra", penalty: 4 },
        { id: "three", label: "Tres primeras letras", penalty: 9 },
    ] as const;

    let phase: Phase = $state("setup");
    let mode: GameMode = $state("learn");
    let difficulty: ChoiceDifficulty = $state("easy");
    let selectedContinents: ContinentId[] = $state(CONTINENTS.map((item) => item.id));
    let currentCountry: Country | null = $state(null);
    let choiceOptions: Country[] = $state([]);
    let recentIds: string[] = $state([]);
    let answer = $state("");
    let feedback: Feedback = $state(null);
    let score = $state(0);
    let streak = $state(0);
    let bestRunStreak = $state(0);
    let level = $state(1);
    let hintPenalty = $state(0);
    let revealedHints: string[] = $state([]);
    let livesEnabled = $state(false);
    let livesRemaining = $state(3);
    let mistakes = $state(0);
    let correctAnswers = $state(0);
    let selectedChoiceCode: string | null = $state(null);
    let celebration: { points: number } | null = $state(null);
    let saveState: SaveState = $state(structuredClone(defaultSave));
    let speechSupported = $state(false);
    let isListening = $state(false);
    let speechMessage = $state("");
    let showHintModal = $state(false);
    let showPoolModal = $state(false);

    let pool = $derived(getCountryPool(selectedContinents, level));
    let selectedCountryCount = $derived(
        countries.filter((country) => selectedContinents.includes(country.continent)).length,
    );
    let modeKey = $derived(mode === "choice" ? `choice_${difficulty}` : mode);
    let currentHighScore = $derived(saveState.highScores[modeKey] ?? 0);
    let progressTier = $derived(getTierForLevel(level));

    onMount(() => {
        const saved = StorageService.load<SaveState>(storageKey);
        if (saved) {
            saveState = {
                highScores: { ...defaultSave.highScores, ...saved.highScores },
                bestStreaks: { ...defaultSave.bestStreaks, ...saved.bestStreaks },
            };
        }

        const browserWindow = window as any;
        speechSupported = Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition);
    });

    function toggleContinent(continent: ContinentId) {
        if (selectedContinents.includes(continent)) {
            if (selectedContinents.length === 1) return;
            selectedContinents = selectedContinents.filter((item) => item !== continent);
        } else {
            selectedContinents = [...selectedContinents, continent];
        }
    }

    function startGame() {
        score = 0;
        streak = 0;
        bestRunStreak = 0;
        level = 1;
        livesRemaining = livesEnabled ? 3 : 0;
        mistakes = 0;
        correctAnswers = 0;
        recentIds = [];
        phase = "playing";
        nextQuestion();
    }

    function stopGame() {
        phase = "setup";
        saveProgress();
    }

    function nextQuestion() {
        const nextPool = getCountryPool(selectedContinents, level);
        currentCountry = pickCountry(nextPool, recentIds);
        recentIds = [...recentIds.slice(-7), currentCountry.code];
        choiceOptions = mode === "choice" ? buildChoiceOptions(currentCountry, nextPool, difficulty, level) : [];
        answer = "";
        feedback = null;
        selectedChoiceCode = null;
        hintPenalty = 0;
        revealedHints = [];
        speechMessage = "";
        if (typeof document !== "undefined") {
            (document.activeElement as HTMLElement | null)?.blur();
        }
    }

    function markCorrect(basePoints: number) {
        const earned = Math.max(1, basePoints + streak * 2 + (currentCountry?.tier ?? 1) - hintPenalty);
        score += earned;
        correctAnswers += 1;
        streak += 1;
        bestRunStreak = Math.max(bestRunStreak, streak);
        level = Math.max(level, Math.floor(streak / 3) + 1);
        feedback = "correct";
        celebration = { points: earned };
        saveProgress();
        window.setTimeout(() => {
            celebration = null;
        }, 900);
        window.setTimeout(nextQuestion, mode === "learn" ? 450 : 850);
    }

    function markWrong() {
        streak = 0;
        mistakes += 1;
        if (livesEnabled) {
            livesRemaining = Math.max(0, livesRemaining - 1);
            if (livesRemaining === 0) {
                feedback = null;
                saveProgress();
                phase = "results";
                return;
            }
        }
        feedback = "wrong";
        saveProgress();
    }

    function saveProgress() {
        const nextSave = {
            highScores: { ...saveState.highScores, [modeKey]: Math.max(saveState.highScores[modeKey] ?? 0, score) },
            bestStreaks: { ...saveState.bestStreaks, [modeKey]: Math.max(saveState.bestStreaks[modeKey] ?? 0, streak) },
        };
        saveState = nextSave;
        StorageService.save(storageKey, nextSave);
    }

    function handleLearnKnown() {
        markCorrect(5);
    }

    function checkTextAnswer() {
        if (!currentCountry || feedback) return;
        if (isCorrectCountryAnswer(answer, currentCountry)) {
            markCorrect(12);
        } else {
            markWrong();
        }
    }

    function chooseFlag(country: Country) {
        if (!currentCountry || feedback) return;
        selectedChoiceCode = country.code;
        if (country.code === currentCountry.code) {
            markCorrect(difficulty === "hard" ? 16 : difficulty === "normal" ? 13 : 10);
        } else {
            markWrong();
        }
    }

    function revealHint(kind: "continent" | "first" | "three") {
        if (!currentCountry || revealedHints.includes(kind)) return;
        revealedHints = [...revealedHints, kind];
        hintPenalty += hintOptions.find((hint) => hint.id === kind)?.penalty ?? 0;
    }

    function countryCountForContinent(continent: ContinentId) {
        return countries.filter((country) => country.continent === continent).length;
    }

    function activeCountryCountForContinent(continent: ContinentId) {
        return pool.filter((country) => country.continent === continent).length;
    }

    function currentHintValue(kind: "continent" | "first" | "three") {
        if (!currentCountry) return "";
        if (kind === "continent") return getContinentLabel(currentCountry.continent);
        if (kind === "first") return currentCountry.name.slice(0, 1);
        return currentCountry.name.slice(0, 3);
    }

    function startListening() {
        if (!speechSupported || isListening) return;
        const browserWindow = window as any;
        const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
        const recognition = new Recognition();
        recognition.lang = "es-ES";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        isListening = true;
        speechMessage = "Escuchando...";

        recognition.onresult = (event: any) => {
            answer = event.results[0][0].transcript;
            speechMessage = "Texto capturado";
            isListening = false;
        };
        recognition.onerror = () => {
            speechMessage = "No se pudo escuchar";
            isListening = false;
        };
        recognition.onend = () => {
            isListening = false;
        };
        recognition.start();
    }
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-4 text-slate-800">
    {#if celebration}
        <div class="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg bg-emerald-600 px-5 py-3 text-lg font-black text-white shadow-xl">
            +{celebration.points} puntos
        </div>
    {/if}

    {#if phase === "setup"}
        <section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-5">
                    <div class="h-11 w-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Globe2 size={24} />
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-slate-900">Banderas del mundo</h2>
                        <p class="text-sm text-slate-500">{countries.length} paises, dificultad progresiva y pistas.</p>
                    </div>
                </div>

                <div class="space-y-5">
                    <div>
                        <div class="mb-2 flex items-center justify-between gap-3">
                            <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Continentes</span>
                            <span class="text-sm font-black text-emerald-700">{selectedCountryCount} paises seleccionados</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            {#each CONTINENTS as continent}
                                <button
                                    type="button"
                                    onclick={() => toggleContinent(continent.id)}
                                    class={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                                        selectedContinents.includes(continent.id)
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                    }`}>
                                    <span>{continent.label}</span>
                                    <span class="ml-auto text-xs font-black opacity-80">{countryCountForContinent(continent.id)} paises</span>
                                    <span class="flex h-5 w-5 items-center justify-center">
                                        {#if selectedContinents.includes(continent.id)}
                                            <Check size={16} />
                                        {/if}
                                    </span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div>
                        <span class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Modo</span>
                        <div class="grid gap-2 sm:grid-cols-3">
                            {#each gameModes as item}
                                <button
                                    type="button"
                                    onclick={() => (mode = item.id)}
                                    class={`rounded-lg border p-3 text-left transition-colors ${
                                        mode === item.id
                                            ? "border-sky-500 bg-sky-50 text-sky-800"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                    }`}>
                                    <span class="block font-black">{item.label}</span>
                                    <span class="block text-xs opacity-80">{item.description}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    {#if mode === "choice"}
                        <div>
                            <span class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Dificultad de banderas parecidas</span>
                            <div class="flex rounded-lg bg-slate-100 p-1">
                                {#each difficulties as item}
                                    <button
                                        type="button"
                                        onclick={() => (difficulty = item.id)}
                                        class={`flex-1 rounded-md px-3 py-2 text-sm font-black transition-colors ${
                                            difficulty === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                        }`}>
                                        {item.label}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <label class="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                        <span>
                            <span class="block font-black text-slate-800">Modo vidas</span>
                            <span class="block text-xs font-bold text-slate-500">Empieza con 3 vidas y muestra resultados al agotarlas.</span>
                        </span>
                        <input
                            type="checkbox"
                            bind:checked={livesEnabled}
                            class="h-5 w-5 accent-emerald-600" />
                    </label>

                    <button
                        type="button"
                        onclick={startGame}
                        class="w-full rounded-lg bg-slate-900 px-4 py-4 text-lg font-black text-white shadow-sm transition-transform active:scale-[0.99]">
                        Empezar
                    </button>
                </div>
            </div>

            <aside class="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <Trophy class="text-amber-500" size={22} />
                    <h3 class="font-black text-slate-900">Records</h3>
                </div>
                <div class="space-y-2">
                    {#each gameModes as item}
                        <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                            <span class="font-bold text-slate-600">{item.label}</span>
                            <span class="font-black text-slate-900">
                                {item.id === "choice"
                                    ? Math.max(saveState.highScores.choice_easy, saveState.highScores.choice_normal, saveState.highScores.choice_hard)
                                    : saveState.highScores[item.id]}
                            </span>
                        </div>
                    {/each}
                </div>
                <div class="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                    Los primeros niveles priorizan paises grandes o muy reconocibles. Al subir la racha entran paises menos frecuentes y distractores mas parecidos.
                </div>
            </aside>
        </section>
    {:else if phase === "playing" && currentCountry}
        <section class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div class="border-b border-slate-200 p-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-3">
                            <div class="rounded-lg bg-slate-100 p-2 text-slate-700">
                                <Flag size={20} />
                            </div>
                            <div>
                                <div class="text-xs uppercase tracking-wider text-slate-500 font-black">Nivel {level} - Tier {progressTier}</div>
                                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-slate-700">
                                    <span>Puntos {score}</span>
                                    <span>Racha {streak}</span>
                                    {#if livesEnabled}
                                        <span class="inline-flex items-center gap-1 text-red-600">
                                            <Heart size={15} fill="currentColor" />
                                            {livesRemaining}
                                        </span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onclick={stopGame}
                            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                            <RotateCcw size={16} />
                            Menu
                        </button>
                    </div>
                    <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2">
                        <div class="flex items-center justify-between gap-3 text-sm">
                            <span class="font-black text-slate-700">Pool actual: {pool.length} paises</span>
                            <button
                                type="button"
                                onclick={() => (showPoolModal = true)}
                                class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                                aria-label="Informacion del pool de paises">
                                <Info size={17} />
                            </button>
                        </div>
                        <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div class="h-full bg-sky-500" style={`width: ${Math.min(100, (pool.length / countries.length) * 100)}%`}></div>
                        </div>
                    </div>
                </div>

                <div class="p-4 sm:p-6">
                    {#if mode === "choice"}
                        <div class="mb-4 text-center">
                            <div class="text-sm font-black uppercase tracking-wider text-slate-500">Elige la bandera de</div>
                            <div class="flex items-center justify-center gap-3">
                                <h2 class="text-3xl sm:text-5xl font-black text-slate-900">{currentCountry.name}</h2>
                                <button
                                    type="button"
                                    onclick={() => (showHintModal = true)}
                                    class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    aria-label="Abrir pistas">
                                    <HelpCircle size={22} />
                                </button>
                            </div>
                        </div>
                        <div class="mx-auto grid max-w-3xl grid-cols-2 gap-3">
                            {#each choiceOptions as option}
                                <button
                                    type="button"
                                    onclick={() => chooseFlag(option)}
                                    class={`rounded-lg border-2 bg-white p-2 transition-all ${
                                        feedback && option.code === currentCountry?.code
                                            ? "border-emerald-500 bg-emerald-50"
                                            : feedback && selectedChoiceCode === option.code
                                              ? "border-red-500 bg-red-50"
                                            : feedback
                                              ? "border-slate-200 opacity-60"
                                              : "border-slate-200 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                                    }`}>
                                    <img class="aspect-[3/2] w-full rounded-md object-cover shadow-sm" src={flagUrl(option, base)} alt={`Bandera de ${option.name}`} />
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <div class="mx-auto max-w-3xl">
                            <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
                                <img class="aspect-[3/2] w-full object-contain" src={flagUrl(currentCountry, base)} alt={`Bandera de ${currentCountry.name}`} />
                                {#if mode !== "learn"}
                                    <button
                                        type="button"
                                        onclick={() => (showHintModal = true)}
                                        class="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-white/95 text-amber-700 shadow-sm hover:bg-amber-50"
                                        aria-label="Abrir pistas">
                                        <HelpCircle size={22} />
                                    </button>
                                {/if}
                            </div>

                            {#if mode === "learn"}
                                <div class="mt-5 text-center">
                                    <div class="text-sm font-black uppercase tracking-wider text-slate-500">{getContinentLabel(currentCountry.continent)}</div>
                                    <h2 class="text-4xl sm:text-6xl font-black text-slate-900">{currentCountry.name}</h2>
                                    <div class="mt-5 grid grid-cols-2 gap-3">
                                        <button type="button" onclick={nextQuestion} class="rounded-lg border border-slate-200 px-4 py-3 font-black text-slate-700 hover:bg-slate-50">
                                            Siguiente
                                        </button>
                                        <button type="button" onclick={handleLearnKnown} class="rounded-lg bg-emerald-600 px-4 py-3 font-black text-white">
                                            Ya la sabia
                                        </button>
                                    </div>
                                </div>
                            {:else}
                                <div class="mt-5 flex flex-col gap-3">
                                    <div class="flex gap-2">
                                        <input
                                            bind:value={answer}
                                            onkeydown={(event) => event.key === "Enter" && !feedback && checkTextAnswer()}
                                            class="min-w-0 flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-sky-500"
                                            placeholder="Nombre del pais"
                                            autocomplete="off" />
                                        <button
                                            type="button"
                                            onclick={startListening}
                                            disabled={!speechSupported || isListening || Boolean(feedback)}
                                            class="rounded-lg border-2 border-slate-200 px-4 text-slate-700 disabled:opacity-40"
                                            aria-label="Responder con microfono">
                                            <Mic class={isListening ? "text-red-500" : ""} size={22} />
                                        </button>
                                    </div>
                                    {#if speechMessage}
                                        <div class="text-sm font-bold text-slate-500">{speechMessage}</div>
                                    {/if}
                                    <button
                                        type="button"
                                        onclick={checkTextAnswer}
                                        disabled={Boolean(feedback)}
                                        class="rounded-lg bg-sky-600 px-4 py-3 text-lg font-black text-white disabled:bg-slate-300 disabled:text-slate-500">
                                        Comprobar
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <div class="mt-5 min-h-10 text-center">
                        {#if feedback === "correct"}
                            <div class="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-4 py-2 font-black text-emerald-700">
                                <Check size={20} />
                                Correcto
                            </div>
                        {:else if feedback === "wrong"}
                            <div class="inline-flex flex-wrap items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 font-black text-red-700">
                                <X size={20} />
                                Era {currentCountry.name}
                                <button type="button" onclick={nextQuestion} class="ml-2 rounded-md bg-white px-3 py-1 text-sm text-red-700">Siguiente</button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <aside class="flex flex-col gap-3">
                <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-black uppercase tracking-wider text-slate-500">Record</span>
                        <Trophy size={18} class="text-amber-500" />
                    </div>
                    <div class="mt-1 text-4xl font-black text-slate-900">{currentHighScore}</div>
                </div>
            </aside>
        </section>
    {:else if phase === "results"}
        <section class="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
            <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Trophy size={30} />
            </div>
            <h2 class="text-3xl font-black text-slate-900">Resultado</h2>
            <p class="mt-1 text-sm font-bold text-slate-500">Se agotaron las vidas.</p>

            <div class="mt-5 grid grid-cols-2 gap-3">
                <div class="rounded-lg bg-slate-50 p-4">
                    <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Puntuacion</span>
                    <span class="text-3xl font-black text-slate-900">{score}</span>
                </div>
                <div class="rounded-lg bg-slate-50 p-4">
                    <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Mejor racha</span>
                    <span class="text-3xl font-black text-slate-900">{bestRunStreak}</span>
                </div>
                <div class="rounded-lg bg-slate-50 p-4">
                    <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Aciertos</span>
                    <span class="text-3xl font-black text-slate-900">{correctAnswers}</span>
                </div>
                <div class="rounded-lg bg-slate-50 p-4">
                    <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Nivel</span>
                    <span class="text-3xl font-black text-slate-900">{level}</span>
                </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onclick={() => (phase = "setup")}
                    class="rounded-lg border border-slate-200 px-4 py-3 font-black text-slate-700 hover:bg-slate-50">
                    Configurar
                </button>
                <button
                    type="button"
                    onclick={startGame}
                    class="rounded-lg bg-slate-900 px-4 py-3 font-black text-white">
                    Repetir
                </button>
            </div>
        </section>
    {/if}

    {#if showHintModal && currentCountry}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <Lightbulb size={20} class="text-amber-500" />
                        <h3 class="text-lg font-black text-slate-900">Pistas</h3>
                    </div>
                    <button
                        type="button"
                        onclick={() => (showHintModal = false)}
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        aria-label="Cerrar pistas">
                        <X size={18} />
                    </button>
                </div>

                <div class="space-y-2">
                    {#each hintOptions as hint}
                        <button
                            type="button"
                            onclick={() => revealHint(hint.id)}
                            disabled={revealedHints.includes(hint.id)}
                            class="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50 disabled:bg-slate-50 disabled:text-slate-500">
                            <div class="flex items-center justify-between gap-3">
                                <span class="font-black text-slate-800">{hint.label}</span>
                                <span class="rounded-md bg-red-50 px-2 py-1 text-xs font-black text-red-600">-{hint.penalty} pts</span>
                            </div>
                            {#if revealedHints.includes(hint.id)}
                                <div class="mt-2 text-sm font-bold text-slate-700">{currentHintValue(hint.id)}</div>
                            {/if}
                        </button>
                    {/each}
                </div>

                <p class="mt-4 text-sm font-bold text-slate-500">
                    Acertar sin pistas mantiene la puntuacion maxima. Las pistas se acumulan y la de tres letras penaliza mas.
                </p>
            </div>
        </div>
    {/if}

    {#if showPoolModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <Info size={20} class="text-sky-500" />
                        <h3 class="text-lg font-black text-slate-900">Paises disponibles</h3>
                    </div>
                    <button
                        type="button"
                        onclick={() => (showPoolModal = false)}
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        aria-label="Cerrar informacion del pool">
                        <X size={18} />
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-lg bg-slate-50 p-3">
                        <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Seleccion</span>
                        <span class="text-2xl font-black text-slate-900">{selectedCountryCount}</span>
                    </div>
                    <div class="rounded-lg bg-sky-50 p-3">
                        <span class="block text-xs font-black uppercase tracking-wider text-sky-600">Nivel actual</span>
                        <span class="text-2xl font-black text-sky-700">{pool.length}</span>
                    </div>
                    <div class="rounded-lg bg-slate-50 p-3">
                        <span class="block text-xs font-black uppercase tracking-wider text-slate-500">Dataset</span>
                        <span class="text-2xl font-black text-slate-900">{countries.length}</span>
                    </div>
                </div>

                <div class="mt-4 space-y-2">
                    {#each CONTINENTS.filter((continent) => selectedContinents.includes(continent.id)) as continent}
                        <div class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold">
                            <span>{continent.label}</span>
                            <span>{activeCountryCountForContinent(continent.id)} / {countryCountForContinent(continent.id)} paises</span>
                        </div>
                    {/each}
                </div>

                <p class="mt-4 text-sm font-bold text-slate-500">
                    El nivel actual filtra por relevancia. Con rachas altas entran mas paises de la seleccion.
                </p>
            </div>
        </div>
    {/if}
</div>
