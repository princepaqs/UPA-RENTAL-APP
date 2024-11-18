import { View, Text, Image } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

export default function ChatRoomHeader() {
    const router = useRouter();
  return (
    
    <View className='bg-[#B33939]'>
        <View className='bg-[#B33939] flex flex-row items-center justify-start gap-2 mt-8 px-5 py-3 shadow-lg'>
          <TouchableOpacity onPress={() => router.push('./MessageDashboard')}>
              <Entypo name="chevron-left" color={'white'} size={20} />
          </TouchableOpacity>
          <View className='flex flex-row'>
            
            {/* <Image source={require('../assets/images/speed.jpg')} className='w-8 h-8 rounded-full mr-2' /> */}
            {/* Name */}
            <Text className='text-xl font-semibold text-white'>iShowSpeed</Text>
          </View>
        </View>
    </View>
  )
}