import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import paymentData from './paymentData.json'; // Import the property data
import { Image } from 'react-native';

export default function paymentReceipt() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // For now, we'll use the first property as an example
    const selectedPayment = paymentData[0];

    const handleContinue = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(() => {
            setLoading(false); // Reset loading state after saving data
            router.replace('../wallet'); // Navigate to the receipt transaction screen
        }, 1000);
    };

    const address = "Caloocan City"
    const referenceNo = "123456789"
  return (
    <View className="bg-[#B33939] flex-1">
        <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        <View className='px-2 items-center'>
          <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
            {/* <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity> */}
          </View>

          <View className='items-center space-y-2'>
                        <Image className="w-28 h-28" source={require('../../../../../assets/images/upalogo.png')} />
                        <Text className='text-lg font-bold text-[#6C6C6C]'>Transaction Receipt</Text>
                    </View>

          {/* Payment Details */}
          <View className='px-4'>
                <View className='w-full flex flex-col space-y-2 px-2 rounded-xl my-2'>
                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Reference No</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Transaction ID</Text>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>Date Time</Text>
                      </View>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>{referenceNo}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.transactionId}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.dateTime}</Text>
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
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.landlord}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.email}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.propertyType}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{address}</Text>
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
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.purpose}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.amount}</Text>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.billingPeriod}</Text>
                        <Text className='text-xs text-[#6C6C6C]'> {selectedPayment.fee}</Text>
                      </View>
                    </View>

                    <View className='flex-row border-t border-gray-300 py-2 items-center justify-between'>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                      </View>
                      <View className='flex-col w-1/2'>
                        <Text className='text-xs text-[#6C6C6C]'>{selectedPayment.total}</Text>
                      </View>
                    </View>
                    <View className='items-center pt-5 px-8'>
                      <Text className='text-xs text-[#6C6C6C] text-center'>Your payment has been successfully processed. Thank you for choosing us!</Text>
                    </View>
                </View>
          </View>

              <View>
                <Text></Text>
              </View>
          <View className='items-center justify-center w-1/2 px-6 mt-5'>               
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
  )
}
