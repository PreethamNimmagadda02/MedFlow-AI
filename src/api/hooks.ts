import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, getPatient, createPatient } from './patients';
import type { CreatePatientInput } from './patients';
import { getProviders, getSpecialties, getProvider } from './providers';
import type { ProviderFilters } from './providers';
import {
    getAppointments,
    createAppointment,
    rescheduleAppointment,
    cancelAppointment,
} from './appointments';
import type { CreateAppointmentInput, AppointmentFilters } from './appointments';
import { postTriage, postDiagnostics } from './triage';
import type { TriageInput, DiagnosticInput } from './types';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
        },
    },
});

// Simulate async delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Patient hooks
export function usePatients() {
    return useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            await delay(300);
            return getPatients();
        },
    });
}

export function usePatient(id: string) {
    return useQuery({
        queryKey: ['patients', id],
        queryFn: async () => {
            await delay(200);
            return getPatient(id);
        },
        enabled: !!id,
    });
}

export function useCreatePatient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreatePatientInput) => {
            await delay(500);
            return createPatient(input);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['patients'] });
        },
    });
}

// Provider hooks
export function useProviders(filters?: ProviderFilters) {
    return useQuery({
        queryKey: ['providers', filters],
        queryFn: async () => {
            await delay(300);
            return getProviders(filters);
        },
    });
}

export function useProvider(id: string) {
    return useQuery({
        queryKey: ['providers', id],
        queryFn: async () => {
            await delay(200);
            return getProvider(id);
        },
        enabled: !!id,
    });
}

export function useSpecialties() {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: async () => {
            await delay(100);
            return getSpecialties();
        },
    });
}

// Appointment hooks
export function useAppointments(filters?: AppointmentFilters) {
    return useQuery({
        queryKey: ['appointments', filters],
        queryFn: async () => {
            await delay(300);
            return getAppointments(filters);
        },
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateAppointmentInput) => {
            await delay(500);
            return createAppointment(input);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['appointments'] });
            qc.invalidateQueries({ queryKey: ['providers'] });
        },
    });
}

export function useRescheduleAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, newStart }: { id: string; newStart: string }) => {
            await delay(400);
            return rescheduleAppointment(id, newStart);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useCancelAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await delay(400);
            return cancelAppointment(id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

// Triage hooks
export function useTriage() {
    return useMutation({
        mutationFn: async (input: TriageInput) => {
            await delay(1500); // Simulate AI processing time
            return postTriage(input);
        },
    });
}

export function useDiagnostics() {
    return useMutation({
        mutationFn: async (input: DiagnosticInput) => {
            await delay(2000); // Simulate image analysis time
            return postDiagnostics(input);
        },
    });
}
