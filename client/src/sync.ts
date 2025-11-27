import axios from 'axios';
import { db } from './db';

const API_URL = 'http://localhost:3000'; // In prod, this would be env var

export const syncManager = {
  sync: async () => {
    if (!navigator.onLine) {
      console.log('Offline: Skipping sync');
      return;
    }

    console.log('Starting Sync...');
    const queue = await db.getUnsyncedItems();

    for (const item of queue) {
      try {
        await axios({
          method: item.method,
          url: `${API_URL}${item.url}`,
          data: item.body,
        });

        // If successful, remove from queue and mark local item as synced
        if (item.id) await db.removeSyncItem(item.id);

        // Update local "synced" flag if applicable
        if (item.url.includes('farmers')) {
          await db.markAsSynced('farmers', item.body.id);
        } else if (item.url.includes('loans')) {
          await db.markAsSynced('loans', item.body.id);
        } else if (item.url.includes('loan-applications')) {
          await db.markAsSynced('applications', item.body.id);
        }

        console.log(`Synced item: ${item.url}`);
      } catch (error) {
        console.error('Sync failed for item', item, error);
        // Keep in queue to retry later
      }
    }
    console.log('Sync Complete');
  }
};

// Auto-sync every 30 seconds
setInterval(() => {
  syncManager.sync();
}, 30000);

// Listen for online event
window.addEventListener('online', () => {
  console.log('Back Online! Triggering sync...');
  syncManager.sync();
});
