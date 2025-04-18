import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage';

interface RentalData {
  propertyId: string;
  ownerId: string;
  paymentStatus: string;
  tenantId: string;
}

interface OwnerData {
  ownerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNo: string;
}

interface PropertyData {
  images: string[];
  image?: string;
  userImage?: string;
  propertyId: string;
  propertyName: string;
  propertyRegion: string;
  propertyCity: string;
  propertyBarangay: string;
  propertyHomeAddress: string;
  propertyLeaseDuration: string;
  rentalStartDate: string;
  rentalEndDate: string;
  propertyCurrentRentAmount: string;
  propertyCurrentRentDeposit: string;
  date: string;
}

interface Contract {
  createdAt: Timestamp;
  ownerContact: string;
  ownerEmail: string;
  ownerFullAddress: string;
  ownerFullName: string;
  ownerId: string;
  ownerImage?: string;
  propertyAddress: string;
  propertyAdvancePayment: string;
  propertyHouseRules: string;
  propertyId: string;
  propertyImage?: string;
  propertyLeaseDuration: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyName: string;
  propertyRentAmount: string;
  propertyRentDueDay: string;
  propertySecurityDepositAmount: string;
  propertySecurityRefundPeriod: string;
  propertyTerminationPeriod: string;
  propertyType: string;
  status: string;
  tenantContact: string;
  tenantEmail: string;
  tenantFullAddress: string;
  tenantFullName: string;
  tenantId: string;
  transactionId: string;
}

interface CombinedData extends RentalData, PropertyData, OwnerData {}

