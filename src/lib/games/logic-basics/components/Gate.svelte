<script lang="ts">
    import type { GateType } from '../types';

    interface Props {
        type: GateType;
        x: number;
        y: number;
        state?: boolean; // Output state for styling
        onPointerDown?: (e: PointerEvent) => void;
        onInputClick?: (index: number, e: PointerEvent) => void;
        onOutputClick?: (e: PointerEvent) => void;
    }

    let { type, x, y, state = false, onPointerDown, onInputClick, onOutputClick }: Props = $props();

    const colors = {
        AND: 'fill-blue-500 stroke-blue-700',
        OR: 'fill-green-500 stroke-green-700',
        NOT: 'fill-red-500 stroke-red-700',
        NAND: 'fill-purple-500 stroke-purple-700',
        NOR: 'fill-orange-500 stroke-orange-700',
        XOR: 'fill-yellow-500 stroke-yellow-700'
    };

    const getPath = (t: GateType) => {
         if (t === 'AND') return "M 10,5 L 35,5 A 25,25 0 0 1 35,55 L 10,55 Z";
         if (t === 'OR') return "M 10,5 Q 25,30 10,55 Q 40,55 60,30 Q 40,5 10,5 Z";
         if (t === 'NOT') return "M 15,10 L 15,50 L 55,30 Z";
         if (t === 'XOR') return "M 5,5 Q 20,30 5,55 M 12,5 Q 27,30 12,55 Q 42,55 62,30 Q 42,5 12,5 Z";
         if (t === 'NAND') return "M 10,5 L 35,5 A 25,25 0 0 1 35,55 L 10,55 Z";
         if (t === 'NOR') return "M 10,5 Q 25,30 10,55 Q 40,55 60,30 Q 40,5 10,5 Z";
         return "";
    }

    const hasBubble = (t: GateType) => ['NOT', 'NAND', 'NOR'].includes(t);
    const bubblePos = (t: GateType) => {
         if (t === 'NOT') return { cx: 58, cy: 30 };
         if (t === 'NAND') return { cx: 63, cy: 30 };
         if (t === 'NOR') return { cx: 63, cy: 30 };
         return { cx: 0, cy: 0 };
    }

    const inputPositions = (t: GateType) => {
        if (t === 'NOT') return [{ x: 15, y: 30 }];
        return [{ x: 10, y: 15 }, { x: 10, y: 45 }];
    };
    
    const outputPosition = (t: GateType) => {
        if (hasBubble(t)) return { x: 68, y: 30 };
        if (t === 'XOR') return { x: 62, y: 30 };
        if (t === 'OR') return { x: 60, y: 30 };
        return { x: 60, y: 30 };
    };

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g 
    transform="translate({x},{y})" 
    class="cursor-grab active:cursor-grabbing select-none pointer-events-auto transition-opacity duration-200"
    onpointerdown={onPointerDown}
>
    <!-- Glow effect when active -->
    {#if state}
        <path d={getPath(type)} class="{colors[type].split(' ')[0]} blur-md opacity-50" transform="scale(1.1) translate(-2, -2)" />
    {/if}

    <!-- Gate Body -->
    <path 
        d={getPath(type)} 
        class="{colors[type]} stroke-2 transition-colors duration-200" 
        fill-opacity={state ? "0.6" : "0.2"} 
    />
    
    <!-- Bubble for negated outputs -->
    {#if hasBubble(type)}
        <circle cx={bubblePos(type).cx} cy={bubblePos(type).cy} r="5" class="{colors[type]} fill-white stroke-2" />
    {/if}

    <!-- Inputs -->
    {#each inputPositions(type) as pos, i}
        <circle 
            cx={pos.x} 
            cy={pos.y} 
            r="6" 
            class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer"
            onpointerdown={(e) => { e.stopPropagation(); onInputClick?.(i, e); }}
        />
    {/each}

    <!-- Output -->
    <circle 
        cx={outputPosition(type).x} 
        cy={outputPosition(type).y} 
        r="6" 
        class="stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer transition-colors duration-200 {state ? 'fill-yellow-300' : 'fill-white'}" 
        onpointerdown={(e) => { e.stopPropagation(); onOutputClick?.(e); }}
    />
    
    <!-- Label -->
    <text x="35" y="70" text-anchor="middle" class="text-xs font-bold fill-gray-600 pointer-events-none">{type}</text>
</g>
