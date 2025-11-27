import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { security } from './security';
import { FormWizard } from './components/FormWizard';
import { FormInput } from './components/FormInput';
import { FormSelect } from './components/FormSelect';
import { FileUpload } from './components/FileUpload';
import { MessageThread } from './components/MessageThread';
import { LoanApplication, DraftApplication } from '../../server/src/types';

interface WizardProps {
    initialData?: LoanApplication;
    onComplete: () => void;
    onCancel: () => void;
}

const INITIAL_STATE: LoanApplication = {
    id: '',
    agentId: 'agent-001',
    submissionId: '',
    timestamp: '',
    status: 'DRAFT',
    messages: [],
    personal: {
        farmerName: '',
        fatherOrHusbandName: '',
        dob: '',
        gender: 'Male',
        aadhaarOrID: '',
        phone: '',
        address: { village: '', tehsil: '', district: '', pin: '' }
    },
    land: {
        size: 0,
        unit: 'Acres',
        ownershipType: 'Owned'
    },
    crops: [],
    financials: {
        last2SeasonsIncomeEstimate: 0,
        previousLoans: []
    },
    loanRequest: {
        amount: 0,
        purpose: '',
        tenure: 12,
        repaymentSource: ''
    },
    collateral: {
        type: '',
        description: ''
    },
    consent: {
        signedBy: '',
        signatureImage: '',
        timestamp: ''
    }
};

