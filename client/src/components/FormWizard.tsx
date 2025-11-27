import React from 'react';
import { Button } from './Button';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface FormWizardProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    onNext: () => void;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    children: React.ReactNode;
}

export const FormWizard: React.FC<FormWizardProps> = ({
    currentStep,
    totalSteps,
    title,
    onNext,
    onBack,
    onSubmit,
    isSubmitting,
    children
}) => {
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <span className="text-sm font-medium text-gray-500">Step {currentStep} of {totalSteps}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-32 px-4 scroll-smooth">
                {children}
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom,1rem)]">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={currentStep === 1}
                    className="flex-1"
                >
                    Back
                </Button>

                {currentStep < totalSteps ? (
                    <Button onClick={onNext} className="flex-1">
                        Next
                    </Button>
                ) : (
                    <Button
                        onClick={onSubmit}
                        className="flex-1"
                        disabled={isSubmitting}
                        icon={isSubmitting ? undefined : CheckCircleIcon}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                )}
            </div>
        </div>
    );
};
