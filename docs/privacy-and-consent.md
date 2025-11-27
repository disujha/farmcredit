# Privacy and Consent Framework

## Data Collection Policy
FarmCredit Connect collects the following data strictly for the purpose of credit assessment and scheme eligibility:
1.  **Personal Identity**: Name, Phone Number, Village.
2.  **Asset Details**: Land Size, Crop Patterns.
3.  **Financial Data**: Loan Amount, Product Type.

## Consent Mechanism
*   **Explicit Consent**: Agents must obtain verbal or written consent from farmers before onboarding.
*   **Digital Record**: A "Consent Obtained" checkbox is required to proceed with data entry in the Client App.
*   **Data Minimization**: Only data required for the specific loan product is collected.

## Data Security
*   **Local Encryption**: Data stored in IndexedDB is accessible only to the application origin.
*   **Transit Security**: All sync operations occur over HTTPS (simulated in dev).
*   **Access Control**: 
    *   Agents can only view farmers they onboarded.
    *   Lenders can only view anonymized aggregates until a specific loan application is opened.

## User Rights
Farmers have the right to:
1.  Request a copy of their stored data.
2.  Request deletion of their profile (Right to be Forgotten).
3.  Correct any inaccuracies in their land or personal records.
