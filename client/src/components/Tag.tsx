import React from 'react';

interface TagProps {
    type: 'success' | 'warning' | 'error' | 'neutral';
    label: string;
}

export const Tag: React.FC<TagProps> = ({ type, label }) => {
    const styles = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        neutral: "bg-gray-100 text-gray-800"
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[type]}`}>
            {label}
        </span>
    );
};
