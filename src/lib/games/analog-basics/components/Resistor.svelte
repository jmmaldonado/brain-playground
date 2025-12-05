<script lang="ts">
    import type { Resistor } from '../types';
    
    interface Props {
        resistor: Resistor;
        selected?: boolean;
        onSelect?: () => void;
        onTerminalClick?: (terminal: 'terminal1' | 'terminal2') => void;
    }
    
    let { resistor, selected = false, onSelect, onTerminalClick }: Props = $props();
    
    // Format resistance value for display
    const resistanceLabel = $derived(() => {
        const r = resistor.resistance;
        if (r >= 1000000) return `${(r / 1000000).toFixed(1)}MΩ`;
        if (r >= 1000) return `${(r / 1000).toFixed(1)}kΩ`;
        return `${r}Ω`;
    });
    
    // Heat visualization based on power
    const heatLevel = $derived(Math.min(resistor.currentPower / resistor.maxPower, 1));
</script>

<g 
    transform="translate({resistor.x}, {resistor.y})"
    class="cursor-pointer"
    onclick={onSelect}
>
    <!-- Hit area (transparent) -->
    <rect
        x="0"
        y="10"
        width="80"
        height="40"
        rx="8"
        fill="white"
        fill-opacity="0.1"
        stroke={selected ? '#3b82f6' : 'transparent'}
        stroke-width="2"
        class="transition-all"
    />

    <!-- Resistor Symbol (Zigzag) -->
    <path
        d="M 15 30 L 20 20 L 30 40 L 40 20 L 50 40 L 60 20 L 65 30"
        fill="none"
        stroke={heatLevel > 0.8 ? '#ef4444' : '#4b5563'}
        stroke-width={heatLevel > 0.8 ? 3 : 2}
        stroke-linejoin="round"
        stroke-linecap="round"
        class="transition-colors"
    />
    
    <!-- Connection lines -->
    <line x1="5" y1="30" x2="15" y2="30" stroke="#9ca3af" stroke-width="2" />
    <line x1="65" y1="30" x2="75" y2="30" stroke="#9ca3af" stroke-width="2" />
    
    <!-- Terminal 1 -->
    <circle
        cx="5"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('terminal1');
        }}
    />
    
    <!-- Terminal 2 -->
    <circle
        cx="75"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('terminal2');
        }}
    />
    
    <!-- Value label -->
    <text x="40" y="55" text-anchor="middle" fill="#374151" font-size="11" font-weight="bold" class="pointer-events-none">
        {resistanceLabel()}
    </text>
    
    <!-- Heat warning -->
    {#if heatLevel > 0.7}
        <text x="40" y="15" text-anchor="middle" fill="#ef4444" font-size="9" font-weight="bold" class="pointer-events-none animate-pulse">
            {heatLevel > 0.9 ? '⚠ HOT!' : 'WARM'}
        </text>
    {/if}
</g>
