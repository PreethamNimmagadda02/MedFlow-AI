import { describe, it, expect } from 'vitest';
import {
    getProviders,
    getProvider,
    getSpecialties,
} from '../api/providers';

describe('Providers API', () => {
    it('returns all providers', () => {
        const providers = getProviders();
        expect(providers.length).toBeGreaterThan(0);
        expect(providers[0]).toHaveProperty('name');
        expect(providers[0]).toHaveProperty('specialty');
    });

    it('filters by specialty', () => {
        const cardiologists = getProviders({ specialty: 'Cardiology' });
        expect(cardiologists.length).toBeGreaterThan(0);
        cardiologists.forEach((p) => {
            expect(p.specialty).toBe('Cardiology');
        });
    });

    it('filters by name', () => {
        const results = getProviders({ name: 'Sunita' });
        expect(results.length).toBe(1);
        expect(results[0].name).toContain('Sunita');
    });

    it('returns empty for non-existent specialty', () => {
        const results = getProviders({ specialty: 'Neurosurgery' });
        expect(results.length).toBe(0);
    });

    it('finds provider by id', () => {
        const providers = getProviders();
        const provider = getProvider(providers[0].id);
        expect(provider).toBeDefined();
        expect(provider!.id).toBe(providers[0].id);
    });

    it('returns unique specialties', () => {
        const specialties = getSpecialties();
        expect(specialties.length).toBeGreaterThan(0);
        expect(new Set(specialties).size).toBe(specialties.length);
    });
});
