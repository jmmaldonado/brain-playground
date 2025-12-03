<script lang="ts">
    import { onMount } from 'svelte';
    import { Download } from 'lucide-svelte';

    let deferredPrompt: any = $state(null);
    let showInstallButton = $state(false);

    onMount(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            showInstallButton = true;
        });

        window.addEventListener('appinstalled', () => {
            // Hide the app-provided install promotion
            showInstallButton = false;
            deferredPrompt = null;
        });
    });

    async function installPWA() {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        showInstallButton = false;
    }
</script>

{#if showInstallButton}
    <button 
        onclick={installPWA}
        class="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all z-50 font-semibold"
        aria-label="Install App"
    >
        <Download size={20} />
        <span>Install App</span>
    </button>
{/if}
