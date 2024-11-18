import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import payment from './paymentData.json'; // Import the property data
import { getItemAsync } from 'expo-secure-store';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";
import { useAuth } from '@/context/authContext';

interface Rent {
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
}

interface Payment {
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
  transactionDate: string;
  propertyName: string;
  ownerFullName: string;
  ownerEmail: string;
  //transactionPurpose: string;
  paymentAmount: string;
  billingPeriod: string;
  paymentFee: string;
  paymentTotal: string;
}

export default function paymentReview() {
  const router = useRouter();
  const { payRent, addWalletTransaction } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rentData, setRentData] = useState<Rent | null>(null);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);

  // For now, we'll use the first property as an example
  const selectedPayment = payment[0];

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,  // Use 12-hour time format
    });
  };

  const handleContinue = async () => {
      setLoading(true); // Set loading to true when starting the process
      setTimeout(async () => {
          setLoading(false); // Reset loading state after saving data
          const nextDueDate = await SecureStore.getItemAsync('nextDueDate');
          console.log('Next Due',nextDueDate);
          if (
            nextDueDate && 
            paymentData?.transactionId && 
            paymentData?.tenantId && 
            paymentData?.paymentAmount && 
            rentData?.propertyLeaseStart && 
            rentData?.propertyLeaseEnd
          ) {
            try {
              // Step 1: Parse nextDueDate in the format "March 15, 2024"
              const dateParts = nextDueDate.match(/([a-zA-Z]+) (\d{1,2}), (\d{4})/);
              if (!dateParts) throw new Error("Invalid nextDueDate format");
          
              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const monthIndex = monthNames.indexOf(dateParts[1]); // Convert month name to month index
              const day = parseInt(dateParts[2], 10);
              const year = parseInt(dateParts[3], 10);
          
              // Step 2: Create a Date object using the extracted values
              const parsedDate = new Date(year, monthIndex, day);
          
              // Check if parsedDate is a valid date
              if (isNaN(parsedDate.getTime())) {
                throw new Error("Invalid parsed nextDueDate");
              }
          
              // Step 3: Format parsedDate as "MM/DD/YYYY"
              const dateNextDue = `${
                (parsedDate.getMonth() + 1).toString().padStart(2, '0')
              }/${
                parsedDate.getDate().toString().padStart(2, '0')
              }/${
                parsedDate.getFullYear()
              }`;
          
              const currentDate = new Date();
          
              // Display the formatted dateNextDue
              console.log("Formatted dateNextDue:", dateNextDue);
          
              // Determine if payment is on time or late
              const paymentStatus = parsedDate >= currentDate ? 'PAY_ONTIME' : 'PAY_LATE';
              console.log(paymentStatus, dateNextDue, currentDate);
          
              // Initiate the rent payment
              await payRent(
                paymentData.transactionId, 
                paymentData.ownerId, 
                paymentData.tenantId, 
                paymentData.paymentAmount, 
                rentData.propertyLeaseStart, 
                rentData.propertyLeaseEnd
              );
          
              // Add the wallet transaction with the determined status
              await addWalletTransaction(
                paymentData.tenantId,
                'Payment',
                paymentData.transactionId,
                formatDate(currentDate),
                paymentData.paymentAmount,
                paymentStatus
              );
          
              // Optionally update property status
              // await updateDoc(doc(db, 'properties', paymentData.ownerId, 'propertyId', paymentData.propertyId), {status: "Rented"});
              // await updateDoc(doc(db, 'propertyTransactions', paymentData.transactionId), {status: "Rented"});
          
              // Navigate to the receipt transaction screen
              router.replace('./paymentReceipt');
              
            } catch (error) {
              Alert.alert('Payment Error', 'There was an issue processing the payment. Please try again.');
              console.error('Payment Processing Error: ', error);
            }
          } else {
            Alert.alert('Error', 'Error in payment data.');
            console.log('Missing data:', {
              transactionId: paymentData?.transactionId,
              ownerId: paymentData?.ownerId,
              tenantId: paymentData?.tenantId,
              rentAmount: rentData?.propertyRentAmount,
              leaseStart: rentData?.propertyLeaseStart,
              leaseEnd: rentData?.propertyLeaseEnd
            });
          }
          
      }, 1000);
  };

  useEffect(() => {
    const fetchRentData = async () => {
      const rentTransactionId = await SecureStore.getItemAsync('rentTransactionId');
      console.log('TransactionID: ', rentTransactionId);
      if(rentTransactionId){
        const paymentRef = await getDoc(doc(db, 'rentTransactions', rentTransactionId));
        if(paymentRef.exists()){
          const data = paymentRef.data();
          if(data){
            setRentData({
              transactionId: data.transactionId,
              ownerId: data.ownerId,
              propertyId: data.propertyId,
              tenantId: data.tenantId,
              propertyLeaseStart: data.propertyLeaseStart,
              propertyLeaseEnd: data.propertyLeaseEnd,
              propertyLeaseDuration: data.propertyLeaseDuration,
              propertyRentAmount: data.propertyRentAmount,
              propertyRentDueDay: data.propertyRentDueDay,
              propertySecurityDepositAmount: data.propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
              paymentDuration: data.paymentDuration
            })
          }
        }
      }
    }

    fetchRentData();
  },[])

  useEffect(() => {
    const fetchPropertyData = async () => {
      if(rentData?.ownerId && rentData?.propertyId && rentData?.transactionId){
        const propertyRef = await getDoc(doc(db, 'properties', rentData?.ownerId, 'propertyId', rentData?.propertyId));
        const rentRef = await getDoc(doc(db, 'rentTransactions', rentData?.transactionId));
        const userRef = await getDoc(doc(db, 'users', rentData?.ownerId));
        if(propertyRef.exists() && rentRef.exists() && userRef.exists()){
          const propertyRefData = propertyRef.data();
          const rentRefData = rentRef.data();
          const userRefData = userRef.data();
          const rent = await SecureStore.getItemAsync('rent');
          if(propertyRefData && rentRefData && userRefData && rent){
            const paymentAmount = parseInt(rent);
            const paymentFee = 100;
            setPaymentData({
              transactionId: rentData.transactionId,
              ownerId: rentData.ownerId,
              propertyId: rentData.propertyId,
              tenantId: rentData.tenantId,
              transactionDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
              propertyName: propertyRefData.propertyName,
              ownerFullName: `${userRefData.firstName} ${userRefData.middleName} ${userRefData.lastName}`,
              ownerEmail: userRefData.email,
              //transactionPurpose: string;
              paymentAmount: paymentAmount.toString(),
              billingPeriod: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
              paymentFee: paymentFee.toString(),
              paymentTotal: (paymentAmount + paymentFee).toString()
            })
          }
        }
      }
    }

    fetchPropertyData();
  }, [rentData]);

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

          {/* Payment Details */}
          <View className='px-6 pt-10 mb-6'>
                <Text className='text-sm font-bold px-4'>Payment Details</Text>
                <View className='bg-white flex flex-col space-y-2 p-5 rounded-xl my-2'>
                    <Text className='text-sm text-gray-500'>Transaction ID: {rentData?.transactionId}</Text>
                    <Text className='text-sm text-gray-500'>Date: {paymentData?.transactionDate}</Text>
                    <Text className='text-sm text-gray-500'>Property: {paymentData?.propertyName}</Text>
                    <Text className='text-sm text-gray-500'>Receipt/Landlord: {paymentData?.ownerFullName}</Text>
                    <Text className='text-sm text-gray-500'>Receipt Email: {paymentData?.ownerEmail}</Text>
                    <Text className='text-sm text-gray-500'>Payment Purpose: Rent</Text>
                    <Text className='text-sm text-gray-500'>Payment Amount: ₱ {parseInt(paymentData ? paymentData?.paymentAmount : '0').toLocaleString()}</Text>
                    <Text className='text-sm text-gray-500'>Billing Period: {paymentData?.billingPeriod}</Text>
                    <Text className='text-sm text-gray-500'>Fee (1%): {paymentData?.paymentFee}</Text>
                    <Text className='text-sm text-gray-500 font-bold'>TOTAL: ₱ {parseInt(paymentData ? paymentData?.paymentTotal: '0').toLocaleString()}</Text>
                </View>
          </View>

          <View className='flex flex-col space-y-2 bottom-0 px-6'>
            <Text className='px-4 text-xs text-gray-500'>By clicking confirm, I confirm that above details are correct.</Text>
                        
            {loading ? ( // Show loading indicator when loading is true
                <ActivityIndicator size={30} color="#D9534F" />
            ) : (
                <TouchableOpacity className='w-full items-center rounded-2xl bg-[#D9534F]' onPress={handleContinue}>
                    <Text className='text-xs text-center py-3 font-bold text-white'>Pay Rent</Text>
                </TouchableOpacity>
            )}
          </View>

        </View>
        </View>
    </View>
  )
}
