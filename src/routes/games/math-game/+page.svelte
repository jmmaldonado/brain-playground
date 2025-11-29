<script>
    import MathGame from '$lib/games/math-game/MathGame.svelte';
    import { ArrowLeft } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Math Whiz');
    });
</script>

<div class="space-y-6">
    <MathGame />
</div>
