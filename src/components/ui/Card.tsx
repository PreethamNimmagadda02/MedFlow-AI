import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: React.CSSProperties;
}

export function Card({
    children,
    className = '',
    glass = false,
    hover = false,
    padding = 'md',
    style,
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    };

    const baseClasses = glass
        ? 'glass-card rounded-xl'
        : 'bg-white rounded-xl border border-surface-200 shadow-sm';

    const hoverClasses = hover
        ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
        : '';

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}
