import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../../Modals/ReportsModal'; // Import the Custom Modal component
import * as SecureStore from 'expo-secure-store';

export default function Describe() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');

  const handleDone = async () => {
    if (!inputValue.trim()) {
      setModalVisible(true); // Show modal if input is empty
    } else {
      console.log(inputValue);
      await SecureStore.setItemAsync('reportPropertyStep3', inputValue);
      router.push("./submittedReportProperty");
    }
  };

  useEffect(() => {
    const getPropertyStep2 = async () => {
      const val = await SecureStore.getItemAsync('reportDesc');
      if(val){
        setValue(val);
      }
    } 

    getPropertyStep2();
  },[])

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='mb-20'>
          <View className='flex flex-row items-center justify-between px-6 pt-8 border-b-2 border-gray-300 pb-3'>
            <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>

            <View className="flex-1 items-center justify-center pr-5">
              <Text className='text-sm font-bold text-center'>Report Property</Text>
            </View>
          </View>

          <View className='px-4 pt-10 gap-10 mb-20'>
            <Text className='text-3xl font-bold'>Describe how it’s a{`${value}`}.</Text>
            <View className='bg-white p-5 rounded-xl'>
              <View>
                {!inputValue && (
                  <Text className='absolute text-xs font-bold text-gray-500'>
                    Kindly provide a detailed description of the issue you're experiencing. This allows us to resolve it more efficiently and accurately.
                  </Text>
                )}
                <TextInput
                  className='text-xs h-28 font-bold'
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  onChangeText={text => setInputValue(text)}
                  value={inputValue}
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDone}
          className='mt-20 bg-[#D9534F] py-3 rounded-xl items-center'
        >
          <Text className='text-white font-bold'>Next</Text>
        </TouchableOpacity>

        {/* Use the custom modal here */}
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          message="Please provide a detailed description of the issue before proceeding."
        />
      </View>
    </View>
  );
}
