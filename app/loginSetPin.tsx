import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import * as SecureStore from 'expo-secure-store';

// Define the keys for the number pad
const numberPadKeys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '⌫', '0', 'C', // Added "Clear" button
];

export default function LoginSetPin() {
  const router = useRouter();
  const { setPin, sendMessageUPA } = useAuth();
  const [pin, setPinNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Function to handle the button press
  const handleSetPin = () => {
    if (pin.length === 6) {
      setLoading(true); // Start loading
      // Simulate an async operation like setting PIN or communicating with server
      setTimeout(async () => {
        setPin(pin);
        setLoading(false); // Stop loading
        setError(''); // Clear any previous error
        const messageSenderId = await SecureStore.getItemAsync('uid');
      if(messageSenderId){
        sendMessageUPA(messageSenderId, 'Welcome!');
        console.log('Message UPA sent')
      }
        router.replace('/loginPin');
      }, 2000); // Simulating 2 seconds delay
    } else {
      setError('Please enter a 6-digit PIN');
    }
  };

  const handleChange = (key: string) => {
    if (key === 'C') {
      setPinNumber(''); // Clear the PIN
    } else if (key === '⌫') {
      setPinNumber(prevPin => prevPin.slice(0, -1)); // Remove the last digit
    } else if (/^\d$/.test(key)) {
      setPinNumber(prevPin => (prevPin.length < 6 ? prevPin + key : prevPin)); // Add digits, limit to 6
    }
  };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white px-6 mt-28 rounded-t-2xl'>
        <View className='flex flex-col space-y-1 items-center mt-10 px-6'>
          <Text className='text-2xl font-bold text-center'>Enter a 6-Digit PIN</Text>
          <Text className='text-xs text-[#B5B5B5] font-semibold text-center'>
            Create a secure 6-digit PIN that you will use to protect your account.
          </Text>
        </View>

        {/* Circle PIN Input Section */}
        <View className='flex flex-row justify-center space-x-5 my-10'>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index}>
              <View
                className={`w-6 h-6 border rounded-full justify-center items-center ${
                  index < pin.length ? 'bg-black' : 'border-gray-400'
                }`}
              />
            </View>
          ))}
        </View>

        {/* Numeric Keypad */}
                <View className='flex flex-col items-center'>
          {numberPadKeys.reduce<string[][]>((rows, key, index) => {
            // Create a new row for every three keys
            if (index % 3 === 0) {
              rows.push([]); // Create a new row
            }
            rows[rows.length - 1].push(key); // Add key to the last row
            return rows; // Return the updated rows
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

        <View className='mt-5 flex flex-col items-center justify-center mx-5'>
          {/* Button with loading spinner inside */}
          <TouchableOpacity
            className={`w-full py-3.5 flex items-center justify-center ${
              pin.length === 6 ? 'bg-[#D9534F]' : 'bg-gray-400'
            } rounded-xl`}
            onPress={handleSetPin}
            disabled={pin.length !== 6 || loading} // Disable button if PIN is not 6 digits or loading is true
          >
            {loading ? (
              <ActivityIndicator size='small' color='#ffffff' /> // Show spinner inside the button
            ) : (
              <Text className='text-xs text-white font-bold'>Set PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
