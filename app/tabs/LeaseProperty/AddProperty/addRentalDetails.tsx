import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function AddNewProperty() {
  const router = useRouter();
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyRentPrice, setMonthlyRentPrice] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("Demo (1 minute)"); // please back to 6 months
  const [securityDepositMonths, setSecurityDepositMonths] = useState("1 month");
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [isPriceError, setIsPriceError] = useState(false);
  // Dropdown visibility states
  const [isLeaseDropdownVisible, setLeaseDropdownVisible] = useState(false);
  const [isSecurityDropdownVisible, setSecurityDropdownVisible] = useState(false);

  const leaseDurations = ["Demo (1 minute)", "Short-term (6 months)", "Long-term (1 year)"];
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

    console.log(monthlyRentPrice);
    try {
      await SecureStore.setItemAsync('propertyMonthlyRent', monthlyRentPrice);
      await SecureStore.setItemAsync('propertyLeaseDuration', leaseDuration);
      await SecureStore.setItemAsync('propertySecurityDepositMonth', securityDepositMonths);
      await SecureStore.setItemAsync('propertySecurityDepositAmount', securityDepositAmount);
      await SecureStore.setItemAsync('propertyAdvancePaymentAmount', advancePaymentAmount);
      await SecureStore.deleteItemAsync('propertyWaterFee');
      await SecureStore.deleteItemAsync('propertyGasFee');
      await SecureStore.deleteItemAsync('propertyElectricFee');
      await SecureStore.deleteItemAsync('propertyInternetFee');
      
      const propertyType = await SecureStore.getItemAsync('propertyType');
      if(propertyType === 'Dorm' || propertyType === 'Bedspace'){
        router.replace('./addUtilityFees');
      }
      else{
        router.replace('./addTerms&Condition');
      }
      
    } catch (error) {
      console.error('Error saving data to SecureStore', error);
    }
  };

  const handleMonthlyRentChange = (value: string) => {
    // Remove spaces
    value = value.replace(/\s/g, '');
  
    // Prevent dots or commas
    if (/[.,]/.test(value)) {
      Alert.alert('Error', 'Rent price should not contain dots, commas, or spaces!');
      setMonthlyRent('');
      setMonthlyRentPrice('');
      setIsPriceError(true);
      return;
    }
  
    // Allow empty input so users can delete and retype
    if (value === '') {
      setMonthlyRent('');
      setMonthlyRentPrice('');
      setIsPriceError(false);
      return;
    }
  
    // Ensure input is a valid number
    if (isNaN(Number(value))) {
      return;
    }
  
    setMonthlyRent(value);
    setMonthlyRentPrice(value);
  
    const price = parseFloat(value);
    setIsPriceError(price < 2000 || price > 100000);
  };

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
          <Text className="text-lg font-bold py-2">Rental Details</Text>
          <Text className="text-xs">Set the monthly rent, deposit, and lease duration.</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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
                  value={monthlyRent}
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
            <View className='pt-5'>
              <TouchableOpacity onPress={handleContinue} className='bg-[#B33939] py-3 rounded-md'>
                <Text className='text-center text-white font-semibold'>Continue</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
