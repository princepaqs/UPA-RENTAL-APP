import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getTransactionData, TransactionData } from '../secureStorage'; // Import secure storage functions
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system'; // Import FileSystem for reading/writing files
import TopUp from './topUp';
import { ref } from 'firebase/storage';

const walletDataPath = FileSystem.documentDirectory + './walletData.json'; // Path to walletData.json file

export default function ReceiptTransaction() {
    const router = useRouter();
    const [transactionData, setTransactionData] = useState<TransactionData | null>(null); // State to hold transaction data
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0); // State to hold wallet balance

    useEffect(() => {
        const loadTransactionData = async () => {
            const data = await getTransactionData();
            setTransactionData(data); // Set the transaction data

            // Load the wallet balance from the file
            await loadWalletData();
        };
        loadTransactionData();
    }, []);

    // Function to load wallet data from file
    const loadWalletData = async () => {
        try {
            // Check if the walletData.json file exists
            const fileExists = await FileSystem.getInfoAsync(walletDataPath);

            if (fileExists.exists) {
                // Read the wallet data
                const walletDataJson = await FileSystem.readAsStringAsync(walletDataPath);
                const walletData = JSON.parse(walletDataJson);

                // Set the wallet balance from the file
                setWalletBalance(walletData.balance);
            } else {
                // If the file doesn't exist, create it with an initial balance
                const initialData = { balance: 0 };
                await FileSystem.writeAsStringAsync(walletDataPath, JSON.stringify(initialData));
                setWalletBalance(0);
            }
        } catch (error) {
            console.error('Error loading wallet data:', error);
        }
    };

    const handleContinue = async () => {
        setLoading(true);

        try {
            // Calculate the new balance
            const newBalance = walletBalance + (transactionData?.total ?? 0);

            // Update walletData with the new balance
            const updatedWalletData = { balance: newBalance };

            // Write the updated walletData back to the file
            await FileSystem.writeAsStringAsync(walletDataPath, JSON.stringify(updatedWalletData));

            // Simulate a loading period (1 second)
            setTimeout(() => {
                setLoading(false);
                router.back();
            }, 1000);
        } catch (error) {
            console.error('Error updating wallet data:', error);
            setLoading(false);
        }
    };

    // if (!transactionData) {
    //     return <Text>Loading...</Text>; // Handle loading state
    // }

    const { transactionID, name, email, dateTime, amount, total } = transactionData ?? {}; // Default to empty object if null

// Ensure amounts are valid numbers
const formattedAmount = (amount ?? 0).toFixed(2); // Ensure toFixed is called on numbers
const formattedTotal = (total ?? 0).toFixed(2); // Ensure toFixed is called on numbers

const totalbalance = (total ?? 0) + walletBalance;

const generateTransactionID = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
    return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
};

    return (
        <View className="bg-[#B33939] flex-1">
            <View className="bg-gray-100 h-screen mt-10 rounded-t-2xl flex-1">
                <View className='px-6 items-center justify-center'>
                    {/* Header */}
                    <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
                        {/* <TouchableOpacity onPress={() => router.back()}>
                            <View className="flex flex-row items-center">
                                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                            </View>
                        </TouchableOpacity> */}
                        
                    </View>

                    <View className='items-center space-y-2'>
                        <Image className="w-28 h-28" source={require('../../../../../assets/images/upalogo.png')} />
                            <Text className="text-lg font-bold text-center text-[#6C6C6C] ">Transaction Receipt</Text>
                    </View>

                    {/* Details Transaction Receipt */}
                        <View className='w-full flex-col space-y-4 rounded-xl my-4'>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Reference No</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Transaction ID</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Date Time</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{generateTransactionID()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transactionID}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{dateTime}</Text>
                                </View>
                            </View>

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{name}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{email}</Text>
                                </View>
                            </View> 

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>PaymentPurpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount: ₱ </Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>Top-up wallet</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(formattedAmount).toLocaleString()}</Text>
                                </View>
                            </View> 
                            
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(formattedTotal).toLocaleString()}</Text>
                                </View>
                            </View> 
                        
                        </View>

                    <View className='w-full items-center mt-10'>
                        <View className='px-5 mb-10'>
                            <Text className='text-xs text-center text-[#6C6C6C]'>Your account has been successfully topped up. Thank you for choosing us!</Text>
                        </View>
                        <TouchableOpacity className='mb-4'>
                            <Text className='text-xs text-[#EF5A6F]'>Download Receipt</Text>
                        </TouchableOpacity>
                    {loading ? ( // Show loading indicator when loading is true
                            <ActivityIndicator size="large" color="#D9534F" />
                        ) : (
                            <TouchableOpacity className='w-2/3 items-center justify-center rounded-2xl bg-[#D9534F]' onPress={handleContinue}>
                                <Text className='text-xs text-center py-3 font-bold text-white'>Done</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </View>
        </View>
    );
}
