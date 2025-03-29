import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onChange: () => void;
  }
  
  // CustomCheckbox component with TypeScript
  const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange }) => (
    <TouchableOpacity onPress={onChange} className="flex flex-row items-center space-y-2">
      <View className={`w-3 h-3 border-2 ${checked ? 'bg-gray-800 border-black' : 'bg-white border-gray-400'} rounded-md mr-2`}>
        {checked && <View className="w-3 h-3" />}
      </View>
      <Text className={`text-xs text-start ${checked ? 'text-black' : 'text-gray-500'}`}>{label}</Text>
    </TouchableOpacity>
  );
   
export default function contractQuestion() {
    const router = useRouter();
    const [extensionPeriod, setExtensionPeriod] = useState('');
    const [monthsPeriod, setMonthsPeriod] = useState(false);
    const [yearPeriod, setYearPeriod] = useState(false);

    const tenantFullName = "Alvin Estrella"
    const ownerFullName = "Prince Paquiado"


    const [showDatePicker, setShowDatePicker] = useState(false);
    const [plannedMoveInDate, setPlannedMoveInDate] = useState(new Date());


    const property = {
        propertyType: "Condo",
        propertyAdress: "Caloocan City",
        leaseStart: "January 1, 2024",
        leaseEnd: "January 1, 2025",
    }
  return (
    <View className="h-screen py-4 px-8">
      <View className="flex-row items-center justify-between mt-6 pb-5 border-b border-gray-300">
        <TouchableOpacity onPress={() => router.replace('./rentalDetails')}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-xs font-bold text-center">Lease Extension Request Form</Text>
      </View>

        <View className='mt-4 flex-col space-y-3'>
            <View>
                <Text className='text-sm font-bold'>Tenant Information</Text>
            </View>

            <View className='flex-col space-y-1'>
                <Text className='text-xs font-bold'>Full Name</Text>
                <Text className='text-xs text-gray-500 font-semibold'>{tenantFullName}</Text>
            </View>
        </View>

        <View className='mt-4 flex-col space-y-3'>
            <View>
                <Text className='text-sm font-bold'>Property Owner Information</Text>
            </View>

            <View className='flex-col space-y-1'>
                <Text className='text-xs font-bold'>Full Name</Text>
                <Text className='text-xs text-gray-500 font-semibold'>{ownerFullName}</Text>
            </View>
        </View>

        <View className='mt-4 flex-col space-y-2'>
            <View>
                <Text className='text-sm font-bold'>Property Information</Text>
            </View>

            <View className='flex-col space-y-1 mt-2'>
                <Text className='text-xs font-bold'>Property Type</Text>
                <Text className='text-xs text-gray-500 font-semibold'>{property.propertyType}</Text>
            </View>

            <View className='flex-col space-y-1'>
                <Text className='text-xs font-bold'>Property Address</Text>
                <Text className='text-xs text-gray-500 font-semibold'>{property.propertyAdress}</Text>
            </View>

            <View className='flex-col space-y-1'>
                <Text className='text-xs font-bold'>Current Lease</Text>
                <Text className='text-xs text-gray-500 font-semibold'>{property.leaseStart} - {property.leaseEnd} </Text>
            </View>
        </View>

        <View className='mt-4 flex-col space-y-3'>
            <View>
                <Text className='text-sm font-bold'>Lease Extension Details</Text>
            </View>

            <Text className='text-xs font-bold mt-2'>Desired Extension Period</Text>
            <View className="w-full px-4 ">
              <CustomCheckbox
                label="Demo (1 minute)"
                checked={monthsPeriod}
                onChange={() => {
                  setExtensionPeriod('1 minute');
                  setYearPeriod(false);
                  setMonthsPeriod(true);
                }}
              />
              <CustomCheckbox
                label="6 months"
                checked={monthsPeriod}
                onChange={() => {
                  setExtensionPeriod('6 months');
                  setYearPeriod(false);
                  setMonthsPeriod(true);
                }}
              />
              <CustomCheckbox
                label="1 year"
                checked={yearPeriod}
                onChange={() => {
                  setExtensionPeriod('1 year');
                  setMonthsPeriod(false);
                  setYearPeriod(true);
                }}
              />
            </View>
        </View>

        <View className='mt-4 flex-col space-y-3'>
            <View>
                <Text className='text-xs font-bold'>Proposed Start Date of New Lease</Text>
            </View>

            <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className='bg-gray-100 border flex flex-row items-center justify-start space-x-2 my-5 border-gray-300 rounded-md p-2'
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

        <View className='flex-col absolute bottom-0 mx-8 w-full my-2 space-y-2'>
            <View>
                <Text className='text-xs font-normal text-gray-400'>By clicking "Submit," you agree to the terms of the lease extension request.</Text>
            </View>
            <View className='flex-row items-center w-full justify-between space-x-6'>
            <Pressable className='w-1/2'
                onPress={() => router.replace('../Notification')}
                >
                <View className=' py-3 items-center rounded-xl border w-full'>
                    <Text className=' font-bold text-xs'>Cancel</Text>
                </View>
            </Pressable>
            <Pressable className='w-1/2'
                onPress={() => router.replace('../Notification')}
                >
                <View className=' py-3 items-center rounded-xl bg-[#D9534F] w-full'>
                    <Text className='text-white font-bold text-xs'>Submit</Text>
                </View>
            </Pressable>
            </View>
        </View>

    </View>
  )
}