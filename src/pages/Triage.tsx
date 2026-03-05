import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTriage, useDiagnostics } from '../api/hooks';
import type { TriageResult, DiagnosticResult } from '../api/types';
import { Input, Select, Textarea } from '../components/ui/Input';
import { ChipInput } from '../components/ui/ChipInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, getUrgencyBadgeVariant } from '../components/ui/Badge';
import { Disclaimer } from '../components/ui/Disclaimer';
import { strings } from '../i18n/en';
import {
    Brain,
    Activity,
    Heart,
    Upload,
    FileImage,
    Lightbulb,
    Stethoscope,
    Loader2,
} from 'lucide-react';

const triageSchema = z.object({
    symptomsText: z.string().min(1, 'Please describe symptoms'),
    tempC: z.coerce.number().min(35).max(43),
    hr: z.coerce.number().min(30).max(220),
    bp: z.string().min(1, 'Required'),
    spo2: z.coerce.number().min(50).max(100),
    onsetDays: z.coerce.number().min(0).max(365),
    painScale: z.coerce.number().min(0).max(10),
    age: z.coerce.number().min(0).max(150),
    sex: z.enum(['male', 'female', 'other']),
});

type TriageFormData = z.infer<typeof triageSchema>;

export function Triage() {
    const [symptomChips, setSymptomChips] = useState<string[]>([]);
    const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
    const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const xrayInputRef = useRef<HTMLInputElement>(null);

    const triage = useTriage();
    const diagnostics = useDiagnostics();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<TriageFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(triageSchema) as any,
        defaultValues: {
            symptomsText: '',
            tempC: 37,
            hr: 72,
            bp: '120/80',
            spo2: 98,
            onsetDays: 1,
            painScale: 3,
            age: 30,
            sex: 'male' as const,
        },
    });

    const painScale = watch('painScale');

    const onSubmit = (data: TriageFormData) => {
        const allSymptoms = [data.symptomsText, ...symptomChips].filter(Boolean).join(', ');
        triage.mutate(
            {
                symptoms: allSymptoms,
                vitals: {
                    tempC: data.tempC,
                    hr: data.hr,
                    bp: data.bp,
                    spo2: data.spo2,
                },
                onsetDays: data.onsetDays,
                age: data.age,
                sex: data.sex,
                painScale: data.painScale,
                fileRef: uploadedFile ? `upload_${uploadedFile.name}` : undefined,
            },
            {
                onSuccess: (result) => setTriageResult(result),
            }
        );
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert(strings.triage.invalidFileType);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert(strings.triage.fileTooLarge);
            return;
        }
        setUploadedFile(file);
    };

    const handleXrayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedXrayTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedXrayTypes.includes(file.type)) {
            alert(strings.triage.invalidXrayType);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(strings.triage.xrayTooLarge);
            return;
        }
        diagnostics.mutate(
            { type: 'chest_xray', fileRef: `upload_${file.name}` },
            { onSuccess: (result) => setDiagnosticResult(result) }
        );
    };

    const getPainColor = (value: number) => {
        if (value <= 3) return 'text-success-600';
        if (value <= 6) return 'text-warning-600';
        return 'text-danger-600';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900 flex items-center gap-2">
                    <Brain size={24} className="text-primary-500" aria-hidden="true" />
                    {strings.triage.title}
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    {strings.triage.subtitleDescription}
                </p>
            </div>

            <Disclaimer text={strings.triage.disclaimer} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <Card>
                    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5" noValidate>
                        {/* Symptoms */}
                        <fieldset>
                            <legend className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-1.5">
                                <Activity size={14} className="text-primary-500" />
                                {strings.triage.symptoms}
                            </legend>
                            <div className="space-y-3">
                                <Textarea
                                    label=""
                                    placeholder={strings.triage.symptomsPlaceholder}
                                    {...register('symptomsText')}
                                    error={errors.symptomsText?.message}
                                />
                                <ChipInput
                                    label=""
                                    value={symptomChips}
                                    onChange={setSymptomChips}
                                    placeholder={strings.triage.symptomChipsPlaceholder}
                                />
                            </div>
                        </fieldset>

                        {/* Vitals */}
                        <fieldset>
                            <legend className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-1.5">
                                <Heart size={14} className="text-danger-500" />
                                {strings.triage.vitals}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input
                                    label={strings.triage.temperature}
                                    type="number"
                                    step="0.1"
                                    required
                                    {...register('tempC')}
                                    error={errors.tempC?.message}
                                />
                                <Input
                                    label={strings.triage.heartRate}
                                    type="number"
                                    required
                                    {...register('hr')}
                                    error={errors.hr?.message}
                                />
                                <Input
                                    label={strings.triage.bloodPressure}
                                    required
                                    placeholder="120/80"
                                    {...register('bp')}
                                    error={errors.bp?.message}
                                />
                                <Input
                                    label={strings.triage.spo2}
                                    type="number"
                                    required
                                    {...register('spo2')}
                                    error={errors.spo2?.message}
                                />
                            </div>
                        </fieldset>

                        {/* Additional info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label={strings.triage.onsetDays}
                                type="number"
                                required
                                {...register('onsetDays')}
                                error={errors.onsetDays?.message}
                            />
                            <Input
                                label={strings.triage.age}
                                type="number"
                                required
                                {...register('age')}
                                error={errors.age?.message}
                            />
                            <Select
                                label={strings.triage.sex}
                                required
                                options={[
                                    { value: 'male', label: strings.patients.sexOptions.male },
                                    { value: 'female', label: strings.patients.sexOptions.female },
                                    { value: 'other', label: strings.patients.sexOptions.other },
                                ]}
                                {...register('sex')}
                                error={errors.sex?.message}
                            />
                            <div>
                                <label htmlFor="pain-scale" className="text-sm font-medium text-surface-700 block mb-1.5">
                                    {strings.triage.painScale}
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="pain-scale"
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        {...register('painScale')}
                                        className="flex-1 accent-primary-500"
                                    />
                                    <span className={`text-lg font-bold min-w-[2ch] text-center ${getPainColor(painScale)}`}>
                                        {painScale}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="text-sm font-medium text-surface-700 block mb-1.5">
                                {strings.triage.fileUpload}
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-surface-300 text-sm text-surface-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                            >
                                <Upload size={16} />
                                {uploadedFile ? uploadedFile.name : strings.triage.fileUploadHint}
                            </button>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={triage.isPending}>
                            <Brain size={18} />
                            {strings.triage.runTriage}
                        </Button>
                    </form>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    {triage.isPending && (
                        <Card className="flex items-center justify-center py-16">
                            <div className="text-center space-y-3">
                                <Loader2 size={32} className="text-primary-500 animate-spin mx-auto" />
                                <p className="text-sm text-surface-500">{strings.triage.analyzingSymptoms}</p>
                            </div>
                        </Card>
                    )}

                    {triageResult && !triage.isPending && (
                        <div className="space-y-4 animate-fade-in">
                            <Card>
                                <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                                    <Stethoscope size={18} className="text-primary-500" />
                                    {strings.triage.results}
                                </h2>

                                {/* Urgency */}
                                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-surface-50">
                                    <div>
                                        <p className="text-xs text-surface-500">{strings.triage.urgencyLevel}</p>
                                        <Badge
                                            variant={getUrgencyBadgeVariant(triageResult.triage.urgency)}
                                            dot
                                            className="mt-1 text-sm"
                                        >
                                            {triageResult.triage.urgency}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-surface-500">{strings.triage.confidence}</p>
                                        <p className="text-2xl font-bold text-surface-900">
                                            {Math.round(triageResult.triage.confidence * 100)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Differentials */}
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-surface-700 mb-2.5">
                                        {strings.triage.differentials}
                                    </p>
                                    <div className="space-y-2.5">
                                        {triageResult.differentials.map((d) => (
                                            <div key={d.condition}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-surface-700">{d.condition}</span>
                                                    <span className="text-sm font-medium text-surface-900">
                                                        {Math.round(d.confidence * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700 ease-out"
                                                        style={{ width: `${d.confidence * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Guidance */}
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-surface-700 mb-2">
                                        {strings.triage.guidance}
                                    </p>
                                    <ul className="space-y-1.5">
                                        {triageResult.guidance.map((g, i) => (
                                            <li key={i} className="text-sm text-surface-600 flex items-start gap-2">
                                                <Lightbulb size={14} className="text-warning-500 mt-0.5 shrink-0" />
                                                {g}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Explanation */}
                                <div className="p-3 rounded-xl bg-accent-50 border border-accent-100">
                                    <p className="text-xs font-semibold text-accent-700 mb-1">
                                        {strings.triage.explanation}
                                    </p>
                                    <p className="text-sm text-accent-800">{triageResult.explanation}</p>
                                </div>
                            </Card>

                            <Disclaimer text={strings.app.disclaimer} />
                        </div>
                    )}

                    {/* Diagnostics section */}
                    <Card>
                        <h3 className="text-sm font-semibold text-surface-800 mb-3 flex items-center gap-2">
                            <FileImage size={16} className="text-primary-500" />
                            {strings.triage.diagnostics}
                        </h3>
                        <input
                            ref={xrayInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleXrayUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => xrayInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-surface-300 text-sm text-surface-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
                        >
                            <Upload size={16} />
                            {strings.triage.uploadXray}
                        </button>

                        {diagnostics.isPending && (
                            <div className="flex items-center justify-center py-6 mt-3">
                                <Loader2 size={24} className="text-primary-500 animate-spin" />
                                <span className="ml-2 text-sm text-surface-500">{strings.triage.analyzingImage}</span>
                            </div>
                        )}

                        {diagnosticResult && !diagnostics.isPending && (
                            <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 animate-fade-in space-y-2">
                                <p className="text-sm font-medium text-surface-800">{diagnosticResult.summary}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-surface-500">{strings.triage.confidence}:</span>
                                    <span className="text-sm font-bold text-surface-900">
                                        {Math.round(diagnosticResult.confidence * 100)}%
                                    </span>
                                </div>
                                {diagnosticResult.nextSteps.length > 0 && (
                                    <ul className="space-y-1">
                                        {diagnosticResult.nextSteps.map((step, i) => (
                                            <li key={i} className="text-sm text-surface-600 flex items-start gap-1.5">
                                                <span className="text-primary-500">→</span> {step}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
