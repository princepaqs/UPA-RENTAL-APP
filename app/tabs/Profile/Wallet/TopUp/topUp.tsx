// TopUp.tsx

import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import walletData from '../walletData.json';
import { setAmount } from '../sharedData';
import CustomModal from '../WalletModal'; // Import the CustomModal
import { getTransactionData, TransactionData } from '../secureStorage'; 
import * as FileSystem from 'expo-file-system'; 
import * as SecureStore from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../../../../../_dbconfig/dbconfig'; // Import Firestore instance

const walletDataPath = FileSystem.documentDirectory + './walletData.json'; 
export default function TopUp() {
    const router = useRouter();
    const [amount, setLocalAmount] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
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
    /*
      try {
          // Check if the walletData.json file exists
          const fileExists = await FileSystem.getInfoAsync(walletDataPath);
  
          if (fileExists.exists) {
              // Read the wallet data
              const walletDataJson = await FileSystem.readAsStringAsync(walletDataPath);
              const walletData = JSON.parse(walletDataJson);
  
              // Set the wallet balance from the file
              setWalletBalance(walletData.balance);
          } else {
              // If the file doesn't exist, create it with an initial balance
              const initialData = { balance: 0 };
              await FileSystem.writeAsStringAsync(walletDataPath, JSON.stringify(initialData));
              setWalletBalance(0);
          }
      } catch (error) {
          console.error('Error loading wallet data:', error);
      }*/
  };

    const handleContinue = () => {
        const numericAmount = Number(amount);

        if (!amount || isNaN(numericAmount) || numericAmount < 20 || numericAmount > 100000) {
            setModalMessage("Please input a valid amount value (between Php 20 and Php 100,000)");
            setModalVisible(true);
        } else {
            setAmount(numericAmount);
            router.replace('./reviewTransaction');
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
                            <Text className="text-sm font-bold text-center">Wallet</Text>
                        </View>
                    </View>

                    <View className='px-6 mb-28'>
                        <View className='p-3'>
                            <Text className='text-lg font-bold'>Set Amount</Text>
                            <Text className='text-xs text-gray-500'>How much you want to top up?</Text>
                        </View>
                        <TextInput
                            className='px-4 bg-white py-2 rounded-2xl text-sm text-center'
                            keyboardType='number-pad'
                            value={amount}
                            onChangeText={setLocalAmount}
                        />
                        <View className='p-3'>
                            <Text className='text-xs text-gray-500'>Current balance : {`Php ${walletBalance.toFixed(2)}`} </Text>
                        </View>
                    </View>

                    <TouchableOpacity className='items-center pt-28 mt-28' onPress={handleContinue}>
                        <Text className='text-xs text-center py-3 rounded-2xl font-bold text-white w-4/5 bg-[#D9534F]'>Continue</Text>
                    </TouchableOpacity>

                    {/* Custom Modal for Alerts */}
                    <CustomModal 
                        visible={modalVisible} 
                        onClose={() => setModalVisible(false)} 
                        title="Wallet" 
                        message={modalMessage} 
                    />
                </View>
            </View>
        </View>
    );
}
