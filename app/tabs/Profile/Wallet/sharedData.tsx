// sharedData.ts
let amount: number | null = null;

export const setAmount = (value: number) => {
    amount = value;
};

export const getAmount = () => {
    return amount;
};


// sharedData.js

export interface TransactionData {
    transactionID: string | null;
    dateTime: string | null;
    amount: number | null; // Assuming amount can be null initially
    total: number | null; // Same for total
}

let transactionData: TransactionData = {
    transactionID: null,
    dateTime: null,
    amount: null,
    total: null,
};

export const setTransactionData = (data: TransactionData) => {
    transactionData = { ...transactionData, ...data };
};

export const getTransactionData = (): TransactionData => transactionData;
