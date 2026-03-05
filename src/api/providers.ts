import type { Provider } from './types';
import { seedProviders } from './mockData';

const providers: Provider[] = [...seedProviders];

export interface ProviderFilters {
    specialty?: string;
    name?: string;
}

export function getProviders(filters?: ProviderFilters): Provider[] {
    let results = [...providers];

    if (filters?.specialty) {
        results = results.filter(
            (p) => p.specialty.toLowerCase() === filters.specialty!.toLowerCase()
        );
    }

    if (filters?.name) {
        const query = filters.name.toLowerCase();
        results = results.filter((p) => p.name.toLowerCase().includes(query));
    }

    return results;
}

export function getProvider(id: string): Provider | undefined {
    return providers.find((p) => p.id === id);
}

export function getSpecialties(): string[] {
    return [...new Set(providers.map((p) => p.specialty))].sort();
}
