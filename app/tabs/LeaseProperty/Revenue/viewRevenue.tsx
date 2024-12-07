import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json';
import { captureScreen } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { db, storage } from '../../../../_dbconfig/dbconfig'; 
import { collection, getDocs, query, where, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

interface Receipt {
    refNo: string;
    uid: string,
    name: string;
    email: string;
    paymentPurpose: string;
    amount: number;
    TransactionID: string;
    dateTime: string;
    fee: number;
    total: number;
}

export default function transferReciept() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState<Receipt | null>(null);

    useEffect(() => {
        const fetchPaymentReceipt = async () => {
            const uid = await SecureStore.getItemAsync('uid');
            const revenueId = await SecureStore.getItemAsync('revenueReceiptId');
            if(uid && revenueId){
                const receiptRef = await getDoc(doc(db, 'revenues', uid, 'revenueId', revenueId));
                if(receiptRef.exists()){
                    const data = receiptRef.data();
                    if(data){
                        console.log(convertStringDateTime(data.dateTime));
                        const convertedDate = await convertStringDateTime(data.dateTime);
                        setReceiptData({
                            refNo: data.refNo,
                            uid: data.uid,
                            name: data.name,
                            email: data.email,
                            paymentPurpose: data.paymentPurpose,
                            amount: data.amount,
                            TransactionID: data.TransactionID,
                            dateTime: convertedDate,
                            fee: data.fee,
                            total: data.total,
                        })
                    }
                }else{
                    console.log('No receipts found.')
                }
            }
        }

        fetchPaymentReceipt();
    }, []);

    const convertStringDateTime = async (dateTime: Timestamp) => {
        // Convert Firestore Timestamp to a JavaScript Date object
        const date = new Date(dateTime.seconds * 1000 + dateTime.nanoseconds / 1000000);
      
        // Format the date into MM/DD/YYYY HH:mm
        const formattedDate = date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true, // Use 24-hour format. Change to true for AM/PM
        });
      
        return formattedDate;
      };
      

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
        <View className="bg-gray-100 mt-16 rounded-t-2xl flex-1">
        <View className='px-6'>
          <View className="flex flex-row items-center justify-between px-6 pt-8">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>

          </View>

          <View className='items-center space-y-1'>
                        <Image className="w-28 h-28" source={require('../../../../assets/images/upalogo.png')} />
                        <Text className="text-lg font-bold text-center text-[#6C6C6C] ">Transaction Receipt</Text>
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
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.refNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.TransactionID}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.dateTime}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                    {receiptData?.paymentPurpose === 'Transfer Revenue' ? (
                                        <></>
                                    ) : (
                                        <>
                                            <View>
                                                <Text className='text-xs mt-1 text-[#6C6C6C] font-bold'>Property ID</Text>
                                                <Text className='text-xs mt-1 text-[#6C6C6C] font-bold'>Address</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.name}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.email}</Text>
                                    {/* {transferData.transactionType === 'Transfer' ? (
                                        <></>
                                    ) : (
                                        <>
                                            <View>
                                                <Text className='text-xs mt-1 text-[#6C6C6C]'>{transferData.propertyID}</Text>
                                                <Text className='text-xs mt-1 text-[#6C6C6C]'>{transferData.address}</Text>
                                            </View>
                                        </>
                                    )} */}
                                    
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Purpose</Text>
                                    {receiptData?.paymentPurpose === 'Transfer Revenue' ? (
                                        <></>
                                    ) : (
                                        <>
                                            <View>
                                                <Text className='text-xs mt-1 text-[#6C6C6C] font-bold'>Received by</Text>
                                                <Text className='text-xs mt-1 text-[#6C6C6C] font-bold'>Billing Period</Text>
                                            </View>
                                        </>
                                    )}
                                    
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Fee</Text>
                                    </View>
                                    <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{receiptData?.paymentPurpose}</Text>
                                    {/* {receiptData?.paymentPurpose === 'Transfer Revenue' ? (
                                        <></>
                                    ) : (
                                        <>
                                            <View>
                                                <Text className='text-xs mt-1 text-[#6C6C6C]'>{receiptData?.receiptName}</Text>
                                                <Text className='text-xs mt-1 text-[#6C6C6C]'>{receiptData?.billingPeriod}</Text>
                                            </View>
                                        </>
                                    )} */}
                                    
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {receiptData?.amount.toLocaleString()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {receiptData?.fee}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {receiptData?.total.toLocaleString()}</Text>
                                </View>
                            </View> 
                        </View>
                    </View>
                    <View className='w-full items-center mt-10 absolute bottom-8'>
                        <TouchableOpacity className='mb-4'
                        onPress={handleDownload}>
                            <Text className='text-xs text-[#EF5A6F]'>Download Receipt</Text>
                        </TouchableOpacity>
                    </View>
        </View>
    </View>
  )
}