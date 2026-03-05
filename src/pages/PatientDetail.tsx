import { useParams, useNavigate } from 'react-router-dom';
import { usePatient, useAppointments } from '../api/hooks';
import { getProvider } from '../api/providers';
import { Card } from '../components/ui/Card';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { strings } from '../i18n/en';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    AlertTriangle,
    Pill,
    Heart,
    Clock,
} from 'lucide-react';

export function PatientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: patient, isLoading } = usePatient(id || '');
    const { data: appointments = [] } = useAppointments({ patientId: id });

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4 animate-pulse" role="status" aria-label={strings.common.loading}>
                <div className="h-8 w-48 bg-surface-200 rounded" />
                <div className="h-64 bg-surface-100 rounded-xl" />
            </div>
        );
    }

    if (!patient) {
        return (
            <Card className="text-center py-12 max-w-md mx-auto">
                <p className="text-surface-500">{strings.patients.notFound}</p>
                <Button variant="secondary" className="mt-4" onClick={() => navigate('/patients')}>
                    {strings.patients.backToPatients}
                </Button>
            </Card>
        );
    }

    const age = Math.floor(
        (Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/patients')}
                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    aria-label={strings.patients.backToPatients}
                >
                    <ArrowLeft size={20} className="text-surface-600" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900 truncate">
                    {patient.firstName} {patient.lastName}
                </h1>
            </div>

            {/* Profile card */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                        {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className="text-xs text-surface-500">{strings.patients.sexLabel}</p>
                                <p className="text-sm font-medium text-surface-900 capitalize">{patient.sex}</p>
                            </div>
                            <div>
                                <p className="text-xs text-surface-500">{strings.patients.ageLabel}</p>
                                <p className="text-sm font-medium text-surface-900">{age} {strings.patients.years}</p>
                            </div>
                            <div>
                                <p className="text-xs text-surface-500">{strings.patients.dobLabel}</p>
                                <p className="text-sm font-medium text-surface-900">
                                    {new Date(patient.birthDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-5 sm:gap-y-2 pt-1">
                            <span className="text-sm text-surface-600 flex items-center gap-1.5 truncate">
                                <Phone size={14} className="text-surface-400 shrink-0" aria-hidden="true" /> {patient.phone}
                            </span>
                            <span className="text-sm text-surface-600 flex items-center gap-1.5 truncate">
                                <Mail size={14} className="text-surface-400 shrink-0" aria-hidden="true" /> {patient.email}
                            </span>
                            <span className="text-sm text-surface-600 flex items-center gap-1.5">
                                <MapPin size={14} className="text-surface-400 shrink-0" aria-hidden="true" /> {patient.address}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Medical info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-danger-500" aria-hidden="true" />
                        <h3 className="text-sm font-semibold text-surface-800">{strings.patients.allergies}</h3>
                    </div>
                    {patient.allergies.length === 0 ? (
                        <p className="text-sm text-surface-400">{strings.common.noneReported}</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {patient.allergies.map((a) => (
                                <Badge key={a} variant="danger">{a}</Badge>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <Heart size={16} className="text-warning-500" aria-hidden="true" />
                        <h3 className="text-sm font-semibold text-surface-800">{strings.patients.conditions}</h3>
                    </div>
                    {patient.conditions.length === 0 ? (
                        <p className="text-sm text-surface-400">{strings.common.noneReported}</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {patient.conditions.map((c) => (
                                <Badge key={c} variant="warning">{c}</Badge>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-3">
                        <Pill size={16} className="text-accent-500" aria-hidden="true" />
                        <h3 className="text-sm font-semibold text-surface-800">{strings.patients.medications}</h3>
                    </div>
                    {patient.medications.length === 0 ? (
                        <p className="text-sm text-surface-400">{strings.common.noneReported}</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {patient.medications.map((m) => (
                                <Badge key={m} variant="info">{m}</Badge>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Appointments */}
            <div>
                <h2 className="text-lg font-semibold text-surface-800 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-primary-500" aria-hidden="true" />
                    {strings.appointments.title}
                </h2>
                {appointments.length === 0 ? (
                    <Card className="text-center py-8">
                        <p className="text-sm text-surface-400">{strings.appointments.noAppointments}</p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {appointments.map((appt) => {
                            const provider = getProvider(appt.providerId);
                            return (
                                <Card key={appt.id} padding="sm" hover>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <Clock size={14} className="text-surface-400 mt-0.5 shrink-0" aria-hidden="true" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-surface-800 truncate">
                                                    {provider?.name || strings.common.unknown} — {appt.reason}
                                                </p>
                                                <p className="text-xs text-surface-500">
                                                    {new Date(appt.start).toLocaleString('en-IN', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                        timeZone: 'Asia/Kolkata',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(appt.status)} dot>
                                            {appt.status}
                                        </Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
