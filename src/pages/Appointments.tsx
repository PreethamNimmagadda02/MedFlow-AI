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
        showToast('info', 'Appointment cancelled.');
        setCancelModal(null);
    };

    const handleReschedule = async () => {
        if (!rescheduleModal || !newSlot) return;
        const isoSlot = new Date(newSlot).toISOString();
        await rescheduleAppt.mutateAsync({ id: rescheduleModal, newStart: isoSlot });
        showToast('success', 'Appointment rescheduled.');
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
                <h1 className="text-2xl font-bold text-surface-900">{strings.appointments.title}</h1>
                <p className="text-sm text-surface-500 mt-1">
                    {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
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
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                            ? 'bg-white text-surface-900 shadow-sm'
                            : 'text-surface-500 hover:text-surface-700'
                            }`}
                    >
                        {strings.appointments[tab.toLowerCase() as 'scheduled' | 'completed' | 'cancelled']}{' '}
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'
                            }`}>
                            {tabCounts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Appointment list */}
            {filtered.length === 0 ? (
                <Card className="text-center py-12">
                    <Calendar size={40} className="text-surface-300 mx-auto mb-3" />
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                            {patient
                                                ? `${patient.firstName[0]}${patient.lastName[0]}`
                                                : '??'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-surface-900">
                                                {patient
                                                    ? `${patient.firstName} ${patient.lastName}`
                                                    : 'Unknown Patient'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    <Stethoscope size={12} />
                                                    {provider?.name || 'Unknown'}
                                                </span>
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDateTime(appt.start)}
                                                </span>
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    {appt.channel === 'video' ? <Video size={12} /> : <MapPin size={12} />}
                                                    {appt.channel === 'video' ? 'Video' : 'In-person'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-surface-600 mt-1">{appt.reason}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-14 sm:pl-0 shrink-0">
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
                                                    <CalendarClock size={14} />
                                                    {strings.appointments.reschedule}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCancelModal(appt.id)}
                                                    className="text-danger-600 hover:bg-danger-50"
                                                >
                                                    <CalendarX size={14} />
                                                    {strings.appointments.cancel}
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

            {/* Cancel confirmation modal */}
            <Modal
                isOpen={!!cancelModal}
                onClose={() => setCancelModal(null)}
                title={strings.appointments.confirmCancel}
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-surface-600">{strings.appointments.cancelConfirm}</p>
                    <div className="flex justify-end gap-3">
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
                    <div className="flex justify-end gap-3">
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
