# Security Architecture

## Authentication
*   **Agent Login**: OTP-based authentication (Mocked for Hackathon).
    *   Input: Phone Number
    *   Verify: 4-digit OTP (Default: 1234)
*   **Session Management**: JWT (JSON Web Tokens) used for API requests.

## Authorization (RBAC)
*   **Role: Agent**
    *   `CREATE` Farmers
    *   `CREATE` Loan Requests
    *   `READ` Own Submissions
*   **Role: Lender/Admin**
    *   `READ` All Loan Requests
    *   `UPDATE` Loan Status (Approve/Reject)
    *   `NO ACCESS` to modify Farmer personal details.

## Offline Security
*   **Risk**: Device theft could expose cached data.
*   **Mitigation**: 
    *   App requires PIN/Biometric to open (Proposed).
    *   Auto-logout after 15 minutes of inactivity.
    *   Sensitive fields (like Aadhar Number) are masked in the UI.

## API Security
*   **Rate Limiting**: APIs are rate-limited to prevent DDoS.
*   **Input Validation**: All incoming JSON bodies are validated against strict schemas (Zod/TypeScript interfaces).
*   **CORS**: Restricted to allowed Client and Dashboard origins.
