import React, { useState } from 'react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
    label: string;
    onFileSelect: (base64: string) => void;
    error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect, error }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                onFileSelect(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearFile = () => {
        setPreview(null);
        onFileSelect('');
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {!preview ? (
                <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id={`file-${label}`} />
                    <label htmlFor={`file-${label}`} className="cursor-pointer flex flex-col items-center">
                        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload photo</span>
                    </label>
                </div>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                        <XMarkIcon className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};
