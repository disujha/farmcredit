import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { label: string; value: string }[];
    error?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ label, options, error, className = '', ...props }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    } ${className}`}
                {...props}
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};
