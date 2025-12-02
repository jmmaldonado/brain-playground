<script lang="ts">
    import LogicGateGame from '$lib/games/logic-gates/LogicGateGame.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Logic Lab');
    });
</script>

<LogicGateGame />
