<script lang="ts">
    import type { Transistor } from '../types';
    
    interface Props {
        transistor: Transistor;
        selected?: boolean;
        onSelect?: () => void;
        onTerminalClick?: (terminal: 'collector' | 'base' | 'emitter') => void;
    }
    
    let { transistor, selected = false, onSelect, onTerminalClick }: Props = $props();
    
    // State color coding
    const stateColors = {
        cutoff: '#6b7280',
        active: '#eab308',
        saturation: '#22c55e'
    };
    
    const stateColor = $derived(stateColors[transistor.currentState]);
</script>

<g 
    transform="translate({transistor.x}, {transistor.y})"
    class="cursor-pointer"
    onclick={onSelect}
>
    <!-- Hit area (transparent) -->
    <rect
        x="0"
        y="0"
        width="60"
        height="80"
        rx="8"
        fill="white"
        fill-opacity="0.1"
        stroke={selected ? '#3b82f6' : 'transparent'}
        stroke-width="2"
        class="transition-all"
    />

    <!-- Transistor Symbol -->
    <!-- Circle -->
    <circle
        cx="35"
        cy="40"
        r="20"
        fill="none"
        stroke="#4b5563"
        stroke-width="2"
    />
    
    <!-- Base Bar -->
    <line x1="25" y1="25" x2="25" y2="55" stroke="#4b5563" stroke-width="3" />
    
    <!-- Collector Leg -->
    <line x1="25" y1="32" x2="45" y2="22" stroke={stateColor} stroke-width="2" class="transition-colors" />
    <line x1="45" y1="22" x2="50" y2="15" stroke="#9ca3af" stroke-width="2" />
    
    <!-- Emitter Leg -->
    <line x1="25" y1="48" x2="45" y2="58" stroke={stateColor} stroke-width="2" class="transition-colors" />
    <line x1="45" y1="58" x2="50" y2="65" stroke="#9ca3af" stroke-width="2" />
    <!-- Arrow -->
    <polygon points="45,58 40,55 42,60" fill={stateColor} class="transition-colors" />
    
    <!-- Base Leg -->
    <line x1="25" y1="40" x2="10" y2="40" stroke="#9ca3af" stroke-width="2" />

    <!-- Collector terminal -->
    <circle
        cx="50"
        cy="15"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('collector');
        }}
    />
    <text x="58" y="18" class="text-xs font-bold fill-gray-500 pointer-events-none">C</text>
    
    <!-- Base terminal -->
    <circle
        cx="10"
        cy="40"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('base');
        }}
    />
    <text x="10" y="55" text-anchor="middle" class="text-xs font-bold fill-gray-500 pointer-events-none">B</text>
    
    <!-- Emitter terminal -->
    <circle
        cx="50"
        cy="65"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('emitter');
        }}
    />
    <text x="58" y="68" class="text-xs font-bold fill-gray-500 pointer-events-none">E</text>
    
    <!-- State indicator -->
    <text
        x="35"
        y="75"
        text-anchor="middle"
        fill={stateColor}
        font-size="9"
        font-weight="bold"
        class="pointer-events-none uppercase"
    >
        {transistor.currentState}
    </text>
</g>
