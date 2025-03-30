import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Animated, RefreshControl } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator } from 'react-native';


/*const property = [
  { id: 1, name: 'Paquiado', date: 'July 20, 2024', status: 'Pending', location: 'Caloocan City, Metro Manila', image: require('../../../assets/images/property1.png') },
  { id: 2, name: 'John Doe', date: 'July 20, 2024', status: 'Pending', location: 'Makati City, Metro Manila', image: require('../../../assets/images/property1.png') },
  { id: 3, name: 'Jane Smith', date: 'July 20, 2024', status: 'Pending', location: 'Quezon City, Metro Manila', image: require('../../../assets/images/property1.png') },
];*/

interface Property {
  id: string;
  name: string;
  propertyId: string;
  price: string;
  status: string;
  city: string;
  region: string;
  type: string;
  image: { uri: string } | number;
}

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

export default function TrackApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);

    const fetchTransactions = async () => {
      const tenantId = await SecureStore.getItemAsync('uid');
      try {
        // Define the type for transaction data
        interface TransactionData {
          transactionId: string;
          ownerId: string;
          status: string;
        }
  
        // Define the type for the transaction data map
        const transactionDataMap: Record<string, TransactionData> = {};
  
        // Fetch all transactions where the tenant is involved
        const transactionsRef = collection(db, 'propertyTransactions');
        const getTenantTransactions = query(
          transactionsRef,
          where('tenantId', '==', tenantId),
          where('status', '==', 'In-review')
        );
        const transactionsSnapshot = await getDocs(getTenantTransactions);
  
        // Create a map of propertyId to transaction data (ownerId, status, etc.)
        transactionsSnapshot.docs.forEach((doc) => {
          const transactionData = doc.data();
          transactionDataMap[transactionData.propertyId] = {
            transactionId: transactionData.transactionId,
            ownerId: transactionData.ownerId,
            status: transactionData.status,
          };
        });
  
        // Eliminate duplicate owner IDs
        const uniqueOwnerIds = [...new Set(transactionsSnapshot.docs.map(doc => doc.data().ownerId))];
        //console.log(uniqueOwnerIds);
  
        // Fetch properties for each unique ownerId
        const propertiesList = await Promise.all(
          uniqueOwnerIds.map(async (ownerId) => {
            const propertiesRef = query(collection(db, 'properties', ownerId, 'propertyId'), where('status', '==', 'Available'));
            const propertiesSnapshot = await getDocs(propertiesRef);
  
            if (!propertiesSnapshot.empty) {
              const userProperties = await Promise.all(
                propertiesSnapshot.docs.map(async (propertyDoc) => {
                  const propertyId = propertyDoc.id;
                  const propertyData = propertyDoc.data();
  
                  // Skip properties not in-review (i.e., not part of the transaction)
                  if (!transactionDataMap[propertyId]) {
                    return null;
                  }
  
                  const firstImageUri = propertyData.images && propertyData.images.length > 0
                    ? await getImageUrl(propertyId, propertyData.images[0])
                    : null;
  
                  return {
                    id: transactionDataMap[propertyId].transactionId, // Ensure the correct transaction ID is used
                    propertyId: propertyId,
                    uid: ownerId,
                    name: propertyData.propertyName,
                    price: propertyData.propertyMonthlyRent,
                    status: transactionDataMap[propertyId].status || 'Available',
                    city: propertyData.propertyCity,
                    region: propertyData.propertyRegion,
                    type: propertyData.propertyType || 'Condo',
                    image: firstImageUri ? { uri: firstImageUri } : require('../../../../assets/images/property1.png'),
                  };
                })
              );
              return userProperties.filter(property => property !== null); // Filter out null values
            }
            return []; // If no properties found, return an empty array
          })
        );
  
        // Flatten the result and update state
        const allProperties = propertiesList.flat();
        setProperties(allProperties);
      } catch (error) {
        console.error('Failed to retrieve property data from Firestore:', error);
      } finally {
        setLoading(false); // Data is fetched, stop loading
      }
    };
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions(); // This will shuffle the properties again
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const getStatusColor = (status:any) => {
    switch (status) {
      case 'In-review':
        return '#000000'; // Black
      case 'Approved':
        return '#28a745'; // Green
      default:
        return '#007bff'; // Default color
    }
  };

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 mb-10'>
          
          <TouchableOpacity onPress={() => router.replace('../../Dashboard')}>
            <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Track Property Application</Text>
          </View>
          
        </View>

        {/* Property Listing */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
          <View className="flex flex-col items-center gap-3 mb-10 ">
            {loading ? (
              <View className="flex-1 w-full h-full justify-center items-center">
              <ActivityIndicator size="large" color="gray" />
            </View>
            ) : (
              
              properties.length > 0 ? (
                properties.map((property, index) => (
                  <TouchableOpacity 
                    className='py-1.5 px-2.5 flex-wrap bg-white rounded-xl shadow-xl border border-gray-200' 
                    key={`${property.id}-${index}`} // Use a combination of id and index for uniqueness
                    onPress={ async () => {
                      await SecureStore.setItemAsync('transactionId', property.id);
                      await SecureStore.setItemAsync('propertyId', property.propertyId);
                      //console.log('PropertyId', property.id);
                      router.push('./ApplicationDetails')
                    }}>
                    <View className="w-full p-1 flex flex-row items-center">
                      <Image className="w-[85px] h-[85px] object-cover rounded-2xl" source={property.image} />
                      <View className="flex flex-col flex-1 gap-1 px-2">
                        {/* Application ID */}
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {property.name}
                        </Text>
                        {/* Type of Property / Location */}
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {property.type}, {property.city}, {property.region}
                        </Text>
                        {/* Price */}
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          Price: ₱{parseInt(property.price).toLocaleString()}
                        </Text>
                        {/* Status */}
                        <View className='flex-row items-center space-x-1'>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">Application Status:</Text>
                        <Text
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                            property?.status === 'Approved'
                                ? 'green'
                                : property?.status === 'In-review'
                                  ? 'black'
                                  : 'red', // fallback color for other statuses
                          }}
                        ></Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {property.status}
                        </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
                
              ) : (
                <View className="pt-4">
                   <Text className="text-center text-gray-500 mt-2">
                    You haven't applied for any properties yet. Start exploring and submit your first application to track its status here!
                  </Text>
                </View>

              )
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

