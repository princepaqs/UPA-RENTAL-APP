import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import walletData from '../walletData.json';
import ValidationModal from '../validationModal'; // Import the modal

export default function Transfer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleContinue = () => {
    // Validate the fields
    if (!amount || !receiptName || !receiptEmail || !accountNumber) {
      setModalVisible(true); // Show the modal if any field is empty
    } else {
      router.push('./transferReviewTransaction');
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
              <Text className="text-sm font-bold text-center">Transfer</Text>
            </View>
          </View>

          {/* Transaction details */}
          <View className='px-6 mt-10 mb-28'>
            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Set Amount</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm text-center'
                keyboardType='number-pad'
                value={amount}
                onChangeText={setAmount}
              />
              <View className='p-3 flex flex-row gap-1'>
                <Ionicons name="wallet-outline" size={15} color="gray" />
                <Text className='text-xs text-gray-500'>Current balance: {`Php ${walletData.balance.toFixed(2)}`}</Text>
              </View>
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Receipt Name</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm'
                value={receiptName}
                onChangeText={setReceiptName}
              />
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Receipt Email</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm'
                value={receiptEmail}
                keyboardType='email-address'
                onChangeText={setReceiptEmail}
              />
            </View>

            <View className='flex flex-col'>
              <View className='p-3'>
                <Text className='text-sm font-bold'>Receipt Account Number</Text>
              </View>
              <TextInput
                className='px-4 bg-white py-1 rounded-2xl text-sm '
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType='number-pad'
              />
            </View>
          </View>

          <TouchableOpacity className='items-center' onPress={handleContinue}>
            <Text className='text-xs text-center py-3 rounded-2xl font-bold text-white w-4/5 bg-[#D9534F]'>Continue</Text>
          </TouchableOpacity>

          {/* Use the separate modal component */}
          <ValidationModal
            visible={modalVisible}
            message=''
            onClose={() => setModalVisible(false)}
          />
        </View>
      </View>
    </View>
  );
}