import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { captureScreen } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';
import { db } from '@/_dbconfig/dbconfig';

export default function TransferReceipt() {
    const router = useRouter();
    const { addWalletTransaction, sendNotification } = useAuth();
    const [loading, setLoading] = useState(false);
    const [transferData, setTransferData] = useState<any>(null);

    // Fetch the transfer data from SecureStore
    useEffect(() => {
        const fetchTransferData = async () => {
            try {
                const data = await SecureStore.getItemAsync('transferData');
                if (data) {
                    setTransferData(JSON.parse(data)); // Parse JSON string to object
                    console.log(transferData?.senderId, transferData?.receiptId);
                } else {
                    console.warn('No transfer data found in SecureStore.');
                }
            } catch (error) {
                console.error('Error fetching transfer data:', error);
            }
        };
        fetchTransferData();
    }, []);

    const handleConfirm = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(async () => {
            setLoading(false); // Reset loading state after saving data
            handleTransfer(transferData?.senderId, transferData?.receiptId);
            router.replace('../wallet'); // Navigate to the wallet screen
        }, 1000);
    };

    const handleTransfer = async (senderId: string, receiverId: string) => {
        if(!senderId || !receiverId){
            console.log('No Ids detected.');
            return;
        }

        addWalletTransaction(senderId, 'Transfer', transferData?.transactionId, transferData?.dateTime, transferData?.transferAmount, '');
        
        const senderWalletRef = doc(db, 'wallets', senderId);
        const receiverWalletRef = doc(db, 'wallets', receiverId);
        const senderWalletSnap = await getDoc(senderWalletRef);
        const receiverWalletSnap = await getDoc(receiverWalletRef);

        if (senderWalletSnap.exists() && receiverWalletSnap.exists()) {
            const senderWalletData = senderWalletSnap.data();
            const senderCurrentBalance = senderWalletData.balance || 0;

            const receiverWalletData = receiverWalletSnap.data();
            const receiverCurrentBalance = receiverWalletData.balance || 0;

            // Parse balance and value to integers
            const senderUpdatedBalance = parseInt(senderCurrentBalance) - parseInt(transferData?.transferAmount);
            const receiverUpdatedBalance = parseInt(receiverCurrentBalance) + parseInt(transferData?.transferAmount);

            // Set the updated balance back into the database
            await updateDoc(senderWalletRef, { balance: senderUpdatedBalance });
            await updateDoc(receiverWalletRef, { balance: receiverUpdatedBalance });
            sendNotification(senderId, 'wallet-transfer', 'Funds Transfer Successful', `Your funds have been successfully transferred to ${transferData?.receiptName}'s account.`, 'Success', 'Unread','','')

            console.log(`Wallet updated: ${senderId} has new balance of ${senderUpdatedBalance}`);
            console.log(`Wallet updated: ${receiverId} has new balance of ${receiverUpdatedBalance}`);
        }
    }

    const handleDownload = async () => {
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

    if (!transferData) {
        return (
            <View className="flex-1 items-center justify-center bg-[#B33939]">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4">Loading receipt data...</Text>
            </View>
        );
    }

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
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.refNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.transactionId}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.dateTime}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.senderName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.senderEmail}</Text>

                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Purpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Received by</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Billing Period</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Fee</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.transferPurpose}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptEmail}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.billingPeriod}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.transferAmount).toLocaleString()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {transferData.fee}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.total).toLocaleString()}</Text>
                                </View>
                            </View> 
                        </View>

                    <View className='w-full items-center mt-5'>
                            <View className='px-5 mb-5'>
                                <Text className='text-xs text-center text-[#6C6C6C]'>Your transfer has been successfully processed. Thank you for choosing us!</Text>
                            </View>
                            <Pressable className='mb-4'
                            onPress={handleDownload}>
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