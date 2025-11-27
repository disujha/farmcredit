import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Badge } from './Badge';
import { LoanApplication } from '../../server/src/types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    application: LoanApplication | null;
    onUpdateStatus: (id: string, status: string, message?: string) => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, application, onUpdateStatus }) => {
    const [message, setMessage] = useState('');
    const [action, setAction] = useState<'APPROVED' | 'REJECTED' | 'INFO_REQUESTED' | null>(null);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (application && action) {
            onUpdateStatus(application.id, action, message);
            setMessage('');
            setAction(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {title}
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {application && (
                                    <div className="mt-2 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block">Farmer</span>
                                                    <span className="font-medium">{application.personal.farmerName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Amount</span>
                                                    <span className="font-medium">₹{application.loanRequest.amount.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Purpose</span>
                                                    <span className="font-medium">{application.loanRequest.purpose}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Status</span>
                                                    <Badge type={application.status} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 justify-center mt-4">
                                            <Button
                                                variant={action === 'APPROVED' ? 'primary' : 'outline'}
                                                onClick={() => setAction('APPROVED')}
                                                icon={CheckCircleIcon}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant={action === 'REJECTED' ? 'danger' : 'outline'}
                                                onClick={() => setAction('REJECTED')}
                                                icon={XCircleIcon}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant={action === 'INFO_REQUESTED' ? 'secondary' : 'outline'}
                                                onClick={() => setAction('INFO_REQUESTED')}
                                                icon={ChatBubbleLeftRightIcon}
                                            >
                                                Request Info
                                            </Button>
                                        </div>

                                        {action && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {action === 'APPROVED' ? 'Approval Note (Optional)' :
                                                        action === 'REJECTED' ? 'Rejection Reason' : 'Information Requested'}
                                                </label>
                                                <textarea
                                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                                                    rows={3}
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Enter details..."
                                                ></textarea>
                                                <div className="mt-2 flex justify-end">
                                                    <Button onClick={handleSubmit}>Confirm Update</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
