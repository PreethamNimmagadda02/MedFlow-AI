import { useState, useMemo } from 'react';
import { useAppointments, useProviders } from '../api/hooks';
import { getPatients } from '../api/patients';
import { Card } from '../components/ui/Card';
import { Badge, getStatusBadgeVariant, getUrgencyBadgeVariant } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { strings } from '../i18n/en';
import {
    Calendar,
    Clock,
    Users,
    Brain,
    MapPin,
    Video,
    ChevronDown,
    ChevronUp,
    TrendingUp,
} from 'lucide-react';

export function Dashboard() {
    const [selectedDate, setSelectedDate] = useState('2026-03-05');
    const [selectedProvider, setSelectedProvider] = useState('');
    const [expandedAppt, setExpandedAppt] = useState<string | null>(null);

    const { data: allAppointments = [] } = useAppointments();
    const { data: providers = [] } = useProviders();
    const patients = getPatients();

    const filteredAppointments = useMemo(() => {
        return allAppointments.filter((a) => {
            const matchDate = a.start.startsWith(selectedDate);
            const matchProvider = !selectedProvider || a.providerId === selectedProvider;
            return matchDate && matchProvider;
        });
    }, [allAppointments, selectedDate, selectedProvider]);

    const stats = useMemo(() => {
        const scheduled = filteredAppointments.filter((a) => a.status === 'Scheduled').length;
        const completed = filteredAppointments.filter((a) => a.status === 'Completed').length;
        const triaged = filteredAppointments.filter((a) => a.triageResult).length;
        return {
            total: filteredAppointments.length,
            scheduled,
            completed,
            triaged,
        };
    }, [filteredAppointments]);

    const getPatientName = (id: string) => {
        const p = patients.find((pat) => pat.id === id);
        return p ? `${p.firstName} ${p.lastName}` : strings.common.unknown;
    };

    const getProviderName = (id: string) => {
        const p = providers.find((prov) => prov.id === id);
        return p ? p.name : strings.common.unknown;
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
        });
    };

    const statCards = [
        { label: strings.dashboard.stats.total, value: stats.total, icon: Calendar, color: 'from-accent-500 to-accent-600' },
        { label: strings.dashboard.stats.scheduled, value: stats.scheduled, icon: Clock, color: 'from-primary-500 to-primary-600' },
        { label: strings.dashboard.stats.completed, value: stats.completed, icon: Users, color: 'from-success-500 to-success-600' },
        { label: strings.dashboard.stats.triaged, value: stats.triaged, icon: Brain, color: 'from-warning-500 to-warning-600' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-surface-900">{strings.dashboard.title}</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        {strings.dashboard.overviewFor} {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-48">
                    <Input
                        label={strings.dashboard.filterDate}
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-64">
                    <label htmlFor="filter-provider" className="text-sm font-medium text-surface-700 block mb-1.5">
                        {strings.dashboard.filterProvider}
                    </label>
                    <select
                        id="filter-provider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    >
                        <option value="">{strings.dashboard.allProviders}</option>
                        {providers.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="relative overflow-hidden" hover>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-surface-500 font-medium">{stat.label}</p>
                                <p className="text-2xl sm:text-3xl font-bold text-surface-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                                <stat.icon size={16} className="text-white sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                            </div>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                    </Card>
                ))}
            </div>

            {/* Appointments list */}
            <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary-500" aria-hidden="true" />
                    {strings.dashboard.todayAppointments}
                </h2>

                {filteredAppointments.length === 0 ? (
                    <Card className="text-center py-12">
                        <Calendar size={40} className="text-surface-300 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-surface-500">{strings.dashboard.noAppointmentsToday}</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredAppointments.map((appt, idx) => (
                            <Card
                                key={appt.id}
                                hover
                                className="cursor-pointer"
                                padding="none"
                            >
                                <div
                                    className="p-3 sm:p-4"
                                    onClick={() =>
                                        setExpandedAppt(expandedAppt === appt.id ? null : appt.id)
                                    }
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                                                {getPatientName(appt.patientId)
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-surface-900 text-sm sm:text-base truncate">
                                                    {getPatientName(appt.patientId)}
                                                </p>
                                                <p className="text-xs sm:text-sm text-surface-500 truncate">
                                                    {getProviderName(appt.providerId)} · {appt.reason}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 pl-12 sm:pl-0 flex-wrap">
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-surface-600">
                                                <Clock size={14} aria-hidden="true" />
                                                {formatTime(appt.start)}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-surface-600">
                                                {appt.channel === 'video' ? (
                                                    <Video size={14} aria-hidden="true" />
                                                ) : (
                                                    <MapPin size={14} aria-hidden="true" />
                                                )}
                                                {appt.channel === 'video' ? strings.scheduling.videoShort : strings.scheduling.inPersonShort}
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(appt.status)} dot>
                                                {appt.status}
                                            </Badge>
                                            {appt.triageResult && (
                                                <Badge variant={getUrgencyBadgeVariant(appt.triageResult.triage.urgency)}>
                                                    {appt.triageResult.triage.urgency}
                                                </Badge>
                                            )}
                                            <button
                                                aria-label={expandedAppt === appt.id ? strings.dashboard.collapseDetails : strings.dashboard.expandDetails}
                                                className="p-1"
                                            >
                                                {expandedAppt === appt.id ? (
                                                    <ChevronUp size={16} className="text-surface-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-surface-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded triage info */}
                                {expandedAppt === appt.id && appt.triageResult && (
                                    <div className="px-3 sm:px-4 pb-4 pt-2 border-t border-surface-100 animate-fade-in">
                                        <div className="ml-0 sm:ml-14 space-y-3">
                                            <h3 className="text-sm font-semibold text-surface-700 flex items-center gap-1.5">
                                                <Brain size={14} className="text-primary-500" aria-hidden="true" />
                                                {strings.dashboard.triageOutcome}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-surface-500 mb-1">{strings.triage.differentials}</p>
                                                    <div className="space-y-1.5">
                                                        {appt.triageResult.differentials.map((d) => (
                                                            <div key={d.condition} className="flex items-center gap-2">
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between mb-0.5">
                                                                        <span className="text-sm text-surface-700">{d.condition}</span>
                                                                        <span className="text-xs text-surface-500">
                                                                            {Math.round(d.confidence * 100)}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                                                                            style={{ width: `${d.confidence * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-surface-500 mb-1">{strings.triage.guidance}</p>
                                                    <ul className="space-y-1">
                                                        {appt.triageResult.guidance.map((g, i) => (
                                                            <li key={i} className="text-sm text-surface-700 flex items-start gap-1.5">
                                                                <span className="text-primary-500 mt-1" aria-hidden="true">•</span>
                                                                {g}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <p className="text-sm text-surface-600 italic bg-surface-50 px-3 py-2 rounded-lg">
                                                {appt.triageResult.explanation}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
