<script lang="ts">
    import type { Battery } from '../types';
    
    interface Props {
        battery: Battery;
        selected?: boolean;
        onSelect?: () => void;
        onTerminalClick?: (terminal: 'pos' | 'neg') => void;
    }
    
    let { battery, selected = false, onSelect, onTerminalClick }: Props = $props();
</script>

<g 
    transform="translate({battery.x}, {battery.y})"
    class="cursor-pointer"
    onclick={onSelect}
>
    <!-- Hit area (transparent) -->
    <rect
        x="0"
        y="0"
        width="60"
        height="60"
        rx="8"
        fill="white"
        fill-opacity="0.1"
        stroke={selected ? '#3b82f6' : 'transparent'}
        stroke-width="2"
        class="transition-all"
    />
    
    <!-- Battery Symbol -->
    <!-- Vertical lines -->
    <line x1="30" y1="10" x2="30" y2="25" stroke="#64748b" stroke-width="3" />
    <line x1="30" y1="35" x2="30" y2="50" stroke="#64748b" stroke-width="3" />
    
    <!-- Battery plates -->
    <!-- Positive (Longer) -->
    <line x1="15" y1="25" x2="45" y2="25" stroke="#ef4444" stroke-width="3" />
    <!-- Negative (Shorter) -->
    <line x1="20" y1="35" x2="40" y2="35" stroke="#64748b" stroke-width="3" />
    
    <!-- Positive terminal -->
    <circle
        cx="30"
        cy="10"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('pos');
        }}
    />
    <text x="42" y="20" class="text-xs font-bold fill-red-500 pointer-events-none">+</text>
    
    <!-- Negative terminal -->
    <circle
        cx="30"
        cy="50"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('neg');
        }}
    />
    
    <!-- Voltage label -->
    <text x="50" y="40" class="text-xs font-bold fill-gray-600 pointer-events-none">
        {battery.voltage}V
    </text>
</g>
