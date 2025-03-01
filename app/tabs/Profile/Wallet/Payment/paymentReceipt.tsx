import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import paymentData from './paymentData.json'; // Import the property data
import { Image } from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { db, storage } from '../../../../../_dbconfig/dbconfig'; 
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';

interface Receipt {
  referenceNo: string;
  transactionId: string;
  dateTime: string;
  uid: string;
  ownerName: string;
  ownerEmail: string;
  propertyId: string;
  propertyAddress: string;
  paymentPurpose: string;
  paymentAmount: string;
  billingPeriod: string;
  fee: string;
  total: string;
  _type: string;
}

export default function paymentReceipt() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState<Receipt | null>(null);

    // For now, we'll use the first property as an example
    const selectedPayment = paymentData[0];

    const generateTransactionID = () => {
      const now = new Date();
      const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
      const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
      return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
  };

    useEffect(() => {
      const fetchPaymentReceipt = async () => {
        const transactionPaymentId = await SecureStore.getItemAsync('transactionPaymentId');
        if(transactionPaymentId){
          const rentRef = await getDoc(doc(db, 'rentTransactions', transactionPaymentId));
          if(rentRef.exists()){
            const rentData = rentRef.data();
            if(rentData){
              const tenantId = rentData.tenantId;
              const ownerId = rentData.ownerId;
              const propertyId = rentData.propertyId;
              if(tenantId && ownerId && propertyId){
                const userRef = await getDoc(doc(db, 'users', ownerId));
                const propertyRef = await getDoc(doc(db, 'properties', ownerId, 'propertyId', propertyId));
                if(userRef && propertyRef){
                  const userData = userRef.data();
                  const propertyData = propertyRef.data();
                  console.log(propertyData)
                  if(userData && propertyData){
                    const referenceNumber = generateTransactionID();
                    const total = parseInt('100') + parseInt(propertyData.propertyMonthlyRent);
                    setReceiptData({
                      referenceNo: referenceNumber,
                      transactionId: transactionPaymentId,
                      dateTime: new Date().toDateString(),
                      uid: userData.uid,
                      ownerName: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
                      ownerEmail: userData.email,
                      propertyId: propertyId,
                      propertyAddress: `${propertyData.propertyHomeAddress}, ${propertyData.propertyBarangay}, ${propertyData.propertyCity}, ${propertyData.propertyRegion}`,
                      paymentPurpose: 'Rent',
                      paymentAmount: propertyData.propertyMonthlyRent,
                      billingPeriod: rentData.propertyLeaseDuration,
                      fee: '100',
                      total: total.toString(),
                      _type: 'Payment',
                    })
                  }
                }
              }
            }
          }
        }
      }

      fetchPaymentReceipt();
    }, [])


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

    const handleContinue = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(async () => {
            setLoading(false); // Reset loading state after saving data
            if(receiptData && receiptData.uid){
              await setDoc(doc(db, 'receipts', receiptData?.uid, 'receiptId', receiptData?.transactionId), receiptData)
            }
            router.replace('../wallet'); // Navigate to the receipt transaction screen
        }, 1000);
    };

    const address = "Caloocan City"
    const referenceNo = "123456789"
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

                        <View className='items-center space-y-2 pt-28'>
                            <Text className="text-lg font-bold text-center text-[#6C6C6C]">Transaction Receipt</Text>
                        </View>
          

          {/* Payment Details */}
          <View className='px-4 '>
                <View className='w-full flex flex-col space-y-2 px-2 rounded-xl my-2'>
                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Reference No</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Transaction ID</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Date Time</Text>
                      </View>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.referenceNo}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.transactionId}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.dateTime}</Text>
                      </View>
                    </View>
                    
                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col space-y-1 w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Property ID</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Address </Text>
                      </View>
                      <View className='flex-col space-y-1 w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.ownerName}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.ownerEmail}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.propertyId}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.propertyAddress}</Text>
                      </View>
                    </View>

                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col space-y-1 w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Purpose</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Amount</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Billing Period</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Fee</Text>
                      </View>
                      <View className='flex-col space-y-1 w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.paymentPurpose}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>₱{receiptData?.paymentAmount}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{receiptData?.billingPeriod}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>₱{receiptData?.fee}</Text>
                      </View>
                    </View>

                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                      </View>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>₱{receiptData?.total}</Text>
                      </View>
                    </View>
                </View>
          </View>

          <View className='w-full items-center mt-10'>
            <View className='px-5 mb-4'>
                <Text className='text-xs text-center text-[#6C6C6C]'>Your payment has been successfully processed. Thank you for choosing us!</Text>
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
                        onPress={handleContinue}
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
