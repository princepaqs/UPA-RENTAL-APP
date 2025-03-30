import { View, Text, TouchableOpacity, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';

interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onChange: () => void;
  }
  
  // CustomCheckbox component with TypeScript
  const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange }) => (
    <TouchableOpacity onPress={onChange} className="flex flex-row items-center mb-4">
      <View className={`w-3 h-3 border-2 ${checked ? 'bg-gray-800 border-black' : 'bg-white border-gray-400'} rounded-md mr-2`}>
        {checked && <View className="w-3 h-3" />}
      </View>
      <Text className={`text-xs text-start ${checked ? 'text-black' : 'text-gray-500'}`}>{label}</Text>
    </TouchableOpacity>
  );

  interface ContractData {
    propertyId: string;
    uid: string;
    tenantId: string;
    propertyHomeAddress: string;
    propertyType: string;
    ownerFullName: string;
    tenantFullName: string;
    transactionId: string;
    rentalStartDate: string;
    rentalEndDate: string;
    propertyMonthlyRent: string;
    propertyPetPolicy: string;
    propertyHouseRules: string;
    propertyLeaseDuration: string;
  }

export default function rentalDetails() {
    const router = useRouter();
    const [petPolicy, setPetPolicy] = useState('');
    const [petAllowed, setPetAllowed] = useState(false);
    const [noPetsAllowed, setNoPetsAllowed] = useState(false);
    const [houseRules, setHouseRules] = useState('');
    const [contractData, setContractData] = useState<ContractData | null>(null);

    const [leaseDuration, setLeaseDuration] = useState("Demo (1 minute)");
    const [isLeaseDropdownVisible, setLeaseDropdownVisible] = useState(false);
    const leaseDurations = ["Demo (1 minute)", "Short-term (6 months)", "Long-term (1 year)"];

    // const monthlyRent = 10000;
    // const Rules = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, nostrum? A deserunt quod aliquam ab nesciunt modi dolorum! Officiis quod quia nesciunt esse sint cum maiores velit modi laudantium quae!"

    useEffect(() => {
          const fetchPropertyDetails = async() => {
            try {
              const uid = await SecureStore.getItemAsync('uid');
              const propertyId = await SecureStore.getItemAsync('extensionPropertyId');
              const tenantId = await SecureStore.getItemAsync('extensionTenantId');
              console.log(uid, propertyId, tenantId);
        
              if(!uid || !propertyId || !tenantId) {
                return
              }
        
              const propertyRef = await getDoc(doc(db, 'properties', uid, 'propertyId', propertyId))
              const tenantRef = await getDoc(doc(db, 'users', tenantId))
              const ownerRef = await getDoc(doc(db, 'users', uid))
        
              if(!propertyRef.exists() || !tenantRef.exists() || !ownerRef.exists()){
                return;
              }
        
              const propertyData = propertyRef.data();
              const tenantData = tenantRef.data();
              const ownerData = ownerRef.data();
              const transactionId = `${uid}-${propertyId}-${tenantId}`;
              if(!propertyData || !tenantData || !ownerData || !transactionId) {
                return;
              }
        
              const transactionRef = await getDoc(doc(db, 'propertyTransactions', transactionId))
              
              if(!transactionRef.exists()){
                return;
              }
        
              const transactionData = transactionRef.data();
        
              if(!transactionData) {
                return;
              }
        
              const contractDetails = {
                propertyId,
                uid,
                tenantId,
                propertyHomeAddress: `${propertyData.propertyHomeAddress}, ${propertyData.propertyBarangay}, ${propertyData.propertyCity}, ${propertyData.propertyRegion}`,
                propertyType: propertyData.propertyType,
                ownerFullName: `${ownerData.firstName} ${ownerData.middleName} ${ownerData.lastName}`,
                tenantFullName: `${tenantData.firstName} ${tenantData.middleName} ${tenantData.lastName}`,
                transactionId,
                rentalStartDate: transactionData.rentalStartDate,
                rentalEndDate: transactionData.rentalEndDate,
                propertyMonthlyRent: propertyData.propertyMonthlyRent,
                propertyPetPolicy: propertyData.propertyPetPolicy,
                propertyHouseRules: propertyData.propertyHouseRules,
                propertyLeaseDuration: propertyData.propertyLeaseDuration,
              }
    
              setContractData(contractDetails);
            } catch (error) {
              
            }
          }
        
          fetchPropertyDetails()
        }, []);

  return (
    <View className="h-screen py-4 px-8">
      <View className="flex-row items-center justify-between mt-10 pb-5 border-b border-gray-300">
        <TouchableOpacity onPress={() => router.replace('../Notification')}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-xs font-bold text-center">Lease Extension Request Form</Text>
      </View>

    <ScrollView showsVerticalScrollIndicator={false}>
      <View className='mt-5 flex-col space-y-2'>
        <Text className='text-xl font-bold'>Rentals Details</Text>
        <Text className='text-xs'>Set the monthly rent and lease duration.</Text>
      </View>

      <View className='mt-6 flex-col space-y-4'>
        <View className='flex-col space-y-1'>
            <View className='px-4'>
                <Text className='text-xs font-bold'>Monthly Rent Price</Text>
            </View>
            <View className='w-full px-4 py-3 bg-[#D9D9D9] rounded-2xl'>
                <Text className='text-xs font-semibold text-gray-500'>₱ {contractData?.propertyMonthlyRent}</Text>
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
                <View className='mt-1 bg-[#D9D9D9] rounded-md shadow-md p-1'>
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
      </View>

      <View className='mt-5 flex-col space-y-2'>
        <Text className='text-xl font-bold'>Terms and Conditions</Text>
        <Text className='text-xs'>Add house rules, pet policies, and any other conditions.</Text>
      </View>

            {/* Pet Policy */}
            <View className="mt-3">
              <Text className="px-2 pb-1 text-xs font-semibold">Pet Policy</Text>
            </View>

            {/* Pet Allowed and No Pets Allowed Checkboxes */}
            <View className="w-full px-4 pt-4 bg-[#D9D9D9] rounded-2xl">
              <CustomCheckbox
                label="Pets Allowed"
                checked={petAllowed}
                onChange={() => {
                  setPetPolicy('Pets allowed');
                  setNoPetsAllowed(false);
                  setPetAllowed(true);
                }}
              />
              <CustomCheckbox
                label="No Pets Allowed"
                checked={noPetsAllowed}
                onChange={() => {
                  setPetPolicy('No pets allowed');
                  setPetAllowed(false);
                  setNoPetsAllowed(true);
                }}
              />
            </View>
        
            {/* House Rules */}
            <View className='flex-col space-y-1 mt-3'>
                <View className='px-4'>
                    <Text className='text-xs font-bold'>House Rules</Text>
                </View>
                <View className='w-full px-4 py-3 bg-[#D9D9D9] rounded-2xl'>
                    <Text className='text-xs font-semibold text-gray-500'>{contractData?.propertyHouseRules}</Text>
                </View>
            </View>
    </ScrollView>
            <Pressable className='absolute bottom-0 mx-6 w-full my-2'
                onPress={() => router.replace('./contractQuestion')}
                >
                <View className=' py-3 items-center rounded-xl bg-[#D9534F] w-full'>
                    <Text className='text-white font-bold text-xs'>Next</Text>
                </View>
            </Pressable>
    </View>
  )
}