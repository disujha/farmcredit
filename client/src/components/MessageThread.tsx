import React from 'react';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Message {
    id: string;
    sender: string;
    role: 'LENDER' | 'AGENT';
    text: string;
    timestamp: string;
}

interface MessageThreadProps {
    messages: Message[];
    status?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages, status }) => {
    if (!messages || messages.length === 0) return null;

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span>Communication Thread</span>
            </div>

            <div className="space-y-2">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${msg.role === 'LENDER'
                                ? 'bg-yellow-50 border border-yellow-200'
                                : 'bg-blue-50 border border-blue-200'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-bold uppercase ${msg.role === 'LENDER' ? 'text-yellow-800' : 'text-blue-800'
                                }`}>
                                {msg.role === 'LENDER' ? '🏦 Lender' : '👤 Agent'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-800">{msg.text}</p>
                    </div>
                ))}
            </div>

            {/* Status indicator at the bottom */}
            {status && (
                <div className={`flex items-center space-x-2 text-xs font-medium p-2 rounded ${status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                        status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                            status === 'INFO_REQUESTED' ? 'bg-yellow-50 text-yellow-700' :
                                'bg-gray-50 text-gray-700'
                    }`}>
                    {status === 'APPROVED' && <CheckCircleIcon className="w-4 h-4" />}
                    {status === 'REJECTED' && <XCircleIcon className="w-4 h-4" />}
                    <span>Current Status: {status.replace('_', ' ')}</span>
                </div>
            )}
        </div>
    );
};
