export interface Farmer {
    id: string;
    name: string;
    village: string;
    phone: string;
    landSize: number;
    createdAt: string;
}

export interface LoanRequest {
    id: string;
    farmerId: string;
    agentId: string;
    productType: string;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timeline: LoanEvent[];
    updatedAt: string;
}

export interface LoanEvent {
    date: string;
    status: string;
    note?: string;
}

export interface User {
    id: string;
    username: string;
    role: 'AGENT' | 'ADMIN' | 'LENDER';
}

// --- New Comprehensive Schema ---

export interface LoanApplication {
    id: string;
    agentId: string;
    submissionId: string;
    timestamp: string;
    status: 'DRAFT' | 'SUBMITTED' | 'SYNCED' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED' | 'RESUBMITTED';
    messages: Array<{
        id: string;
        sender: string;
        role: 'LENDER' | 'AGENT';
        text: string;
        timestamp: string;
    }>;

    // Step 1: Personal Details
    personal: {
        farmerName: string;
        fatherOrHusbandName: string;
        dob: string;
        gender: 'Male' | 'Female' | 'Other';
        aadhaarOrID: string; // Encrypted
        phone: string; // Encrypted
        altPhone?: string;
        address: {
            village: string;
            tehsil: string;
            district: string;
            pin: string;
        };
    };

    // Step 2: Land & Crops
    land: {
        size: number;
        unit: 'Acres' | 'Hectares';
        ownershipType: 'Owned' | 'Leased';
        geoCoords?: { lat: number; lng: number };
        landRecordFile?: string; // Base64 or Path
    };
    crops: Array<{
        name: string;
        season: 'Rabi' | 'Kharif' | 'Zaid';
        lastYield?: string;
    }>;

    // Step 3: Financials
    financials: {
        last2SeasonsIncomeEstimate: number;
        otherIncomeSources?: string;
        previousLoans: Array<{
            lender: string;
            amount: number;
            status: 'Active' | 'Closed';
            outstanding?: number;
        }>;
    };

    // Step 4: Loan Request & Consent
    loanRequest: {
        amount: number;
        purpose: string;
        tenure: number; // Months
        repaymentSource: string;
    };
    collateral: {
        type: string;
        description: string;
        guarantor?: {
            name: string;
            phone: string;
        };
    };
    consent: {
        signedBy: string;
        signatureImage: string; // Base64
        timestamp: string;
        gpsStamp?: { lat: number; lng: number };
    };
}

export interface DraftApplication extends Partial<LoanApplication> {
    id: string;
    lastModified: number;
    step: number; // 1-4
}
