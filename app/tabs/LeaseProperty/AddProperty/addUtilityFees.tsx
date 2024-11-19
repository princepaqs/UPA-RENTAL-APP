import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function AddUtilityFees() {
  const router = useRouter();
  const [waterFee, setWaterFee] = useState("");
  const [electricityFee, setElectricityFee] = useState("");
  const [gasFee, setGasFee] = useState("");
  const [internetFee, setInternetFee] = useState("");

  const handleContinue = async() => {
        if (!waterFee?.trim() || !electricityFee?.trim() ||
        !gasFee?.trim() || !internetFee?.trim()) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    } else {
      await SecureStore.setItemAsync('propertyWaterFee', waterFee);
      await SecureStore.setItemAsync('propertyElectricFee', electricityFee);
      await SecureStore.setItemAsync('propertyGasFee', gasFee);
      await SecureStore.setItemAsync('propertyInternetFee', internetFee);

      router.replace('./addTerms&Condition');
    }
  }

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-white px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          
          <TouchableOpacity onPress={() => router.replace('../PropertyDashboard')}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-lg font-semibold text-center'>Add Property</Text>
          </View>
          
        </View>

        <View className="flex flex-col justify-between mt-5 pt-3 pb-1 border-t mb-2">
          <Text className="text-lg font-bold py-2">Utility and Extra Fees </Text>
          <Text className="text-xs">List any extra fees for utilities if applicable.</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className='mb-20 mt-2'>
            
            {/* Water Fee */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Water Fee</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-md'>
                <Text className='text-xs text-gray-500'>₱</Text>
                <TextInput
                  onChangeText={value => setWaterFee(value)}
                  className='flex-1 font-semibold text-xs text-gray-500'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Electricity Fee */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Electricity Fee</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-md'>
                <Text className='text-xs text-gray-500'>₱</Text>
                <TextInput
                  onChangeText={value => setElectricityFee(value)}
                  className='flex-1 font-semibold text-xs text-gray-500'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Gas Fee */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Gas Fee</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-md'>
                <Text className='text-xs text-gray-500'>₱</Text>
                <TextInput
                  onChangeText={value => setGasFee(value)}
                  className='flex-1 font-semibold text-xs text-gray-500'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Internet Fee */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Internet Fee</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-md'>
                <Text className='text-xs text-gray-500'>₱</Text>
                <TextInput
                  onChangeText={value => setInternetFee(value)}
                  className='flex-1 font-semibold text-xs text-gray-500'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            <View className='flex flex-row mt-4'>
              <View className='flex flex-row pr-4  gap-1'>
                <TouchableOpacity className='bg-[#333333] py-3 rounded-md w-1/2' onPress={() => router.back()}>
                  <View >
                    <Text className='text-xs text-center text-white'>Back</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className='bg-[#B33939] py-3 rounded-md w-1/2' onPress={handleContinue}>
                  <View >
                    <Text className='text-xs text-center text-white'>Continue</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
