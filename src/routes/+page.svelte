<script lang="ts">
    import {
        ArrowRight,
        Bird,
        Box,
        Calculator,
        Cpu,
        Filter,
        Globe2,
        Lock,
        MapPin,
        Palette,
        Search,
        X,
    } from "lucide-svelte";
    import { onMount } from "svelte";
    import { pageTitle } from "$lib/stores/app";
    import { base } from "$app/paths";

    onMount(() => {
        pageTitle.set("Brain Playground");
    });

    let selectedCategory = $state("Todos");
    let showFilterModal = $state(false);

    const games = [
        {
            id: "world-flags",
            title: "Banderas del mundo",
            description: "Aprende paises por continente con banderas, pistas, texto y microfono.",
            icon: Globe2,
            color: "bg-emerald-100 text-emerald-700",
            category: "Geografia",
            href: `${base}/games/world-flags`,
        },
        {
            id: "spain-map",
            title: "Mapa de Espana",
            description: "Aprende las comunidades, provincias y capitales.",
            icon: MapPin,
            color: "bg-orange-100 text-orange-600",
            category: "Geografia",
            href: `${base}/games/spain-map`,
        },
        {
            id: "math-game",
            title: "Math Whiz",
            description: "Practice addition, subtraction, and multiplication.",
            icon: Calculator,
            color: "bg-green-100 text-green-600",
            category: "Matematicas",
            href: `${base}/games/math-game`,
        },
        {
            id: "math-fill",
            title: "Math Detectives",
            description: "Find the missing numbers or signs to solve the puzzle.",
            icon: Calculator,
            color: "bg-blue-100 text-blue-600",
            category: "Matematicas",
            href: `${base}/games/math-fill`,
        },
        {
            id: "color-theory",
            title: "Chromatic Academy",
            description: "Master color theory: mixing, harmony, and matching.",
            icon: Palette,
            color: "bg-purple-100 text-purple-600",
            category: "Creatividad",
            href: `${base}/games/color-theory`,
        },
        {
            id: "logic-gates",
            title: "Logic Lab",
            description: "Learn how computers think with digital logic gates.",
            icon: Cpu,
            color: "bg-indigo-100 text-indigo-600",
            category: "Logica",
            href: `${base}/games/logic-gates`,
        },
        {
            id: "logic-basics",
            title: "Logic Basics",
            description: "Experiment with switches, buttons, and light bulbs.",
            icon: Cpu,
            color: "bg-yellow-100 text-yellow-600",
            category: "Logica",
            href: `${base}/games/logic-basics`,
        },
        {
            id: "code-breaker",
            title: "Code Breaker",
            description: "Crack the secret code using logic and deduction.",
            icon: Lock,
            color: "bg-red-100 text-red-600",
            category: "Logica",
            href: `${base}/games/code-breaker`,
        },
        {
            id: "math-crossing",
            title: "Math Crossing",
            description: "Solve intersecting math equations in a crossword style.",
            icon: Calculator,
            color: "bg-indigo-100 text-indigo-600",
            category: "Matematicas",
            href: `${base}/games/math-crossing`,
        },
        {
            id: "number-parrot",
            title: "Number Parrot",
            description: "Listen and repeat the numbers with the parrot.",
            icon: Bird,
            color: "bg-sky-100 text-sky-600",
            category: "Memoria",
            href: `${base}/games/number-parrot`,
        },
        {
            id: "emoji-detective",
            title: "Emoji Detective",
            description: "Find the hidden emojis as fast as you can.",
            icon: Search,
            color: "bg-violet-100 text-violet-600",
            category: "Atencion",
            href: `${base}/games/emoji-detective`,
        },
        {
            id: "rubiks-cube-timer",
            title: "SpeedCube Timer",
            description: "Practice your speedsolving with this professional timer.",
            icon: Box,
            color: "bg-blue-100 text-blue-600",
            category: "Herramientas",
            href: `${base}/games/rubiks-cube-timer`,
        },
    ];

    const categories = $derived([
        "Todos",
        ...Array.from(new Set(games.map((game) => game.category))),
    ]);
    const filteredGames = $derived(
        selectedCategory === "Todos"
            ? games
            : games.filter((game) => game.category === selectedCategory),
    );

    function selectCategory(category: string) {
        selectedCategory = category;
        showFilterModal = false;
    }
</script>

<div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900">Juegos</h1>
            <p class="text-sm sm:text-base text-slate-600">
                Elige una actividad y vuelve al menu desde la barra superior.
            </p>
        </div>
        <button
            type="button"
            onclick={() => (showFilterModal = true)}
            class={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-black shadow-sm transition-colors ${
                selectedCategory === "Todos"
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-blue-600 bg-blue-600 text-white"
            }`}>
            <Filter size={18} />
            {selectedCategory === "Todos" ? "Filtrar" : selectedCategory}
        </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {#each filteredGames as game}
            <a
                href={game.href}
                class="group flex min-h-32 items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <div class={`h-12 w-12 shrink-0 rounded-lg flex items-center justify-center ${game.color}`}>
                    <game.icon class="w-6 h-6" />
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="text-xs font-black uppercase tracking-wider text-slate-400">{game.category}</span>
                            <h2 class="text-lg sm:text-xl font-black text-slate-900 leading-tight">{game.title}</h2>
                        </div>
                        <ArrowRight class="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                    </div>
                    <p class="mt-2 text-sm text-slate-600 line-clamp-2">{game.description}</p>
                </div>
            </a>
        {/each}
    </div>

    {#if showFilterModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div class="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <h2 class="text-lg font-black text-slate-900">Filtrar juegos</h2>
                    <button
                        type="button"
                        onclick={() => (showFilterModal = false)}
                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        aria-label="Cerrar filtros">
                        <X size={18} />
                    </button>
                </div>

                <div class="space-y-2">
                    {#each categories as category}
                        <button
                            type="button"
                            onclick={() => selectCategory(category)}
                            class={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left font-black transition-colors ${
                                selectedCategory === category
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}>
                            <span>{category}</span>
                            {#if selectedCategory === category}
                                <Filter size={16} />
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
