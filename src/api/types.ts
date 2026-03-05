export interface Patient {
    id: string;
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
    createdAt: string;
}

export interface Provider {
    id: string;
    name: string;
    specialty: string;
    locations: string[];
    slots: string[];
    avatar?: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    providerId: string;
    start: string;
    reason: string;
    channel: 'in_person' | 'video';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    createdAt: string;
    triageResult?: TriageResult;
}

export interface TriageInput {
    symptoms: string;
    vitals: {
        tempC: number;
        hr: number;
        bp: string;
        spo2: number;
    };
    onsetDays: number;
    age: number;
    sex: string;
    painScale?: number;
    fileRef?: string;
}

export interface TriageResult {
    triage: {
        urgency: 'Low' | 'Medium' | 'High' | 'Critical';
        confidence: number;
    };
    differentials: Array<{
        condition: string;
        confidence: number;
    }>;
    guidance: string[];
    explanation: string;
}

export interface DiagnosticInput {
    type: string;
    fileRef: string;
}

export interface DiagnosticResult {
    summary: string;
    confidence: number;
    flags: string[];
    nextSteps: string[];
}
