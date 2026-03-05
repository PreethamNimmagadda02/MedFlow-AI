import type { TriageInput, TriageResult, DiagnosticInput, DiagnosticResult } from './types';

/**
 * Deterministic mock triage endpoint.
 * Maps symptom keywords to urgency/differentials/guidance.
 * No real AI/LLM is called.
 */
export function postTriage(input: TriageInput): TriageResult {
    const symptoms = input.symptoms.toLowerCase();
    const temp = input.vitals.tempC;
    const hr = input.vitals.hr;
    const spo2 = input.vitals.spo2;

    // Critical: very high fever OR very low SpO2 OR very high HR
    if (temp >= 40 || spo2 < 90 || hr > 130) {
        return {
            triage: { urgency: 'Critical', confidence: 0.91 },
            differentials: [
                { condition: 'Sepsis', confidence: 0.45 },
                { condition: 'Severe pneumonia', confidence: 0.35 },
                { condition: 'Meningitis', confidence: 0.12 },
            ],
            guidance: [
                'Immediate emergency evaluation',
                'IV access and fluids',
                'Blood cultures and CBC',
                'Continuous monitoring',
            ],
            explanation: `Critical vitals detected (Temp: ${temp}°C, HR: ${hr}, SpO2: ${spo2}%) — requires urgent evaluation and stabilization.`,
        };
    }

    // Chest pain pathway
    if (symptoms.includes('chest pain') || symptoms.includes('chest tightness')) {
        const isHighRisk = input.age > 45 || hr > 100;
        return {
            triage: {
                urgency: isHighRisk ? 'High' : 'Medium',
                confidence: isHighRisk ? 0.85 : 0.72,
            },
            differentials: [
                { condition: 'Acute coronary syndrome', confidence: isHighRisk ? 0.42 : 0.18 },
                { condition: 'Costochondritis', confidence: isHighRisk ? 0.22 : 0.45 },
                { condition: 'Gastroesophageal reflux', confidence: 0.2 },
            ],
            guidance: [
                'ECG within 10 minutes',
                'Troponin levels',
                isHighRisk ? 'Cardiology consult' : 'Monitor and reassess',
                'Aspirin if no contraindications',
            ],
            explanation: `Chest pain in ${input.age}yo ${input.sex} with HR ${hr} → ${isHighRisk ? 'higher risk profile, needs urgent cardiac workup' : 'lower-risk profile but warrants evaluation'}.`,
        };
    }

    // Respiratory symptoms
    if (
        symptoms.includes('cough') ||
        symptoms.includes('breathing') ||
        symptoms.includes('shortness of breath') ||
        symptoms.includes('wheezing')
    ) {
        return {
            triage: { urgency: spo2 < 95 ? 'High' : 'Medium', confidence: 0.78 },
            differentials: [
                { condition: 'Acute bronchitis', confidence: 0.42 },
                { condition: 'Pneumonia', confidence: 0.28 },
                { condition: 'Asthma exacerbation', confidence: 0.2 },
            ],
            guidance: [
                'Chest X-ray',
                'Pulse oximetry monitoring',
                spo2 < 95 ? 'Supplemental oxygen' : 'Symptomatic treatment',
                'Consider bronchodilator',
            ],
            explanation: `Respiratory symptoms with SpO2 ${spo2}% → ${spo2 < 95 ? 'hypoxia needs attention' : 'stable oxygenation, monitor closely'}.`,
        };
    }

    // Fever + sore throat (default from spec)
    if (
        (symptoms.includes('fever') || temp >= 38) &&
        (symptoms.includes('sore throat') || symptoms.includes('throat'))
    ) {
        return {
            triage: { urgency: 'Medium', confidence: 0.74 },
            differentials: [
                { condition: 'Viral pharyngitis', confidence: 0.68 },
                { condition: 'Streptococcal pharyngitis', confidence: 0.22 },
            ],
            guidance: ['Hydration and rest', 'Consider rapid strep test'],
            explanation: 'Fever + sore throat + myalgia with stable vitals → likely viral.',
        };
    }

    // Headache pathway
    if (symptoms.includes('headache') || symptoms.includes('head pain')) {
        return {
            triage: { urgency: 'Low', confidence: 0.82 },
            differentials: [
                { condition: 'Tension headache', confidence: 0.72 },
                { condition: 'Migraine without aura', confidence: 0.18 },
            ],
            guidance: ['OTC analgesics', 'Track triggers', 'Follow up if worsening'],
            explanation: 'Headache pattern without red flags → likely tension-type.',
        };
    }

    // Abdominal pain
    if (
        symptoms.includes('abdominal') ||
        symptoms.includes('stomach') ||
        symptoms.includes('nausea') ||
        symptoms.includes('vomiting')
    ) {
        return {
            triage: { urgency: 'Medium', confidence: 0.68 },
            differentials: [
                { condition: 'Acute gastritis', confidence: 0.45 },
                { condition: 'Gastroenteritis', confidence: 0.32 },
                { condition: 'Appendicitis', confidence: 0.12 },
            ],
            guidance: [
                'Abdominal examination',
                'Hydration',
                'Consider CBC and metabolic panel',
                'NPO if surgical concern',
            ],
            explanation: `Abdominal symptoms in ${input.age}yo ${input.sex} → gastritis most likely, but appendicitis should be ruled out.`,
        };
    }

    // Default / general
    return {
        triage: { urgency: 'Low', confidence: 0.65 },
        differentials: [
            { condition: 'Viral upper respiratory infection', confidence: 0.55 },
            { condition: 'Allergic rhinitis', confidence: 0.25 },
        ],
        guidance: [
            'Symptomatic treatment',
            'Rest and hydration',
            'Follow up if symptoms worsen or persist > 7 days',
        ],
        explanation: `General symptoms in ${input.age}yo ${input.sex} with stable vitals → likely self-limiting viral illness.`,
    };
}

/**
 * Deterministic mock diagnostic endpoint for imaging.
 */
export function postDiagnostics(input: DiagnosticInput): DiagnosticResult {
    if (input.type === 'chest_xray') {
        return {
            summary: 'No acute cardiopulmonary process detected.',
            confidence: 0.81,
            flags: [],
            nextSteps: ['Clinical correlation recommended'],
        };
    }

    return {
        summary: 'Image analysis complete. No significant abnormalities detected.',
        confidence: 0.75,
        flags: [],
        nextSteps: ['Clinical correlation recommended', 'Consider follow-up imaging if symptoms persist'],
    };
}
