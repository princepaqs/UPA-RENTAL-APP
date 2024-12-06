import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { Transaction, updateDoc } from 'firebase/firestore';
import { captureScreen } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage';
import { getAmount } from '../sharedData'; // Adjust the path accordingly
import { db, storage } from '../../../../../_dbconfig/dbconfig'; 
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';

interface Receipt {
    refNo: string;
    uid: string,
    name: string;
    email: string;
    paymentPurpose: string;
    amount: number;
    TransactionID: string;
    dateTime: Date;
    fee: number;
    total: number;
}

export default function ReceiptTransaction() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [topUp, setData] = useState<Receipt | null>(null);

    const handleContinue = async () => {
        setLoading(true);

            setTimeout(async () => {
                setLoading(false);
                if(topUp){
                    //await setDoc(doc(db, 'revenues', topUp.uid, 'revenueId', topUp.TransactionID), topUp);
                    if(topUp.total){
                        console.log(topUp.total, topUp.uid)
                        const walletRef = await getDoc(doc(db, 'wallets', topUp.uid));
                        if(walletRef.exists()){
                            const walletData = walletRef.data();
                            if(walletData){
                                const newRevenueBalance = walletData.revenueBalance - topUp.total;
                                const newWalletBalance = walletData.balance + topUp.total;
                                console.log(newRevenueBalance , newWalletBalance);
                                await updateDoc(doc(db, 'wallets', topUp.uid), {balance: newWalletBalance, revenueBalance: newRevenueBalance});
                                await setDoc(doc(db, 'revenues', topUp.uid, 'revenueId', topUp.TransactionID), topUp);
                            }
                        }
                    }
                }
                router.back();
            }, 1000);

    };

    const generateTransactionID = () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
        const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
    };

    useEffect(()=> {
        const fetchUserData = async () => {
            const uid = await SecureStore.getItemAsync('uid')
            if(uid){
                const userRef = await getDoc(doc(db, 'users', uid));
                if(userRef.exists()){
                    const userData = userRef.data();
                    const refNumber = generateTransactionID();
                    const transactionId = generateTransactionID();
                    const transferAmount = getAmount();
                    const fee = 15;
                    const total = transferAmount ? transferAmount + fee : 0;
                    if(userData && transferAmount){
                        setData({
                            refNo: refNumber,
                            TransactionID: transactionId,
                            uid,
                            name: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
                            email: userData.email,
                            paymentPurpose: 'Transfer Revenue',
                            amount: transferAmount,
                            dateTime: new Date(),
                            fee,
                            total,
                        })
                    }
                }
            }
        }

        fetchUserData();
    }, []);

    // const topUp = {   
    //     refNo: '12456154876421214654',
    //     name: 'John Doe',
    //     email: 'johndoe@gmail.com',
    //     paymentPurpose: 'Transfer Revenue',
    //     amount: 100,
    //     TransactionID: '1234567890',
    //     dataTime: 'May 26, 2024 ; 10:45 AM',
    // }

    const fees = 15
    const total = topUp ? topUp.amount + fees : 0;

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
                        <Image className="w-20 h-20" source={require('../../../../../assets/images/upalogo.png')} />
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
                                <View className="flex-col w-1/2 space-y-2">
                                    <Text className="text-xs text-[#6C6C6C]">{topUp?.refNo}</Text>
                                    <Text className="text-xs text-[#6C6C6C]">{topUp?.TransactionID}</Text>
                                    <Text className="text-xs text-[#6C6C6C]">
                                        {topUp?.dateTime
                                            ? topUp.dateTime.toLocaleString() // Format the Date object
                                            : new Date().toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp?.name}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp?.email}</Text>
                                </View>
                            </View> 

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>PaymentPurpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount: ₱ </Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp?.paymentPurpose}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {topUp?.amount.toLocaleString()}</Text>
                                </View>
                            </View> 
                            
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {total.toLocaleString()}</Text>
                                </View>
                            </View> 
                        
                        </View>

                    <View className='w-full items-center mt-10'>
                        <View className='px-5 mb-10'>
                            <Text className='text-xs text-center text-[#6C6C6C]'>Your transfer has been successfully processed. Thank you for choosing us!</Text>
                        </View>
                        <TouchableOpacity className='mb-4'
                            onPress={handleDownload}>
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
