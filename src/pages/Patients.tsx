import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../api/hooks';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { strings } from '../i18n/en';
import { UserPlus, Search, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export function Patients() {
    const [search, setSearch] = useState('');
    const { data: patients = [], isLoading } = usePatients();

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.firstName.toLowerCase().includes(q) ||
            p.lastName.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.email.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-surface-900">{strings.patients.title}</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        {strings.patients.totalCount(patients.length)}
                    </p>
                </div>
                <Link to="/patients/register">
                    <Button size="md">
                        <UserPlus size={16} />
                        {strings.patients.register}
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                    type="search"
                    placeholder={strings.patients.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    aria-label="Search patients"
                />
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-surface-100 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="text-center py-12">
                    <AlertCircle size={40} className="text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500">{strings.patients.noPatients}</p>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((patient, idx) => (
                        <Link
                            key={patient.id}
                            to={`/patients/${patient.id}`}
                            className="block animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <Card hover padding="md">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                                            {patient.firstName[0]}
                                            {patient.lastName[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-surface-900 text-sm sm:text-base truncate">
                                                {patient.firstName} {patient.lastName}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-0.5 sm:gap-x-4 sm:gap-y-1 mt-1">
                                                <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1 truncate">
                                                    <Phone size={12} aria-hidden="true" /> {patient.phone}
                                                </span>
                                                <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1 truncate">
                                                    <Mail size={12} aria-hidden="true" /> {patient.email}
                                                </span>
                                                <span className="text-xs sm:text-sm text-surface-500 flex items-center gap-1">
                                                    <MapPin size={12} aria-hidden="true" /> {patient.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pl-12 sm:pl-0 flex-wrap">
                                        {patient.conditions.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {patient.conditions.map((c) => (
                                                    <Badge key={c} variant="warning">
                                                        {c}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {patient.allergies.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {patient.allergies.map((a) => (
                                                    <Badge key={a} variant="danger">
                                                        ⚠ {a}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
