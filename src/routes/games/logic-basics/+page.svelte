<script lang="ts">
    import LogicBasicsGame from '$lib/games/logic-basics/LogicBasicsGame.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Logic Basics');
    });
</script>

<svelte:head>
    <title>Logic Basics | Brain Playground</title>
</svelte:head>

<LogicBasicsGame />
