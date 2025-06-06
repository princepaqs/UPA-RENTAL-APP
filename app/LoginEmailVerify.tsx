import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function emailVerify() {
  const router = useRouter();

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white px-6 mt-28 rounded-t-2xl'>
        <View className='flex flex-col space-y-5 items-center mt-28 px-6'>
          <Text className='text-3xl font-bold text-center'>Email Verification</Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            An email verification link has been sent to your email. Please check your inbox and follow the instructions to reset your password.
          </Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            Didn't receive an email? {'\n'} Check your <Text className='text-red-700'>spam folder</Text> or try again.
          </Text>
        </View>
        
        <View className='h-full flex flex-col items-center justify-center mx-5 bottom-20'>
          <TouchableOpacity className='p-2 mt-2 flex items-center' onPress={async () => {
            router.replace('./signIn') 
            await SecureStore.deleteItemAsync('email');}}>
            <Text className='text-sm'>Back to log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
