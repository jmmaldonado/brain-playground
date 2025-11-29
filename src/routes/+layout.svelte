<script lang="ts">
	import '../app.css';
	import { Gamepad2, Settings } from 'lucide-svelte';
    
    let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<header class="bg-blue-600 text-white p-4 shadow-md">
		<div class="container mx-auto flex justify-between items-center">
			<a href="/" class="text-2xl font-bold flex items-center gap-2">
				<Gamepad2 /> Brain Playground
			</a>
			<nav>
                <!-- Place for global settings or links -->
                <button class="p-2 hover:bg-blue-700 rounded-full" aria-label="Settings">
                    <Settings size={20} />
                </button>
			</nav>
		</div>
	</header>

	<main class="flex-grow container mx-auto p-4">
		{@render children()}
	</main>

	<footer class="bg-gray-100 p-4 text-center text-gray-500 text-sm">
		<p>&copy; {new Date().getFullYear()} Brain Playground</p>
	</footer>
</div>
