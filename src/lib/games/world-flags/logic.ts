import { CONTINENTS, countries, type ContinentId, type Country } from "./data";

export type GameMode = "learn" | "write" | "choice";
export type ChoiceDifficulty = "easy" | "normal" | "hard";

export const gameModes: Array<{ id: GameMode; label: string; description: string }> = [
    { id: "learn", label: "Aprender", description: "Bandera y pais juntos" },
    { id: "write", label: "Responder", description: "Escribe o dicta el pais" },
    { id: "choice", label: "4 banderas", description: "Elige la bandera correcta" },
];

export const difficulties: Array<{ id: ChoiceDifficulty; label: string }> = [
    { id: "easy", label: "Facil" },
    { id: "normal", label: "Medio" },
    { id: "hard", label: "Dificil" },
];

export function getContinentLabel(continent: ContinentId) {
    return CONTINENTS.find((item) => item.id === continent)?.label ?? continent;
}

export function flagUrl(country: Country, basePath = "") {
    return `${basePath}/flags/w640/${country.code.toLowerCase()}.png`;
}

export function shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
}

export function getTierForLevel(level: number): 1 | 2 | 3 | 4 {
    if (level >= 13) return 4;
    if (level >= 8) return 3;
    if (level >= 4) return 2;
    return 1;
}

export function getCountryPool(selectedContinents: ContinentId[], level: number) {
    const maxTier = getTierForLevel(level);
    const selected = countries.filter((country) => selectedContinents.includes(country.continent));
    const tiered = selected.filter((country) => country.tier <= maxTier);
    return tiered.length >= 3 ? tiered : selected;
}

export function pickCountry(pool: Country[], recentIds: string[] = []) {
    const fresh = pool.filter((country) => !recentIds.includes(country.code));
    const source = fresh.length > 0 ? fresh : pool;
    return source[Math.floor(Math.random() * source.length)];
}

export function buildChoiceOptions(target: Country, pool: Country[], difficulty: ChoiceDifficulty, level: number) {
    const maxTier = getTierForLevel(level);
    const candidates = pool.filter((country) => country.code !== target.code && country.tier <= Math.max(maxTier, target.tier));
    const scored = candidates
        .map((country) => ({
            country,
            score: scoreDistractor(target, country, difficulty) + Math.random() * 0.25,
        }))
        .sort((a, b) => b.score - a.score)
        .map((item) => item.country);

    const selected = [target];
    for (const country of scored) {
        if (selected.length >= 4) break;
        if (!selected.some((item) => item.code === country.code)) {
            selected.push(country);
        }
    }

    for (const country of shuffle(pool.filter((item) => item.code !== target.code))) {
        if (selected.length >= 4) break;
        if (!selected.some((item) => item.code === country.code)) {
            selected.push(country);
        }
    }

    return shuffle(selected);
}

function scoreDistractor(target: Country, candidate: Country, difficulty: ChoiceDifficulty) {
    const sameContinent = target.continent === candidate.continent;
    const sameFamily = target.flagFamily === candidate.flagFamily;
    const closeTier = Math.abs(target.tier - candidate.tier) <= 1;

    if (difficulty === "easy") {
        return (sameContinent ? -2 : 2) + (sameFamily ? -3 : 2) + (closeTier ? 0.5 : 0);
    }

    if (difficulty === "normal") {
        return (sameContinent ? 2 : 0) + (sameFamily ? 1.5 : 0) + (closeTier ? 1 : 0);
    }

    return (sameFamily ? 4 : 0) + (sameContinent ? 2 : 0) + (closeTier ? 1 : 0);
}

export function normalizeAnswer(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\b(el|la|los|las|de|del|republica)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function isCorrectCountryAnswer(input: string, country: Country) {
    const normalizedInput = normalizeAnswer(input);
    if (!normalizedInput) return false;

    const validAnswers = [country.name, ...(country.aliases ?? [])].map(normalizeAnswer);
    return validAnswers.some((answer) => {
        if (normalizedInput === answer) return true;
        if (answer.length >= 6 && levenshtein(normalizedInput, answer) <= 1) return true;
        return false;
    });
}

function levenshtein(a: string, b: string) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            );
        }
    }

    return matrix[a.length][b.length];
}
