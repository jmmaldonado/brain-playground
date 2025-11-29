<script>
    import MathFillGame from '$lib/games/math-fill/MathFillGame.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Math Detectives');
    });
</script>

<MathFillGame />
