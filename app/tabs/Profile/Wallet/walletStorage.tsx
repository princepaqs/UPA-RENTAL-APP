import * as FileSystem from 'expo-file-system';

// Path to the wallet data file
const walletDataPath = FileSystem.documentDirectory + 'walletData.json';

// Define the WalletData interface
interface WalletData {
    uid: number;
    balance: number;
    transactions: {
        id: number;
        type: string;
        amount: number;
        date: string;
    }[];
}

// Function to read wallet data
export const readWalletData = async (): Promise<WalletData> => {
    try {
        const jsonData = await FileSystem.readAsStringAsync(walletDataPath);
        return JSON.parse(jsonData); // Parse and return as object
    } catch (error) {
        console.error('Error reading wallet data:', error);
        throw error;
    }
};

// Function to save wallet data
export const saveWalletData = async (updatedWalletData: WalletData) => {
    try {
        await FileSystem.writeAsStringAsync(walletDataPath, JSON.stringify(updatedWalletData)); // Write object as string
    } catch (error) {
        console.error('Error saving wallet data:', error);
        throw error;
    }
};
