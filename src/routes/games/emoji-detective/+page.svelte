<script lang="ts">
    import EmojiDetectiveGame from "$lib/games/emoji-detective/EmojiDetectiveGame.svelte";
    import { onMount } from "svelte";
    import { pageTitle } from "$lib/stores/app";

    onMount(() => {
        pageTitle.set("Emoji Detective");
    });
</script>

<EmojiDetectiveGame />
