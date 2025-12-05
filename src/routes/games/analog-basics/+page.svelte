<script lang="ts">
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';
    import AnalogBasicsGame from '$lib/games/analog-basics/AnalogBasicsGame.svelte';

    onMount(() => {
        pageTitle.set('Analog Basics');
    });
</script>

<AnalogBasicsGame />
