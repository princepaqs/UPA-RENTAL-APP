import { View, Text, TouchableOpacity, Pressable, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import paymentData from './paymentData.json'; // Import the property data
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, storage } from '../../../../../_dbconfig/dbconfig';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';
import { Alert } from "react-native";


interface PropertyPayment {
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyLeaseDuration: string;
  propertyRentAmount: string;
  propertyRentDueDay: string;
  propertySecurityDepositAmount: string;
  propertySecurityDepositRefundPeriod: string;
  propertyAdvancePaymentAmount: string;
  paymentDuration: string;
  propertyStatus: string;
  nextDueDate: string;
  propertyName: string; // from propertyTransactions 
  propertyType: string; // from propertyTransactions 
}

interface PropertyMap {
  [propertyId: string]: {
    propertyName: string;
    propertyType: string;
  };
}

interface TransactionData {
  uid: string;
  transactionId: string;
  transactionType: string;
  paymentTransactionId: string;
  dateTime: string;
  value: number;  // Ensure total is a number
}

export default function Payment() {
  const router = useRouter();
  
  // Refresh control state
  const [refreshing, setRefreshing] = useState(false);
  const [paymentList, setPaymentList] = useState<PropertyPayment[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]); 

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false); // Stop the refreshing animation after 1 second
    }, 1000);
  }, []);

  const payDue = async (id: string) => {
    //console.log(`Paying due for PropertyID ${id}`);
    await SecureStore.setItemAsync('rentTransactionId', id);
    router.replace('./paymentReview');
  };

  const loadWalletTransactions = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
  
      if (uid) {
        const transactionsQuery = query(collection(db, 'walletTransactions', uid, 'walletId'), where('uid', '==', uid)); // test
        const querySnapshot = await getDocs(transactionsQuery);
  
        const transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          return {
            uid: data.uid,
            transactionId: doc.id,
            transactionType: data.transactionType,
            paymentTransactionId: data.paymentTransactionId,
            dateTime: data.date,
            value: parseInt(data.value),  // Ensure the value is correctly retrieved
          };
        });
  
        return transactions; // Return the transactions
      }
    } catch (error) {
      console.error("Error loading transactions:", error); // Log any errors that occur
    }
    return []; // Return an empty array if no transactions were found
  };
  
  useEffect(() => {
    const fetchPaymentData = async () => {
      console.log('Starting fetchPaymentData');
  
      // Load wallet transactions and wait for them to be fetched
      const walletTransactions = await loadWalletTransactions();
      console.log('Wallet Transactions:', walletTransactions);
  
      try {
        const uid = await SecureStore.getItemAsync('uid');
        console.log('User ID:', uid);
        if (!uid) {
          console.log('UID not found');
          return;
        }
  
        const paymentCollectionRef = collection(db, 'rentTransactions');
        const mainCollectionSnapshot = await getDocs(paymentCollectionRef);
        console.log('Number of transactions:', mainCollectionSnapshot.docs.length);
  
        let combinedPayments: PropertyPayment[] = [];
  
        // Step 1: Fetch all transactions where tenantId matches uid
        const transactions = mainCollectionSnapshot.docs
          .map((transactionDoc) => {
            const rentData = transactionDoc.data();
  
            // Only include transactions that match the uid
            if (rentData.tenantId === uid) {

              const leaseStart = rentData.propertyLeaseStart; // Sample date in MM/DD/YYYY format
              console.log(leaseStart);
              // Split the date string by "/"
              const [month, day, year] = leaseStart.split("/").map(Number);

              // Create the Date object with parsed values
              const leaseStartDate = new Date(year, month - 1, day); // Month is zero-indexed in JavaScript Date

              console.log(leaseStartDate);
              // Parse the propertyRentDueDay and create a date for the due date
              const dayOnly = parseInt(rentData.propertyRentDueDay.replace(/\D/g, ''), 10);
              const today = new Date();
              const currentMonth = leaseStartDate.getMonth(); // 0-indexed
              const currentYear = today.getFullYear();
  
              // Create due date with the current month and year
              let dueDate = new Date(currentYear, currentMonth, dayOnly);
  
              // Check if the due date is before today, and if so, set it to the next month
              if (dueDate < today) {
                dueDate.setMonth(dueDate.getMonth());
              }
  
              // Calculate the next due date by starting from today
              let nextDueDate = new Date(dueDate); // Copy dueDate to nextDueDate
  
              const paymentCount = walletTransactions.filter(
                (transaction) =>
                  transaction.transactionType === 'Payment' && 
                  transaction.paymentTransactionId === `${rentData.ownerId}-${rentData.propertyId}-${uid}`
              ).length;
              console.log(paymentCount);
  
              // Update nextDueDate by adding the count of matching transactions
              nextDueDate.setMonth(nextDueDate.getMonth() + paymentCount);
  
              // Format the next due date into "Month day, year"
              const formattedDueDate = nextDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              SecureStore.setItemAsync('nextDueDate', formattedDueDate);
  
              return {
                transactionId: `${rentData.ownerId}-${rentData.propertyId}-${uid}`, // Construct transaction ID
                ownerId: rentData.ownerId,
                propertyId: rentData.propertyId,
                tenantId: rentData.tenantId,
                propertyLeaseStart: rentData.propertyLeaseStart,
                propertyLeaseEnd: rentData.propertyLeaseEnd,
                propertyLeaseDuration: rentData.propertyLeaseDuration,
                propertyRentAmount: rentData.propertyRentAmount,
                propertyRentDueDay: rentData.propertyRentDueDay,
                propertySecurityDepositAmount: rentData.propertySecurityDepositAmount,
                propertySecurityDepositRefundPeriod: rentData.propertySecurityDepositRefundPeriod,
                propertyAdvancePaymentAmount: rentData.propertyAdvancePaymentAmount,
                paymentDuration: rentData.paymentDuration,
                propertyStatus: rentData.status,
                nextDueDate: formattedDueDate, // Set the calculated next due date
              };
            }
  
            return null; // Return null for transactions that do not match
          })
          .filter(transaction => transaction !== null); // Remove null values from the final transactions array
  
        // Step 2: Fetch property transactions for each transaction ID
        for (const transaction of transactions) {
          const propertyDocRef = doc(db, 'properties', transaction.ownerId, 'propertyId', transaction.propertyId);
          const propertyDocSnapshot = await getDoc(propertyDocRef);
          console.log('TransactionIds: ', transaction.transactionId);
          const propertyData = propertyDocSnapshot.exists() ? propertyDocSnapshot.data() : null;
          
          // Push combined data into combinedPayments array
          if (transaction?.paymentDuration !== '6' && transaction?.propertyLeaseDuration === 'Short-term (6 months)' || transaction?.paymentDuration !== '12' && transaction?.propertyLeaseDuration === 'Long-term (1 year)' || transaction.paymentDuration == '0') {
            combinedPayments.push({
              transactionId: transaction.transactionId,
              ownerId: transaction.ownerId,
              propertyId: transaction.propertyId,
              tenantId: transaction.tenantId,
              propertyLeaseStart: transaction.propertyLeaseStart,
              propertyLeaseEnd: transaction.propertyLeaseEnd,
              propertyLeaseDuration: transaction.propertyLeaseDuration,
              propertyRentAmount: transaction.propertyRentAmount,
              propertyRentDueDay: transaction.propertyRentDueDay,
              propertySecurityDepositAmount: transaction.propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod: transaction.propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount: transaction.propertyAdvancePaymentAmount,
              paymentDuration: transaction.paymentDuration,
              propertyStatus: transaction.propertyStatus,
              nextDueDate: transaction.nextDueDate,
              propertyName: propertyData?.propertyName, // Fetch propertyName if it exists
              propertyType: propertyData?.propertyType, // Fetch propertyType if it exists
            });
          }
        }
        setPaymentList(combinedPayments); // Set the combined list to the state
        console.log("Fetched combined payments:", combinedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };
  
    fetchPaymentData();
  }, []);
  
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
              <Text className="text-sm font-bold text-center">Payment</Text>
            </View>
          </View>

          {/* Payment list with ScrollView and RefreshControl */}
<ScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  <View className="px-6 mb-28">
    <Text className="text-sm font-bold px-4">Dues</Text>

    {paymentList.length === 0 ? (
  <View className="bg-white flex items-center p-4 rounded-xl my-2 border border-gray-200 shadow-sm">
    <Text className="text-sm text-gray-600">You have no pending payments at the moment.</Text>
    {/* <Text className="text-xs text-gray-400 mt-2">Please check back later or contact support if you believe this is an error.</Text> */}
  </View>
) : (
  paymentList.map((payment) => (
    <View key={payment.transactionId} className="bg-white flex flex-col space-y-3 p-4 rounded-xl my-2">
      <Text className="text-sm font-bold">{payment.propertyName} Rent</Text>
      <View>
        <Text className="text-xs text-gray-500">Due Date: {payment.nextDueDate}</Text>
        <Text className="text-xs text-gray-500">Amount: ₱ {parseInt(payment.propertyRentAmount).toLocaleString()}</Text>
      </View>
      <Pressable
        className="items-center bg-[#D9534F] rounded-xl py-1.5"
        onPress={async () => {
          payDue(payment.transactionId);
          await SecureStore.setItemAsync('rent', payment.propertyRentAmount);
        }}
      >
        <Text className="text-xs font-bold text-white">Pay Due</Text>
      </Pressable>
    </View>
  ))
)}

  </View>
</ScrollView>

        </View>
      </View>
    </View>
  );
}
