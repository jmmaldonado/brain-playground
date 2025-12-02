<script lang="ts">
    interface Props {
        label: string;
        x: number;
        y: number;
        state: boolean;
        onInputClick: (e: PointerEvent) => void;
    }

    let { label, x, y, state, onInputClick }: Props = $props();

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g 
    transform="translate({x},{y})" 
    class="select-none pointer-events-auto"
>
    <!-- Light Bulb Body -->
    <path 
        d="M 20,45 L 20,55 A 5,5 0 0 0 30,55 L 30,45 Z" 
        class="fill-gray-400"
    />
    <circle 
        cx="25" cy="25" r="20" 
        class="transition-colors duration-300 {state ? 'fill-yellow-300 stroke-yellow-500' : 'fill-gray-200 stroke-gray-400'} stroke-2"
    />
    
    <!-- Glow Effect -->
    {#if state}
        <circle cx="25" cy="25" r="30" class="fill-yellow-300 blur-xl opacity-40 pointer-events-none animate-pulse" />
        <!-- Filament shine -->
        <circle cx="20" cy="18" r="4" class="fill-white opacity-80" />
    {/if}

    <!-- Label -->
    <text x="25" y="-10" text-anchor="middle" class="text-sm font-bold fill-gray-700">{label}</text>

    <!-- Input Connection Point -->
    <circle 
        cx="-10" 
        cy="25" 
        r="6" 
        class="stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer fill-white" 
        onpointerdown={(e) => { e.stopPropagation(); onInputClick(e); }}
    />
</g>
