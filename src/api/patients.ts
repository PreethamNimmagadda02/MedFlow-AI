import type { Patient } from './types';
import { seedPatients } from './mockData';

let patients: Patient[] = [...seedPatients];
let nextId = 6;

export function getPatients(): Patient[] {
    return [...patients];
}

export function getPatient(id: string): Patient | undefined {
    return patients.find((p) => p.id === id);
}

export interface CreatePatientInput {
    firstName: string;
    lastName: string;
    sex: 'male' | 'female' | 'other';
    birthDate: string;
    phone: string;
    email: string;
    address: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    skipDuplicateCheck?: boolean;
}

export interface DuplicateError {
    type: 'duplicate';
    field: 'phone' | 'email';
    existingPatient: Patient;
}

export function createPatient(
    input: CreatePatientInput
): { success: true; patient: Patient } | { success: false; error: DuplicateError } {
    if (!input.skipDuplicateCheck) {
        const phoneMatch = patients.find((p) => p.phone === input.phone);
        if (phoneMatch) {
            return {
                success: false,
                error: { type: 'duplicate', field: 'phone', existingPatient: phoneMatch },
            };
        }

        const emailMatch = patients.find(
            (p) => p.email.toLowerCase() === input.email.toLowerCase()
        );
        if (emailMatch) {
            return {
                success: false,
                error: { type: 'duplicate', field: 'email', existingPatient: emailMatch },
            };
        }
    }

    const newPatient: Patient = {
        ...input,
        id: `pat_${String(nextId++).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
    };

    patients = [newPatient, ...patients];
    return { success: true, patient: newPatient };
}

export function resetPatients() {
    patients = [...seedPatients];
    nextId = 6;
}
