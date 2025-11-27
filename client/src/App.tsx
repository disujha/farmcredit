import React, { useEffect, useState } from 'react';
import { db } from './db';
import { syncManager } from './sync';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Tag } from './components/Tag';
import { Navbar } from './components/Navbar';
import { Toast, ToastMessage } from './components/Toast';
import { LoanApplicationWizard } from './LoanApplicationWizard';
import {
  UserPlusIcon,
  DocumentPlusIcon,
  CloudArrowUpIcon,
  SignalIcon,
  SignalSlashIcon,
  ArrowPathIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

function App() {
  const [view, setView] = useState<'home' | 'farmers' | 'loans' | 'sync' | 'wizard'>('home');
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    loadData();
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ id: Date.now().toString(), type, message });
  };

  const loadData = async () => {
    const f = await db.getFarmers();
    const l = await db.getLoans();
    const apps = await db.getApplications();
    const d = await db.getDrafts();
    setFarmers(f);
    setLoans(l);
    setApplications(apps);
    setDrafts(d);
  };

  const handleManualSync = async () => {
    showToast('info', 'Starting sync...');
    await syncManager.sync();
    showToast('success', 'Sync complete');
  };

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            size="lg"
            icon={DocumentPlusIcon}
            onClick={() => setView('wizard')}
            className="h-24 flex-col space-y-2 col-span-2"
          >
            Start Loan Application
          </Button>
        </div>
      </section>

      {drafts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Drafts</h2>
          <div className="space-y-3">
            {drafts.map(draft => (
              <Card key={draft.id} onClick={() => setView('wizard')}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{draft.personal?.farmerName || 'Untitled Application'}</h3>
                    <p className="text-xs text-gray-500">Last edited: {new Date(draft.lastModified).toLocaleTimeString()}</p>
                  </div>
                  <PencilSquareIcon className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Applications</h2>
          <button onClick={() => setView('loans')} className="text-sm text-[var(--color-primary)] font-semibold">View All</button>
        </div>
        <div className="space-y-3">
          {applications.slice(0, 3).map(app => (
            <Card key={app.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">₹{app.loanRequest.amount.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">{app.personal.farmerName}</p>
                  <p className="text-xs text-gray-400 mt-1">{app.loanRequest.purpose}</p>
                </div>
                <Tag
                  type={app.synced ? 'success' : 'warning'}
                  label={app.synced ? 'Synced' : 'Pending'}
                />
              </div>
            </Card>
          ))}
          {applications.length === 0 && <p className="text-gray-400 text-center py-4">No recent applications</p>}
        </div>
      </section>
    </div>
  );

  const renderFarmers = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Registered Farmers</h2>
      {farmers.map(f => (
        <Card key={f.id}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{f.name}</h3>
              <p className="text-sm text-gray-600">{f.village} • {f.landSize} Acres</p>
            </div>
            <Tag
              type={f.synced ? 'success' : 'warning'}
              label={f.synced ? 'Synced' : 'Pending'}
            />
          </div>
        </Card>
      ))}
      {farmers.length === 0 && <div className="text-center text-gray-500 mt-10">No farmers found.</div>}
    </div>
  );

  const renderLoans = () => {
    const actionRequired = applications.filter(a =>
      a.status === 'INFO_REQUESTED' ||
      (a.status === 'APPROVED' && a.messages?.length > 0) ||
      (a.status === 'REJECTED' && a.messages?.length > 0)
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Loan Applications</h2>
          {actionRequired.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {actionRequired.length} New
            </span>
          )}
        </div>
        {applications.map(app => {
          const hasNewMessages = app.messages && app.messages.length > 0;
          const isClickable = app.status === 'INFO_REQUESTED' || app.status === 'DRAFT' || hasNewMessages;

          return (
            <Card
              key={app.id}
              onClick={() => {
                if (isClickable) {
                  setSelectedApp(app);
                  setView('wizard');
                }
              }}
              className={isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{app.loanRequest.purpose}</h3>
                    {hasNewMessages && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{app.personal.farmerName}</p>
                  {hasNewMessages && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💬 {app.messages.length} message{app.messages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <Tag
                  type={
                    app.status === 'APPROVED' ? 'success' :
                      app.status === 'REJECTED' ? 'error' :
                        app.status === 'INFO_REQUESTED' ? 'error' :
                          'warning'
                  }
                  label={app.status === 'INFO_REQUESTED' ? 'Action Required' : app.status}
                />
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 pt-2 mt-2">
                <span className="text-lg font-bold text-[var(--color-primary)]">₹{app.loanRequest.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-400">{new Date(app.timestamp).toLocaleDateString()}</span>
              </div>
            </Card>
          );
        })}
        {applications.length === 0 && <div className="text-center text-gray-500 mt-10">No applications found.</div>}
      </div>
    );
  };

  const renderSync = () => (
    <div className="space-y-6 text-center pt-10">
      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isOnline ? <SignalIcon className="w-10 h-10" /> : <SignalSlashIcon className="w-10 h-10" />}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">{isOnline ? 'You are Online' : 'You are Offline'}</h2>
        <p className="text-gray-500 mt-2">
          {isOnline ? 'Data is syncing automatically.' : 'Changes are saved locally and will sync when connection is restored.'}
        </p>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        <h3 className="font-bold text-gray-700 mb-2">Sync Status</h3>
        <div className="flex justify-between py-2 border-b border-gray-50">
          <span className="text-gray-600">Pending Applications</span>
          <span className="font-bold">{applications.filter(a => !a.synced).length}</span>
        </div>
      </div>

      <Button onClick={handleManualSync} disabled={!isOnline} icon={ArrowPathIcon} className="w-full">
        Sync Now
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold">FC</div>
          <h1 className="text-lg font-bold text-gray-900">FarmCredit</h1>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-gray-800 text-white text-xs py-1 px-4 text-center">
          Working Offline. Changes will sync later.
        </div>
      )}

      {/* Main Content */}
      <main className="p-4">
        {view === 'home' && renderHome()}
        {view === 'farmers' && renderFarmers()}
        {view === 'loans' && renderLoans()}
        {view === 'sync' && renderSync()}

        {view === 'wizard' && (
          <LoanApplicationWizard
            initialData={selectedApp}
            onComplete={() => {
              setView('home');
              setSelectedApp(undefined);
              showToast('success', 'Application Submitted!');
              loadData();
              syncManager.sync();
            }}
            onCancel={() => {
              setView('home');
              setSelectedApp(undefined);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {['home', 'farmers', 'loans', 'sync'].includes(view) && (
        <Navbar
          currentView={view as any}
          setView={setView}
          notificationCount={applications.filter(a =>
            a.status === 'INFO_REQUESTED' ||
            (a.status === 'APPROVED' && a.messages?.length > 0) ||
            (a.status === 'REJECTED' && a.messages?.length > 0)
          ).length}
        />
      )}
    </div>
  );
}

export default App;
