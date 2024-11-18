import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

export default function MessageHeader() {
    const router = useRouter();
  return (
    
    <View className='bg-[#B33939]'>
        <View className='bg-[#B33939] flex flex-row items-center justify-start gap-2 mt-8 px-5 py-3 shadow-lg'>
        <TouchableOpacity onPress={() => router.back()}>
          <Entypo name="chevron-left" color={'white'} size={20} />
        </TouchableOpacity>
      <Text className='text-2xl font-bold text-white'>Chats</Text>
    </View>
    </View>
  )
}