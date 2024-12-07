import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';


export default function thankyouFeedback() {
    const router = useRouter();
  return (
    <View className='h-screen flex-1 items-center justify-center'>
      
        <Image
            className='w-24 h-24'
            source={require('../../../../assets/images/successFeedback.png')}
          />

        <View className='pt-5 pb-20 mb-20 gap-5 mx-8 items-center justify-center1'>
            <Text className='text-sm text-center font-bold'>Thank you for taking the time to share your feed</Text>
            <Text className='text-xs text-center'>Your input is invaluable and helps us improve our services. If you have any additional comments or questions, feel free to reach out to us. Have a great day!</Text>
        </View>
        
        <TouchableOpacity className='bg-[#D9534F] mx-10 w-1/2 py-3 rounded-xl items-center'
            onPress={() => router.back()}
        >
            <Text className='font-bold text-white'>Return Dashboard</Text>
        </TouchableOpacity>
        
    </View>
  )
}