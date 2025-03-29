import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { AntDesign, Feather, FontAwesome5, FontAwesome6, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../../../../_dbconfig/dbconfig'; // Import Firestore instance

const properties = [
  { id: '1', type: 'Payment', desciption: 'Payment - Rent', dateTime: 'January 1, 2025 12:01 AM', name: 'Paquiado', price: '5,000', status: 'Available', location: 'Caloocan City, Metro Manila' },
  { id: '2', type: 'Transfer', desciption: 'Transfer to Wallet', dateTime: 'January 1, 2025 12:01 AM', name: 'John Doe', price: '10,000', status: 'Rented', location: 'Makati City, Metro Manila' },
  { id: '3', type: 'Payment', desciption: 'Payment - Deposite & Advance', dateTime: 'January 1, 2025 12:01 AM', name: 'Jane Smith', price: '7,500', status: 'Available', location: 'Quezon City, Metro Manila' },
];

interface Revenue {
  id: string;
  transactionId: string;
  type: string;
  value: number;
  createdAt: Timestamp;
}

export default function revenue() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [revenueBalance, setRevenueBalance] = useState(0);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);
  const [filteredProperties, setFilteredProperties] = useState(revenueData);
  const inputWidth = useRef(new Animated.Value(40)).current;

  // Handle search input change
  const handleTextChange = (text: string) => {
    setSearchText(text);

    Animated.timing(inputWidth, {
      toValue: text.length > 0 ? 100 : 40, 
      duration: 200,
      useNativeDriver: false,
    }).start();

    const filtered = revenueData.filter(revenue =>
      revenue.id.toLowerCase().includes(text.toLowerCase()) || 
      revenue.type.toLowerCase().includes(text.toLowerCase()) ||
      revenue.value.toString().toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

    // Function to determine color based on transaction type
    const getColorByType = (type: string) => {
      switch (type) {
        case 'Transfer':
          return 'text-red-500';
        default:
          return 'text-green-500';
      }
    };
  
    // Function to determine the prefix (whether "+" or "-") based on type
    const formatAmountByType = (type: string, amount: number) => {
      const formattedAmount = `Php ${amount.toLocaleString()}`;
      return type === 'Transfer' ? `-${formattedAmount}` : `+${formattedAmount}`;
    };

    useEffect(() => {
      const fetchRevenueRealtime = async () => {
        try {
          const uid = await SecureStore.getItemAsync('uid');
          if (uid) {
            // Real-time listener for the wallet document
            const walletUnsubscribe = onSnapshot(doc(db, 'wallets', uid), (docSnapshot) => {
              if (docSnapshot.exists()) {
                const walletData = docSnapshot.data();
                if (walletData) {
                  const totalRevenue = walletData.revenueBalance;
                  setRevenueBalance(totalRevenue);
                }
              }
            });
    
            // Real-time listener for the revenues subcollection
            const revenueUnsubscribe = onSnapshot(
              collection(db, 'revenues', uid, 'revenueId'),
              (snapshot) => {
                const revenues = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    uid: data.uid,
                    type: data.paymentPurpose || '',
                    transactionId: data.TransactionID || '',
                    value: data.amount || 0,
                    createdAt: data.dateTime || Timestamp.now(),
                  };
                });
    
                // Updating states
                setRevenueData(revenues as Revenue[]);
                setFilteredProperties(revenues as Revenue[]); // Sync filtered data initially
              }
            );
    
            // Cleanup on unmount
            return () => {
              walletUnsubscribe();
              revenueUnsubscribe();
            };
          }
        } catch (error) {
          console.error('Error loading revenues in real-time:', error);
        }
      };
    
      fetchRevenueRealtime();
    }, []);
    
    
  

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
      <View className='flex flex-row items-center justify-between px-6 pt-8 border-b border-gray-400 pb-4 '>
          
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-semibold text-center'>Revenue</Text>
          </View>
          
        </View>

        <View className='p-4 bg-[#333333] rounded-xl my-4'>
          <View className='flex-row space-x-2'>
            <AntDesign name="wallet" size={15} color="white" />
            <Text className='text-white text-xs'>Total Earnings</Text>
          </View>
          <View className='flex-row justify-end items-center space-x-2 border-b border-white pb-1'>
            <Text className='text-white text-xs top-1.5'>PHP</Text>
            <Text className='text-white text-3xl'>{revenueBalance.toLocaleString()}.00</Text>
          </View>
          <TouchableOpacity className='flex-row items-center mt-2 space-x-2'
            onPress={async () => {
              router.push('./TransferRevenue/transferRevenue')
              await SecureStore.setItemAsync('revenueBalance',revenueBalance.toString())
              }}>
            <FontAwesome6 name="money-bill-transfer" size={13} color="white" />
            <Text className='text-white text-[10px]'>Transfer Wallet</Text>
          </TouchableOpacity>
        </View>
        
      <View className="flex flex-row justify-between mb-2 border-b border-gray-400">
            <Text className="text-lg font-bold py-2">Transaction History</Text>
            <View className='flex flex-row items-center justify-center py-2'>
                <View className='flex flex-row items-center bg-gray-100 px-4 rounded-full'>
                    <Ionicons name="search" size={15} color="gray" />
                    {/* Animated TextInput for searching */}
                    <Animated.View style={{ width: inputWidth }}>
                      <TextInput 
                        className='text-xs text-gray-400' 
                        placeholder='Search'
                        value={searchText}
                        onChangeText={handleTextChange}
                      />
                    </Animated.View> 
                    
                </View>
            </View>
            
        </View>
      
      {/* Property Listing */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
  <View className="flex-col space-y-2 px-2 mb-20 flex-wrap">
    {filteredProperties.length === 0 ? (
      <View className="w-full flex items-center justify-center mt-10">
        <Text className="text-gray-400 text-sm">No transactions yet.</Text>
      </View>
    ) : (
      filteredProperties.map((property) => (
        <TouchableOpacity
          key={property.id}
          onPress={async () => {
            router.push('./viewRevenue');
            if (property) {
              console.log(property.transactionId);
              await SecureStore.setItemAsync('revenueReceiptId', property.transactionId);
            }
          }}
          className="w-full p-2.5 rounded-xl shadow-md border border-gray-100 bg-white flex flex-row"
        >
          <View className="w-full flex-col space-y-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold">{property.type}</Text>
              <Text className={`text-xs font-bold ${getColorByType(property.type)}`}>
                {formatAmountByType(property.type, property.value)}
              </Text>
            </View>
            <Text className="text-[10px] text-gray-400">
              {property.createdAt.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}
            </Text>
          </View>
        </TouchableOpacity>
      ))
    )}
  </View>
</ScrollView>

    </View>
    </View>
  );
}
