import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function success() {
  const router = useRouter();
  const Fullname = useRef("");

  const handleReturn = () => {
    router.replace('./dashboard');
  }

  const [isDetailsVisible, setIsDetailsVisible] = useState(false); 
  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible); // Toggle visibility
  };

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-20 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Sign Agreement & Secure Your Lease</Text>
          </View>
        </View>

        <View className='flex-row py-3 items-center justify-center space-x-8 bg-[#D9D9D9] '>
          <View className='flex-col items-center'>
            <View className='px-1 py-1 bg-[#0FA958] text-white rounded-full font-bold text-sm '>
              <FontAwesome name="check" size={15} color="white" />
            </View>
            <Text className='font-bold text-xs text-gray-500'>STEP 1</Text>
            <Text className='text-xs '>Sign contract</Text>
          </View>

          <View className='flex-col items-center'>
          <View className='px-1 py-1 bg-[#0FA958] text-white rounded-full font-bold text-sm '>
              <FontAwesome name="check" size={15} color="white" />
            </View>
            <Text className='font-bold text-xs '>STEP 2</Text>
            <Text className='text-xs '>Lease Confirmed</Text>
          </View>
        </View>

        {/* Contract Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-4 px-8 mb-5">
            <View className='items-center justify-center px-10'>
              <View className='pt-10 pb-5 items-center justify-center'>
                <Image
                  className='w-32 h-32'
                  source={require('../../../assets/images/sucess.png')}
                />
              </View>
              <Text className='text-xl font-bold'>You’re All Set!</Text>
              <Text className='text-center text-gray-500'>Your lease renewal is now complete. Thank you for confirming! Your rental is officially extended.</Text>

              <TouchableOpacity className='mt-10' onPress={handleReturn}>
                <Text className='px-3 py-2 bg-[#D9534F] rounded-xl text-white text-xs font-bold'>Return Dashboard</Text>
              </TouchableOpacity>
            </View>
            
            
            
          </View>
        </ScrollView>

        
      </View>
    </View>
  );
}
