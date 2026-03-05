import { describe, it, expect, beforeEach } from 'vitest';
import {
    getPatients,
    getPatient,
    createPatient,
    resetPatients,
} from '../api/patients';

describe('Patients API', () => {
    beforeEach(() => {
        resetPatients();
    });

    it('returns seeded patients', () => {
        const patients = getPatients();
        expect(patients.length).toBe(5);
        expect(patients[0].firstName).toBe('Asha');
    });

    it('finds patient by id', () => {
        const patient = getPatient('pat_001');
        expect(patient).toBeDefined();
        expect(patient!.lastName).toBe('Rao');
    });

    it('returns undefined for unknown id', () => {
        expect(getPatient('pat_999')).toBeUndefined();
    });

    it('creates a new patient', () => {
        const result = createPatient({
            firstName: 'Test',
            lastName: 'User',
            sex: 'male',
            birthDate: '2000-01-01',
            phone: '+91-1111111111',
            email: 'test@example.com',
            address: 'Test City',
            allergies: [],
            conditions: [],
            medications: [],
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.patient.firstName).toBe('Test');
            expect(result.patient.id).toMatch(/^pat_/);
        }
        expect(getPatients().length).toBe(6);
    });

    it('detects duplicate phone', () => {
        const result = createPatient({
            firstName: 'Dup',
            lastName: 'Test',
            sex: 'female',
            birthDate: '1990-01-01',
            phone: '+91-9876543210', // Asha Rao's phone
            email: 'unique@example.com',
            address: 'Somewhere',
            allergies: [],
            conditions: [],
            medications: [],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.field).toBe('phone');
            expect(result.error.existingPatient.firstName).toBe('Asha');
        }
    });

    it('detects duplicate email (case-insensitive)', () => {
        const result = createPatient({
            firstName: 'Dup',
            lastName: 'Email',
            sex: 'male',
            birthDate: '1990-01-01',
            phone: '+91-0000000000',
            email: 'ASHA.RAO@example.com',
            address: 'Somewhere',
            allergies: [],
            conditions: [],
            medications: [],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.field).toBe('email');
        }
    });

    it('skips duplicate check when skipDuplicateCheck is true', () => {
        const result = createPatient({
            firstName: 'Force',
            lastName: 'Create',
            sex: 'other',
            birthDate: '2000-01-01',
            phone: '+91-9876543210', // duplicate phone
            email: 'asha.rao@example.com', // duplicate email
            address: 'Forced',
            allergies: [],
            conditions: [],
            medications: [],
            skipDuplicateCheck: true,
        });
        expect(result.success).toBe(true);
        expect(getPatients().length).toBe(6);
    });
});
