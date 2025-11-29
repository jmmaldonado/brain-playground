<script lang="ts">
    import { StorageService } from '$lib/services/storage';
    import { ArrowLeft, Download, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-svelte';
    import { base } from '$app/paths';

    let statusMsg = $state('');
    let statusType: 'success' | 'error' | '' = $state('');

    function handleExport() {
        const data = StorageService.exportAll();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brain-playground-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Data exported successfully!', 'success');
    }

    function handleImport(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (StorageService.importAll(content)) {
                showStatus('Data imported successfully!', 'success');
            } else {
                showStatus('Failed to import data. Invalid file.', 'error');
            }
        };
        reader.readAsText(file);
    }

    function handleClear() {
        if (confirm('Are you sure you want to delete all game progress? This cannot be undone.')) {
            StorageService.clearAll();
            showStatus('All data cleared.', 'success');
        }
    }

    function showStatus(msg: string, type: 'success' | 'error') {
        statusMsg = msg;
        statusType = type;
        setTimeout(() => {
            statusMsg = '';
            statusType = '';
        }, 3000);
    }
</script>

<div class="max-w-2xl mx-auto space-y-8">
    <div class="flex items-center gap-4">
        <a href="{base}/" class="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
        </a>
        <h1 class="text-3xl font-bold text-gray-800">Settings</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
        
        <!-- Status Message -->
        {#if statusMsg}
            <div class={`p-4 rounded-lg flex items-center gap-3 ${statusType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {#if statusType === 'success'}
                    <CheckCircle size={20} />
                {:else}
                    <AlertCircle size={20} />
                {/if}
                {statusMsg}
            </div>
        {/if}

        <!-- Export -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Download size={20} /> Export Data
            </h2>
            <p class="text-gray-600">Save your game progress to a file so you can transfer it to another device.</p>
            <button 
                onclick={handleExport}
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
                Download Backup
            </button>
        </div>

        <hr />

        <!-- Import -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Upload size={20} /> Import Data
            </h2>
            <p class="text-gray-600">Restore your game progress from a backup file.</p>
            <label class="inline-block px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors cursor-pointer">
                Select Backup File
                <input type="file" accept=".json" onchange={handleImport} class="hidden" />
            </label>
        </div>

        <hr />

        <!-- Clear -->
        <div class="space-y-4">
             <h2 class="text-xl font-semibold text-red-600 flex items-center gap-2">
                <Trash2 size={20} /> Reset App
            </h2>
            <p class="text-gray-600">Delete all game progress and high scores from this device.</p>
            <button 
                onclick={handleClear}
                class="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
            >
                Clear All Data
            </button>
        </div>
    </div>
</div>
