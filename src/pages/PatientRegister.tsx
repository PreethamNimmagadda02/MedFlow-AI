import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCreatePatient } from '../api/hooks';
import type { DuplicateError } from '../api/patients';
import { Input, Select } from '../components/ui/Input';
import { ChipInput } from '../components/ui/ChipInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { strings } from '../i18n/en';
import { ArrowLeft, UserPlus } from 'lucide-react';

const patientSchema = z.object({
    firstName: z.string().min(1, strings.common.required).max(50),
    lastName: z.string().min(1, strings.common.required).max(50),
    sex: z.enum(['male', 'female', 'other']),
    birthDate: z.string().min(1, strings.common.required),
    phone: z.string().min(10, strings.common.invalidPhone).max(20),
    email: z.string().email(strings.common.invalidEmail),
    address: z.string().min(1, strings.common.required).max(200),
    allergies: z.array(z.string()),
    conditions: z.array(z.string()),
    medications: z.array(z.string()),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function PatientRegister() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const createPatient = useCreatePatient();
    const [duplicateInfo, setDuplicateInfo] = useState<DuplicateError | null>(null);
    const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<PatientFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(patientSchema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            sex: 'male' as const,
            birthDate: '',
            phone: '',
            email: '',
            address: '',
            allergies: [],
            conditions: [],
            medications: [],
        },
    });

    const onSubmit = (data: PatientFormData) => {
        setDuplicateInfo(null);
        createPatient.mutate(
            { ...data, skipDuplicateCheck },
            {
                onSuccess: (result) => {
                    if (result.success) {
                        showToast('success', strings.patients.registrationSuccess);
                        navigate('/patients');
                    } else {
                        setDuplicateInfo(result.error);
                        setSkipDuplicateCheck(false);
                    }
                },
            }
        );
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/patients')}
                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    aria-label="Back to patients"
                >
                    <ArrowLeft size={20} className="text-surface-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">{strings.patients.register}</h1>
                    <p className="text-sm text-surface-500 mt-0.5">{strings.patients.formSubtitle}</p>
                </div>
            </div>

            {duplicateInfo && (
                <div className="px-4 py-3 rounded-xl bg-danger-50 border border-danger-200" role="alert">
                    <p className="text-sm text-danger-800 mb-3">
                        {strings.patients.duplicateError} (Existing: {duplicateInfo.existingPatient.firstName} {duplicateInfo.existingPatient.lastName} — matched on {duplicateInfo.field})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/patients/${duplicateInfo.existingPatient.id}`)}
                        >
                            {strings.patients.duplicateUseExisting}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSkipDuplicateCheck(true);
                                setDuplicateInfo(null);
                            }}
                        >
                            {strings.patients.duplicateCreateAnyway}
                        </Button>
                    </div>
                </div>
            )}

            <Card>
                <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5" noValidate>
                    {/* Personal Info */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-surface-800 mb-3">{strings.patients.personalInfo}</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={strings.patients.firstName}
                                required
                                {...register('firstName')}
                                error={errors.firstName?.message}
                            />
                            <Input
                                label={strings.patients.lastName}
                                required
                                {...register('lastName')}
                                error={errors.lastName?.message}
                            />
                            <Select
                                label={strings.patients.sex}
                                required
                                options={[
                                    { value: 'male', label: strings.patients.sexOptions.male },
                                    { value: 'female', label: strings.patients.sexOptions.female },
                                    { value: 'other', label: strings.patients.sexOptions.other },
                                ]}
                                {...register('sex')}
                                error={errors.sex?.message}
                            />
                            <Input
                                label={strings.patients.birthDate}
                                type="date"
                                required
                                {...register('birthDate')}
                                error={errors.birthDate?.message}
                            />
                        </div>
                    </fieldset>

                    {/* Contact Info */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-surface-800 mb-3">{strings.patients.contactInfo}</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={strings.patients.phone}
                                type="tel"
                                required
                                placeholder="+91-9XXXXXXXXX"
                                {...register('phone')}
                                error={errors.phone?.message}
                            />
                            <Input
                                label={strings.patients.email}
                                type="email"
                                required
                                placeholder="name@example.com"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                        </div>
                        <div className="mt-4">
                            <Input
                                label={strings.patients.address}
                                required
                                placeholder="City, State"
                                {...register('address')}
                                error={errors.address?.message}
                            />
                        </div>
                    </fieldset>

                    {/* Medical Info */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-surface-800 mb-3">{strings.patients.medicalInfo}</legend>
                        <div className="space-y-4">
                            <Controller
                                name="allergies"
                                control={control}
                                render={({ field }) => (
                                    <ChipInput
                                        label={strings.patients.allergies}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={strings.patients.allergiesPlaceholder}
                                    />
                                )}
                            />
                            <Controller
                                name="conditions"
                                control={control}
                                render={({ field }) => (
                                    <ChipInput
                                        label={strings.patients.conditions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={strings.patients.conditionsPlaceholder}
                                    />
                                )}
                            />
                            <Controller
                                name="medications"
                                control={control}
                                render={({ field }) => (
                                    <ChipInput
                                        label={strings.patients.medications}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={strings.patients.medicationsPlaceholder}
                                    />
                                )}
                            />
                        </div>
                    </fieldset>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" type="button" onClick={() => navigate('/patients')}>
                            {strings.common.cancel}
                        </Button>
                        <Button type="submit" isLoading={createPatient.isPending}>
                            <UserPlus size={16} />
                            {strings.patients.register}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
