# FarmCredit Connect

**Hackathon Track 3: Ecosystem Orchestration Platform**

FarmCredit Connect is an offline-first orchestration platform that connects Field Agents, Farmers, and Lenders. It is designed to work in low-connectivity environments and sync data seamlessly when internet becomes available.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    # This installs dependencies for root, client, server, and dashboard
    ```

2.  **Start All Services**
    Open 3 terminal tabs:

    *   **Server (Port 3000)**
        ```bash
        npm run dev:server
        ```
    *   **Client PWA (Port 5173)**
        ```bash
        npm run dev:client
        ```
    *   **Lender Dashboard (Port 5174)**
        ```bash
        npm run dev:dashboard
        ```

## 🏗 Architecture

*   **Client (PWA)**: React + Vite + IndexedDB. Handles offline data entry and syncs with server.
*   **Server**: Node.js + Express + SQLite. Acts as the orchestration layer, managing data sync and mock integrations.
*   **Dashboard**: React + Vite. Provides a view for Lenders to approve/reject loans.

## 📱 Demo Flow

1.  **Offline Mode**: Turn off internet (or simulate offline in DevTools).
2.  **Agent Action**: Create a new Farmer and submit a Loan Request in the Client App.
3.  **Sync**: Turn internet back on. Watch the data sync to the Server.
4.  **Lender Action**: Open Dashboard. See the new loan. Approve it.
5.  **Feedback**: Check Client App. The loan status updates to "APPROVED".

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, TailwindCSS, IDB (IndexedDB)
*   **Backend**: Node.js, Express, Better-SQLite3
*   **Tools**: Vite, Recharts, Axios
