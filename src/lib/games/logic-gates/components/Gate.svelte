<script lang="ts">
    import type { GateType } from '../types';

    interface Props {
        type: GateType;
        x: number;
        y: number;
        onPointerDown?: (e: PointerEvent) => void;
        onInputClick?: (index: number, e: PointerEvent) => void;
        onOutputClick?: (e: PointerEvent) => void;
    }

    let { type, x, y, onPointerDown, onInputClick, onOutputClick }: Props = $props();

    const colors = {
        AND: 'fill-blue-500 stroke-blue-700',
        OR: 'fill-green-500 stroke-green-700',
        NOT: 'fill-red-500 stroke-red-700',
        NAND: 'fill-purple-500 stroke-purple-700',
        NOR: 'fill-orange-500 stroke-orange-700',
        XOR: 'fill-yellow-500 stroke-yellow-700'
    };

    const gatePath = (t: GateType) => {
        switch (t) {
            case 'AND': return 'M 10,10 V 50 A 20,20 0 0 0 10,10 Z M 10,10 H 30 A 20,20 0 0 1 30,50 H 10 Z'; // Simplified AND shape
            case 'OR': return 'M 10,10 Q 20,30 10,50 Q 40,50 60,30 Q 40,10 10,10 Z';
            case 'NOT': return 'M 10,10 L 10,50 L 50,30 Z';
            case 'NAND': return 'M 10,10 V 50 A 20,20 0 0 0 10,10 Z M 10,10 H 30 A 20,20 0 0 1 30,50 H 10 Z M 60,30 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0';
            case 'NOR': return 'M 10,10 Q 20,30 10,50 Q 40,50 60,30 Q 40,10 10,10 Z M 65,30 m -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0';
            case 'XOR': return 'M 5,10 Q 15,30 5,50 M 10,10 Q 20,30 10,50 Q 40,50 60,30 Q 40,10 10,10 Z';
            default: return '';
        }
    };
    
    // Adjusting paths for SVG rendering
    const getPath = (t: GateType) => {
         if (t === 'AND') return "M 10,5 L 35,5 A 25,25 0 0 1 35,55 L 10,55 Z";
         if (t === 'OR') return "M 10,5 Q 25,30 10,55 Q 40,55 60,30 Q 40,5 10,5 Z"; // simplified OR
         if (t === 'NOT') return "M 15,10 L 15,50 L 55,30 Z";
         if (t === 'XOR') return "M 5,5 Q 20,30 5,55 M 12,5 Q 27,30 12,55 Q 42,55 62,30 Q 42,5 12,5 Z";
         if (t === 'NAND') return "M 10,5 L 35,5 A 25,25 0 0 1 35,55 L 10,55 Z"; // Circle added via separate element or path
         if (t === 'NOR') return "M 10,5 Q 25,30 10,55 Q 40,55 60,30 Q 40,5 10,5 Z"; // Circle added via separate element
         return "";
    }

    const hasBubble = (t: GateType) => ['NOT', 'NAND', 'NOR'].includes(t);
    const bubblePos = (t: GateType) => {
         if (t === 'NOT') return { cx: 58, cy: 30 };
         if (t === 'NAND') return { cx: 63, cy: 30 };
         if (t === 'NOR') return { cx: 63, cy: 30 };
         return { cx: 0, cy: 0 };
    }

    // Input/Output positions relative to 0,0 of the group
    // These need to align with the connection points
    const inputPositions = (t: GateType) => {
        if (t === 'NOT') return [{ x: 15, y: 30 }]; // Single input
        return [{ x: 10, y: 15 }, { x: 10, y: 45 }]; // Two inputs
    };
    
    const outputPosition = (t: GateType) => {
        if (hasBubble(t)) return { x: 68, y: 30 }; // Adjusted for bubble
        if (t === 'XOR') return { x: 62, y: 30 };
         if (t === 'OR') return { x: 60, y: 30 };
        return { x: 60, y: 30 };
    };

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g 
    transform="translate({x},{y})" 
    class="cursor-grab active:cursor-grabbing select-none pointer-events-auto"
    onpointerdown={onPointerDown}
>
    <!-- Gate Body -->
    <path d={getPath(type)} class="{colors[type]} stroke-2" fill-opacity="0.2" />
    
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
        class="fill-white stroke-gray-400 stroke-2 hover:stroke-blue-500 cursor-pointer" 
        onpointerdown={(e) => { e.stopPropagation(); onOutputClick?.(e); }}
    />
    
    <!-- Label -->
    <text x="35" y="65" text-anchor="middle" class="text-xs font-bold fill-gray-600 pointer-events-none">{type}</text>
</g>
