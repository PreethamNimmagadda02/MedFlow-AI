import { useState } from 'react';
import { useAppointments, useCancelAppointment, useRescheduleAppointment } from '../api/hooks';
import { getPatient } from '../api/patients';
import { getProvider } from '../api/providers';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { strings } from '../i18n/en';
import {
    Clock,
    MapPin,
    Video,
    CalendarX,
    CalendarClock,
    Calendar,
    Stethoscope,
} from 'lucide-react';

type StatusTab = 'Scheduled' | 'Completed' | 'Cancelled';

export function Appointments() {
    const [activeTab, setActiveTab] = useState<StatusTab>('Scheduled');
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [rescheduleModal, setRescheduleModal] = useState<string | null>(null);
    const [newSlot, setNewSlot] = useState('');

    const { data: appointments = [] } = useAppointments();
    const cancelAppt = useCancelAppointment();
    const rescheduleAppt = useRescheduleAppointment();
    const { showToast } = useToast();

    const filtered = appointments.filter((a) => a.status === activeTab);

    const formatDateTime = (iso: string) => {
        return new Date(iso).toLocaleString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
        });
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        await cancelAppt.mutateAsync(cancelModal);
        showToast('info', strings.appointments.cancelSuccess);
        setCancelModal(null);
    };

    const handleReschedule = async () => {
        if (!rescheduleModal || !newSlot) return;
        const isoSlot = new Date(newSlot).toISOString();
        await rescheduleAppt.mutateAsync({ id: rescheduleModal, newStart: isoSlot });
        showToast('success', strings.appointments.rescheduleSuccess);
        setRescheduleModal(null);
        setNewSlot('');
    };

    const tabs: StatusTab[] = ['Scheduled', 'Completed', 'Cancelled'];
    const tabCounts = {
        Scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
        Completed: appointments.filter((a) => a.status === 'Completed').length,
        Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900">{strings.appointments.title}</h1>
                <p className="text-sm text-surface-500 mt-1">
                    {strings.appointments.totalCount(appointments.length)}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-100 rounded-xl" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab
                            ? 'bg-white text-surface-900 shadow-sm'
                            : 'text-surface-500 hover:text-surface-700'
                            }`}
                    >
                        {strings.appointments[tab.toLowerCase() as 'scheduled' | 'completed' | 'cancelled']}{' '}
                        <span className={`ml-0.5 sm:ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'
                            }`}>
                            {tabCounts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Appointment list */}
            <div role="tabpanel">
                {filtered.length === 0 ? (
                    <Card className="text-center py-12">
                        <Calendar size={40} className="text-surface-300 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-surface-500">{strings.appointments.noAppointments}</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((appt, idx) => {
                            const patient = getPatient(appt.patientId);
                            const provider = getProvider(appt.providerId);
                            return (
                                <Card
                                    key={appt.id}
                                    hover
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                                                {patient
                                                    ? `${patient.firstName[0]}${patient.lastName[0]}`
                                                    : '??'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-surface-900 text-sm sm:text-base truncate">
                                                    {patient
                                                        ? `${patient.firstName} ${patient.lastName}`
                                                        : strings.common.unknownPatient}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-4 sm:gap-y-1 mt-1">
                                                    <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1">
                                                        <Stethoscope size={12} aria-hidden="true" />
                                                        {provider?.name || strings.common.unknown}
                                                    </span>
                                                    <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1">
                                                        <Clock size={12} aria-hidden="true" />
                                                        {formatDateTime(appt.start)}
                                                    </span>
                                                    <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1">
                                                        {appt.channel === 'video' ? <Video size={12} aria-hidden="true" /> : <MapPin size={12} aria-hidden="true" />}
                                                        {appt.channel === 'video' ? strings.scheduling.videoShort : strings.scheduling.inPersonShort}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-surface-600 mt-1 truncate">{appt.reason}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pl-12 sm:pl-0 shrink-0 flex-wrap">
                                            <Badge variant={getStatusBadgeVariant(appt.status)} dot>
                                                {appt.status}
                                            </Badge>
                                            {appt.status === 'Scheduled' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setRescheduleModal(appt.id)}
                                                    >
                                                        <CalendarClock size={14} aria-hidden="true" />
                                                        <span className="hidden sm:inline">{strings.appointments.reschedule}</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setCancelModal(appt.id)}
                                                        className="text-danger-600 hover:bg-danger-50"
                                                    >
                                                        <CalendarX size={14} aria-hidden="true" />
                                                        <span className="hidden sm:inline">{strings.appointments.cancel}</span>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cancel confirmation modal */}
            <Modal
                isOpen={!!cancelModal}
                onClose={() => setCancelModal(null)}
                title={strings.appointments.confirmCancel}
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-surface-600">{strings.appointments.cancelConfirm}</p>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <Button variant="secondary" onClick={() => setCancelModal(null)}>
                            {strings.common.back}
                        </Button>
                        <Button variant="danger" onClick={handleCancel} isLoading={cancelAppt.isPending}>
                            {strings.appointments.confirmCancel}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reschedule modal */}
            <Modal
                isOpen={!!rescheduleModal}
                onClose={() => setRescheduleModal(null)}
                title={strings.appointments.rescheduleTitle}
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="new-slot" className="text-sm font-medium text-surface-700">
                            {strings.appointments.selectNewSlot}
                        </label>
                        <input
                            id="new-slot"
                            type="datetime-local"
                            value={newSlot}
                            onChange={(e) => setNewSlot(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <Button variant="secondary" onClick={() => setRescheduleModal(null)}>
                            {strings.common.cancel}
                        </Button>
                        <Button
                            onClick={handleReschedule}
                            isLoading={rescheduleAppt.isPending}
                            disabled={!newSlot}
                        >
                            {strings.appointments.confirmReschedule}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
