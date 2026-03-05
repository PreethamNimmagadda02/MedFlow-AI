import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, id, className = '', ...props }, ref) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
        return (
            <div className="flex flex-col gap-1.5">
                <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
                    {label}
                    {props.required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 placeholder:text-surface-400 text-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none ${error ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-100' : ''
                        } ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="text-xs text-surface-500">
                        {hint}
                    </p>
                )}
                {error && (
                    <p id={`${inputId}-error`} className="text-xs text-danger-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
        const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
        return (
            <div className="flex flex-col gap-1.5">
                <label htmlFor={selectId} className="text-sm font-medium text-surface-700">
                    {label}
                    {props.required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
                </label>
                <select
                    ref={ref}
                    id={selectId}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-10 ${error ? 'border-danger-400' : ''
                        } ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${selectId}-error` : undefined}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p id={`${selectId}-error`} className="text-xs text-danger-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, id, className = '', ...props }, ref) => {
        const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
        return (
            <div className="flex flex-col gap-1.5">
                <label htmlFor={textareaId} className="text-sm font-medium text-surface-700">
                    {label}
                    {props.required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
                </label>
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 placeholder:text-surface-400 text-sm transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-y min-h-[80px] ${error ? 'border-danger-400' : ''
                        } ${className}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="text-xs text-danger-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
