import { describe, it, expect, beforeEach } from 'vitest';
import {
    getAppointments,
    createAppointment,
    cancelAppointment,
    rescheduleAppointment,
    resetAppointments,
} from '../api/appointments';

describe('Appointments API', () => {
    beforeEach(() => {
        resetAppointments();
    });

    it('returns seeded appointments', () => {
        const appts = getAppointments();
        expect(appts.length).toBeGreaterThan(0);
    });

    it('filters by status', () => {
        const scheduled = getAppointments({ status: 'Scheduled' });
        scheduled.forEach((a) => expect(a.status).toBe('Scheduled'));
    });

    it('creates an appointment', () => {
        const count = getAppointments().length;
        const appt = createAppointment({
            patientId: 'pat_001',
            providerId: 'doc_001',
            start: new Date().toISOString(),
            reason: 'Test reason',
            channel: 'video',
        });
        expect(appt.id).toMatch(/^appt_/);
        expect(appt.status).toBe('Scheduled');
        expect(getAppointments().length).toBe(count + 1);
    });

    it('cancels an appointment', () => {
        const appts = getAppointments({ status: 'Scheduled' });
        if (appts.length > 0) {
            const result = cancelAppointment(appts[0].id);
            expect(result).toBeDefined();
            expect(result!.status).toBe('Cancelled');
        }
    });

    it('reschedules an appointment', () => {
        const appts = getAppointments({ status: 'Scheduled' });
        if (appts.length > 0) {
            const newTime = '2026-04-01T10:00:00.000Z';
            const result = rescheduleAppointment(appts[0].id, newTime);
            expect(result).toBeDefined();
            expect(result!.start).toBe(newTime);
            expect(result!.status).toBe('Scheduled');
        }
    });
});
