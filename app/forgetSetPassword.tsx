import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgetOTP() {
  const router = useRouter();


  const handleResetPassword = () => {
    router.push('./forgetSuccess')
  };

  return (
    <View className="bg-[#B33939]">
        
      <View className="h-screen bg-white mt-28 rounded-t-2xl pt-10">
        <TouchableOpacity className='mx-10' onPress={() => router.back()}>
            <Ionicons name="chevron-back-sharp" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex flex-col items-center pt-10 mx-10">
            <Text className="text-2xl font-bold text-center">
              Set new password
            </Text>
        </View>

        <View className='mx-10 py-8'>
          <View className='gap-1 py-2'>
          <Text className='text-xs font-bold pl-2'>New Password</Text>
          <View className='bg-gray-100 rounded-xl p-2'>
            <TextInput
            className='text-xs px-2'
            placeholder='Enter your new password'
            />
          </View>
          </View>

          <View className='gap-1 py-2'>
          <Text className='text-xs font-bold pl-2'>Confirm Password</Text>
          <View className='bg-gray-100 rounded-xl p-2'>
            <TextInput
            className='text-xs px-2'
            placeholder='Confirm your new password'
            />
          </View>
          </View>
        </View>

        <View className="flex flex-col items-center justify-center mx-10">
          <TouchableOpacity className="bg-[#D9534F] rounded-xl w-full py-3 items-center" onPress={handleResetPassword}>
            <Text className="text-white text-xs font-bold">Reset Password</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
