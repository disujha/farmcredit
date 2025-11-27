import express from 'express';
import cors from 'cors';
import { initDB } from './db';
import db from './db';
import { Farmer, LoanRequest } from './types';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <html>
      <head><title>FarmCredit Server</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>FarmCredit Connect Orchestration Layer</h1>
        <p>Status: <strong>Running</strong></p>
        <p>This is the API Server. Please access the applications at:</p>
        <ul>
          <li>Client PWA: <a href="http://localhost:5173">http://localhost:5173</a></li>
          <li>Dashboard: <a href="http://localhost:5174">http://localhost:5174</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Silence favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());
initDB();

// --- API ENDPOINTS ---

// 1. Sync / Farmers (Create/Get)
app.get('/api/farmers', (req, res) => {
    const farmers = db.prepare('SELECT * FROM farmers').all();
    res.json(farmers);
});

app.post('/api/farmers', (req, res) => {
    const farmer = req.body as Farmer;
    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO farmers (id, name, village, phone, landSize, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(farmer.id, farmer.name, farmer.village, farmer.phone, farmer.landSize, farmer.createdAt);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Loans (Create/Get/Update)
app.get('/api/loans', (req, res) => {
    const loans = db.prepare('SELECT * FROM loans').all();
    const parsedLoans = loans.map((l: any) => ({
        ...l,
        timeline: JSON.parse(l.timeline)
    }));
    res.json(parsedLoans);
});

app.post('/api/loans', (req, res) => {
    const loan = req.body as LoanRequest;
    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO loans (id, farmerId, agentId, productType, amount, status, timeline, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run(loan.id, loan.farmerId, loan.agentId, loan.productType, loan.amount, loan.status, JSON.stringify(loan.timeline), loan.updatedAt);

        // Mock Webhook Trigger
        if (loan.status === 'PENDING') {
            console.log(`[Webhook] New Loan Request ${loan.id} received from Agent ${loan.agentId}`);
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Lender Action (Approve/Reject)
app.post('/api/loans/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, note, userId } = req.body; // userId is the lender/admin

    try {
        const loan: any = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const timeline = JSON.parse(loan.timeline);
        timeline.push({
            date: new Date().toISOString(),
            status: status,
            note: note || `Status updated to ${status} by ${userId}`
        });

        const stmt = db.prepare('UPDATE loans SET status = ?, timeline = ?, updatedAt = ? WHERE id = ?');
        stmt.run(status, JSON.stringify(timeline), new Date().toISOString(), id);

        console.log(`[Notification] SMS sent to Farmer: Your loan is ${status}`);

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Govt Scheme Mock
app.post('/api/schemes/check', (req, res) => {
    const { landSize, crop } = req.body;
    const schemes = [];

    if (landSize < 2) {
        schemes.push({ name: 'PM-KISAN', benefit: '₹6000/year' });
    }
    if (crop === 'Wheat' || crop === 'Rice') {
        schemes.push({ name: 'Crop Insurance Subsidy', benefit: '50% premium off' });
    }

    res.json({ eligibleSchemes: schemes });
});

// 5. Loan Applications (Comprehensive Flow)
app.get('/api/loan-applications', (req, res) => {
    const apps = db.prepare('SELECT * FROM applications').all();
    const parsedApps = apps.map((a: any) => {
        const data = JSON.parse(a.data);
        return { ...data, status: a.status }; // Merge status from DB
    });
    res.json(parsedApps);
});

app.post('/api/loan-applications', (req, res) => {
    const appData = req.body as any; // LoanApplication
    try {
        // Check if exists to preserve messages if not provided in payload (though usually client sends full state)
        const existing: any = db.prepare('SELECT * FROM applications WHERE id = ?').get(appData.id);

        let status = appData.status;
        // If it was INFO_REQUESTED and now being posted again by agent, it's RESUBMITTED
        if (existing && existing.status === 'INFO_REQUESTED') {
            status = 'RESUBMITTED';
        } else if (!existing) {
            status = 'SUBMITTED';
        }

        const stmt = db.prepare('INSERT OR REPLACE INTO applications (id, agentId, submissionId, timestamp, status, data) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(
            appData.id,
            appData.agentId,
            appData.submissionId,
            appData.timestamp,
            status,
            JSON.stringify({ ...appData, status }) // Ensure status in JSON matches DB column
        );
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Loan Application Status/Message Update (Lender Action)
app.post('/api/loan-applications/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, message, role } = req.body; // role: 'LENDER' | 'AGENT'

    try {
        const app: any = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
        if (!app) return res.status(404).json({ error: 'Application not found' });

        const data = JSON.parse(app.data);

        // Update Status
        if (status) {
            data.status = status;
        }

        // Add Message
        if (message) {
            if (!data.messages) data.messages = [];
            data.messages.push({
                id: uuidv4(),
                sender: role === 'LENDER' ? 'Lender Admin' : 'Field Agent',
                role: role,
                text: message,
                timestamp: new Date().toISOString()
            });
        }

        const stmt = db.prepare('UPDATE applications SET status = ?, data = ? WHERE id = ?');
        stmt.run(data.status, JSON.stringify(data), id);

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
