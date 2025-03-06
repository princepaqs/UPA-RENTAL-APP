import { View, Text, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import walletData from './walletData.json'; // Adjust the path as needed
import * as FileSystem from 'expo-file-system'; // Import FileSystem for reading/writing files
import { getTransactionData } from './secureStorage'; 
import * as SecureStore from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../../../../_dbconfig/dbconfig'; // Import Firestore instance


const walletDataPath = FileSystem.documentDirectory + './walletData.json'; // Path to walletData.json file

interface TransactionData {
  uid: string;
  transactionId: string;
  transactionType: string;
  dateTime: string;
  value: number;  // Ensure total is a number
}

export default function Wallet() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number>(0); // State to hold wallet balance
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]); 
  
  useEffect(() => {
    const loadTransactionData = async () => {
      const data = await getTransactionData();
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setTransactionData(data); // Safe to set as TransactionData[]
      } else {
        setTransactionData([]); // Fallback to an empty array if the result isn't an array
      }
  
      // Load the wallet balance from the file
      await loadWalletData();
    };
  
    loadTransactionData();
    loadWalletTransactions();
  }, []);
  

  const loadWalletData = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
      if (uid) {
        const walletRef = doc(db, 'wallets', uid);
  
        // Listen for real-time updates
        const unsubscribe = onSnapshot(walletRef, (walletSnap) => {
          if (walletSnap.exists()) {
            const walletData = walletSnap.data();
            const currentBalance = walletData.balance || 0;
            setWalletBalance(currentBalance);
          } else {
            console.error('No wallet found for this user.');
            setWalletBalance(0); // Default to zero if no document exists
          }
        });
  
        // Optional: Return the unsubscribe function to stop listening when not needed
        return unsubscribe;
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const loadWalletTransactions = async () => {
  try {
    const uid = await SecureStore.getItemAsync("uid");

    if (uid) {
      const transactionsQuery = query(
        collection(db, "walletTransactions", uid, "walletId"),
        where("uid", "==", uid)
      );
      const querySnapshot = await getDocs(transactionsQuery);

      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let formattedDate: Date | null = null;

        // Check if date is in "MM/DD/YYYY, hh:mm:ss AM/PM" format
        if (/^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}(:\d{2})? [APM]{2}$/.test(data.date)) {
          const [datePart, timePart] = data.date.split(", ");
          const [month, day, year] = datePart.split("/").map(Number);
          const [time, meridian] = timePart.split(" ");
          let [hours, minutes] = time.split(":").map(Number);

          if (meridian === "PM" && hours !== 12) hours += 12;
          if (meridian === "AM" && hours === 12) hours = 0;

          formattedDate = new Date(year, month - 1, day, hours, minutes);
        }

        return {
          uid: data.uid,
          transactionId: doc.id,
          transactionType: data.transactionType,
          dateTime: data.date,
          value: parseInt(data.value),
          dateObject: formattedDate || new Date(0), // Default to epoch if parsing fails
        };
      });

      // Sort transactions by date in descending order (latest → oldest)
      transactions.sort((b, a) => a.dateObject.getTime() - b.dateObject.getTime());

      console.log(transactions.length);
      console.log(transactions);
      setTransactionData(transactions as TransactionData[]);
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
};

  
  
  
  

  // Function to determine color based on transaction type
  const getColorByType = (type: string) => {
    switch (type) {
      case 'Top Up':
        return 'text-green-500';
      case 'Withdraw':
        return 'text-red-500';
      case 'Payment':
        return 'text-orange-500';
      case 'Transfer':
        return 'text-gray-500';
      default:
        return 'text-black';
    }
  };

  // Function to determine the prefix (whether "+" or "-") based on type
  const formatAmountByType = (type: string, amount: number) => {
    const formattedAmount = `Php ${amount.toLocaleString()}`;
    return type === 'Top Up' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadWalletData();          // Reload wallet balance
      await loadWalletTransactions();   // Reload transactions
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false); // Stop the refreshing animation
    }
  }, []);

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="h-screen bg-gray-100 mt-14 pb-28 rounded-t-2xl flex-1">
        <View className='px-6'>

          {/* Header */}
          <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
            {/* change later  */}
            <TouchableOpacity onPress={() => router.replace('../../Dashboard')}> 
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center pr-5">
              <Text className="text-sm font-bold text-center">Wallet</Text>
            </View>
          </View>

          {/* BALANCE */}
          <View className='bg-[#B33939] flex flex-col space-y-2 p-7 rounded-xl'>
            <View className='flex flex-row items-center space-x-2'>
              <Ionicons name="wallet-outline" size={20} color="white" />
              <Text className='text-white text-xs'>Current Balance</Text>
            </View>
            <Text className='text-3xl text-white font-semibold'>{`Php ${walletBalance.toLocaleString()}`}</Text>
          </View>

          {/* Menu buttons */}
          <View className='flex flex-row items-center justify-between py-5 px-3 border-b mb-2 border-gray-600'>
            <View className='flex flex-col items-center space-y-1'>
              <TouchableOpacity className='p-2.5 bg-[#333333] rounded-full' 
              onPress={async () => {
                router.push('./TopUp/topUp')
                }}>
                <Feather name="plus" size={30} color="white" />
              </TouchableOpacity>
              <Text className='text-xs'>Top up</Text>
            </View>

            <View className='flex flex-col items-center space-y-1'>
              <TouchableOpacity className='p-2.5 bg-[#333333] rounded-full'
              onPress={async () => {
                router.push('./Withdraw/withdraw')
                }}>
                <Feather name="minus" size={30} color="white" />
              </TouchableOpacity>
              <Text className='text-xs'>Withdraw</Text>
            </View>

            <View className='flex flex-col items-center space-y-1'>
              <TouchableOpacity className='p-2.5 bg-[#333333] rounded-full'
              onPress={async () => {
                router.push('./Payment/payment')
                }}>
                <Feather name="arrow-up" size={30} color="white" />
              </TouchableOpacity>
              <Text className='text-xs'>Payment</Text>
            </View>

            <View className='flex flex-col items-center space-y-1'>
              <TouchableOpacity className='p-2.5 bg-[#333333] rounded-full'
              onPress={async () => {
                router.push('./Transfer/transfer')
                }}>
                <AntDesign name="swap" size={30} color="white" />
              </TouchableOpacity>
              <Text className='text-xs'>Transfer</Text>
            </View>
          </View>

          {/* All Transactions List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className='px-5 min-h-screen'>
              <Text className='text-lg font-bold'>Transactions</Text>

              {transactionData.length === 0 ? (
                <Text className='text-center text-sm text-gray-500 mt-4'>
                  You don’t have any transactions yet. Start by making your first transaction.
                </Text>
              ) : (
                transactionData.map((transaction) => (
                  <View key={transaction.transactionId} className='p-3 bg-white flex flex-col space-y-1 rounded-xl mt-4'>
                    <View className='flex flex-row items-center justify-between'>
                      <Text className='text-sm font-bold'>{transaction.transactionType}</Text>
                      <Text className={`text-xs font-bold ${getColorByType(transaction.transactionType)}`}>
                        {formatAmountByType(transaction.transactionType, transaction.value)}
                      </Text>
                    </View>
                    <Text className='text-xs text-gray-500'>{transaction.dateTime}</Text>
                  </View>
                ))
              )}

              {/* Dummy view at the bottom to ensure visibility */}
              <View className="h-60" />
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
