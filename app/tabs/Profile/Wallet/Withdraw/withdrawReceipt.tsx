import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json';
export default function withdrawReceipt() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(() => {
            setLoading(false); // Reset loading state after saving data
            router.replace('../wallet'); // Navigate to the receipt transaction screen
        }, 1000);
    };



  return (
    <View className="bg-[#B33939] flex-1">
        <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        <View className='px-6'>
          {/* <View className="flex flex-row items-center justify-between px-6 pt-8">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>

          </View> */}

          <View className='items-center space-y-2'>
                        <Image className="w-28 h-28" source={require('../../../../../assets/images/upalogo.png')} />
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
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.senderEmail}</Text>

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
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.transferPurpose}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.bankName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.accNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.transferAmount).toLocaleString()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {transferData.fee}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.fee).toLocaleString()}</Text>
                                </View>
                            </View> 
                        </View>

                        <View className='w-full items-center mt-5'>
                        <View className='px-5 mb-5'>
                            <Text className='text-xs text-center text-[#6C6C6C]'>Your account has been successfully topped up. Thank you for choosing us!</Text>
                        </View>
                        <TouchableOpacity className='mb-4'>
                            <Text className='text-xs text-[#EF5A6F]'>Download Receipt</Text>
                        </TouchableOpacity>
                    {loading ? ( // Show loading indicator when loading is true
                            <ActivityIndicator size="large" color="#D9534F" />
                        ) : (
                            <TouchableOpacity className='w-2/3 items-center justify-center rounded-2xl bg-[#D9534F]' onPress={handleConfirm}>
                                <Text className='text-xs text-center py-3 font-bold text-white'>Done</Text>
                            </TouchableOpacity>
                        )}
                    </View>

        </View>
        </View>
    </View>
  )
}