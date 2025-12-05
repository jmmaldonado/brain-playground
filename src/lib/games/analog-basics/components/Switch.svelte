<script lang="ts">
    import type { Switch } from '../types';
    
    interface Props {
        switchComp: Switch;
        selected?: boolean;
        onSelect?: () => void;
        onToggle?: () => void;
        onTerminalClick?: (terminal: 'terminal1' | 'terminal2') => void;
    }
    
    let { switchComp, selected = false, onSelect, onToggle, onTerminalClick }: Props = $props();
</script>

<g 
    transform="translate({switchComp.x}, {switchComp.y})"
    class="cursor-pointer"
    onclick={onSelect}
>
    <!-- Hit area (transparent) -->
    <rect
        x="0"
        y="0"
        width="80"
        height="60"
        rx="8"
        fill="white"
        fill-opacity="0.1"
        stroke={selected ? '#3b82f6' : 'transparent'}
        stroke-width="2"
        class="transition-all"
        onclick={(e) => {
            e.stopPropagation();
            onToggle?.();
        }}
    />

    <!-- Switch Symbol -->
    <!-- Base lines -->
    <line x1="10" y1="30" x2="25" y2="30" stroke="#4b5563" stroke-width="2" />
    <line x1="55" y1="30" x2="70" y2="30" stroke="#4b5563" stroke-width="2" />
    
    <!-- Contact points -->
    <circle cx="25" cy="30" r="2" fill="#4b5563" />
    <circle cx="55" cy="30" r="2" fill="#4b5563" />
    
    <!-- Switch Arm -->
    <line
        x1="25"
        y1="30"
        x2={switchComp.state ? "55" : "50"}
        y2={switchComp.state ? "30" : "15"}
        stroke={switchComp.state ? '#22c55e' : '#ef4444'}
        stroke-width="3"
        stroke-linecap="round"
        class="transition-all duration-300"
    />
    
    <!-- Terminal 1 -->
    <circle
        cx="10"
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
        cx="70"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('terminal2');
        }}
    />
    
    <!-- Label -->
    <text x="40" y="55" text-anchor="middle" fill={switchComp.state ? '#22c55e' : '#ef4444'} font-size="11" font-weight="bold" class="pointer-events-none select-none">
        {switchComp.state ? 'CLOSED' : 'OPEN'}
    </text>
</g>
