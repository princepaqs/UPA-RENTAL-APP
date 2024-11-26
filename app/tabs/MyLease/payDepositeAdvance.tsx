import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import contractData from './contractData.json'; 
import { collection, getDocs, query, where, doc, getDoc, updateDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
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
  propertyStatus: string;
}

interface Payment {
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
  tenantFullName: string;
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

export default function payDepositeAdvance() {
  const router = useRouter();
  const [rentData, setRentData] = useState<Rent | null>(null);
  const [paymentData, setPaymentData] = useState<Payment | null>(null);
  const { payRent, addWalletTransaction, sendNotification } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handlePayment = async () => {
    setLoading(true);
    try {
      const uid = await SecureStore.getItemAsync('uid');
      const rent = parseInt(rentData?.propertyRentAmount || '0');
      if(uid && rent){
        // Reference to the user's wallet document in the 'wallets' collection
        const walletDocRef = doc(db, 'wallets', uid);
        const walletDoc = await getDoc(walletDocRef);
    
        if (walletDoc.exists()) {
          // Parse the balance for comparison
          const walletData = walletDoc.data();
          const balance = parseInt(walletData?.balance) || 0;
    
          if (balance >= rent) {
            // Balance is greater than or equal to rent, proceed with payment
            await SecureStore.setItemAsync('rent', rent.toString());

            if(paymentData && rentData){
              payRent(paymentData?.transactionId, paymentData?.ownerId, paymentData?.tenantId, rentData?.propertyRentAmount, rentData.propertyLeaseStart, rentData.propertyLeaseEnd);
              sendNotification(paymentData?.tenantId, 'approval', 'Payment Successful', `Your advance and downpayment have been successfully processed. Your lease is now secured, and the next steps will be provided shortly.`, 'Success', 'Unread')
              sendNotification(paymentData.ownerId, 'approval', 'Deposit and Advance Payment Received', `You have successfully received the deposit and advance payment from ${paymentData.tenantFullName} for ${paymentData.propertyName}.`, 'Success', 'Unread');
              addWalletTransaction(paymentData?.tenantId, 'Payment', paymentData?.transactionId, formatDate(new Date()), rentData?.propertyRentAmount, 'PAY_ONTIME');
              await updateDoc(doc(db, 'propertyTransactions', paymentData.transactionId), {status: 'Approved'});
              await updateDoc(doc(db, 'properties', paymentData?.ownerId, 'propertyId', paymentData?.propertyId), {status: "Occupied"})
              await updateDoc(doc(db, 'contracts', paymentData.transactionId), {status: "Active"});
              //await updateDoc(doc(db, 'propertyTransactions', paymentData?.transactionId), {status: "Rented"})
              // router.replace('./paymentReceipt'); // Navigate to the receipt transaction screen
              Alert.alert("Payment", "Payment Success")
              router.replace('./successContract')
            }else{
              Alert.alert('Error', 'Error payment.');
              console.log('Error: ', paymentData?.transactionId, paymentData?.tenantId, rentData?.propertyRentAmount)
            }
            
          } else {
            // Insufficient balance
            Alert.alert('Error', `Insufficient balance. Top-up first. \nBalance: ${balance}\nAmount Due: ${rent}`);
          }
        } else {
          // Wallet does not exist
          Alert.alert('Error', 'Insufficient balance. Top-up first.');
        }
      }
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      Alert.alert('Error', 'An error occurred while processing the payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isDetailsVisible, setIsDetailsVisible] = useState(false); 
  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible); // Toggle visibility
  };

  useEffect(() => {
    const getRentData = async () => {
      const contractId = await SecureStore.getItemAsync('contractId');
      console.log(contractId);

      if(contractId){
        const paymentRef = await getDoc(doc(db, 'rentTransactions', contractId));
        if(paymentRef.exists()){
          const data = paymentRef.data();
          if(data){

            const firstRentAmount = parseInt(data.propertyAdvancePaymentAmount) + parseInt(data.propertySecurityDepositAmount);
            setRentData({
              transactionId: data.transactionId,
              ownerId: data.ownerId,
              propertyId: data.propertyId,
              tenantId: data.tenantId,
              propertyLeaseStart: data.propertyLeaseStart,
              propertyLeaseEnd: data.propertyLeaseEnd,
              propertyLeaseDuration: data.propertyLeaseDuration,
              propertyRentAmount: firstRentAmount.toString(),
              propertyRentDueDay: data.propertyRentDueDay,
              propertySecurityDepositAmount: data.propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
              paymentDuration: data.paymentDuration,
              propertyStatus: data.propertyStatus,

            })
          }
        }
      }
    }

    getRentData();
  }, [])

  useEffect(() => {
    const fetchPropertyData = async () => {
      if(rentData?.ownerId && rentData?.propertyId && rentData?.transactionId){
        const propertyRef = await getDoc(doc(db, 'properties', rentData?.ownerId, 'propertyId', rentData?.propertyId));
        const rentRef = await getDoc(doc(db, 'rentTransactions', rentData?.transactionId));
        const userRef = await getDoc(doc(db, 'users', rentData?.ownerId));
        const tenantRef = await getDoc(doc(db, 'users', rentData?.tenantId));
        if(propertyRef.exists() && rentRef.exists() && userRef.exists() && tenantRef.exists()){
          const propertyRefData = propertyRef.data();
          const rentRefData = rentRef.data();
          const userRefData = userRef.data();
          const tenantData = tenantRef.data();
          const rent = await SecureStore.getItemAsync('rent');
          if(propertyRefData && rentRefData && userRefData && rent && tenantData){
            const paymentAmount = parseInt(rent);
            const paymentFee = 100;
            setPaymentData({
              transactionId: rentData.transactionId,
              ownerId: rentData.ownerId,
              propertyId: rentData.propertyId,
              tenantId: rentData.tenantId,
              tenantFullName: `${tenantData.firstName} ${tenantData.middleName} ${tenantData.lastName}`,
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
      <View className="bg-gray-100 mt-20 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Sign Agreement & Secure Your Lease</Text>
          </View>
        </View>

        <View className='flex-row py-3 items-center justify-center space-x-8 bg-[#D9D9D9] '>
          <View className='flex-col items-center'>
            <View className='px-1 py-1 bg-[#0FA958] text-white rounded-full font-bold text-sm '>
              <FontAwesome name="check" size={15} color="white" />
            </View>
            <Text className='font-bold text-xs text-gray-500'>STEP 1</Text>
            <Text className='text-xs '>Sign contract</Text>
          </View>
          <View className='flex-col items-center'>
            <Text className='px-2 py-0.5 bg-[#EF5A6F] text-white rounded-full font-bold text-sm '>2</Text>
            <Text className='font-bold text-xs '>STEP 2</Text>
            <Text className='text-xs '>Make Payment</Text>
          </View>
          <View className='flex-col items-center'>
            <Text className='px-2 py-0.5 bg-[#828282] text-white rounded-full font-bold text-sm '>3</Text>
            <Text className='font-bold text-xs '>STEP 3</Text>
            <Text className='text-xs '>Lease Confirmed</Text>
          </View>
        </View>

        {/* Contract Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-4 px-8 mb-5">
        
          <View>
            <Text className='text-sm text-gray-500'>To secure your lease, please complete both the deposit and advance payment. Simply follow the prompts to make these payments directly in the app.</Text>
          </View>

          <View className="flex-col rounded-lg mt-4">
                    <View className="flex-col items-center bg-white pb-4 rounded-xl shadow-xl">

                      <View className=' px-4 flex-row items-center'>
                        <View className=" flex-col w-1/2">
                  <Text className="text-sm font-bold mb-1">Payment & Deposit</Text>
                  {/* Conditional Rendering Based on Lease Status */}
                  {contractData?.propertyStatus !== 'Rented' ? (
                    <Text className="text-gray-500 text-xs">
                    Settle all payments and deposits within 
                    <Text className="text-[#D9534F] font-bold text-xs"> 24 hours </Text>
                      to avoid losing the property.
                    </Text>
                  ) : (
                    <>
                      <Text className="text-gray-500 text-sm">Your bill is due on</Text>
                      <Text className="text-[#D9534F] text-sm font-bold">{contractData?.nextDueDate}</Text>
                    </>
                  )}
                </View>
                <View className="flex flex-col pr-6 mt-4 items-end">
                  <Text className="text-xs">Total amount to pay</Text>
                  <Text className="text-sm font-bold">
                    ₱ {parseInt(rentData ? rentData.propertyRentAmount: '0').toLocaleString() }.00
                  </Text>
                  <TouchableOpacity
                    className="bg-[#D9534F] mt-2 py-2 px-4 rounded-md"
                    onPress={async () => await handlePayment()}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-semibold">Pay Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View className='w-full'>
                <TouchableOpacity onPress={toggleDetails} className="flex flex-row items-center px-6">
                  <Text className='text-start text-xs'>View Details </Text>
                  <Feather name={isDetailsVisible ? 'chevron-up' : 'chevron-down'} size={16} />
                </TouchableOpacity>
                {isDetailsVisible && (
                  <View className='px-4 py-2'>
                    <View className="border-t-0.5 space-y-1">
                      <Text className="text-xs font-bold py-2">Billing Summary</Text>
                      <View className='flex-row items-center justify-between'>
                        <Text className="text-xs">Advance Payment:</Text>
                        <Text className="text-xs">
                          ₱ { 
                            (rentData?.propertyLeaseDuration === 'Long-term (1 year)' && rentData?.paymentDuration == '12') ||
                            (rentData?.propertyLeaseDuration === 'Short-term (6 months)' && rentData?.paymentDuration == '6')
                              ? parseInt(rentData.propertyAdvancePaymentAmount).toLocaleString()
                              : '0'
                          }
                        </Text>
                      </View>
                      <View className='flex-row items-center justify-between'>
                        <Text className="text-xs">Security Deposit:</Text>
                        <Text className="text-xs">
                          ₱ { 
                            (rentData?.propertyLeaseDuration === 'Long-term (1 year)' && rentData?.paymentDuration == '12') ||
                            (rentData?.propertyLeaseDuration === 'Short-term (6 months)' && rentData?.paymentDuration == '6')
                              ? parseInt(rentData.propertySecurityDepositAmount).toLocaleString()
                              : '0'
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
            </View>
        </View>
        </ScrollView>

        
      </View>
    </View>
  );
}
