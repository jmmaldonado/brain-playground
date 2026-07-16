<script lang="ts">
    import type { GateType } from './types';

    interface Props {
        type: GateType;
        active?: boolean;
    }

    let { type, active = false }: Props = $props();

    const colors: Record<GateType, string> = {
        AND: '#2563eb',
        OR: '#16a34a',
        NOT: '#dc2626',
        NAND: '#7c3aed',
        NOR: '#ea580c',
        XOR: '#ca8a04',
    };

    function pathFor(t: GateType) {
        if (t === 'AND' || t === 'NAND') return 'M 16,8 L 43,8 A 27,27 0 0 1 43,62 L 16,62 Z';
        if (t === 'OR' || t === 'NOR') return 'M 15,8 Q 31,35 15,62 Q 47,62 67,35 Q 47,8 15,8 Z';
        if (t === 'NOT') return 'M 18,12 L 18,58 L 62,35 Z';
        return 'M 8,8 Q 24,35 8,62 M 16,8 Q 32,35 16,62 Q 48,62 69,35 Q 48,8 16,8 Z';
    }

    function hasBubble(t: GateType) {
        return t === 'NOT' || t === 'NAND' || t === 'NOR';
    }
</script>

<svg class="h-[82px] w-[86px] overflow-visible" viewBox="0 0 86 82" aria-hidden="true">
    {#if active}
        <path d={pathFor(type)} fill={colors[type]} opacity="0.2" filter="url(#gate-glow)" />
    {/if}
    <defs>
        <filter id="gate-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" />
        </filter>
    </defs>
    <path
        d={pathFor(type)}
        fill={colors[type]}
        fill-opacity={active ? '0.28' : '0.14'}
        stroke={colors[type]}
        stroke-width="2.5"
    />
    {#if hasBubble(type)}
        <circle cx={type === 'NOT' ? 68 : 73} cy="35" r="6" fill="white" stroke={colors[type]} stroke-width="2.5" />
    {/if}
    <text x="43" y="79" text-anchor="middle" class="select-none text-[12px] font-black fill-slate-700">{type}</text>
</svg>
