import React from 'react';
import { HomeIcon, UsersIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
    currentView: 'home' | 'farmers' | 'loans' | 'sync';
    setView: (view: any) => void;
    notificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, notificationCount = 0 }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: HomeIcon },
        { id: 'farmers', label: 'Farmers', icon: UsersIcon },
        { id: 'loans', label: 'Loans', icon: DocumentTextIcon, badge: notificationCount },
        { id: 'sync', label: 'Sync', icon: ArrowPathIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
