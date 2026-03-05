import type { Appointment } from './types';
import { seedAppointments } from './mockData';

let appointments: Appointment[] = [...seedAppointments];
let nextId = 9007;

export interface CreateAppointmentInput {
    patientId: string;
    providerId: string;
    start: string;
    reason: string;
    channel: 'in_person' | 'video';
}

export interface AppointmentFilters {
    patientId?: string;
    providerId?: string;
    status?: string;
    date?: string;
}

export function getAppointments(filters?: AppointmentFilters): Appointment[] {
    let results = [...appointments];

    if (filters?.patientId) {
        results = results.filter((a) => a.patientId === filters.patientId);
    }
    if (filters?.providerId) {
        results = results.filter((a) => a.providerId === filters.providerId);
    }
    if (filters?.status) {
        results = results.filter((a) => a.status === filters.status);
    }
    if (filters?.date) {
        results = results.filter((a) => a.start.startsWith(filters.date!));
    }

    return results.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
}

export function getAppointment(id: string): Appointment | undefined {
    return appointments.find((a) => a.id === id);
}

export function createAppointment(
    input: CreateAppointmentInput
): Appointment {
    const newAppointment: Appointment = {
        ...input,
        id: `appt_${nextId++}`,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
    };

    appointments = [newAppointment, ...appointments];
    return newAppointment;
}

export function rescheduleAppointment(
    id: string,
    newStart: string
): Appointment | undefined {
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    appointments[idx] = {
        ...appointments[idx],
        start: newStart,
        status: 'Scheduled',
    };
    return appointments[idx];
}

export function cancelAppointment(id: string): Appointment | undefined {
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    appointments[idx] = {
        ...appointments[idx],
        status: 'Cancelled',
    };
    return appointments[idx];
}

export function resetAppointments() {
    appointments = [...seedAppointments];
    nextId = 9007;
}
