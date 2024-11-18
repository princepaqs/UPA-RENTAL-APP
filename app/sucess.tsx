import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function Success() {
    const router = useRouter();
  return (
    <View className='bg-[#B33939]'>
      <View className="flex items-start px-12 pb-5 justify-center bg-[#B33939]">
        <View className='pt-20'></View>
      </View>
      
      <View className='w-full px-12 py-5 rounded-t-2xl bg-[#FFFFFF] round-2xl'>
        <View className='pt-10 pb-5 pl-20'>
          <Image
            className='w-[150px] h-[150px]'
            source={require('../assets/images/image.png')}
          />
        </View>
        <View className='flex flex-col items-center justify-center'>
          <View className='flex flex-col gap-5'>
            <Text className='text-2xl font-semibold text-center'>You’re All Set!</Text>
            <Text className='text-xs text-center'>
              Your registration is complete, and your documents and profile are now{' '}
              <Text className='text-[#B33939] font-bold'>under review.</Text>
            </Text>
            <Text className='text-xs text-center'>
              You can now explore the app and start discovering our features while we process your information. 
              Thank you for joining us!
            </Text>
          </View>
        </View>
        <View className='pt-20'>
          <Pressable className='bg-[#B33939] py-3 rounded-2xl' onPress={() => router.push('/tabs/Dashboard')}>
            <Text className='text-white font-semibold text-xs text-center tracking-wider'>Let's Explore</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
