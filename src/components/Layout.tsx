import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarCheck,
    Brain,
    Menu,
    X,
    Activity,
} from 'lucide-react';
import { strings } from '../i18n/en';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: strings.nav.dashboard },
    { to: '/patients', icon: Users, label: strings.nav.patients },
    { to: '/scheduling', icon: Calendar, label: strings.nav.scheduling },
    { to: '/appointments', icon: CalendarCheck, label: strings.nav.appointments },
    { to: '/triage', icon: Brain, label: strings.nav.triage },
];

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-surface-50">
            {/* Skip to content link — first focusable element */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium"
            >
                {strings.app.skipToContent}
            </a>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-700/50">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                        <Activity size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight">{strings.app.title}</h1>
                        <p className="text-xs text-surface-400">{strings.app.subtitle}</p>
                    </div>
                    <button
                        className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-surface-700 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-3 flex flex-col gap-1 mt-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary-600/20 text-primary-300 shadow-sm'
                                    : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                        <p className="text-xs text-surface-400 leading-relaxed">{strings.app.disclaimer}</p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top bar (mobile) */}
                <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-surface-200 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <Menu size={20} className="text-surface-700" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <Activity size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-surface-900 text-sm">{strings.app.title}</span>
                    </div>
                </header>

                {/* Page content */}
                <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
