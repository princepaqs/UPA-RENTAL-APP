import { View, Text, TextInput, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function signUp() {
  const router = useRouter();

  return (
    <View className='bg-[#B33939]'>
      <View className="flex items-start px-12 pb-5 justify-center bg-[#B33939]">
        <View className='pt-20'>
        </View>
        <Text className='text-white text-3xl font-semibold'>Get started now</Text>
        <Text className='text-white text-xs'>Join us and find your perfect home.</Text>
        
      </View>
      
      <View className='w-full px-12 py-5 rounded-t-2xl bg-[#FFFFFF] round-2xl'>
        <View className='px-2'>
          <Text className='text-sm font-semibold'>Personal Information</Text>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='First Name'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Middle Name'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Last Name'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Address'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Phone Number'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Profession'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Monthly Salary'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Email Address'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Password'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>

        <View className='pt-10'>
        <Pressable className='bg-[#B33939]  py-3 rounded-2xl' onPress={()=> router.push('/document')}>
          <Text className='text-white font-semibold text-xs text-center tracking-wider'>Continue</Text>
        </Pressable>
      </View>
      </View>

      
    </View>
  )
}