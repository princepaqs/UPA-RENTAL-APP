import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function ReportProperty() {
  const router = useRouter();
  
  // State to track selected option
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Options for the checklist
  const options = [
    { label: 'Listing Accuracy and Misrepresentation'},
    { label: 'Property Availability and Condition'}, 
    { label: 'Legal and Regulatory Violations'},
    { label: 'Content and Communication Issues'},
    { label: 'Discrimination and Unethical Practices'},
    { label: 'It is something else'},
  ];

  // Handle selection
  const handleSelect = (option: typeof options[0]) => {
    setSelectedOption(option.label); // Set selected option but do not route yet
    console.log(option.label);
  };

  // Handle navigation when "Next" button is pressed
  /*const handleNext = async () => {
    const selectedRoute = options.find(option => option.label === selectedOption)?.route;
    if (selectedRoute) {
      router.push(selectedRoute as any); // Navigate based on the selected route
      await SecureStore.setItemAsync('reportPropertyStep1',selectedOption ?? '');
    }
  };*/

  const handleNext = async () => {
    router.push('./reportPropertyNextStep'); // Navigate based on the selected route
    await SecureStore.setItemAsync('reportPropertyStep1',selectedOption ?? '');
  }

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen w-full bg-gray-100 px-6 mt-14 rounded-t-2xl'>
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

        <View className='pt-10 px-2 flex flex-col gap-10'>
          <View>
            <Text className='text-3xl font-bold'>Why are you reporting this listing?</Text>
            <Text className='text-xs text-black/50'>This won’t be shared with the owner.</Text>
          </View>

          {/* Checklist with Selection */}
          <View className='flex-col space-y-5'>
            {options.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => handleSelect(option)}
                className='flex-row items-center space-x-3'
              >
                <Ionicons
                  name={
                    selectedOption === option.label
                      ? 'radio-button-on-outline'
                      : 'radio-button-off-outline'
                  }
                  size={18}
                  color={selectedOption === option.label ? 'black' : 'gray'}
                />
                <Text
                  className={`text-sm ${
                    selectedOption === option.label ? 'font-semibold text-black' : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          
        </View>

        <View className='my-10'>
            {/* Next Button */}
            {selectedOption && (
                <TouchableOpacity
                onPress={handleNext}
                className='mt-20 bg-[#D9534F] py-3 rounded-xl items-center'
                >
                <Text className='text-white font-bold'>Next</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
}
