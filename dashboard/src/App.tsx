import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from './components/Button';
import { Badge } from './components/Badge';
import { Modal } from './components/Modal';
import {
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ArrowPathIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { LoanApplication } from '../../server/src/types';

const API_URL = 'http://localhost:3000';

function App() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/loan-applications`);
            setApplications(res.data);
            calculateStats(res.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const calculateStats = (data: LoanApplication[]) => {
        const approved = data.filter(l => l.status === 'APPROVED').length;
        const rejected = data.filter(l => l.status === 'REJECTED').length;
        const pending = data.filter(l => l.status === 'SUBMITTED' || l.status === 'RESUBMITTED').length;
        const infoReq = data.filter(l => l.status === 'INFO_REQUESTED').length;

        setStats([
            { name: 'Approved', count: approved, color: '#16a34a' },
            { name: 'Pending', count: pending, color: '#ea580c' },
            { name: 'Info Req', count: infoReq, color: '#eab308' },
            { name: 'Rejected', count: rejected, color: '#dc2626' },
        ]);
    };

    const handleStatusUpdate = async (id: string, status: string, message?: string) => {
        try {
            await axios.post(`${API_URL}/api/loan-applications/${id}/status`, {
                status,
                message,
                role: 'LENDER'
            });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const openDetails = (app: LoanApplication) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl">FC</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">FarmCredit</h1>
                            <p className="text-xs text-gray-500">Lender Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                            AD
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-gray-800">Application Status</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Action Required</h3>
                            <p className="text-4xl font-bold text-gray-900">
                                {applications.filter(l => l.status === 'SUBMITTED' || l.status === 'RESUBMITTED').length}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Pending Review</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Total Disbursed</h3>
                            <p className="text-4xl font-bold text-[var(--color-primary)]">
                                ₹{(applications.filter(l => l.status === 'APPROVED').reduce((acc, curr) => acc + curr.loanRequest.amount, 0) / 100000).toFixed(1)}L
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Across {applications.filter(l => l.status === 'APPROVED').length} loans</p>
                        </div>
                    </div>
                </div>

                {/* Loan List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Incoming Applications</h3>
                        <Button variant="outline" size="sm" icon={ArrowPathIcon} onClick={fetchData}>Refresh</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Farmer</th>
                                    <th className="p-4">Purpose</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-sm text-gray-500">{new Date(app.timestamp).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{app.personal.farmerName}</div>
                                            <div className="text-xs text-gray-500">{app.personal.address.village}</div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-700">{app.loanRequest.purpose}</td>
                                        <td className="p-4 font-bold text-gray-900">₹{app.loanRequest.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <Badge type={app.status} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" icon={EyeIcon} onClick={() => openDetails(app)}>
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400">No applications found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Loan Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Application Review"
                application={selectedApp}
                onUpdateStatus={handleStatusUpdate}
            />
        </div>
    );
}

export default App;
