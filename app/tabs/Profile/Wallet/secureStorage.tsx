// secureStorage.ts

import * as SecureStore from 'expo-secure-store';

export interface TransactionData {
  transactionID: string;
  uid: string;
  name: string;
  email: string;
  type: string;
  dateTime: string;
  amount: number; // Ensure amount is a number
  total: number;  // Ensure total is a number
}

export const saveTransactionData = async (data: TransactionData) => {
  try {
    await SecureStore.setItemAsync('transactionData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving transaction data:', error);
  }
};

export const getTransactionData = async (): Promise<TransactionData | null> => {
  try {
    const data = await SecureStore.getItemAsync('transactionData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving transaction data:', error);
    return null;
  }
};
