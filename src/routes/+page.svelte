<script lang="ts">
	import { Calculator, Palette, Cpu } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';
    import { base } from '$app/paths';

    onMount(() => {
        pageTitle.set('Brain Playground');
    });

    // This will be populated dynamically later
	let games = [
		{
			id: 'math-game',
			title: 'Math Whiz',
			description: 'Practice addition, subtraction, and multiplication!',
			icon: Calculator,
			color: 'bg-green-100 text-green-600',
            href: `${base}/games/math-game`
		},
        {
            id: 'math-fill',
            title: 'Math Detectives',
            description: 'Find the missing numbers or signs to solve the puzzle!',
            icon: Calculator,
            color: 'bg-blue-100 text-blue-600',
            href: `${base}/games/math-fill`
        },
        {
            id: 'color-theory',
            title: 'Chromatic Academy',
            description: 'Master color theory: Mixing, Harmony, and Matching!',
            icon: Palette,
            color: 'bg-purple-100 text-purple-600', // Changed color to purple to match the old mixer vibe
            href: `${base}/games/color-theory`
        },
        {
            id: 'logic-gates',
            title: 'Logic Lab',
            description: 'Learn how computers think with digital logic gates!',
            icon: Cpu,
            color: 'bg-indigo-100 text-indigo-600',
            href: `${base}/games/logic-gates`
        },
        {
            id: 'logic-basics',
            title: 'Logic Basics',
            description: 'Experiment with switches, buttons, and light bulbs!',
            icon: Cpu,
            color: 'bg-yellow-100 text-yellow-600',
            href: `${base}/games/logic-basics`
        }
	];
</script>

<div class="space-y-4 sm:space-y-8">
	<div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
		{#each games as game}
			<a
				href={game.href}
				class="block p-4 sm:p-6 rounded-2xl shadow-md sm:shadow-lg bg-white hover:shadow-xl transition-shadow transform hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center"
			>
				<div class={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${game.color}`}>
					<game.icon class="w-6 h-6 sm:w-8 sm:h-8" />
				</div>
				<h2 class="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">{game.title}</h2>
				<p class="text-xs sm:text-base text-gray-600 line-clamp-3 sm:line-clamp-none">{game.description}</p>
			</a>
		{/each}
	</div>
</div>
