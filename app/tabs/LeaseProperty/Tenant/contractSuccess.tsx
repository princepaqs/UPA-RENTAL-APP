import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function contractSuccess() {
    const router = useRouter();
  return (
    <View className="bg-[#B33939]">
      <View className="h-screen bg-gray-100 px-2 mt-20 rounded-t-2xl">
      <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Contract Sent Successfully!</Text>
          </View>
        </View>
        
        <View className='px-6'>
        <View className='pt-10 pb-5 pl-20'>
          <Image
            className='w-[150px] h-[150px]'
            source={require('../../../../assets/images/sucess.png')}
          />
        </View>
        <View className='flex flex-col items-center justify-center'>
          <View className='flex flex-col gap-5'>
            <Text className='text-2xl font-semibold text-center'>Success! </Text>
            <Text className='text-xs text-center'>
              The rental contract has been successfully sent to the tenant.
            </Text>
            <Text className='text-xs text-center'>
              <Text className='text-xs font-bold text-[#D9534F]'>Note:</Text> If the tenant does not sign the contract and pay the deposit and advance within 24 hours, the property will be made available for listing again. You will then have the option to choose another tenant application for the property.
            </Text>
          </View>
        </View>
        <View className='pt-20'>
          <Pressable className='items-center justify-center' onPress={() => router.replace('/tabs/LeaseProperty/Tenant/tenants')}>
            <Text className='text-white font-semibold text-xs text-center tracking-wider bg-[#D9534F] py-2 px-8 rounded-xl'>Continue</Text>
          </Pressable>
        </View>
        </View>
      </View>
    </View>
  )
}
