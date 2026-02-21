<script lang="ts">
    import NumberParrotGame from "$lib/games/number-parrot/NumberParrotGame.svelte";
    import { onMount } from "svelte";
    import { pageTitle } from "$lib/stores/app";

    onMount(() => {
        pageTitle.set("Number Parrot");
    });
</script>

<NumberParrotGame />
