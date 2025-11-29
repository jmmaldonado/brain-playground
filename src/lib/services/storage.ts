export class StorageService {
    private static PREFIX = 'bp_';

    /**
     * Save data to localStorage with a prefixed key.
     * @param key - The unique identifier for the data (e.g., 'math-game').
     * @param data - The data to save.
     */
    static save<T>(key: string, data: T): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(`${this.PREFIX}${key}`, serialized);
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    /**
     * Load data from localStorage.
     * @param key - The unique identifier for the data.
     * @param defaultValue - Value to return if no data is found.
     */
    static load<T>(key: string, defaultValue: T | null = null): T | null {
        if (typeof localStorage === 'undefined') return defaultValue;
        try {
            const item = localStorage.getItem(`${this.PREFIX}${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error loading data:', e);
            return defaultValue;
        }
    }

    /**
     * Export all app-specific data from localStorage as a JSON string.
     */
    static exportAll(): string {
        if (typeof localStorage === 'undefined') return '{}';
        const exportData: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                const cleanKey = key.slice(this.PREFIX.length);
                exportData[cleanKey] = this.load(cleanKey);
            }
        }
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import data from a JSON object or string, overwriting existing keys.
     * @param json - JSON string or object containing game data.
     */
    static importAll(input: string | Record<string, any>): boolean {
        if (typeof localStorage === 'undefined') return false;
        try {
            const data = typeof input === 'string' ? JSON.parse(input) : input;
            for (const [key, value] of Object.entries(data)) {
                this.save(key, value);
            }
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    /**
     * Clears all app-specific data.
     */
    static clearAll(): void {
         if (typeof localStorage === 'undefined') return;
         const keysToRemove: string[] = [];
         for (let i = 0; i < localStorage.length; i++) {
             const key = localStorage.key(i);
             if (key && key.startsWith(this.PREFIX)) {
                 keysToRemove.push(key);
             }
         }
         keysToRemove.forEach(k => localStorage.removeItem(k));
    }
}
