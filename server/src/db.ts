import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

export function initDB() {
  // Farmers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      village TEXT NOT NULL,
      phone TEXT NOT NULL,
      landSize REAL NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Loans Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      farmerId TEXT NOT NULL,
      agentId TEXT NOT NULL,
      productType TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED'
      timeline TEXT NOT NULL, -- JSON string
      synced INTEGER DEFAULT 1,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(farmerId) REFERENCES farmers(id)
    )
  `);

  // Users (Agents/Admins) - Simplified for Hackathon
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      role TEXT NOT NULL -- 'AGENT', 'ADMIN', 'LENDER'
    )
  `);

  // Loan Applications (Comprehensive)
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      agentId TEXT NOT NULL,
      submissionId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL -- Full JSON payload
    )
  `);

  console.log('Database initialized');

  // Seed Data
  const count = db.prepare('SELECT count(*) as count FROM farmers').get() as any;
  if (count.count === 0) {
    console.log('Seeding database...');
    const insertFarmer = db.prepare('INSERT INTO farmers (id, name, village, phone, landSize, createdAt) VALUES (?, ?, ?, ?, ?, ?)');

    // Hardcoded seed data for simplicity in this file, or read from JSON if fs is available
    const seedFarmers = [
      { id: "farmer-001", name: "Ramesh Kumar", village: "Rampur", phone: "9876543210", landSize: 2.5, createdAt: new Date().toISOString() },
      { id: "farmer-002", name: "Sita Devi", village: "Lakhanpur", phone: "9876543211", landSize: 1.2, createdAt: new Date().toISOString() },
      { id: "farmer-003", name: "Abdul Khan", village: "Sonpur", phone: "9876543212", landSize: 5.0, createdAt: new Date().toISOString() }
    ];

    const insertTransaction = db.transaction((farmers: any[]) => {
      for (const farmer of farmers) insertFarmer.run(farmer.id, farmer.name, farmer.village, farmer.phone, farmer.landSize, farmer.createdAt);
    });

    insertTransaction(seedFarmers);
    console.log('Seeding complete.');
  }
}

export default db;