export default function RentalHistory() {
  const router = useRouter();
  const [rentalData, setRentalData] = useState<CombinedData[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = async (propertyId: string, fileName: string) => {
    try {
      const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  const getUserImageUrl = async (ownerId: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${ownerId}-profilepictures`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  }

  // useEffect(() => {
  //   const fetchRentalHistory = async () => {
  //     try {
  //       const uid = await SecureStore.getItemAsync('uid');
  //       if (!uid) {
  //         setError('User not authenticated');
  //         setLoading(false);
  //         return;
  //       }
  
  //       const today = new Date();
  //       const propertyTransactionsRef = collection(db, 'propertyTransactions');
  //       const rentTransactionsRef = collection(db, 'rentTransactions');
  
  //       const propertyTransactionsQuery = query(
  //         propertyTransactionsRef,
  //         where('paymentStatus', '==', 'done'), // change to done
  //         where('tenantId', '==', uid)
  //       );
  //       const propertyTransactionsSnapshot = await getDocs(propertyTransactionsQuery);
  
  //       const rentTransactionsQuery = query(
  //         rentTransactionsRef,
  //         where('rentalEndDate', '<=', today), // change to rentalEndDate <= today
  //         where('tenantId', '==', uid)
  //       );
  //       const rentTransactionsSnapshot = await getDocs(rentTransactionsQuery);
  
  //       const propertyTransactionsData = propertyTransactionsSnapshot.docs.map(doc => doc.data() as RentalData);
  //       const rentTransactionsData = rentTransactionsSnapshot.docs.map(doc => doc.data() as RentalData);
  
  //       // Merge both transactions and remove duplicates using a Set
  //       const uniqueRentalData = new Map();
  
  //       const combinedRentalData = [...propertyTransactionsData, ...rentTransactionsData];
  
  //       for (const rental of combinedRentalData) {
  //         const uniqueKey = `${rental.propertyId}-${rental.ownerId}`;
  
  //         if (!uniqueRentalData.has(uniqueKey)) {
  //           uniqueRentalData.set(uniqueKey, rental);
  //         }
  //       }
  
  //       // Fetch property data
  //       const combinedData: CombinedData[] = await Promise.all(
  //         Array.from(uniqueRentalData.values()).map(async (rental) => {
  //           const propertyDocRef = doc(db, 'properties', rental.ownerId, 'propertyId', rental.propertyId);
  //           const propertyDocSnap = await getDoc(propertyDocRef);
  
  //           if (!propertyDocSnap.exists()) return rental; // Skip if no property data found
  
  //           const propertyData = propertyDocSnap.data() as PropertyData;
  //           console.log(propertyData)
  //           const firstImage = Array.isArray(propertyData.images) ? propertyData.images[0] : propertyData.images;
  //           const imageUrl = await getImageUrl(rental.propertyId, firstImage);            
  //           const userImage = await getUserImageUrl(rental.ownerId);

  //           const ownerDocRef = doc(db, 'users', rental.ownerId);
  //           const ownerDocSnap = await getDoc(ownerDocRef);
  //           const ownerData = ownerDocSnap.data() as OwnerData;
  
  //           return { ...rental, ...propertyData, ...ownerData, image: imageUrl, userImage: userImage };
  //         })
  //       );
  
  //       console.log('Final Rental Data:', combinedData);
  //       setRentalData(combinedData);
  //     } catch (error) {
  //       console.error('Error fetching rental history:', error);
  //       setError('Error fetching rental history');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchRentalHistory();
  // }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const uid = await SecureStore.getItemAsync('uid');
        if (!uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
  
        const contractRef = query(
          collection(db, 'contracts'),
          where('tenantId', '==', uid),
          where('status', '==', 'done')
        );
  
        const contractCollections = await getDocs(contractRef);

        console.log(contractCollections)
  
        const contractDatas = await Promise.all(
          contractCollections.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            console.log(data);
            if (!data) return null; // Ensure data exists
  
            try {
              // Fetch owner image
              const ownerImage = await getUserImageUrl(data.ownerId);
              console.log(ownerImage)
              // Fetch property details
              const propertyDocRef = doc(db, 'properties', data.ownerId, 'propertyId', data.propertyId);
              const propertyDocSnap = await getDoc(propertyDocRef);
  
              if (!propertyDocSnap.exists()) return null; // Skip if no property data found
  
              const propertyData = propertyDocSnap.data() as PropertyData;
              console.log(propertyData);
  
              // Get first property image
              const firstImage = Array.isArray(propertyData.images) ? propertyData.images[0] : propertyData.images;
              const propertyImage = await getImageUrl(data.propertyId, firstImage);
  
              return {
                id: docSnapshot.id,
                createdAt: data.createdAt as Timestamp,
                ownerContact: data.ownerContact || '',
                ownerEmail: data.ownerEmail || '',
                ownerFullAddress: data.ownerFullAddress || '',
                ownerFullName: data.ownerFullName || '',
                ownerId: data.ownerId || '',
                ownerImage: ownerImage || '',
                propertyAddress: data.propertyAddress || '',
                propertyAdvancePayment: data.propertyAdvancePayment || '',
                propertyHouseRules: data.propertyHouseRules || '',
                propertyId: data.propertyId || '',
                propertyImage: propertyImage || '',
                propertyLeaseDuration: data.propertyLeaseDuration || '',
                propertyLeaseStart: data.propertyLeaseStart || '',
                propertyLeaseEnd: data.propertyLeaseEnd || '',
                propertyName: data.propertyName || '',
                propertyRentAmount: data.propertyRentAmount || '',
                propertyRentDueDay: data.propertyRentDueDay || '',
                propertySecurityDepositAmount: data.propertySecurityDepositAmount || '',
                propertySecurityRefundPeriod: data.propertySecurityRefundPeriod || '',
                propertyTerminationPeriod: data.propertyTerminationPeriod || '',
                propertyType: data.propertyType || '',
                status: data.status || '',
                tenantContact: data.tenantContact || '',
                tenantEmail: data.tenantEmail || '',
                tenantFullAddress: data.tenantFullAddress || '',
                tenantFullName: data.tenantFullName || '',
                tenantId: data.tenantId || '',
                transactionId: data.transactionId || '',
              } as Contract;
            } catch (error) {
              console.error('Error processing contract:', error);
              return null;
            }
          })
        );
  
        // **Fix: Remove null values explicitly**
        setContracts(contractDatas.filter((contract): contract is Contract => contract !== null));
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Failed to fetch contracts');
      } finally {
        setLoading(false);
      }
    };
  
    fetchContracts();
  }, []);  

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 mb-5'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Rental History</Text>
          </View>
        </View>

        <ScrollView className='' showsVerticalScrollIndicator={false}>
          <View className='mx-2 my-5'>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text className='text-center text-red-500'>{error}</Text>
            ) : contracts.length === 0 ? (
              <Text className='text-center text-gray-500'>No rental history available.</Text>
            ) : (
              contracts.map((rental, index) => (
                <TouchableOpacity key={index} className='flex flex-row mb-4 bg-white px-3 py-2 space-x-1 rounded-xl shadow-xl border border-gray-200'
                  onPress={async () => {
                    await SecureStore.setItemAsync('selectedPropertyImage', rental.propertyImage as string);
                    await SecureStore.setItemAsync('selectedUserImage', rental.ownerImage as string);
                    // router.push('./RentalDetails')
                    router.push({ pathname: './RentalDetails', params: { rentalData: JSON.stringify(rental) } });

                    }}>
                  <Image className="w-[80px] h-[80px] object-cover rounded-2xl" source={{ uri: rental.propertyImage }} />
                  <View className='flex-1 flex-col items-start justify-center gap-1'>
                    <Text className='text-sm font-bold'>{rental.propertyName}</Text>
                    <Text className='text-xs'>{rental.propertyAddress}</Text>
                    <Text className='text-xs'>{rental.propertyLeaseStart} - {rental.propertyLeaseEnd}</Text>
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