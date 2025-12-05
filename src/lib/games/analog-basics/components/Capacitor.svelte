<script lang="ts">
    import type { Capacitor } from '../types';
    
    interface Props {
        capacitor: Capacitor;
        selected?: boolean;
        onSelect?: () => void;
        onTerminalClick?: (terminal: 'terminal1' | 'terminal2') => void;
    }
    
    let { capacitor, selected = false, onSelect, onTerminalClick }: Props = $props();
    
    // Format capacitance for display
    const capacitanceLabel = $derived(() => {
        const c = capacitor.capacitance;
        if (c >= 0.001) return `${(c * 1000).toFixed(1)}mF`;
        if (c >= 0.000001) return `${(c * 1000000).toFixed(1)}µF`;
        if (c >= 0.000000001) return `${(c * 1000000000).toFixed(1)}nF`;
        return `${(c * 1000000000000).toFixed(1)}pF`;
    });
    
    // Charge level visualization (0-1)
    const chargeLevel = $derived(Math.min(capacitor.voltage / capacitor.maxVoltage, 1));
</script>

<g 
    transform="translate({capacitor.x}, {capacitor.y})"
    class="cursor-pointer"
    onclick={onSelect}
>
    <!-- Hit area (transparent) -->
    <rect
        x="0"
        y="0"
        width="70"
        height="60"
        rx="8"
        fill="white"
        fill-opacity="0.1"
        stroke={selected ? '#3b82f6' : 'transparent'}
        stroke-width="2"
        class="transition-all"
    />

    <!-- Capacitor Symbol -->
    <!-- Plate 1 -->
    <line x1="30" y1="15" x2="30" y2="45" stroke="#4b5563" stroke-width="3" />
    <!-- Plate 2 -->
    <line x1="40" y1="15" x2="40" y2="45" stroke="#4b5563" stroke-width="3" />
    
    <!-- Connection lines -->
    <line x1="5" y1="30" x2="30" y2="30" stroke="#9ca3af" stroke-width="2" />
    <line x1="40" y1="30" x2="65" y2="30" stroke="#9ca3af" stroke-width="2" />
    
    <!-- Charge visualization (glow between plates) -->
    {#if chargeLevel > 0.1}
        <rect
            x="32"
            y="15"
            width="6"
            height="30"
            fill="#60a5fa"
            opacity={chargeLevel * 0.8}
            class="pointer-events-none blur-sm"
        />
    {/if}

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
        cx="65"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('terminal2');
        }}
    />
    
    <!-- Value label -->
    <text x="35" y="60" text-anchor="middle" fill="#374151" font-size="11" font-weight="bold" class="pointer-events-none">
        {capacitanceLabel()}
    </text>
    
    <!-- Voltage indicator -->
    {#if chargeLevel > 0.1}
        <text x="35" y="10" text-anchor="middle" fill="#3b82f6" font-size="9" class="pointer-events-none">
            {capacitor.voltage.toFixed(1)}V
        </text>
    {/if}
</g>
