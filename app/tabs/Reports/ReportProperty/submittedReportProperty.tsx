import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import * as SecureStore from 'expo-secure-store';

export default function submittedReport() {
    const router = useRouter();
    const { reportProperty } = useAuth();


    const handleDone = () => {
        Alert.alert("Done", "Your report is submitted")
        setTimeout(async () => {
            const propertyId = await SecureStore.getItemAsync('propertyId');
            const ownerId = await SecureStore.getItemAsync('userId');
            const tenantId = await SecureStore.getItemAsync('uid');
            const reportPropertyStep1 = await SecureStore.getItemAsync('reportPropertyStep1');
            const reportPropertyStep2 = await SecureStore.getItemAsync('reportPropertyStep2');
            const reportPropertyStep3 = await SecureStore.getItemAsync('reportPropertyStep3');
            if(ownerId &&  propertyId && tenantId && reportPropertyStep1 && reportPropertyStep2 && reportPropertyStep3){
                reportProperty(ownerId, propertyId, tenantId, reportPropertyStep1, reportPropertyStep2, reportPropertyStep3);
                router.replace("../../Dashboard");
            }else{
                Alert.alert("Error", "Your report failed to submit.")
            }
        }, 1000);
      };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='mb-20'>
            <View className='flex flex-row items-center justify-between px-6 pt-8 border-b-2 border-gray-300 pb-3'>
            <TouchableOpacity onPress={() => router.replace("../../Dashboard")}>
                <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </View>
            </TouchableOpacity>

            <View className="flex-1 items-center justify-center pr-5">
                <Text className='text-sm font-bold text-center'>Report Property</Text>
            </View>
            </View>

            <View className='px-4 pt-10 gap-5 mb-20 pb-20'>
                <Text className='text-3xl font-bold'>We got your report.</Text>
                <Text className='text-xs'>
                    Thanks for taking the time to let us know what’s going on. We have received your submission regarding the property and will review it shortly. Your feedback is important to us, and we take all reports seriously. If necessary, we will follow up for more information.
                </Text>
            </View>
        </View>

        <TouchableOpacity
                onPress={handleDone}
                className='mt-20 bg-[#D9534F] py-3 rounded-xl items-center'
                >
                <Text className='text-white font-bold'>Okay</Text>
        </TouchableOpacity>

        </View>
    </View>
  )
}