import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StayLoggedInModal from '../Modals/StayLoggedInModal'; // Import the modal component
import { useAuth } from '../../../context/authContext';
import * as SecureStore from 'expo-secure-store';

// Define the keys for the number pad
const numberPadKeys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '⌫', '0', 'C', // Added "Clear" button
];

export default function ChangePin() {
  const router = useRouter();
  const { setPin } = useAuth();
  const [pin, setPinNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const inputRef = useRef<TextInput>(null); // Ref to control the TextInput

  // Function to handle the button press
  const handleSetNewPin = async () => {
    const newPin = await SecureStore.getItemAsync('newPin');
    if (pin.length === 6 && newPin == pin) {
      setLoading(true); // Start loading
      setTimeout(() => {
        setPin(pin);
        setLoading(false); // Simulate completion of setting new PIN
        setModalVisible(true); // Show the modal
      }, 2000); // Simulate a delay (e.g., 2 seconds)
    } else if (pin.length === 6 && newPin !== pin){
      setError('Please enter the correct PIN');
    }else {
      setError('Please enter a 6-digit PIN');
    }
  };

  // Function to handle input change
  const handleChange = (key: string) => {
    if (key === 'C') {
      setPinNumber(''); // Clear the PIN
    } else if (key === '⌫') {
      setPinNumber(prevPin => prevPin.slice(0, -1)); // Remove the last digit
    } else if (/^\d$/.test(key)) {
      // Allow only digits and limit input to 6 digits
      setPinNumber(prevPin => {
        const newPin = prevPin.length < 6 ? prevPin + key : prevPin; // Ensure length is limited to 6
        return newPin;
      });
    }
  };

  // Function to focus on the hidden TextInput when user taps on a circle
  const handleCirclePress = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // Programmatically focus on the TextInput
    }
  };

  // Handle modal actions
  const handleYes = () => {
    setModalVisible(false);
    router.replace('/tabs/Dashboard'); // Navigate to dashboard if user stays logged in
  };

  const handleNo = () => {
    setModalVisible(false);
    router.replace('/signIn'); // Navigate to sign-in if user logs out
  };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen items-center justify-center bg-white px-6 mt-20 rounded-t-2xl'>
        <View className='absolute top-10 flex-row items-center justify-between px-6 '>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Change Pin</Text>
          </View>
        </View>
        
        <View className='flex flex-col items-center px-4'>
          <Text className='text-3xl font-bold text-center'>Confirm New PIN</Text>
          <Text className='text-sm text-[#B5B5B5] font-bold text-center'>
            Enter the new PIN to confirm the account.
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
                  onPress={() => handleChange(key)}
                >
                  <Text className='text-2xl text-white font-normal'>{key}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Error message */}
        {error ? (
          <Text className='text-red-500 text-center mt-4'>{error}</Text>
        ) : null}

        {/* Set New PIN Button */}
        <View className='flex flex-col items-center justify-center mx-5 mt-10'>
          <TouchableOpacity
            className={`w-1/3 py-3 px-4 flex items-center ${
              pin.length === 6 ? 'bg-[#D9534F]' : 'bg-gray-400'
            } rounded-xl`}
            onPress={handleSetNewPin}
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
      {/* Stay Logged In Modal */}
      <StayLoggedInModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onYes={handleYes}
        onNo={handleNo}
      />
    </View>
  );
}
