import { openDB, DBSchema } from 'idb';
import { LoanApplication, DraftApplication } from '../../server/src/types';

interface FarmCreditDB extends DBSchema {
  farmers: {
    key: string;
    value: {
      id: string;
      name: string;
      village: string;
      phone: string;
      landSize: number;
      createdAt: string;
      synced?: number;
    };
    indexes: { 'by-sync': number };
  };
  loans: {
    key: string;
    value: {
      id: string;
      farmerId: string;
      agentId: string;
      productType: string;
      amount: number;
      status: string;
      timeline: any[];
      updatedAt: string;
      synced?: number;
    };
    indexes: { 'by-sync': number; 'by-farmer': string };
  };
  // New Store for Drafts
  drafts: {
    key: string;
    value: DraftApplication;
    indexes: { 'by-modified': number };
  };
  // New Store for Completed Applications (Offline Queue)
  applications: {
    key: string;
    value: LoanApplication & { synced: number };
    indexes: { 'by-sync': number };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      url: string;
      method: 'POST' | 'PUT' | 'DELETE';
      body: any;
      timestamp: number;
    };
  };
}

const dbPromise = openDB<FarmCreditDB>('farm-credit-db', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion < 1) {
      const farmerStore = db.createObjectStore('farmers', { keyPath: 'id' });
      farmerStore.createIndex('by-sync', 'synced');

      const loanStore = db.createObjectStore('loans', { keyPath: 'id' });
      loanStore.createIndex('by-sync', 'synced');
      loanStore.createIndex('by-farmer', 'farmerId');

      db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
    }
    if (oldVersion < 2) {
      const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
      draftStore.createIndex('by-modified', 'lastModified');

      const appStore = db.createObjectStore('applications', { keyPath: 'id' });
      appStore.createIndex('by-sync', 'synced');
    }
  },
});

export const db = {
  getFarmers: async () => (await dbPromise).getAll('farmers'),
  addFarmer: async (farmer: any) => {
    const db = await dbPromise;
    await db.put('farmers', { ...farmer, synced: 0 });
    await db.add('syncQueue', {
      url: '/api/farmers',
      method: 'POST',
      body: farmer,
      timestamp: Date.now(),
    });
  },
  getLoans: async () => (await dbPromise).getAll('loans'),
  addLoan: async (loan: any) => {
    const db = await dbPromise;
    await db.put('loans', { ...loan, synced: 0 });
    await db.add('syncQueue', {
      url: '/api/loans',
      method: 'POST',
      body: loan,
      timestamp: Date.now(),
    });
  },
  // Drafts
  saveDraft: async (draft: DraftApplication) => {
    const db = await dbPromise;
    await db.put('drafts', draft);
  },
  getDrafts: async () => (await dbPromise).getAllFromIndex('drafts', 'by-modified'),
  getDraft: async (id: string) => (await dbPromise).get('drafts', id),
  deleteDraft: async (id: string) => (await dbPromise).delete('drafts', id),

  // Applications
  submitApplication: async (app: LoanApplication) => {
    const db = await dbPromise;
    await db.put('applications', { ...app, synced: 0 });
    await db.delete('drafts', app.id); // Remove draft on submit
    await db.add('syncQueue', {
      url: '/api/loan-applications',
      method: 'POST',
      body: app,
      timestamp: Date.now()
    });
  },
  getApplications: async () => (await dbPromise).getAll('applications'),

  getUnsyncedItems: async () => (await dbPromise).getAll('syncQueue'),
  removeSyncItem: async (id: number) => (await dbPromise).delete('syncQueue', id),
  markAsSynced: async (store: 'farmers' | 'loans' | 'applications', id: string) => {
    const db = await dbPromise;
    const item = await db.get(store as any, id);
    if (item) {
      item.synced = 1;
      await db.put(store as any, item);
    }
  }
};
