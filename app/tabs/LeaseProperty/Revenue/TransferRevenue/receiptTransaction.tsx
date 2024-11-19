import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { Transaction } from 'firebase/firestore';

export default function ReceiptTransaction() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);


    const handleContinue = async () => {
        setLoading(true);

            setTimeout(() => {
                setLoading(false);
                router.back();
            }, 1000);

    };



    const topUp = {   
        refNo: '12456154876421214654',
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        paymentPurpose: 'Transfer Revenue',
        amount: 100,
        TransactionID: '1234567890',
        dataTime: 'May 26, 2024 ; 10:45 AM',
    }

    const fees = 15
    const total = topUp.amount + fees
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
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.refNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.TransactionID}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.dataTime}</Text>
                                </View>
                            </View>

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.name}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.email}</Text>
                                </View>
                            </View> 

                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>PaymentPurpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount: ₱ </Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-2'>
                                    <Text className='text-xs text-[#6C6C6C]'>{topUp.paymentPurpose}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {topUp.amount.toLocaleString()}</Text>
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
