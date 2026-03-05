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
                    <h1 className="text-2xl font-bold text-surface-900">{strings.patients.title}</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
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
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                            {patient.firstName[0]}
                                            {patient.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-surface-900">
                                                {patient.firstName} {patient.lastName}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    <Phone size={12} /> {patient.phone}
                                                </span>
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    <Mail size={12} /> {patient.email}
                                                </span>
                                                <span className="text-sm text-surface-500 flex items-center gap-1">
                                                    <MapPin size={12} /> {patient.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pl-15 sm:pl-0">
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
