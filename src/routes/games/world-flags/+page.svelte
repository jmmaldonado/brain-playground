<script lang="ts">
    import { onMount } from "svelte";
    import { pageTitle } from "$lib/stores/app";
    import WorldFlagsGame from "$lib/games/world-flags/WorldFlagsGame.svelte";

    onMount(() => {
        pageTitle.set("Banderas del mundo");
    });
</script>

<WorldFlagsGame />

