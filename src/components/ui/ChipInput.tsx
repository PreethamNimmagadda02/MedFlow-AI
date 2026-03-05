import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface ChipInputProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    error?: string;
    id?: string;
}

export function ChipInput({
    label,
    value,
    onChange,
    placeholder = 'Type and press Enter',
    error,
    id,
}: ChipInputProps) {
    const [inputValue, setInputValue] = useState('');
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    const addChip = (text: string) => {
        const trimmed = text.trim().toLowerCase();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue('');
    };

    const removeChip = (chipToRemove: string) => {
        onChange(value.filter((chip) => chip !== chipToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addChip(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeChip(value[value.length - 1]);
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-sm font-medium text-surface-700">
                {label}
            </label>
            <div
                className={`flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border bg-white transition-colors min-h-[42px] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 ${error ? 'border-danger-400' : 'border-surface-300'
                    }`}
            >
                {value.map((chip) => (
                    <span
                        key={chip}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium animate-scale-in"
                    >
                        {chip}
                        <button
                            type="button"
                            onClick={() => removeChip(chip)}
                            className="p-0.5 rounded-full hover:bg-primary-200 transition-colors"
                            aria-label={`Remove ${chip}`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    id={inputId}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] border-none outline-none text-sm text-surface-900 placeholder:text-surface-400 bg-transparent"
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            </div>
            {error && (
                <p id={`${inputId}-error`} className="text-xs text-danger-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
