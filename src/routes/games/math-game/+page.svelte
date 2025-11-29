<script>
    import MathGame from '$lib/games/math-game/MathGame.svelte';
    import { ArrowLeft } from 'lucide-svelte';
</script>

<div class="space-y-6">
    <div class="flex items-center gap-4">
        <a href="/" class="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
        </a>
        <h1 class="text-3xl font-bold text-gray-800">Math Whiz</h1>
    </div>

    <MathGame />
</div>
