import { describe, it, expect } from 'vitest';
import { postTriage, postDiagnostics } from '../api/triage';

describe('Triage Engine (deterministic mock)', () => {
    it('returns high urgency for "chest pain"', () => {
        const result = postTriage({
            symptoms: 'chest pain, shortness of breath',
            vitals: { tempC: 37, hr: 110, bp: '140/90', spo2: 93 },
            onsetDays: 1,
            age: 55,
            sex: 'male',
            painScale: 8,
        });
        expect(result.triage.urgency).toBe('High');
        expect(result.triage.confidence).toBeGreaterThan(0.5);
        expect(result.differentials.length).toBeGreaterThan(0);
        expect(result.guidance.length).toBeGreaterThan(0);
        expect(result.explanation).toBeTruthy();
    });

    it('returns medium urgency for "fever"', () => {
        const result = postTriage({
            symptoms: 'fever, headache',
            vitals: { tempC: 38.5, hr: 90, bp: '120/80', spo2: 97 },
            onsetDays: 2,
            age: 30,
            sex: 'female',
            painScale: 4,
        });
        expect(['Medium', 'Low']).toContain(result.triage.urgency);
        expect(result.differentials.length).toBeGreaterThan(0);
    });

    it('returns low urgency for mild symptoms', () => {
        const result = postTriage({
            symptoms: 'mild runny nose',
            vitals: { tempC: 37, hr: 72, bp: '120/80', spo2: 99 },
            onsetDays: 3,
            age: 25,
            sex: 'male',
            painScale: 1,
        });
        expect(result.triage.urgency).toBe('Low');
    });

    it('is deterministic — same input produces same output', () => {
        const input = {
            symptoms: 'cough, fever',
            vitals: { tempC: 38.2, hr: 88, bp: '120/80', spo2: 96 },
            onsetDays: 4,
            age: 40,
            sex: 'male' as const,
            painScale: 3,
        };
        const r1 = postTriage(input);
        const r2 = postTriage(input);
        expect(r1).toEqual(r2);
    });

    it('provides all required output fields', () => {
        const result = postTriage({
            symptoms: 'headache',
            vitals: { tempC: 37, hr: 72, bp: '120/80', spo2: 98 },
            onsetDays: 1,
            age: 30,
            sex: 'female',
            painScale: 5,
        });
        expect(result).toHaveProperty('triage.urgency');
        expect(result).toHaveProperty('triage.confidence');
        expect(result).toHaveProperty('differentials');
        expect(result).toHaveProperty('guidance');
        expect(result).toHaveProperty('explanation');
        expect(Array.isArray(result.differentials)).toBe(true);
        expect(Array.isArray(result.guidance)).toBe(true);
    });

    it('returns critical urgency for extreme vitals', () => {
        const result = postTriage({
            symptoms: 'feeling unwell',
            vitals: { tempC: 41, hr: 72, bp: '120/80', spo2: 85 },
            onsetDays: 1,
            age: 60,
            sex: 'male',
            painScale: 7,
        });
        expect(result.triage.urgency).toBe('Critical');
    });
});

describe('Diagnostics Engine (deterministic mock)', () => {
    it('returns a result for chest_xray', () => {
        const result = postDiagnostics({ type: 'chest_xray', fileRef: 'test.png' });
        expect(result.summary).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
        expect(Array.isArray(result.nextSteps)).toBe(true);
    });
});
