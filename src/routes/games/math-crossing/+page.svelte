<script>
    import MathCrossingGame from '$lib/games/math-crossing/MathCrossingGame.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Math Crossing');
    });
</script>

<MathCrossingGame />
