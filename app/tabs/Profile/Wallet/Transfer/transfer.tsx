import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import walletData from '../walletData.json';
import ValidationModal from '../validationModal'; // Import the modal
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';
import * as SecureStore from 'expo-secure-store';

export default function Transfer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountId, setAccountId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0); // State to hold wallet balance
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Validate the fields
    if (!amount || !receiptName || !receiptEmail || !accountNumber || parseInt(amount) > walletBalance || accountId === accountNumber) {
      console.log(amount, receiptName, receiptEmail, accountNumber, parseInt(amount), walletBalance)
      setModalVisible(true); // Show the modal if any field is empty
    } else {
      if(amount && receiptName && receiptEmail && accountNumber && parseInt(amount) < walletBalance){
        await SecureStore.setItemAsync('transferAmount', amount);
        await SecureStore.setItemAsync('transferReceiptName', receiptName);
        await SecureStore.setItemAsync('transferReceiptEmail', receiptEmail);
        await SecureStore.setItemAsync('transferAccountNumber', accountNumber);
        await SecureStore.setItemAsync('transactionType', 'Transfer');
        router.push('./transferReviewTransaction');
      }
    }
  };

  const loadWalletData = async () => {
      try {
        const uid = await SecureStore.getItemAsync('uid');
        const accountId = await SecureStore.getItemAsync('accountId') || '';
        if(uid){
          const walletRef = doc(db, 'wallets', uid);
          const walletSnap = await getDoc(walletRef);
  
          if (walletSnap.exists()) {
              const walletData = walletSnap.data();
              const currentBalance = walletData.balance || 0;
              setWalletBalance(currentBalance);
              setAccountId(accountId);
          }
        }
      } catch (error) {
    }
  }

  useEffect(() => {
    const fetchTransferData = async () => {
      if (!accountNumber) {
        loadWalletData()
        setReceiptName('');
        setReceiptEmail('');
        return;
      }

      setLoading(true); // Show loading state while fetching

      try {
        const userQuery = query(
          collection(db, 'users'),
          where('accountId', '==', accountNumber)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setReceiptName(`${userData.firstName} ${userData.middleName} ${userData.lastName}`);
          setReceiptEmail(userData.email);
        } else {
          setReceiptName('Account not found');
          setReceiptEmail('Email not found');
        }
      } catch (error) {
        console.error('Error fetching account data:', error);
        setReceiptName('Error fetching data');
        setReceiptEmail('');
      } finally {
        setLoading(false); // Hide loading state after fetching
      }
    };

    // Debounce the API call
    const debounceTimer = setTimeout(() => {
      fetchTransferData();
    }, 500); // Delay of 500ms

    return () => clearTimeout(debounceTimer); // Cleanup the timer
  }, [accountNumber]);

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        <View className="px-6">
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
          <View className="px-6 mt-10 mb-28">
            <View className="flex flex-col">
              <View className="p-3">
                <Text className="text-sm font-bold">Set Amount</Text>
              </View>
              {(amount && parseFloat(amount) > walletBalance) ? (
                <Text className='text-xs text-red-500 mb-2'>Amount exceeds current balance!</Text>
              ) : (amount === '0') && (
                <Text className='text-xs text-red-500 mb-2'>Amount cannot be zero!</Text>
              )}
              <TextInput
                className="px-4 bg-white py-1 rounded-2xl text-sm text-center"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <View className="p-3 flex flex-row gap-1">
                <Ionicons name="wallet-outline" size={15} color="gray" />
                <Text className="text-xs text-gray-500">Current balance: {`Php ${walletBalance.toFixed(2)}`}</Text>
              </View>
            </View>

            <View className="flex flex-col">
              <View className="p-3">
                <Text className="text-sm font-bold">Receipt Account Number</Text>
              </View>
              {(accountId && accountId === accountNumber) ? (
                <Text className='text-xs text-red-500 mb-2'>You cannot transfer money to yourself.</Text>
              ) : (accountNumber === '0') && (
                <Text className='text-xs text-red-500 mb-2'>Invalid Account Id</Text>
              )}
              <TextInput
                className="px-4 bg-white py-1 rounded-2xl text-sm"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                placeholder="Please input the account number"
              />
            </View>

            {loading && <Text className="text-sm text-gray-500">Checking account...</Text>}

            <View className="flex flex-col">
              <View className="p-3">
                <Text className="text-sm font-bold">Receipt Name</Text>
              </View>
              <TextInput
                className="px-4 bg-white py-1 rounded-2xl text-sm"
                value={receiptName}
                editable={false}
              />
            </View>

            <View className="flex flex-col">
              <View className="p-3">
                <Text className="text-sm font-bold">Receipt Email</Text>
              </View>
              <TextInput
                className="px-4 bg-white py-1 rounded-2xl text-sm"
                value={receiptEmail}
                keyboardType="email-address"
                editable={false}
              />
            </View>
          </View>

          <TouchableOpacity className="items-center" onPress={handleContinue}>
            <Text className="text-xs text-center py-3 rounded-2xl font-bold text-white w-4/5 bg-[#D9534F]">Continue</Text>
          </TouchableOpacity>

          <ValidationModal
            visible={modalVisible}
            message="Invalid or missing input fields"
            onClose={() => setModalVisible(false)}
          />
        </View>
      </View>
    </View>
  );
}
