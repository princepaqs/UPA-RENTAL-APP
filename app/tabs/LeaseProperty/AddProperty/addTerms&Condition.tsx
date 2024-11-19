import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import * as SecureStore from 'expo-secure-store';

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

export default function AddTerms() {
  const router = useRouter();
  const [petPolicy, setPetPolicy] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [petAllowed, setPetAllowed] = useState(false);
  const [noPetsAllowed, setNoPetsAllowed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const { addProperty } = useAuth();

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
        try {
          await SecureStore.setItemAsync('propertyPetPolicy', petPolicy);
          await SecureStore.setItemAsync('propertyHouseRules', houseRules);
          await addProperty();
        } catch (error) {
          Alert.alert('Error!', 'Something went wrong.');
        } finally {
          setLoading(false); // Stop loading
        }
      }
    }
  };

  const isFormValid = () => {
    return petPolicy && houseRules && acceptTerms;
  };

  return (
    <View className="flex-1 bg-[#B33939]">
      <View className="flex-1 bg-white px-6 mt-14 rounded-t-2xl">
        <View className="flex flex-row items-center justify-between px-6 pt-8">
          <TouchableOpacity onPress={() => router.replace('../PropertyDashboard')}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-lg font-semibold text-center">Add Property</Text>
          </View>
        </View>

        <View className="flex flex-col justify-between mt-5 pt-3 pb-1 border-t mb-2">
          <Text className="text-lg font-bold py-2">Terms and Conditions</Text>
          <Text className="text-xs">Add house rules, pet policies, and any other conditions.</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="mb-20 mt-2">
            {/* Pet Policy */}
            <View className="pt-4">
              <Text className="px-2 pb-1 text-xs font-semibold">Pet Policy</Text>
            </View>

            {/* Pet Allowed and No Pets Allowed Checkboxes */}
            <View className="pt-4 px-4 bg-gray-100 rounded-md">
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
                className="px-4 py-2 bg-gray-100 rounded-md text-xs"
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
              <TouchableOpacity className="bg-[#333333] py-3 rounded-md w-1/2" onPress={() => router.back()}>
                <View>
                  <Text className="text-xs text-center text-white">Back</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 rounded-md w-1/2 ${isFormValid() ? 'bg-[#B33939]' : 'bg-gray-400'}`}
                onPress={handleContinue}
                disabled={!isFormValid()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View>
                    <Text className="text-xs text-center text-white">Submit</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
