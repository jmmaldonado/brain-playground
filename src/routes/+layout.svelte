<script lang="ts">
	import '../app.css';
	import { Gamepad2, Settings, ArrowLeft } from 'lucide-svelte';
    import { pageTitle } from '$lib/stores/app';
    
    let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<header class="bg-blue-600 text-white p-4 shadow-md">
		<div class="container mx-auto flex justify-between items-center">
			<div class="flex items-center gap-4">
                {#if $pageTitle !== 'Brain Playground'}
                    <a href="/" class="p-1 hover:bg-blue-700 rounded-full transition-colors" aria-label="Back to Home">
                        <ArrowLeft size={28} />
                    </a>
                {:else}
                    <div class="p-1">
                        <Gamepad2 size={28} />
                    </div>
                {/if}
                <span class="text-2xl font-bold">{$pageTitle}</span>
            </div>
			<nav>
                <!-- Place for global settings or links -->
                <a href="/settings" class="p-2 hover:bg-blue-700 rounded-full inline-block text-white" aria-label="Settings">
                    <Settings size={20} />
                </a>
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
