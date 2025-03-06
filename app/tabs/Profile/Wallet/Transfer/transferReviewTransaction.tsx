import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json'; // Import the JSON data
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';
import * as SecureStore from 'expo-secure-store';

interface Transfer {
  transactionId: string;
  dateTime: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiptId: string;
  receiptName: string;
  receiptEmail: string;
  transferAmount: string;
  fee: string;
  total: string;
}

export default function TransferReviewTransaction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState<Transfer | null>(null);

  const handleContinue = async () => {
    if (transferData) {
      setLoading(true);

      // Save the transfer data into SecureStore as a JSON string
      await SecureStore.setItemAsync('transferData', JSON.stringify(transferData));

      setTimeout(() => {
        setLoading(false); // Reset loading state
        // router.replace('./transferReceipt'); // Navigate to receipt transaction screen
        router.replace('../walletPin');
      }, 1000);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const generateTransactionID = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
    return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
  };

  useEffect(() => {
    const fetchTransferData = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      const transactionId = generateTransactionID();
      const dateTime = formatDate(new Date);
      const transferAmount = await SecureStore.getItemAsync('transferAmount');
      const transferReceiptName = await SecureStore.getItemAsync('transferReceiptName');
      const transferReceiptEmail = await SecureStore.getItemAsync('transferReceiptEmail');
      const transferAccountNumber = await SecureStore.getItemAsync('transferAccountNumber');

      if(!uid || !transactionId || !dateTime || !transferAmount || !transferReceiptName || !transferReceiptEmail || !transferAccountNumber){
        console.log('Missing Fields!');
        return;
      }

      const senderRef = await getDoc(doc(db, 'users', uid));
      const receiverRef = await getDocs(query(collection(db, 'users'), where('accountId', '==', transferAccountNumber), where('email', '==', transferReceiptEmail)))
      
      if(!senderRef.exists() || receiverRef.empty){
        console.log('Users does not exist.');
        return;
      }

      const senderData = senderRef.data();
      const receiverData = receiverRef.docs[0].data();

      if(!senderData || !receiverData){
        console.log('Users does not existing data.');
        return;
      } 

      setTransferData({
        transactionId,
        dateTime,
        senderId: senderRef.id,
        senderName: `${senderData.firstName} ${senderData.middleName} ${senderData.lastName}`,
        senderEmail: senderData.email,
        receiptId: receiverRef.docs[0].id,
        receiptName: transferReceiptName,
        receiptEmail: transferReceiptEmail,
        transferAmount: parseInt(transferAmount).toFixed(2),
        fee: '50',
        total: (parseInt(transferAmount) + 50).toFixed(2),
      })
    }

    fetchTransferData();
  }, []);

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        <View className='px-6'>
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

          {/* Transfer Details */}
          <View className='px-6 pt-10 mb-6'>
            <Text className='text-sm font-bold px-4'>Top up Details</Text>
            <View className='bg-white flex flex-col space-y-2 p-5 rounded-xl my-2'>
              <Text className='text-xs text-gray-500'>Transaction ID: {transferData?.transactionId}</Text>
              <Text className='text-xs text-gray-500'>Date Time: {transferData?.dateTime}</Text>
              <Text className='text-xs text-gray-500'>Sender Name: {transferData?.senderName}</Text>
              <Text className='text-xs text-gray-500'>Sender Email: {transferData?.senderEmail}</Text>
              <Text className='text-xs text-gray-500'>Receipt Name: {transferData?.receiptName}</Text>
              <Text className='text-xs text-gray-500'>Receipt Email: {transferData?.receiptEmail}</Text>
              <Text className='text-xs text-gray-500'>Transfer Purpose: Payment for Services</Text>
              <Text className='text-xs text-gray-500'>Transfer Amount: ₱{transferData?.transferAmount}</Text>
              <Text className='text-xs text-gray-500'>Fee: ₱{transferData?.fee}</Text>
              <Text className='text-xs text-gray-500'>TOTAL: ₱{transferData?.total}</Text>
            </View>
          </View>

          <View className='flex flex-col space-y-2 pt-20 px-6'>
            <Text className='px-4 text-xs text-gray-500'>By clicking confirm, I confirm that above details are correct.</Text>
            
            {loading ? ( // Show loading indicator when loading is true
              <ActivityIndicator size={30} color="#D9534F" />
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