export const LoanApplicationWizard: React.FC<WizardProps> = ({ initialData, onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<LoanApplication>(() => {
        if (initialData) return initialData;
        return {
            ...INITIAL_STATE,
            id: uuidv4(),
            submissionId: uuidv4(),
            timestamp: new Date().toISOString()
        };
    });

    // Auto-save draft (only if not editing an existing submitted app)
    useEffect(() => {
        if (formData.status !== 'DRAFT') return;

        const saveDraft = async () => {
            const draft: DraftApplication = {
                ...formData,
                lastModified: Date.now(),
                step
            };
            await db.saveDraft(draft);
        };
        const timer = setTimeout(saveDraft, 1000);
        return () => clearTimeout(timer);
    }, [formData, step]);

    const updateField = (section: keyof LoanApplication, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [field]: value
            }
        }));
    };

    const updateNestedField = (section: keyof LoanApplication, subsection: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [subsection]: {
                    ...((prev[section] as any)[subsection]),
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        // Encrypt PII before submitting
        const finalData: LoanApplication = {
            ...formData,
            status: formData.status === 'INFO_REQUESTED' ? 'RESUBMITTED' : 'SUBMITTED',
            personal: {
                ...formData.personal,
                aadhaarOrID: security.encrypt(formData.personal.aadhaarOrID),
                phone: security.encrypt(formData.personal.phone)
            },
            consent: {
                ...formData.consent,
                timestamp: new Date().toISOString()
            }
        };

        await db.submitApplication(finalData);
        onComplete();
    };

    const renderStep1 = () => (
        <div className="space-y-4 animate-fade-in-up">
            {/* Status Banners */}
            {formData.status === 'APPROVED' && (
                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-green-800 text-sm uppercase mb-2 flex items-center">
                        <span className="mr-2">✅</span> Application Approved
                    </h4>
                    <p className="text-sm text-green-700">Congratulations! This loan application has been approved by the lender.</p>
                </div>
            )}

            {formData.status === 'REJECTED' && (
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-red-800 text-sm uppercase mb-2 flex items-center">
                        <span className="mr-2">❌</span> Application Rejected
                    </h4>
                    <p className="text-sm text-red-700">This application has been rejected. Please review the feedback below.</p>
                </div>
            )}

            {formData.status === 'INFO_REQUESTED' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-yellow-800 text-sm uppercase mb-2 flex items-center">
                        <span className="mr-2">⚠️</span> Action Required
                    </h4>
                    <p className="text-sm text-yellow-700">The lender has requested additional information. Please review and update the application.</p>
                </div>
            )}

            {/* Message Thread */}
            {formData.messages && formData.messages.length > 0 && (
                <div className="mb-6">
                    <MessageThread messages={formData.messages} status={formData.status} />
                </div>
            )}

            <h3 className="font-bold text-gray-800">Personal Details</h3>
            <FormInput
                label="Farmer Name"
                value={formData.personal.farmerName}
                onChange={e => updateField('personal', 'farmerName', e.target.value)}
            />
            <FormInput
                label="Father/Husband Name"
                value={formData.personal.fatherOrHusbandName}
                onChange={e => updateField('personal', 'fatherOrHusbandName', e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Date of Birth"
                    type="date"
                    value={formData.personal.dob}
                    onChange={e => updateField('personal', 'dob', e.target.value)}
                />
                <FormSelect
                    label="Gender"
                    options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                    value={formData.personal.gender}
                    onChange={e => updateField('personal', 'gender', e.target.value)}
                />
            </div>
            <FormInput
                label="Aadhaar / ID Number"
                value={security.decrypt(formData.personal.aadhaarOrID)}
                onChange={e => updateField('personal', 'aadhaarOrID', e.target.value)}
            />
            <FormInput
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                value={security.decrypt(formData.personal.phone)}
                onChange={e => updateField('personal', 'phone', e.target.value)}
            />
            <h4 className="font-semibold text-gray-700 mt-4">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Village"
                    value={formData.personal.address.village}
                    onChange={e => updateNestedField('personal', 'address', 'village', e.target.value)}
                />
                <FormInput
                    label="District"
                    value={formData.personal.address.district}
                    onChange={e => updateNestedField('personal', 'address', 'district', e.target.value)}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-bold text-gray-800">Land & Crops</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Land Size"
                    type="number"
                    inputMode="decimal"
                    value={formData.land.size}
                    onChange={e => updateField('land', 'size', Number(e.target.value))}
                />
                <FormSelect
                    label="Unit"
                    options={[{ label: 'Acres', value: 'Acres' }, { label: 'Hectares', value: 'Hectares' }]}
                    value={formData.land.unit}
                    onChange={e => updateField('land', 'unit', e.target.value)}
                />
            </div>
            <FormSelect
                label="Ownership Type"
                options={[{ label: 'Owned', value: 'Owned' }, { label: 'Leased', value: 'Leased' }]}
                value={formData.land.ownershipType}
                onChange={e => updateField('land', 'ownershipType', e.target.value)}
            />

            <FileUpload
                label="Land Record (7/12)"
                onFileSelect={base64 => updateField('land', 'landRecordFile', base64)}
            />

            <div className="p-4 bg-blue-50 rounded-lg text-blue-800 text-sm flex items-center">
                <span>📍 Geo-coordinates captured: 19.0760° N, 72.8777° E</span>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-bold text-gray-800">Financials & Loan Request</h3>
            <FormInput
                label="Annual Income Estimate (₹)"
                type="number"
                value={formData.financials.last2SeasonsIncomeEstimate}
                onChange={e => updateField('financials', 'last2SeasonsIncomeEstimate', Number(e.target.value))}
            />

            <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-bold text-gray-800 mb-3">Loan Details</h4>
                <FormInput
                    label="Requested Amount (₹)"
                    type="number"
                    value={formData.loanRequest.amount}
                    onChange={e => updateField('loanRequest', 'amount', Number(e.target.value))}
                />
                <FormSelect
                    label="Purpose"
                    options={[
                        { label: 'Crop Cultivation', value: 'Crop Cultivation' },
                        { label: 'Equipment Purchase', value: 'Equipment Purchase' },
                        { label: 'Irrigation', value: 'Irrigation' }
                    ]}
                    value={formData.loanRequest.purpose}
                    onChange={e => updateField('loanRequest', 'purpose', e.target.value)}
                />
                <FormInput
                    label="Tenure (Months)"
                    type="number"
                    value={formData.loanRequest.tenure}
                    onChange={e => updateField('loanRequest', 'tenure', Number(e.target.value))}
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-bold text-gray-800">Consent & Declaration</h3>

            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2 border border-gray-200">
                <p>I hereby declare that the information provided is true and correct.</p>
                <p>I authorize FarmCredit to verify my details and fetch credit history.</p>
            </div>

            <FormInput
                label="Signed By (Farmer Name)"
                value={formData.consent.signedBy}
                onChange={e => updateField('consent', 'signedBy', e.target.value)}
            />

            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-white">
                <span className="text-gray-400">Digital Signature Pad (Mock)</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h1 className="font-bold text-gray-700">New Application</h1>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
            </div>

            <FormWizard
                currentStep={step}
                totalSteps={4}
                title={
                    step === 1 ? 'Personal Details' :
                        step === 2 ? 'Land & Crops' :
                            step === 3 ? 'Financials' : 'Consent'
                }
                onNext={() => setStep(s => Math.min(s + 1, 4))}
                onBack={() => setStep(s => Math.max(s - 1, 1))}
                onSubmit={handleSubmit}
            >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </FormWizard>
        </div>
    );
};
