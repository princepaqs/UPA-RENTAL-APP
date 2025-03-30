import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json';
import { getAmount } from '../sharedData';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';
import { saveTransactionData } from '../secureStorage';
import { useAuth } from '@/context/authContext';

export default function WithdrawReviewTransaction() {
  const router = useRouter();
  const { sendNotification } = useAuth()
  // const amount = getAmount(); // Get the amount from the shared data
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string>(''); 
  const [name, setName] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [bankName, setBank] = useState<string>(''); 
  const [withdrawAmount, setWithdrawAmount] = useState<string>(''); 
  const [accountHolderName, setAccountHolderName] = useState<string>(''); 
  const [accountNumber, setAccountNumber] = useState<string>(''); 
  const [emailAddress, setEmailAddress] = useState<string>(''); 
  
  
  const type = 'Withdraw'

  const handleContinue = async () => {
    // setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    //   router.replace('./withdrawReceipt'); 
    // }, 1000);
    try {
      if(tenantId){
        setLoading(true);
        await saveTransactionData(transactionData);
        await SecureStore.setItemAsync('routes', '/Withdraw/withdrawReceipt')
        await SecureStore.setItemAsync('transactionType', 'Withdraw')
        await SecureStore.setItemAsync('transactionPaymentId', '')
        await SecureStore.setItemAsync('transactionDate', transactionData.dateTime);
        await SecureStore.setItemAsync('transactionAmount', transactionData.total.toString())
        await SecureStore.setItemAsync('transactionStatus', '')
        setLoading(false); // Reset loading state after saving data
        router.replace('../walletPin');
      }else{
        Alert.alert('Error', 'Wallet transaction failed.')
        const tenantId = await SecureStore.getItemAsync('uid');
        if(tenantId){
            sendNotification(tenantId, 'wallet-withdraw-failed', 'Withdraw Unsuccessful', `Your wallet withdraw attempt of ₱${transactionData.total.toString()} was unsuccessful. Please check your payment details and try again.`, 'Rejected', 'Unread','','');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Wallet transaction failed.')
    }
  };

  // Generate unique Transaction ID
  const generateTransactionID = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
    return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
  };

  // Get current date and time
  const getCurrentDateTime = () => {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    }); // Formats the date and time based on the user's locale
  };

  const transactionData = {
    transactionID: generateTransactionID(),
    uid: tenantId,
    name,
    email,
    dateTime: getCurrentDateTime(),
    type,
    bankName,
    accountHolderName,
    accountNumber,
    emailAddress,
    amount: parseInt(withdrawAmount),
    total : parseFloat(withdrawAmount) + 50,
  };

  useEffect(() => {
    const fetchUser = async () => {
        const tenantId = await SecureStore.getItemAsync('uid');
        if(tenantId){
            setTenantId(tenantId);
            const userRef = await getDoc(doc(db, 'users', tenantId));
            if(userRef.exists()){
                const data = userRef.data();
                if(data){
                    const bankName = await SecureStore.getItemAsync('bankName'); setBank(bankName || '');
                    const withdrawAmount = await SecureStore.getItemAsync('withdrawAmount'); setWithdrawAmount(withdrawAmount || '');
                    const accountHolderName = await SecureStore.getItemAsync('accountHolderName'); setAccountHolderName(accountHolderName || '');
                    const accountNumber = await SecureStore.getItemAsync('accountNumber'); setAccountNumber(accountNumber || '');
                    const emailAddress = await SecureStore.getItemAsync('emailAddress'); setEmailAddress(emailAddress || '');
                    setName(`${data.firstName} ${data.middleName} ${data.lastName}`)
                    setEmail(data.email);
                }
            }
        }
    }
      fetchUser();
  }, [])

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
              <Text className="text-sm font-bold text-center">Review Transaction</Text>
            </View>
          </View>

          {/* Withdraw Details */}
          <View className='px-6 pt-10 mb-6'>
            <Text className='text-sm font-bold px-4'>Withdraw Details</Text>
            <View className='bg-white flex flex-col space-y-2 p-5 rounded-xl my-2'>
              <Text className='text-xs text-gray-500'>Transaction ID: {transactionData.transactionID}</Text>
              <Text className='text-xs text-gray-500'>Date Time: {transactionData.dateTime}</Text> 
              <Text className='text-xs text-gray-500'>Bank Name: {transactionData.bankName}</Text>
              <Text className='text-xs text-gray-500'>Account Number: {transactionData.accountNumber}</Text>
              <Text className='text-xs text-gray-500'>Account Holder Name: {transactionData.accountHolderName}</Text>
              <Text className='text-xs text-gray-500'>Email: {transactionData.emailAddress}</Text>
              <Text className='text-xs text-gray-500'>Withdraw Amount: ₱ {transactionData.amount}</Text>
              <Text className='text-xs text-gray-500'>Fee: ₱ {transferData.fee}</Text>
              <Text className='text-xs text-gray-500'>TOTAL: ₱ {transactionData.total}</Text>
            </View>
          </View>

          <View className='flex flex-col space-y-2 pt-20 px-6'>
            <Text className='px-4 text-xs text-gray-500'>By clicking confirm, I confirm that above details are correct.</Text>
            
            {loading ? ( // Show loading indicator when loading is true
              <ActivityIndicator size={30} color="#D9534F" />
            ) : (
              <TouchableOpacity className='w-full items-center rounded-2xl bg-[#D9534F]' onPress={handleContinue}>
                <Text className='text-xs text-center py-3 font-bold text-white'>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
