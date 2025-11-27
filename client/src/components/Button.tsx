import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className = '',
    ...props
}) => {
    const baseStyles = "flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--color-primary)] text-white hover:bg-green-800 focus:ring-green-500",
        secondary: "bg-[var(--color-secondary)] text-white hover:bg-green-600 focus:ring-green-400",
        danger: "bg-[var(--color-danger)] text-white hover:bg-red-700 focus:ring-red-500",
        outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50 focus:ring-green-500"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {Icon && <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />}
            {children}
        </button>
    );
};
