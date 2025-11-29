<script lang="ts">
	import { Calculator, Palette } from 'lucide-svelte';

    // This will be populated dynamically later
	let games = [
		{
			id: 'math-game',
			title: 'Math Whiz',
			description: 'Practice addition, subtraction, and multiplication!',
			icon: Calculator,
			color: 'bg-green-100 text-green-600',
            href: '/games/math-game'
		},
		{
			id: 'color-mixer',
			title: 'Color Mixer',
			description: 'Mix red, green, and blue to make new colors!',
			icon: Palette,
			color: 'bg-purple-100 text-purple-600',
             href: '/games/color-mixer'
		},
        {
            id: 'color-theory',
            title: 'Chromatic Academy',
            description: 'Learn how mixing works and find opposing colors!',
            icon: Palette,
            color: 'bg-pink-100 text-pink-600',
            href: '/games/color-theory'
        }
	];
</script>

<div class="space-y-8">
	<section class="text-center py-8">
		<h1 class="text-4xl font-extrabold text-gray-800 mb-4">Welcome to Brain Playground!</h1>
		<p class="text-xl text-gray-600">Choose a game to start playing and learning.</p>
	</section>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each games as game}
			<a
				href={game.href}
				class="block p-6 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow transform hover:-translate-y-1 border border-gray-100"
			>
				<div class={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${game.color}`}>
					<game.icon size={32} />
				</div>
				<h2 class="text-2xl font-bold text-gray-800 mb-2">{game.title}</h2>
				<p class="text-gray-600">{game.description}</p>
			</a>
		{/each}
	</div>
</div>
