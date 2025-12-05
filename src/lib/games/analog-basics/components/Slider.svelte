<script lang="ts">
    interface Props {
        value: number;
        min: number;
        max: number;
        step?: number;
        label: string;
        unit?: string;
        onChange: (val: number) => void;
    }

    let { value, min, max, step = 1, label, unit = '', onChange }: Props = $props();
</script>

<div class="flex flex-col gap-1 w-full">
    <div class="flex justify-between items-center">
        <label class="text-sm font-bold text-gray-700">{label}</label>
        <span class="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            {value}{unit}
        </span>
    </div>
    <input
        type="range"
        {min}
        {max}
        {step}
        value={value}
        oninput={(e) => onChange(parseFloat(e.currentTarget.value))}
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
    />
    <div class="flex justify-between text-xs text-gray-400 px-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
    </div>
</div>
