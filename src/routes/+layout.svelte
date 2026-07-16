<script lang="ts">
	import '../app.css';
	import { Gamepad2, Settings, ArrowLeft } from 'lucide-svelte';
    import { pageTitle } from '$lib/stores/app';
    import { base } from '$app/paths';
    
    import InstallPrompt from '$lib/components/InstallPrompt.svelte';

    let { children } = $props();

    $effect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` })
                .then((registration) => {
                    console.log('SW Registered', registration);
                })
                .catch((error) => {
                    console.log('SW registration error', error);
                });
        }
    });
</script>

<svelte:head>
    <link rel="manifest" href="{base}/manifest.webmanifest">
</svelte:head>

<div class="min-h-screen flex flex-col">
	<header class="bg-blue-600 text-white px-3 py-2 shadow-sm">
		<div class="container mx-auto flex justify-between items-center">
			<div class="flex items-center gap-2 min-w-0">
                {#if $pageTitle !== 'Brain Playground'}
                    <a href="{base}/" class="p-1 hover:bg-blue-700 rounded-md transition-colors shrink-0" aria-label="Back to Home">
                        <ArrowLeft size={22} />
                    </a>
                {:else}
                    <div class="p-1 shrink-0">
                        <Gamepad2 size={22} />
                    </div>
                {/if}
                <span class="truncate text-lg sm:text-xl font-bold">{$pageTitle}</span>
            </div>
			<nav>
                <!-- Place for global settings or links -->
                <a href="{base}/settings" class="p-1.5 hover:bg-blue-700 rounded-md inline-block text-white" aria-label="Settings">
                    <Settings size={18} />
                </a>
			</nav>
		</div>
	</header>

	<main class="flex-grow container mx-auto p-3 sm:p-4">
		{@render children()}
	</main>

	<footer class="bg-gray-100 p-4 text-center text-gray-500 text-sm">
		<p>&copy; {new Date().getFullYear()} Brain Playground</p>
	</footer>
    
    <InstallPrompt />
</div>
