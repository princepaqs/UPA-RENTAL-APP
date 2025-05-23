import { View, Text, TouchableOpacity, ActivityIndicator, Image, ImageBackground, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json';
import { captureScreen } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { getTransactionData, TransactionData } from '../secureStorage'; // Import secure storage functions
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';
const walletDataPath = FileSystem.documentDirectory + './walletData.json'; // Path to walletData.json file

export default function withdrawReceipt() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [transactionData, setTransactionData] = useState<TransactionData | null>(null); // State to hold transaction data
    const [walletBalance, setWalletBalance] = useState<number>(0);

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
                //console.log(walletData);
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

    const { transactionID, name, email, dateTime, type, bankName, accountHolderName, accountNumber, emailAddress, amount, total, uid } = transactionData ?? {}; // Default to empty object if null

    // Ensure amounts are valid numbers
    const formattedAmount = (amount ?? 0).toFixed(2); // Ensure toFixed is called on numbers
    const formattedTotal = (total ?? 0).toFixed(2); // Ensure toFixed is called on numbers
 
    const generateTransactionID = () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
        const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
    };

    const receiptData = {
        referenceNo: generateTransactionID(),
        transactionId: transactionID,
        uid,
        name: name,
        email: email,
        dateTime: dateTime,
        type,
        bankName,
        accountHolderName,
        accountNumber,
        emailAddress,
        amount: formattedAmount,
        total: formattedTotal,
        createdAt: new Date(),
        _type: 'Topup',
    }

    const handleConfirm = async () => {
        setLoading(true); // Set loading to true when starting the process
        try {
            // Calculate the new balance
            const newBalance = walletBalance - (transactionData?.total ?? 0);

            // Update walletData with the new balance
            const updatedWalletData = { balance: newBalance };

            // Write the updated walletData back to the file
            await FileSystem.writeAsStringAsync(walletDataPath, JSON.stringify(updatedWalletData));
            if(receiptData.uid && receiptData.transactionId){
                console.log('Withdraw receipt created.')
                await setDoc(doc(db, 'receipts', receiptData.uid, 'receiptId', receiptData.transactionId), receiptData)
            }

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

    const hanndleDownload = async () => {
        try {
            setLoading(true);
  
            // Capture the screen as an image
            const screenshotUri = await captureScreen({
                format: 'jpg',
                quality: 0.8,
            });
  
            // Request permission to access media library
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                // Save the screenshot to the photo album
                const asset = await MediaLibrary.createAssetAsync(screenshotUri);
                await MediaLibrary.createAlbumAsync('ScreenShots', asset, false); // Creates a 'ScreenShots' album if it doesn't exist
  
                // Optionally, show a success message
                alert('Receipt downloaded successfully!');
            } else {
                alert('Permission to access media library is required to save the screenshot.');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt.');
        } finally {
            setLoading(false);
        }
    };


  return (
    <View className="bg-[#B33939] flex-1">
        <View className="bg-gray-100 h-screen mt-10 rounded-t-2xl flex-1">
                <ImageBackground
                source={require('../../../../../assets/images/receipt_bg.png')}
                className='flex-1 w-full h-full'
                resizeMode="stretch"
                >
                    <View className='px-6 items-center justify-center'>
                        {/* Header */}
                        <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">

                        </View>

                        <View className='items-center space-y-2 pt-20'>
                            <Text className="text-lg font-bold text-center text-[#6C6C6C]">Transaction Receipt</Text>
                        </View>
{/* Details Transaction Receipt */}
<View className='w-full flex-col space-y-4 rounded-xl my-4'>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Reference No</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Transaction ID</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Date Time</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.referenceNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.transactionId}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.dateTime}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.name}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.email}</Text>

                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Purpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Bank Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Account Number</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Account Holder Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Fee</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>Withdraw</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.bankName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.accountNumber}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData.accountHolderName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(receiptData.amount).toLocaleString()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ 50</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(receiptData.total).toLocaleString()}</Text>
                                </View>
                            </View> 
                        </View>

                        <View className='w-full items-center mt-5'>
                            <View className='px-5 mb-5'>
                                <Text className='text-xs text-center text-[#6C6C6C]'>Your withdrawal has been successfully processed. Thank you for choosing us!</Text>
                            </View>
                            <Pressable className='mb-4'
                            onPress={hanndleDownload}>
                                <Text className='text-xs text-[#EF5A6F]'>Download Receipt</Text>
                            </Pressable>
                            {loading ? ( // Show loading indicator when loading is true
                                <ActivityIndicator size="large" color="#D9534F" />
                            ) : (
                                <View className='px-6 w-full'>
                                    <TouchableOpacity
                                        onPress={handleConfirm}
                                        className="w-full py-3 bg-[#333333] rounded-xl items-center space-x-2"
                                    >
                                        <Text className="font-bold text-white">Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

        </View>
        </ImageBackground>
        </View>
    </View>
  )
}