import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
    dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-surface-100 text-surface-700',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-accent-100 text-accent-800',
};

const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-surface-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-accent-500',
};

export function Badge({ children, variant = 'default', className = '', dot = false }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />
            )}
            {children}
        </span>
    );
}

// Convenience functions for appointment/triage status
export function getStatusBadgeVariant(status: string): BadgeVariant {
    switch (status) {
        case 'Scheduled':
            return 'info';
        case 'Completed':
            return 'success';
        case 'Cancelled':
            return 'danger';
        default:
            return 'default';
    }
}

export function getUrgencyBadgeVariant(urgency: string): BadgeVariant {
    switch (urgency) {
        case 'Critical':
            return 'danger';
        case 'High':
            return 'warning';
        case 'Medium':
            return 'primary';
        case 'Low':
            return 'success';
        default:
            return 'default';
    }
}
