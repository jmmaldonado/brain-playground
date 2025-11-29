<script>
    import ColorTheoryGame from '$lib/games/color-theory/ColorTheoryGame.svelte';
    import { ArrowLeft } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Chromatic Academy');
    });
</script>

<div class="space-y-6">
    <ColorTheoryGame />
</div>
