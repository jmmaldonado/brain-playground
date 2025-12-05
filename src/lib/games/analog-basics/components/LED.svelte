<script lang="ts">
    import type { LED } from '../types';
    
    interface Props {
        led: LED;
        selected?: boolean;
        onSelect?: () => void;
        onTerminalClick?: (terminal: 'anode' | 'cathode') => void;
    }
    
    let { led, selected = false, onSelect, onTerminalClick }: Props = $props();
    
    // Map LED color to actual display color
    const colorMap: Record<string, string> = {
        red: '#ef4444',
        green: '#22c55e',
        blue: '#3b82f6',
        yellow: '#eab308',
        white: '#f8fafc'
    };
    
    const ledColor = $derived(colorMap[led.color] || colorMap.red);
    const brightness = $derived(led.currentBrightness);
    const glowIntensity = $derived(brightness * 0.8);
</script>

<g 
    transform="translate({led.x}, {led.y})"
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

    <!-- LED Glow -->
    {#if brightness > 0.1 && !led.isBurned}
        <circle
            cx="30"
            cy="30"
            r={15 + brightness * 10}
            fill={ledColor}
            opacity={glowIntensity * 0.5}
            class="pointer-events-none blur-md"
        />
    {/if}

    <!-- LED Symbol -->
    <!-- Triangle -->
    <path 
        d="M 20,20 L 20,40 L 40,30 Z" 
        fill={led.isBurned ? '#4b5563' : (brightness > 0.1 ? ledColor : 'none')} 
        stroke={led.isBurned ? '#4b5563' : ledColor} 
        stroke-width="2"
        stroke-linejoin="round"
    />
    <!-- Bar -->
    <line x1="40" y1="20" x2="40" y2="40" stroke={led.isBurned ? '#4b5563' : ledColor} stroke-width="2" />
    
    <!-- Arrows (indicating light) -->
    <g transform="translate(35, 10) rotate(-30)">
        <line x1="0" y1="0" x2="10" y2="0" stroke={ledColor} stroke-width="2" />
        <path d="M 7,-3 L 10,0 L 7,3" fill="none" stroke={ledColor} stroke-width="2" />
    </g>
    <g transform="translate(42, 15) rotate(-30)">
        <line x1="0" y1="0" x2="10" y2="0" stroke={ledColor} stroke-width="2" />
        <path d="M 7,-3 L 10,0 L 7,3" fill="none" stroke={ledColor} stroke-width="2" />
    </g>

    <!-- Anode terminal (Left) -->
    <circle
        cx="10"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('anode');
        }}
    />
    
    <!-- Cathode terminal (Right) -->
    <circle
        cx="50"
        cy="30"
        r="6"
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer terminal"
        onclick={(e) => {
            e.stopPropagation();
            onTerminalClick?.('cathode');
        }}
    />
    
    <!-- Burned indicator -->
    {#if led.isBurned}
        <path
            d="M 20 20 L 40 40 M 40 20 L 20 40"
            stroke="#ef4444"
            stroke-width="3"
            class="pointer-events-none"
        />
        <text x="30" y="55" text-anchor="middle" fill="#ef4444" font-size="10" font-weight="bold" class="pointer-events-none">
            BURNED
        </text>
    {/if}
</g>
