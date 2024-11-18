import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json'; // Import the JSON data

export default function TransferReviewTransaction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true); // Set loading to true when starting the process
    setTimeout(() => {
      setLoading(false); // Reset loading state after saving data
      router.replace('./transferReceipt'); // Navigate to the receipt transaction screen
    }, 1000);
  };

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
              <Text className='text-xs text-gray-500'>Transaction ID: {transferData.transactionId}</Text>
              <Text className='text-xs text-gray-500'>Date Time: {transferData.dateTime}</Text>
              <Text className='text-xs text-gray-500'>Sender Name: {transferData.senderName}</Text>
              <Text className='text-xs text-gray-500'>Sender Email: {transferData.senderEmail}</Text>
              <Text className='text-xs text-gray-500'>Receipt Name: {transferData.receiptName}</Text>
              <Text className='text-xs text-gray-500'>Receipt Email: {transferData.receiptEmail}</Text>
              <Text className='text-xs text-gray-500'>Transfer Purpose: {transferData.transferPurpose}</Text>
              <Text className='text-xs text-gray-500'>Transfer Amount: {transferData.transferAmount}</Text>
              <Text className='text-xs text-gray-500'>Fee: {transferData.fee}</Text>
              <Text className='text-xs text-gray-500'>TOTAL: {transferData.total}</Text>
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
