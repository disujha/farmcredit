// Simple mock encryption for demo purposes
// In production, use crypto-subtle or a library like sodium-plus

export const security = {
    encrypt: (text: string): string => {
        if (!text) return '';
        // Mock: Base64 encode with a salt prefix
        return `ENC_${btoa(text)}`;
    },

    decrypt: (encryptedText: string): string => {
        if (!encryptedText || !encryptedText.startsWith('ENC_')) return encryptedText;
        try {
            return atob(encryptedText.replace('ENC_', ''));
        } catch (e) {
            return encryptedText;
        }
    },

    mask: (text: string, visibleChars = 4): string => {
        if (!text) return '';
        const len = text.length;
        if (len <= visibleChars) return text;
        return '*'.repeat(len - visibleChars) + text.slice(-visibleChars);
    }
};
