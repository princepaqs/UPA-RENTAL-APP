import { View, Text, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'; // Added 'doc' import
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';

interface Rent {
  transactionId: string;
  // Property
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyLeaseDuration: string;
  propertyRentAmount: string;
  //propertyRentDueDay: string;
  propertySecurityDepositAmount: string;
  //propertySecurityDepositRefundPeriod: string;
  //propertyAdvancePaymentAmount: string;
  //propertyHouseRules: string;
  //propertyTerminationPeriod: string;
  propertyImage?: number | { uri: string };
  status: string;
  // Tenants
  tenantId: string;
  tenantFullName: string;
  tenantContactNo: string;
  tenantImage?: number | { uri: string };
}

interface Wallet {
  paymentTransactionId: string;
  paymentTransactionType: string;
  date: string;
  value: string;
}


export default function TenantDetails() {
  const router = useRouter();
  const [rentData, setRentData] = useState<Rent | null>(null);
  const [walletData, setWalletData] = useState<Wallet[]>([]);

  const handlePhoneCall = () => {
    Linking.openURL(rentData ? rentData.tenantContactNo.toString() : '09123456789');
  };

  const [showMore, setShowMore] = useState(false);

  // Function to get color based on tenant status
  const getStatusColor = (status:any) => {
    switch (status) {
      case 'Move Out':
        return '#000000'; // Black
      case 'Active':
        return '#28a745'; // Green
      case 'Inactive':
        return '#cccccc '; // Red
      case 'Move In':
        return '#dc3545'; // Blue
      default:
        return '#007bff'; // Default color
    }
  };

  const getImageUrl = async (propertyId: string, fileName: string) => {
    try {
      const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`); // when gettin
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  useEffect(() => {
    const getTenantDetails = async () => {
      const transactionId = await SecureStore.getItemAsync('transactionId');
      if(transactionId){
        const detailsRef = await getDoc(doc(db, 'rentTransactions', transactionId));
        if(detailsRef.exists()){
          const rentData = detailsRef.data()
          if(rentData){
            const tenantId = rentData.tenantId;
            if(tenantId){
              const userRef = await getDoc(doc(db, 'users', tenantId));
              if(userRef.exists()){
                const userData = userRef.data()
                if(userData){
                  const propertyId = rentData.propertyId;
                  const ownerId = rentData.ownerId;
                  const propertyRef = await getDoc(doc(db, 'properties', ownerId, 'propertyId', propertyId))
                  if(propertyRef.exists()){
                    const propertyData = propertyRef.data();
                    if(propertyData){

                      const propertyImage = propertyData.images && propertyData.images.length > 0 
                      ? await getImageUrl(propertyId, propertyData.images[0]) // Fetch the first image URL
                      : null;

                      let profilePictureUrl = null;
                      if (tenantId) {
                        try {
                          const profilePictureFileName = `${tenantId}-profilepictures`;
                          const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
                          profilePictureUrl = await getDownloadURL(profilePictureRef);
                        } catch (error) {
                          console.error('Error fetching profile picture:', error);
                        }
                      }

                      setRentData({
                        transactionId: transactionId,
                        propertyId: rentData.propertyId,
                        propertyName: propertyData.propertyName,
                        propertyType: propertyData.propertyType,
                        propertyAddress: `${propertyData.propertyHomeAddress}, ${propertyData.propertyBarangay}, ${propertyData.propertyCity}, ${propertyData.propertyRegion}`,
                        propertyLeaseStart: rentData.propertyLeaseStart,
                        propertyLeaseEnd: rentData.propertyLeaseEnd,
                        propertyLeaseDuration: rentData.propertyLeaseDuration,
                        propertyRentAmount: rentData.propertyRentAmount,
                        propertySecurityDepositAmount: rentData.propertySecurityDepositAmount,
                        propertyImage: propertyImage ? { uri: propertyImage } : require('../../../../assets/images/property1.png'),
                        status: propertyData.status,
                        tenantId: rentData.tenantId,
                        tenantFullName: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
                        tenantContactNo: userData.phoneNo,
                        tenantImage: profilePictureUrl ? { uri: profilePictureUrl } : require('../../../../assets/images/profile.png')
                      })
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    getTenantDetails();
  }, [])

  useEffect(() => {
    const getPaymentDetails = async () => {
      const tenantId = rentData?.tenantId;
      const transactionId = rentData?.transactionId;
      console.log('Transaction ID:', transactionId);
  
      if (tenantId && transactionId) {
        // Reference to the tenant's wallet transactions
        const paymentQuery = query(
          collection(db, 'walletTransactions', tenantId, 'walletId'),
          where('transactionType', '==', 'Payment'),
          where('paymentTransactionId', '==', transactionId)
        );
  
        try {
          const querySnapshot = await getDocs(paymentQuery);
          const paymentDetails: Wallet[] = querySnapshot.docs.map(doc => ({
            paymentTransactionId: doc.id,
            paymentTransactionType: doc.data().transactionType,
            date: doc.data().date,
            value: doc.data().value,
          }));
  
          // Parse date strings to Date objects and sort by date
          const sortedPaymentDetails = paymentDetails.sort((a, b) => {
            // Manually parse dates to ensure consistency
            const dateA = parseCustomDate(a.date);
            const dateB = parseCustomDate(b.date);
            return dateA.getTime() - dateB.getTime(); // Sort by most recent date first
          });
  
          console.log("Sorted paymentDetails by date:", sortedPaymentDetails);
          setWalletData(sortedPaymentDetails);
        } catch (error) {
          console.error("Error fetching payment transactions:", error);
        }
      }
    };
  
    // Helper function to parse dates in "MM/DD/YYYY, hh:mm:ss AM/PM" format
    const parseCustomDate = (dateString: string) => {
      const [datePart, timePart] = dateString.split(', ');
      const [month, day, year] = datePart.split('/').map(Number);
      const [time, period] = timePart.split(' ');
  
      let [hours, minutes, seconds] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
  
      // Create Date object with parsed values
      return new Date(year, month - 1, day, hours, minutes, seconds);
    };
  
    getPaymentDetails();
  }, [rentData]);

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 my-14 rounded-t-2xl'>
  
        {/* Header */}
        <View className='flex flex-row items-center justify-between px-6 pt-8 pb-4 border-b'>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-xs font-bold text-center'>Tenant Details</Text>
          </View>
        </View>
  
        <ScrollView className='mb-2' contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
  
          {/* Tenant Information */}
          <View className='mt-6'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-sm font-bold'>Tenant Information</Text>
              <TouchableOpacity className='flex-row items-center space-x-1' onPress={() => router.push('../../MyLease/ViewContract')}>
                <Ionicons name="eye" size={20} color="#D9534F" />
                <Text className='text-xs font-semibold text-[#D9534F] '>View Contract</Text>
              </TouchableOpacity>
            </View>
  
            <View className='p-3 flex-row space-x-2 items-center bg-white rounded-xl mt-2'>
              <Image
                className="w-[45px] h-[45px] object-cover rounded-full"
                source={rentData?.tenantImage}
              />
              <View className='flex-row flex-1 justify-between items-center'>
                <View className='flex-col'>
                  <Text className='text-sm text-gray-500'>{rentData?.tenantFullName}</Text>
                  <View className='flex-row items-center space-x-1'>
                    <Text className='w-3 h-3 rounded-full' style={{ backgroundColor: getStatusColor(rentData?.status) }}></Text>
                    <Text className='text-xs font-bold' style={{ color: getStatusColor(rentData?.status) }}>{rentData?.status}</Text>
                  </View>
                </View>
              </View>
              <View className='flex-row space-x-2'>
                <TouchableOpacity onPress={async () => {
                  router.push('../../Message/msgDetails')
                  const uid = await SecureStore.getItemAsync('uid');
                  if (rentData?.tenantId !== uid) {
                    await SecureStore.setItemAsync('messageRecipientId', rentData?.tenantId ?? '');
                  }
                  }}>
                  <MaterialIcons name="message" size={18} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePhoneCall}>
                  <FontAwesome6 name="phone" size={15} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
  
          {/* Lease Information */}
          <View className='mt-6'>
            <View className='mb-2 flex-row items-center justify-between'>
              <Text className='text-sm font-bold'>Lease Information</Text>
              <TouchableOpacity onPress={async() => {
                if(rentData){
                  await SecureStore.setItemAsync('propertyId', rentData.propertyId);
                  router.push('../PropertyDetails')
                }
              }}>
                <Text className='bg-[#333333] text-xs text-white py-1 px-2 rounded-md'>View Lease</Text>
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Property Details */}
          <View className='p-3 bg-white rounded-md mt-3'>
            <View className='flex-row items-center space-x-2 border-b border-gray-400 pb-3'>
              <Image
                className="w-[45px] h-[45px] object-cover rounded-md"
                source={rentData?.propertyImage}
              />
              <View className='flex-col'>
                <Text className='text-sm text-gray-500'>{rentData?.propertyName}</Text>
                <Text className='text-xs text-gray-500'>
                  {rentData?.propertyAddress && rentData.propertyAddress.length > 45 
                    ? `${rentData.propertyAddress.slice(0, 45)}...` 
                    : rentData?.propertyAddress || ''}
                </Text>
              </View>
            </View>
  
            <View className='mt-3'>
              <Text className='text-sm font-bold mb-2'>Lease Agreement Details</Text>
              <View className='flex-col space-y-1'>
                {[
                  { label: 'Start Date', value: rentData?.propertyLeaseStart },
                  { label: 'End Date', value: rentData?.propertyLeaseEnd },
                  { label: 'Lease Term', value: rentData?.propertyLeaseDuration },
                  { label: 'Rent Amount / Month', value: `₱ ${parseInt(rentData ? rentData?.propertyRentAmount : '0').toLocaleString()}.00` },
                  { label: 'Security Deposit', value: `₱ ${parseInt(rentData ? rentData?.propertySecurityDepositAmount : '0').toLocaleString()}.00` }
                ].map(detail => (
                  <View key={detail.label} className='flex-row items-center space-y-1 justify-between'>
                    <View className='flex-row items-center space-x-2'>
                      <Text className='text-xs text-gray-500'>{detail.label}</Text>
                      {detail.label === 'Security Deposit' ? ( <Text className='text-xs text-gray-500 bg-[#D9D9D9] px-3 py-0.5 rounded-lg'>Held</Text> ) : ( '' )}
                    </View>
                    <Text className='text-xs text-gray-500'>{detail.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
  
          {/* Payment History */}
          <View className='mt-6'>
            <View className='flex-row items-center justify-between mb-1'>
              <Text className='text-sm font-semibold'>Payment History</Text>
              <TouchableOpacity className='flex-row items-center space-x-1' onPress={async () => {
                router.push('./tenantPaymentHistorySchedule')
                if(rentData){
                  await SecureStore.setItemAsync('paymentTransactionId', rentData.transactionId);
                  await SecureStore.setItemAsync('tenantId', rentData.tenantId);
                }
                }}>
                <Text className='text-[10px] font-bold text-[#D9534F]'>Payment History & Schedule</Text>
              </TouchableOpacity>
            </View>
            <View className='p-2 flex-col space-y-3 rounded-md'>
              {walletData.slice(0, showMore ? walletData.length : 3).map(payment => (
                <View key={payment.paymentTransactionId} className='flex-row p-3 justify-between bg-white rounded-lg'>
                  <View className='space-y-1'>
                    <Text className='text-sm font-bold'>{payment.paymentTransactionType}</Text>
                    <Text className='text-xs text-gray-500'>{payment.date}</Text>
                  </View>
                  <Text className='text-sm text-[#508D4E] font-bold'>₱ {payment.value}.00</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowMore(!showMore)} className='mb-4'>
              <Text className='text-center text-xs text-[#007BFF] font-semibold'>
                {showMore ? 'Show Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <TouchableOpacity className='bottom-5 py-4 flex-row item-center justify-center '
              onPress={() => router.push('../../../tabs/Reports/ReportProfile/reportProfile')}>
                <MaterialIcons name="report" size={20} color="#D9534F" />
                <Text className='text-center text-xs text-[#D9534F]'>Report this profile</Text>
              </TouchableOpacity>
      </View>
    </View>
  );
}
