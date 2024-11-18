import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

export default function upgradeRequestSubmitted() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDone = async () => {
        setLoading(true);

        setTimeout(() => {
            Alert.alert('Submission Successful', 'Your request to upgrade has been submitted');
            router.back();
            setLoading(false);
        }, 1500);
    
    };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-8 mt-20 rounded-t-2xl'>

        <ScrollView
            showsVerticalScrollIndicator={false}
            >
        <View className='w-full h-full items-center pt-20'>
        <View className='pt-10 pb-5'>
          <Image
            className='w-[200px] h-[200px]'
            source={require('../../../assets/images/sucess.png')}
          />
        </View>
        <View className='flex flex-col items-center justify-center px-4'>
          <View className='flex flex-col gap-5'>
            <Text className='text-2xl font-semibold text-center'>Request Submitted!!</Text>
            <Text className='text-xs text-center'>
              Thank you for your request! We’ll review your documents and notify you once approved.
            </Text>
          </View>
        </View>
        </View>
        </ScrollView>
        <View className='bottom-0 px-2 mt-2 mb-20 space-y-2'>
                        <TouchableOpacity className='w-full bg-[#D9534F] rounded-2xl py-2.5 items-center'
                            onPress={handleDone}
                            disabled={loading} 
                            >
                            {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                            <Text className='text-xs text-white font-bold'>Done</Text>
                            )}
                        </TouchableOpacity>
                </View>

        </View>
    </View>
  )
}