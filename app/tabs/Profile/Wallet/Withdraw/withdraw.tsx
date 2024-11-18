import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import walletData from '../walletData.json';
import ValidationModal from '../validationModal'; // Import the modal

export default function Withdraw() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // To show specific error messages

  const currentBalance = walletData.balance;

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = () => {
    // Validate the fields
    if (!amount || !bankName || !accountHolderName || !accountNumber || !emailAddress) {
      setErrorMessage('All fields are required.');
      setModalVisible(true); // Show the modal if any field is empty
    } else if (parseFloat(amount) > currentBalance) {
      setErrorMessage('Amount exceeds current balance!');
      setModalVisible(true); // Show modal if amount exceeds balance
    } else if (parseFloat(amount) === 0) {
      setErrorMessage('Amount cannot be zero!');
      setModalVisible(true); // Show modal if amount is zero
    } else if (!isValidEmail(emailAddress)) {
      setErrorMessage('Invalid email address.');
      setModalVisible(true); // Show modal if email is invalid
    } else {
      router.replace('./withdrawReviewTransaction');
    }
  };

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        <View className='px-6'>
          <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center pr-5">
              <Text className="text-sm font-bold text-center">Withdraw</Text>
            </View>
          </View>

          {/* Transaction details */}
          <View className='px-6 mt-10 mb-12'>
            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Set Amount</Text>
              </View>
              {/* Warning message if amount exceeds balance */}
              {(amount && parseFloat(amount) > currentBalance) ? (
                <Text className='text-xs text-red-500 mb-2'>Amount exceeds current balance!</Text>
              ) : (amount === '0') && (
                <Text className='text-xs text-red-500 mb-2'>Amount cannot be zero!</Text>
              )}
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm text-center'
                keyboardType='number-pad'
                value={amount}
                onChangeText={setAmount}
              />
              <View className='p-3 flex flex-row gap-1'>
                <Ionicons name="wallet-outline" size={15} color="gray" />
                <Text className='text-xs text-gray-500'>Current balance: {`Php ${currentBalance.toFixed(2)}`}</Text>
              </View>
            </View>

            {/* Other input fields */}
            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Bank Name</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm'
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Account Number</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm'
                value={accountNumber}
                keyboardType='number-pad'
                onChangeText={setAccountNumber}
              />
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Account Holder Name</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm '
                value={accountHolderName}
                onChangeText={setAccountHolderName}
              />
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Email Address</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm '
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType='email-address'
              />
            </View>
          </View>

          <TouchableOpacity className='items-center' onPress={handleContinue}>
            <Text className='text-xs text-center py-3 rounded-2xl font-bold text-white w-4/5 bg-[#D9534F]'>Continue</Text>
          </TouchableOpacity>

          {/* Use the separate modal component */}
          <ValidationModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            message={errorMessage} // Pass the error message to the modal
          />
        </View>
      </View>
    </View>
  );
}
