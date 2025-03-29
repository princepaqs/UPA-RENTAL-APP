import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';

// Define the type for CustomCheckbox props
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
}

export default function setTerms() {
  const router = useRouter();
  const [petPolicy, setPetPolicy] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [petAllowed, setPetAllowed] = useState(false);
  const [noPetsAllowed, setNoPetsAllowed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [contractData, setContractData] = useState<ContractData | null>(null);

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
            }
  
            setContractData(contractDetails);
          } catch (error) {
            
          }
        }
      
        fetchPropertyDetails()
      }, []);

  const handleContinue = async () => {

    if (!petPolicy || !houseRules) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    } else {
      if (!acceptTerms) {
        Alert.alert('Error', 'Please accept the terms and conditions first!');
        return;
      } else {
        setLoading(true); // Start loading
        
          setTimeout(async () => {
            if(contractData){
              console.log(contractData)
              await updateDoc(doc(db, 'properties', contractData?.uid, 'propertyId', contractData?.propertyId), {status: 'Available'}) // for demo purposes only
              router.replace('../Notification')
            }
            setLoading(false);
          }, 1500);
      }
    }
  };

  const isFormValid = () => {
    return petPolicy && houseRules && acceptTerms;
  };

  return (
    <View className="h-screen pt-4 px-8">
    <View className="flex-row items-center justify-between mt-10 pb-5 border-b border-gray-300">
      <TouchableOpacity onPress={() => router.replace('../Notification')}>
        <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
      </TouchableOpacity>
      <Text className="flex-1 text-xs font-bold text-center">Set Property Availability Date</Text>
    </View>

        

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-col justify-between mt-2 mb-2">
          <Text className="text-lg font-bold py-2">Terms and Conditions</Text>
          <Text className="text-xs">Add house rules, pet policies, and any other conditions.</Text>
        </View>
          <View className="mb-20 mt-2">
            {/* Pet Policy */}
            <View className="pt-4">
              <Text className="px-2 pb-1 text-xs font-semibold">Pet Policy</Text>
            </View>

            {/* Pet Allowed and No Pets Allowed Checkboxes */}
            <View className="pt-4 px-4 bg-[#D9D9D9] rounded-md">
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
            <View className="pt-4">
              <Text className="px-2 pb-1 text-xs font-semibold">House Rules</Text>
              <TextInput
                className="px-4 py-2 bg-[#D9D9D9] rounded-md text-xs"
                placeholder="Enter house rules"
                multiline
                numberOfLines={4}
                value={houseRules}
                onChangeText={setHouseRules}
              />
            </View>
          </View>
        </ScrollView>

        {/* Accept Terms Checkbox */}
        <View className="px-6 pt-4">
          <CustomCheckbox
            label="By submitting this form, you acknowledge that you have read, understood, and agree to the terms and conditions of the application."
            checked={acceptTerms}
            onChange={() => setAcceptTerms(!acceptTerms)}
          />
        </View>

        {/* Buttons */}
        <View className="px-6 pb-4">
          <View className="flex flex-row">
            <View className="flex flex-row pr-4 gap-1">
              <TouchableOpacity className="bg-[#333333] py-3 rounded-2xl w-1/2" onPress={() =>  router.replace('../Notification')}>
                <View>
                  <Text className="text-xs text-center text-white">Back</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 rounded-2xl w-1/2 ${isFormValid() ? 'bg-[#D9534F]' : 'bg-gray-400'}`}
                onPress={handleContinue}
                disabled={!isFormValid()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View>
                    <Text className="text-xs text-center text-white">SUBMIT</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
  );
}
