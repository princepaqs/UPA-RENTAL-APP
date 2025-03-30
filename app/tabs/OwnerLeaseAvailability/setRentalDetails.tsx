import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function setRentalDetails() {
  const router = useRouter();
  const [monthlyRentPrice, setMonthlyRentPrice] = useState("");
  const [leaseDuration, setLeaseDuration] = useState("Demo (1 minute)");
  const [securityDepositMonths, setSecurityDepositMonths] = useState("1 month");
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [isPriceError, setIsPriceError] = useState(false);
  // Dropdown visibility states
  const [isLeaseDropdownVisible, setLeaseDropdownVisible] = useState(false);
  const [isSecurityDropdownVisible, setSecurityDropdownVisible] = useState(false);

  const leaseDurations = ["Demo (1 minute)", "Short-term (6 months)", "Long-term (1 year)"];
  const securityDepositOptions = ["1 month", "2 months"];

  const [showDatePicker, setShowDatePicker] = useState(false);
    const [plannedMoveInDate, setPlannedMoveInDate] = useState(new Date());

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

  useEffect(() => {
    const monthlyRent = '5000';
    setMonthlyRentPrice(monthlyRent);
  }, []);


  const handleContinue = async () => {
    router.replace('./setTerms&Condition');
  };


  return (
     <View className="h-screen pt-4 px-8">
      <View className="flex-row items-center justify-between mt-10 pb-5 border-b border-gray-300">
        <TouchableOpacity onPress={() => router.replace('../Notification')}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-xs font-bold text-center">Set Property Availability Date</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
      <View className='mt-5 flex-col space-y-2'>
        <Text className='text-xl font-bold'>Property Availability</Text>
        <Text className='text-xs'>Set the property's next available date to update the listing for new applicants.</Text>
      </View>

      <View className='mt-4 flex-col space-y-3'>
            <View>
                <Text className='text-xs font-bold'>Next Available Date for Lease</Text>
            </View>

            <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className='bg-[#D9D9D9] border flex flex-row items-center justify-start space-x-2 my-5 border-gray-300 rounded-2xl p-2'
          >
            <Entypo name="calendar" size={20} color="black" />
            <Text className='w-1/2 text-xs'>{plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={plannedMoveInDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || plannedMoveInDate;
                setShowDatePicker(false); // Ensure this state change is stable.
                setPlannedMoveInDate(currentDate);
                console.log(currentDate);
              }}
            />
          )}
        </View>


        <View className="flex flex-col justify-between mt-2 mb-2">
          <Text className="text-lg font-bold py-2">Rental Details</Text>
          <Text className="text-xs">Set the monthly rent, deposit, and lease duration.</Text>
        </View>
          <View className='mb-5 mt-2'>
            {/* Monthly Rent Price */}
            <View className='flex-col space-y-1'>
            <View className='px-4'>
                <Text className='text-xs font-bold'>Monthly Rent Price</Text>
            </View>
            <View className='w-full px-4 py-3 bg-[#D9D9D9] rounded-2xl'>
                <Text className='text-xs font-semibold text-gray-500'>₱ {monthlyRentPrice}</Text>
            </View>
        </View>

            {/* Lease Duration Dropdown */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Lease Duration</Text>
              <TouchableOpacity onPress={() => setLeaseDropdownVisible(!isLeaseDropdownVisible)} className='flex flex-row px-8 py-3 items-center justify-between bg-[#D9D9D9] rounded-2xl'>
                <Text className='text-xs '>{leaseDuration}</Text>
                <Entypo name={!isLeaseDropdownVisible ? "chevron-down" : "chevron-up"}   size={15} color="black" />
              </TouchableOpacity>
              
              {isLeaseDropdownVisible && (
                <View className='mt-1 bg-[#D9D9D9] rounded-2xl shadow-md p-1'>
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
              <TouchableOpacity onPress={() => setSecurityDropdownVisible(!isSecurityDropdownVisible)} className='flex flex-row px-8 py-3.5 items-center bg-[#D9D9D9] rounded-2xl'>
                <Text className='text-xs '>{securityDepositMonths}</Text>
              </TouchableOpacity>
              
              {isSecurityDropdownVisible && (
                <View className='mt-1 bg-[#D9D9D9] rounded-2xl shadow-md p-1'>
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
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-2xl'>
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
              <View className='flex flex-row px-8 py-2 items-center bg-[#D9D9D9] rounded-2xl'>
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
                <TouchableOpacity className='bg-[#D9534F] py-3 rounded-2xl w-full items-center' onPress={handleContinue}>
                  <View >
                    <Text className='text-xs text-center text-white'>Continue</Text>
                  </View>
                </TouchableOpacity>
              </View>

          </View>
        </ScrollView>
      </View>
  );
}
