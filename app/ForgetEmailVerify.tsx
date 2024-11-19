import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgetEmailVerify() {
  const router = useRouter();

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white px-6 mt-28 rounded-t-2xl'>

      <View className='flex flex-row items-center justify-between px-6 pt-8 '>
          
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Forgot Password </Text>
          </View>
          
        </View> 

        <View className='flex flex-col space-y-5 items-center mt-28 px-6'>
          <Text className='text-3xl font-bold text-center'>Email Verification</Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            An email verification link has been sent to your email. Please check your inbox and follow the instructions to reset your password.
          </Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            Didn't receive an email? {'\n'} Check your <Text className='text-red-700'>spam folder</Text> or try again.
          </Text>
        </View>
        

      </View>
    </View>
  );
}
