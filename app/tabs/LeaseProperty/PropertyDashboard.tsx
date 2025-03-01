import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Animated, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign, Feather, FontAwesome5, FontAwesome6, Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import LoadingModal from '@/components/LoadingModal';

// Define the interface for the property data
interface Property {
  id: string;
  name: string;
  price: string;
  status: string;
  location: string;
  image: { uri: string } | number;
}

export default function PropertyDashboard() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const inputWidth = useRef(new Animated.Value(40)).current;
  // Count properties with 'approved' status
const rentedCount = properties.filter(property => property.status === 'Approved').length;

// Count properties with 'available' status
const vacantCount = properties.filter(property => property.status === 'Available').length;

  const handleTextChange = (text: string) => {
    setSearchText(text);
    const filtered = properties.filter(property =>
      property.name.toLowerCase().includes(text.toLowerCase()) ||
      property.location.toLowerCase().includes(text.toLowerCase()) ||
      property.status.toLowerCase().includes(text.toLowerCase()) ||
      property.price.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProperties(filtered);
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

  const handleProperty = async(propertyId: string) => {
    // router.push('../Property')
    router.push('./Property/ViewPropertyDetails')
  }

    const fetchPropertyData = async () => {
      try {
        const uid = await SecureStore.getItemAsync('uid') || 'error';
        await SecureStore.setItemAsync('userId', uid);
  
        // Get the document that contains all the propertyIds
        const propertyIdsRef = collection(db, 'properties', uid, 'propertyId'); // Adjust to your structure
        const propertyIdsSnapshot = await getDocs(propertyIdsRef); // Fetch all property IDs
  
        if (!propertyIdsSnapshot.empty) {
          const propertiesList = await Promise.all(
            propertyIdsSnapshot.docs.map(async (propertyDoc) => {
              const propertyId = propertyDoc.id; // Get the propertyId
              const propertyRef = doc(db, 'properties', uid, 'propertyId', propertyId); // Fetch property data for each propertyId
              const propertySnapshot = await getDoc(propertyRef);
  
              if (propertySnapshot.exists()) {
                const propertyData = propertySnapshot.data();
  
                // Assuming the propertyData contains the necessary fields
                const firstImageUri = propertyData.images && propertyData.images.length > 0 
                  ? await getImageUrl(propertyId, propertyData.images[0]) // Fetch the first image URL
                  : null;

                  const transactionsRef = collection(db, 'propertyTransactions');
                  const q = query(
                    transactionsRef,
                    where('ownerId', '==', uid)
                  );

                  try {
                    // Get all transactions where the owner is the current UID
                    const transactionsSnapshot = await getDocs(q);

                    // Create a map to store the status of each transaction by propertyId
                    const transactionStatusMap: Record<string, string> = {};

                    // Populate the map with transaction data
                    transactionsSnapshot.docs.forEach(doc => {
                      const transactionData = doc.data();
                      const propertyId = transactionData.propertyId;
                      const status = transactionData.status; // Add fallback if status is missing
                      transactionStatusMap[propertyId] = status;
                    });

                    // Return property data with the corresponding status from transactions
                    return {
                      id: propertyId.toString(), // Ensure it's a string
                      name: propertyData.propertyName,
                      price: propertyData.propertyMonthlyRent,
                      status: transactionStatusMap[propertyId]|| 'Available', 
                      location: propertyData.propertyCity,
                      image: firstImageUri ? { uri: firstImageUri } : require('../../../assets/images/property1.png'),
                    };
                  } catch (error) {
                    console.error('Error fetching transaction statuses:', error);
                    return null;
                  }
              } else {
                //(`Property with ID ${propertyId} does not exist.`);
                return null;
              }
            })
          );
  
          // Filter out any null values in case some properties didn't exist
          const validProperties = propertiesList.filter(property => property !== null);
          setProperties(validProperties);
          setFilteredProperties(validProperties);
        } else {
          //console.log("No property IDs found for this user.");
        }
      } catch (error) {
        console.error('Failed to retrieve property data from Firestore:', error);
      } finally {
        setLoading(false);
      }
    };


  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPropertyData(); // This will shuffle the properties again
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchPropertyData();
  }, []);

  return (
    <View className="px-6 flex-1 ">
      <LoadingModal visible={loading} />

      <View className="flex flex-col pt-5 border-t">
      <View className='flex-row items-center justify-between mb-5'>
        <TouchableOpacity className='flex flex-row items-center gap-2' onPress={async() => {
          router.replace('/tabs/Dashboard')
          await SecureStore.deleteItemAsync('isPropertyOwner');
          }}>
          <Ionicons name="home" size={24} color="black" />
          <Text className="text-xl font-bold">My Property Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./OwnerProfile')}>
            <MaterialCommunityIcons name="account-circle-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>
        <Text className="text-lg font-bold">Tools</Text>
        <View className="flex w-full px-2 gap-1.5 flex-row items-center justify-between py-4">
          <TouchableOpacity className='bg-white w-1/3 py-2 pl-1.5 rounded-md border border-gray-200 shadow-xl' onPress={() => router.push('./Tenant/tenants')}>
            <View className="flex flex-row gap-1 items-center">
              <Ionicons name="people" color="black" size={15} />
              <Text className="text-[10px]">Tenants</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className='bg-white w-1/3 py-2 pl-1.5 rounded-md border border-gray-200 shadow-xl' onPress={() => router.push('./Maintenance/maintenance')}>
            <View className="flex flex-row gap-1 items-center">
              <Feather name="tool" color="black" size={15} />
              <Text className="text-[10px]">Maintenance</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className='bg-white w-1/3 py-2 pl-1.5 rounded-md border border-gray-200 shadow-xl' onPress={() => router.push('./Revenue/revenue')}>
            <View className="flex flex-row gap-1 items-center">
              <FontAwesome6 name="sack-dollar" color="black" size={15} />
              <Text className="text-[10px]">Revenue</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-lg font-bold py-2">Overview</Text>

      <View className="flex flex-row items-center gap-1 pr-2">
        <View className="flex flex-col w-1/3 py-2 px-3 bg-[#333333] rounded-lg shadow-lg">
          <View className="flex flex-row gap-1 items-center">
            <Ionicons name="home" color="white" size={15} />
            <Text className="text-[12px] text-white">Property</Text>
          </View>
          <View className="flex items-end pt-2">
            <Text className="text-3xl font-semibold text-white">{properties.length}</Text>
          </View>
        </View>
        <View className="flex flex-col w-1/3 py-2 px-3 bg-[#B33939] rounded-lg shadow-lg">
          <View className="flex flex-row gap-1 items-center">
            <AntDesign name="like2" color="white" size={15} />
            <Text className="text-[12px] text-white">Rented</Text>
          </View>
          <View className="flex items-end pt-2">
            <Text className="text-3xl font-semibold text-white">{rentedCount}</Text>
          </View>
        </View>
        <View className="flex flex-col w-1/3 py-2 px-3 bg-[#16423C] rounded-lg shadow-lg">
          <View className="flex flex-row gap-1 items-center">
            <FontAwesome5 name="building" color="white" size={15} />
            <Text className="text-[12px] text-white">Vacant</Text>
          </View>
          <View className="flex items-end pt-2">
            <Text className="text-3xl font-semibold text-white">{vacantCount}</Text>
          </View>
        </View>
      </View>

      <View className="flex flex-row items-center justify-between pt-5">
        <Text className="text-lg font-bold">List of Property</Text>
        <View className="flex flex-col items-center justify-end">
        <TouchableOpacity className="bg-[#D9534F] py-1.5 px-2 rounded-2xl" onPress={() => router.push('./AddProperty/addNewProperty')}>
              <View className='felx flex-row items-center'>
                <MaterialIcons name="add" color="white" size={20} />
                <Text className='text-white text-xs'>Add Property</Text>
              </View>
        </TouchableOpacity>
          
        </View>
        
      </View>
      <View className='items-start py-2 border-b border-gray-200'>
        

        <View className="flex flex-row items-center w-full bg-white px-4 rounded-full">
            <Ionicons name="search" size={15} color="gray" />
            {/* Animated TextInput for searching */}
              <TextInput 
                className="text-xs w-full pl-2 pr-6 py-1" 
                placeholder="Search"
                value={searchText}
                onChangeText={handleTextChange}
              />
          </View>
      </View>
      
      {/* Property Listing */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View className="flex flex-col px-2 mt-2 mb-20 flex-wrap space-y-3">
          {filteredProperties.length === 0 ? (
            <></>
          ) : (
            filteredProperties.map((property) => (
                <TouchableOpacity key={property.id} className="w-full bg-white px-2.5 py-2 rounded-xl shadow-xl border border-gray-200 flex flex-row" onPress={async () => {
                  await SecureStore.setItemAsync('propertyId', property?.id);
                  handleProperty(property?.id)}}
                  >
                  <Image className="w-[100px] h-[100px] object-cover rounded-2xl" source={property.image} />
                  <View className="flex flex-col flex-1 gap-1 px-2 pt-2">
                    {/* Property Name */}
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                      Property Name: {property.name}
                    </Text>
                    {/* Address */}
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                      Address: {property.location}
                    </Text>
                    {/* Price */}
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                      Price: ₱ {parseInt(property.price).toLocaleString()}/monthly
                    </Text>
                    {/* Status */}
                    <View className='flex-row items-center space-x-1'>
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]"></Text>
                        <Text
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                            property?.status === 'Approved'
                                ? 'green'
                                : property?.status === 'Occupied'
                                  ? 'black'
                                  : 'blue', // fallback color for other statuses
                          }}
                        ></Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                            color:
                            property?.status === 'Approved'
                                ? 'green'
                                : property?.status === 'Occupied'
                                  ? 'black'
                                  : 'blue', // fallback color for other statuses
                          }}>
                          {property.status}
                        </Text>
                    </View>
                  </View>
                </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

    </View>
  );
}
