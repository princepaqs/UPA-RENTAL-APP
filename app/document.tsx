import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native'
import { useRouter } from 'expo-router';

export default function document() {
    const router = useRouter();
  return (
    
    <View className='bg-[#B33939]'>
      <View className="flex items-start px-12 pb-5 justify-center bg-[#B33939]">
        <View className='pt-20'>
        </View>
        
      </View>
      
      <View className='w-full px-12 py-5 rounded-t-2xl bg-[#FFFFFF] round-2xl'>
        <View className='px-2'>
          <Text className='text-lg font-semibold'>Upload Documents</Text>
          <View className='flex flex-col gap-2'>
            <Text className='text-xs font-normal'>These documents verify your identity, legal status, and financial capability for renting.</Text>
            <Text className='text-xs font-normal'>Please ensure that the documents are clear and in the accepted formats (PDF, JPG, PNG).</Text>
          </View>
        </View>
        
        <View className='pt-4'>
            <View className='px-2'>
                <Text className='text-xs font-semibold'>Profile Picture</Text>
            </View>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Capture Profile Picture'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
        <View className='px-2'>
                <Text className='text-xs font-semibold'>Barangay Clearance</Text>
            </View>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Upload Barangay Clearance'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
        <View className='px-2'>
                <Text className='text-xs font-semibold'>NBI Clearance</Text>
            </View>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Upload NBI Clearance'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
        <View className='px-2'>
                <Text className='text-xs font-semibold'>Government Issued ID</Text>
            </View>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Upload Government-Issued ID'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        <View className='pt-4'>
        <View className='px-2'>
                <Text className='text-xs font-semibold'>Proof of Income</Text>
            </View>
          <View className='flex flex-row px-8 py-1 items-center bg-[#D9D9D9] rounded-2xl'>
                <TextInput
                  className='flex-1 pl-4 font-semibold text-xs text-gray-500'
                  placeholder='Upload Proof of Income'
                  placeholderTextColor={'gray'}
                />
          </View>
        </View>
        

        <View className='pt-20'>
        <View className='flex items-center justify-center pb-2'>
        <Text className='text-gray-400 text-center text-xs'>By clicking sign up, I agree to the terms and conditions</Text>

      </View>
        <Pressable className='bg-[#B33939]  py-3 rounded-2xl' onPress={()=> router.push('/sucess')}>
          <Text className='text-white font-semibold text-xs text-center tracking-wider'>Sign Up</Text>
        </Pressable>
      </View>
      </View>

      
    </View>
  )
}