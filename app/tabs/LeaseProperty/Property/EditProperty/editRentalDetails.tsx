import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function AddNewProperty() {
  const router = useRouter();
  const [monthlyRentPrice, setMonthlyRentPrice] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("Short-term (6 months)");
  const [securityDepositMonths, setSecurityDepositMonths] = useState("1 month");
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [isPriceError, setIsPriceError] = useState(false);
  // Dropdown visibility states
  const [isLeaseDropdownVisible, setLeaseDropdownVisible] = useState(false);
  const [isSecurityDropdownVisible, setSecurityDropdownVisible] = useState(false);

  const leaseDurations = ["Short-term (6 months)", "Long-term (1 year)"];
  const securityDepositOptions = ["1 month", "2 months"];

  // Function to calculate deposit based on months and rent
  const calculateSecurityDepositAmount = () => {
    const monthlyRent = parseFloat(monthlyRentPrice);
    if (!isNaN(monthlyRent)) {
      const depositMultiplier = parseInt(securityDepositMonths.split(" ")[0]) || 1; // Extract the numeric value
      const depositAmount = monthlyRent * depositMultiplier;
      setSecurityDepositAmount(depositAmount.toString()); // Adjust to appropriate decimal places
    } else {
      setSecurityDepositAmount("0.00"); // Reset if monthly rent is invalid
    }
  };

  // Automatically calculate the deposit when monthlyRentPrice or securityDepositMonths change
  useEffect(() => {
    calculateSecurityDepositAmount();
  }, [monthlyRentPrice, securityDepositMonths]);

  // Automatically set advance payment amount to the monthly rent price
  useEffect(() => {
    if (monthlyRentPrice) {
      setAdvancePaymentAmount(monthlyRentPrice); // Set advance payment to the same value as monthly rent
    }
  }, [monthlyRentPrice]);

  const handleContinue = async () => {
    if (!monthlyRentPrice || !leaseDuration || !securityDepositAmount || !securityDepositMonths) {
      Alert.alert('Error', 'Please input all fields!');
      return;
    }

    const price = parseFloat(monthlyRentPrice);
    if (isNaN(price) || price < 2000 || price > 100000) {
      setIsPriceError(true);
      return;
    }

    // Ensure the rent price is a valid number
    if (isNaN(parseFloat(monthlyRentPrice))) {
      Alert.alert('Error', 'Please enter a valid rent price!');
      return;
    }

    try {
      await SecureStore.setItemAsync('editpropertyMonthlyRent', monthlyRentPrice);
      await SecureStore.setItemAsync('editpropertyLeaseDuration', leaseDuration);
      await SecureStore.setItemAsync('editpropertySecurityDepositMonth', securityDepositMonths);
      await SecureStore.setItemAsync('editpropertySecurityDepositAmount', securityDepositAmount);
      await SecureStore.setItemAsync('editpropertyAdvancePaymentAmount', advancePaymentAmount);
      await SecureStore.deleteItemAsync('editpropertyWaterFee');
      await SecureStore.deleteItemAsync('editpropertyGasFee');
      await SecureStore.deleteItemAsync('editpropertyElectricFee');
      await SecureStore.deleteItemAsync('editpropertyInternetFee');
      
      const propertyType = await SecureStore.getItemAsync('propertyType');
      if(propertyType === 'Dorm' || propertyType === 'Bedspace'){
        router.push('./addUtilityFees');
      }
      else{
        router.push('./editTerms&Condition');
      }
      
    } catch (error) {
      console.error('Error saving data to SecureStore', error);
    }
  };

  const handleMonthlyRentChange = (value: any) => {
    setMonthlyRentPrice(value);
    const price = parseFloat(value);
    setIsPriceError(isNaN(price) || price < 2000 || price > 100000);
  };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white mt-14 py-4 px-6 rounded-t-2xl'>
            <View className='border-b border-gray-400 flex-row items-center justify-between px-4 py-3'>
                <TouchableOpacity onPress={() => router.back()}>
                <View className="flex flex-row items-center">
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </View>
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center">
                <Text className='text-sm font-bold text-center'>Edit Property</Text>
                </View>
            </View>

        

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-col justify-between mt-2 mb-2">
          <Text className="text-lg font-bold py-2">Rental Details</Text>
          <Text className="text-xs">Set the monthly rent, deposit, and lease duration.</Text>
        </View>
          <View className='mb-20 mt-2'>
            {/* Monthly Rent Price */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Monthly Rent Price</Text>
              {isPriceError && (
                <Text className='px-2 text-xs text-red-500'>min ₱2,000 - max ₱100,000</Text>
              )}
              <View className='flex flex-row px-8 py-2 items-center bg-gray-100 rounded-md'>
                <Text className='text-xs '>₱</Text>
                <TextInput
                  onChangeText={handleMonthlyRentChange}
                  className='flex-1 font-semibold text-xs'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Lease Duration Dropdown */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Lease Duration</Text>
              <TouchableOpacity onPress={() => setLeaseDropdownVisible(!isLeaseDropdownVisible)} className='flex flex-row px-8 py-3.5 items-center bg-gray-100 rounded-md'>
                <Text className='text-xs '>{leaseDuration}</Text>
              </TouchableOpacity>
              
              {isLeaseDropdownVisible && (
                <View className='mt-1 bg-gray-100 rounded-md shadow-md p-1'>
                  {leaseDurations.map((duration, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setLeaseDuration(duration);
                        setLeaseDropdownVisible(false);
                      }}
                      className='px-7 py-3 border-b border-gray-300'
                    >
                      <Text className='text-xs'>{duration}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Security Deposit Months Dropdown */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Security Deposit Month/s</Text>
              <TouchableOpacity onPress={() => setSecurityDropdownVisible(!isSecurityDropdownVisible)} className='flex flex-row px-8 py-3.5 items-center bg-gray-100 rounded-md'>
                <Text className='text-xs '>{securityDepositMonths}</Text>
              </TouchableOpacity>
              
              {isSecurityDropdownVisible && (
                <View className='mt-1 bg-gray-100 rounded-md shadow-md p-1'>
                  {securityDepositOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSecurityDepositMonths(option);
                        setSecurityDropdownVisible(false);
                      }}
                      className='px-7 py-3 border-b border-gray-300'
                    >
                      <Text className='text-xs'>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Security Deposit Amount */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Security Deposit Amount</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-gray-100 rounded-md'>
                <Text className='text-xs '>₱</Text>
                <TextInput
                  value={securityDepositAmount}
                  editable={false} // Non-editable since it's auto-calculated
                  className='flex-1 font-semibold text-xs '
                  placeholderTextColor={'black'}
                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Advance Payment Amount */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Advance Payment Amount</Text>
              <View className='flex flex-row px-8 py-2 items-center bg-gray-100 rounded-md'>
                <Text className='text-xs '>₱</Text>
                <TextInput
                  value={monthlyRentPrice}
                  className='flex-1 font-semibold text-xs '
                  editable={false}
                  placeholderTextColor={'gray'}

                  keyboardType='numeric'
                />
              </View>
            </View>

            {/* Continue Button */}
            <View className='flex flex-row pr-4  gap-1 mt-5'>
                <TouchableOpacity className='bg-[#333333] py-3 rounded-2xl w-1/2' onPress={() => router.back()}>
                  <View >
                    <Text className='text-xs text-center text-white'>Back</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className='bg-[#D9534F] py-3 rounded-2xl w-1/2' onPress={handleContinue}>
                  <View >
                    <Text className='text-xs text-center text-white'>Continue</Text>
                  </View>
                </TouchableOpacity>
              </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
