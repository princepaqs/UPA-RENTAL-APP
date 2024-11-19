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
            source={require('../assets/images/sucess.png')}
          />
        </View>
        <View className='flex flex-col items-center justify-center'>
          <View className='flex flex-col gap-5'>
            <Text className='text-2xl font-semibold text-center'>All done!</Text>
            <Text className='text-xs text-center'>
              Your password has been reset successfully. You can now log in to your account.
            </Text>
          </View>
        </View>
        <View className='pt-20'>
          <Pressable className='bg-[#D9534F] py-3 rounded-md' onPress={() => router.push('/signIn')}>
            <Text className='text-white font-semibold text-xs text-center tracking-wider'>Let's Explore</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
