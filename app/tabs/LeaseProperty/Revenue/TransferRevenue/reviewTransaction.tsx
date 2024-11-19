import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAmount } from '../sharedData'; // Adjust the path accordingly

import { useAuth } from '@/context/authContext';

const fees = 15.00; // Set your fees

export default function ReviewTransaction() {
    const router = useRouter();
    const amount = getAmount(); // Get the amount from the shared data
    const { topUpWallet, addWalletTransaction } = useAuth();
    const [loading, setLoading] = useState(false);
    const type = 'Transfer'
    // Check if amount is null and handle accordingly
    if (amount === null) {
        return (
            <View>
                <Text>Error: Amount is not available</Text>
            </View>
        );
    }

    // Generate unique Transaction ID
    const generateTransactionID = () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
        const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
    };

    // Get current date and time
    const getCurrentDateTime = () => {
        return new Date().toLocaleString(); // Formats the date and time based on the user's locale
    };

    // Calculate total after fees
    const total = amount + fees;
    const transactionData = {
        transactionID: generateTransactionID(),
        dateTime: getCurrentDateTime(),
        type,
        amount,
        total : total,
    };

    const handleContinue = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(() => {
            setLoading(false); // Reset loading state after saving data
            router.replace('./receiptTransaction'); // Navigate to the receipt transaction screen
        }, 1000);
    };

   
    return (
        <View className="bg-[#B33939] flex-1">
            <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
                <View className='px-6'>
                    {/* Header */}
                    <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="flex flex-row items-center">
                                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                            </View>
                        </TouchableOpacity>
                        <View className="flex-1 items-center justify-center pr-5">
                            <Text className="text-sm font-bold text-center">Review Transaction</Text>
                        </View>
                    </View>

                    {/* Transfer details */}
                    <View className='px-6 pt-10 mb-6'>
                        <Text className='text-sm font-bold px-4'>Transfer Details</Text>
                        <View className='bg-white flex flex-col space-y-2 p-5 rounded-xl my-2'>
                            <Text className='text-sm text-gray-500'>Transaction ID: {transactionData.transactionID}</Text>
                            <Text className='text-sm text-gray-500'>Date Time: {transactionData.dateTime}</Text>
                            <Text className='text-sm text-gray-500'>Transfer Amount: ₱ {parseInt(amount.toLocaleString())}</Text>
                            <Text className='text-sm text-gray-500'>Fees: ₱ {fees}</Text>
                            <Text className='text-sm text-gray-500 font-bold'>TOTAL: ₱ {parseInt(total.toLocaleString())}</Text>
                        </View>
                    </View>

                    <View className='flex flex-col space-y-2 pt-20 mt-20 px-6'>
                        <Text className='px-4 text-xs text-gray-500'>By clicking confirm, I confirm that above details are correct.</Text>
                        
                        {loading ? ( // Show loading indicator when loading is true
                            <ActivityIndicator size="large" color="#D9534F" />
                        ) : (
                            <TouchableOpacity className='w-full items-center rounded-2xl bg-[#D9534F]' onPress={handleContinue}>
                                <Text className='text-xs text-center py-3 font-bold text-white'>Continue</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
