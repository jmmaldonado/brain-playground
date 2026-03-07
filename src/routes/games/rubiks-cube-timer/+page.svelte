<script>
    import RubiksCubeTimer from '$lib/games/rubiks-cube-timer/RubiksCubeTimer.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('SpeedCube Timer');
    });
</script>

<RubiksCubeTimer />
