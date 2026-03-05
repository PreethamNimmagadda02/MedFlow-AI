import { useState } from 'react';
import { useProviders, useSpecialties, usePatients, useCreateAppointment } from '../api/hooks';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { strings } from '../i18n/en';
import {
    Search,
    MapPin,
    Clock,
    Stethoscope,
    CalendarPlus,
    Video,
    Building,
} from 'lucide-react';

export function Scheduling() {
    const [searchName, setSearchName] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [bookingModal, setBookingModal] = useState<{
        providerId: string;
        providerName: string;
        slot: string;
    } | null>(null);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [reason, setReason] = useState('');
    const [channel, setChannel] = useState<'in_person' | 'video'>('in_person');

    const { data: providers = [], isLoading } = useProviders({
        specialty: selectedSpecialty || undefined,
        name: searchName || undefined,
    });
    const { data: specialties = [] } = useSpecialties();
    const { data: patients = [] } = usePatients();
    const createAppointment = useCreateAppointment();
    const { showToast } = useToast();

    const formatSlot = (iso: string) => {
        const d = new Date(iso);
        return {
            date: d.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                timeZone: 'Asia/Kolkata',
            }),
            time: d.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata',
            }),
        };
    };

    const handleBook = async () => {
        if (!bookingModal || !selectedPatient || !reason) return;
        await createAppointment.mutateAsync({
            patientId: selectedPatient,
            providerId: bookingModal.providerId,
            start: bookingModal.slot,
            reason,
            channel,
        });
        showToast('success', strings.scheduling.bookingSuccess);
        setBookingModal(null);
        setSelectedPatient('');
        setReason('');
        setChannel('in_person');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">{strings.scheduling.title}</h1>
                <p className="text-sm text-surface-500 mt-1">Find a provider and book an appointment</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                        type="search"
                        placeholder={strings.scheduling.searchProvider}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        aria-label="Search providers"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 bg-white text-sm text-surface-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        aria-label="Filter by specialty"
                    >
                        <option value="">{strings.scheduling.allSpecialties}</option>
                        {specialties.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Provider cards */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-surface-100 animate-pulse" />
                    ))}
                </div>
            ) : providers.length === 0 ? (
                <Card className="text-center py-12">
                    <Stethoscope size={40} className="text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500">{strings.scheduling.noProviders}</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {providers.map((provider, idx) => (
                        <Card
                            key={provider.id}
                            hover
                            className="animate-fade-in"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold text-base shrink-0">
                                    {provider.name
                                        .replace('Dr. ', '')
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-surface-900">{provider.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Stethoscope size={13} className="text-primary-500" />
                                        <span className="text-sm text-surface-500">{provider.specialty}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <MapPin size={13} className="text-surface-400" />
                                        <span className="text-xs text-surface-500">{provider.locations.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Available slots */}
                            <div className="mt-4">
                                <p className="text-xs font-medium text-surface-500 mb-2 flex items-center gap-1">
                                    <Clock size={12} /> {strings.scheduling.availableSlots}
                                </p>
                                {provider.slots.length === 0 ? (
                                    <p className="text-xs text-surface-400">{strings.scheduling.noSlots}</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {provider.slots.slice(0, 6).map((slot) => {
                                            const f = formatSlot(slot);
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() =>
                                                        setBookingModal({
                                                            providerId: provider.id,
                                                            providerName: provider.name,
                                                            slot,
                                                        })
                                                    }
                                                    className="px-2.5 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-xs font-medium text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-all duration-150 cursor-pointer"
                                                >
                                                    {f.date}, {f.time}
                                                </button>
                                            );
                                        })}
                                        {provider.slots.length > 6 && (
                                            <span className="px-2.5 py-1.5 text-xs text-surface-500">
                                                +{provider.slots.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            <Modal
                isOpen={!!bookingModal}
                onClose={() => setBookingModal(null)}
                title={strings.scheduling.bookAppointment}
            >
                {bookingModal && (
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                            <p className="text-sm font-medium text-surface-900">
                                {bookingModal.providerName}
                            </p>
                            <p className="text-sm text-surface-500 flex items-center gap-1.5 mt-1">
                                <Clock size={14} />
                                {new Date(bookingModal.slot).toLocaleString('en-IN', {
                                    dateStyle: 'full',
                                    timeStyle: 'short',
                                    timeZone: 'Asia/Kolkata',
                                })}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="book-patient" className="text-sm font-medium text-surface-700">
                                {strings.scheduling.selectPatient} <span className="text-danger-500">*</span>
                            </label>
                            <select
                                id="book-patient"
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                required
                            >
                                <option value="">Select a patient...</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="book-reason" className="text-sm font-medium text-surface-700">
                                {strings.scheduling.reason} <span className="text-danger-500">*</span>
                            </label>
                            <input
                                id="book-reason"
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Fever and sore throat"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-surface-700">{strings.scheduling.channel}</label>
                            <div className="flex gap-3">
                                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${channel === 'in_person' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-500 hover:border-surface-300'}`}>
                                    <input
                                        type="radio"
                                        name="channel"
                                        value="in_person"
                                        checked={channel === 'in_person'}
                                        onChange={() => setChannel('in_person')}
                                        className="sr-only"
                                    />
                                    <Building size={16} />
                                    <span className="text-sm font-medium">{strings.scheduling.inPerson}</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${channel === 'video' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-500 hover:border-surface-300'}`}>
                                    <input
                                        type="radio"
                                        name="channel"
                                        value="video"
                                        checked={channel === 'video'}
                                        onChange={() => setChannel('video')}
                                        className="sr-only"
                                    />
                                    <Video size={16} />
                                    <span className="text-sm font-medium">{strings.scheduling.video}</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setBookingModal(null)}>
                                {strings.common.cancel}
                            </Button>
                            <Button
                                onClick={handleBook}
                                isLoading={createAppointment.isPending}
                                disabled={!selectedPatient || !reason}
                            >
                                <CalendarPlus size={16} />
                                {strings.scheduling.bookAppointment}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
