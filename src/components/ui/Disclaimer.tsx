import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
    text: string;
    className?: string;
}

export function Disclaimer({ text, className = '' }: DisclaimerProps) {
    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-warning-50 border border-warning-200 ${className}`}
            role="alert"
        >
            <AlertTriangle size={20} className="text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-warning-800 font-medium">{text}</p>
        </div>
    );
}
