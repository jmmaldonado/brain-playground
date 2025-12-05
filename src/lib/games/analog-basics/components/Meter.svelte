<script lang="ts">
    interface Props {
        value: number;
        type: 'voltage' | 'current';
        label?: string;
    }

    let { value, type, label }: Props = $props();

    const unit = $derived(type === 'voltage' ? 'V' : 'A');
    const displayValue = $derived(type === 'voltage' ? value.toFixed(2) : (value * 1000).toFixed(1));
    const displayUnit = $derived(type === 'voltage' ? 'V' : 'mA');
    const color = $derived(type === 'voltage' ? 'text-blue-600' : 'text-orange-600');
    const borderColor = $derived(type === 'voltage' ? 'border-blue-200' : 'border-orange-200');
    const bgColor = $derived(type === 'voltage' ? 'bg-blue-50' : 'bg-orange-50');
</script>

<div class="flex flex-col items-center p-3 rounded-lg border-2 {borderColor} {bgColor} shadow-sm min-w-[120px]">
    {#if label}
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
    {/if}
    <div class="font-mono text-2xl font-bold {color} flex items-baseline gap-1">
        {displayValue}
        <span class="text-sm font-normal text-gray-600">{displayUnit}</span>
    </div>
</div>
