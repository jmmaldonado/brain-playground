<script lang="ts">
    import type { SwitchType } from '../types';

    interface Props {
        label: string;
        type: SwitchType;
        x: number;
        y: number;
        state: boolean;
        onToggle: () => void;
        onOutputClick: (e: PointerEvent) => void;
    }

    let { label, type, x, y, state, onToggle, onOutputClick }: Props = $props();

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g 
    transform="translate({x},{y})" 
    class="select-none pointer-events-auto"
>
    <!-- Switch Body -->
    <rect 
        x="0" y="0" width="80" height="40" rx="8" 
        class="stroke-2 cursor-pointer transition-colors duration-200 {state ? 'fill-blue-50 stroke-blue-500' : 'fill-gray-50 stroke-gray-400'}"
        onpointerdown={(e) => { e.stopPropagation(); onToggle(); }}
    />

    <!-- Switch Toggle Visual -->
    {#if type === 'toggle'}
        <rect 
            x={state ? "45" : "5"} y="5" width="30" height="30" rx="4"
            class="transition-all duration-200 pointer-events-none {state ? 'fill-blue-500' : 'fill-gray-300'}"
        />
        <text x="40" y="25" text-anchor="middle" dominant-baseline="middle" class="text-xs font-bold fill-gray-500 pointer-events-none">
            {state ? 'ON' : 'OFF'}
        </text>
    {:else}
        <!-- Pulse Button Visual -->
        <circle cx="40" cy="20" r="14" class="transition-all duration-100 pointer-events-none {state ? 'fill-blue-500 r-12' : 'fill-gray-300'}" />
    {/if}

    <!-- Label -->
    <text x="40" y="-10" text-anchor="middle" class="text-sm font-bold fill-gray-700">{label}</text>

    <!-- Output Connection Point -->
    <circle 
        cx="90" 
        cy="20" 
        r="6" 
        class="stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer transition-colors duration-200 {state ? 'fill-blue-400' : 'fill-white'}" 
        onpointerdown={(e) => { e.stopPropagation(); onOutputClick(e); }}
    />
</g>
