import CryptoJS from 'crypto-js';

const SECRET_KEY = 'heltech-secret-key-change-this-in-prod';

const secureStorage = {
    setItem: (key, value) => {
        try {
            const encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
            localStorage.setItem(key, encryptedValue);
        } catch (error) {
            console.error('Error encrypting data', error);
        }
    },

    getItem: (key) => {
        try {
            const encryptedValue = localStorage.getItem(key);
            if (!encryptedValue) return null;

            const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
            const decryptedValue = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedValue;
        } catch (error) {
            console.error('Error decrypting data', error);
            return null;
        }
    },

    removeItem: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

export default secureStorage;
