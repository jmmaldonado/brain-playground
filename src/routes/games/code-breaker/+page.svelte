<script>
    import CodeBreaker from '$lib/games/code-breaker/CodeBreaker.svelte';
    import { onMount } from 'svelte';
    import { pageTitle } from '$lib/stores/app';

    onMount(() => {
        pageTitle.set('Code Breaker');
    });
</script>

<CodeBreaker />
