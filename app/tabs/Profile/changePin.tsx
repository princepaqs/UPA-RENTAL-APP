import { View, Text, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import ChangePinModal from '../Modals/ChangePinModal'; 
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../_dbconfig/dbconfig';

export default function ChangePin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [loading, setLoading] = useState(false); // Loading state

  // Define the keys for the number pad
  const numberPadKeys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '⌫', '0', 'C', // Added "Clear" button
  ];

  // Function to handle PIN confirmation
  const handleSetPin = async () => {
    setLoading(true); // Start loading
    const tenantId = await SecureStore.getItemAsync('uid');
    if (pin && tenantId && pin.length === 6) {
      const userRef = doc(db, 'users', tenantId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const uPin = userData.userPin;
        await SecureStore.setItemAsync('oldPin', uPin);
        if (uPin === pin) {
          setModalVisible(false);
          router.replace('./changePinSetNew');
        } else {
          setModalVisible(true); // Show error modal
          setPin(''); 
        }
      }
    }
    setLoading(false); // Stop loading
  };

  // Function to handle adding a digit to the PIN
  const handleAddDigit = (key: string) => {
    if (key === '⌫') {
      setPin((prev) => prev.slice(0, -1)); // Remove last digit
    } else if (key === 'C') {
      setPin(''); // Clear the PIN
    } else if (pin.length < 6) {
      setPin((prev) => prev + key); // Add digit if PIN length is less than 6
    }
  };

  return (
    <View className='bg-[#B33939] flex-1'>
      <View className='h-screen bg-white px-6 mt-20 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Change Pin</Text>
          </View>
        </View>

        <View className='flex flex-col items-center mt-20 px-4'>
          <Text className='text-3xl font-bold text-center'>Confirm Current PIN</Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            Please enter your current PIN to proceed.
          </Text>
        </View>

        {/* Circle PIN Input Section */}
        <View className='flex flex-row justify-center space-x-5 mt-6 mb-8'>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index}>
              <View
                className={`w-6 h-6 border rounded-full justify-center items-center ${
                  index < pin.length ? 'bg-[#333333]' : 'border-gray-400'
                }`}
              />
            </View>
          ))}
        </View>

        {/* Number Pad Section */}
        <View className='flex flex-col items-center'>
          {numberPadKeys.reduce<string[][]>((rows, key, index) => {
            if (index % 3 === 0) {
              rows.push([]);
            }
            rows[rows.length - 1].push(key);
            return rows;
          }, []).map((row, rowIndex) => (
            <View key={rowIndex} className='flex flex-row justify-center'>
              {row.map((key, index) => (
                <Pressable
                  key={index}
                  className='w-16 h-16 bg-[#D9534F] rounded-full flex justify-center items-center m-2.5'
                  onPress={() => handleAddDigit(key)}
                >
                  <Text className='text-2xl text-white font-normal'>{key}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Confirm Button */}
        <View className='flex flex-col items-center justify-center mx-5 mt-10'>
          <TouchableOpacity
            className={`w-1/3 py-3 px-4 flex items-center ${
              pin.length === 6 ? 'bg-[#D9534F]' : 'bg-gray-400'
            } rounded-xl`}
            onPress={handleSetPin}
            disabled={pin.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className='text-xs text-white font-bold'>Confirm PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for incorrect PIN */}
      <ChangePinModal
        visible={modalVisible}
        message="Incorrect PIN. Please try again."
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
