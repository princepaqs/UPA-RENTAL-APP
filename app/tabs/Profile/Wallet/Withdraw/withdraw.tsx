import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import walletData from '../walletData.json';
import ValidationModal from '../validationModal'; // Import the modal
import { getTransactionData, TransactionData } from '../secureStorage';
import * as FileSystem from 'expo-file-system'; 
import * as SecureStore from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '@/_dbconfig/dbconfig';

export default function Withdraw() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // To show specific error messages
  const [walletBalance, setWalletBalance] = useState<number>(0); // State to hold wallet balance
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);

  useEffect(() => {
    const loadTransactionData = async () => {
        const data = await getTransactionData();
        setTransactionData(data); // Set the array of transaction data

        // Load the wallet balance from the file
        await loadWalletData();
    };
    loadTransactionData();
  }, []);

  const loadWalletData = async () => {
      try {
        const uid = await SecureStore.getItemAsync('uid');
        if(uid){
          const walletRef = doc(db, 'wallets', uid);
          const walletSnap = await getDoc(walletRef);
  
          if (walletSnap.exists()) {
              const walletData = walletSnap.data();
              const currentBalance = walletData.balance || 0;
              setWalletBalance(currentBalance);
          }
        }
      } catch (error) {
    }
  }

  // const currentBalance = walletBalance;

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    // Validate the fields
    if (!amount || !bankName || !accountHolderName || !accountNumber || !emailAddress) {
      setErrorMessage('All fields are required.');
      setModalVisible(true); // Show the modal if any field is empty
    } else if (parseFloat(amount) > walletBalance) {
      setErrorMessage('Amount exceeds current balance!');
      setModalVisible(true); // Show modal if amount exceeds balance
    } else if (parseFloat(amount) === 0) {
      setErrorMessage('Amount cannot be zero!');
      setModalVisible(true); // Show modal if amount is zero
    } else if (!isValidEmail(emailAddress)) {
      setErrorMessage('Invalid email address.');
      setModalVisible(true); // Show modal if email is invalid
    } else {
      console.log(amount, bankName, accountHolderName, accountNumber, emailAddress);
      await SecureStore.setItemAsync('withdrawAmount', amount);
      await SecureStore.setItemAsync('bankName', bankName);
      await SecureStore.setItemAsync('accountHolderName', accountHolderName);
      await SecureStore.setItemAsync('accountNumber', accountNumber);
      await SecureStore.setItemAsync('emailAddress', emailAddress);
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
              {(amount && parseFloat(amount) > walletBalance) ? (
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
                <Text className='text-xs text-gray-500'>Current balance: {`Php ${walletBalance.toFixed(2)}`}</Text>
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
