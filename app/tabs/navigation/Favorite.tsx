import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, EvilIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../../context/authContext';
import { onSnapshot } from 'firebase/firestore'; // Import Firestore functions

interface Property {
  propertyId: string;
  ownerId: string;
  tenantId: string;
  price: string;
  status: string;
  city: string;
  region: string;
  type: string;
  image: { uri: string } | number; // The URL of the first image for display
  isFavorite: boolean;
}


export default function Favorite() {
  const router = useRouter();
  const { addFavorite, removeFavorite } = useAuth();
  
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]); // Initialize as an empty array


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavoriteData();
    setTimeout(() => {
      // Simulating data refresh
      setRefreshing(false);
    }, 1000);
  };

  const getPropertyImageUrl = async (propertyId: string, fileName: string) => {
    try {
        const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error) {
        console.error("Error fetching image URL:", error);
        return null;
    }
};

const toggleFavorite = async (ownerId: string, propertyId: string) => {
  const key = `${ownerId}_${propertyId}`;
  const isFavorite = favorites[key]; // Check if the property is currently a favorite

  // Add or remove the favorite based on the current state
  if (isFavorite) {
      await removeFavorite(ownerId, propertyId); // If it's already a favorite, remove it
  } else {
      await addFavorite(ownerId, propertyId); // If it's not a favorite, add it
  }

  // Update the local favorites state
  setFavorites(prevState => ({
      ...prevState,
      [key]: !isFavorite, // Toggle the favorite state
  }));

};

const fetchFavoriteData = async () => {
  try {
    const tenantId = (await SecureStore.getItemAsync('uid')) || '';
    const favoritesRef = collection(db, "favorites", tenantId, 'owner');
    const q = query(favoritesRef, where("tenantId", "==", tenantId));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        tenantId: doc.data().tenantId,
        ownerId: doc.data().ownerId,
        propertyId: doc.data().propertyId,
      }));

      // Fetch properties with real-time updates
      const propertiesWithImages = await Promise.all(data.map(async (item) => {
        const propertiesRef = doc(db, 'properties', item.ownerId, 'propertyId', item.propertyId);

        return new Promise<Property | null>((resolve) => {
          const unsub = onSnapshot(propertiesRef, async (propertiesSnapshot) => {
            if (propertiesSnapshot.exists()) {
              const propertyData = propertiesSnapshot.data();
              const firstImageUri = propertyData.images && propertyData.images.length > 0
                ? await getPropertyImageUrl(item.propertyId, propertyData.images[0])
                : null;

              // Check if this property is a favorite
              const isFavorite = data.some(fav => fav.propertyId === item.propertyId && fav.tenantId === tenantId && fav.ownerId === item.ownerId);

              resolve({
                propertyId: item.propertyId,
                ownerId: item.ownerId,
                tenantId: tenantId,
                price: propertyData.propertyMonthlyRent,
                status: propertyData.status || 'Available',
                city: propertyData.propertyCity,
                region: propertyData.propertyRegion,
                type: propertyData.propertyType || 'Condo',
                image: firstImageUri ? { uri: firstImageUri } : require('../../../assets/images/property1.png'),
                isFavorite: isFavorite
              });
            } else {
              resolve(null);
            }
          });
        });
      }));

      const validProperties = propertiesWithImages.filter(property => property !== null);
      setProperties(validProperties);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error fetching favorite data:', error);
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    fetchFavoriteData();
  }, []);

  const newMessage = 1;
  const newNotification = 1;

  return (
    <View className='h-full bg-[#F6F6F6] flex-1'>

      {/* Property Listing */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className='px-8'>
        <Text className='text-2xl px-2 font-bold mt-5 mb-2'>Favorites</Text>
      </View>
        {loading ? (
              <View className="h-1/2  w-full justify-center items-center">
              <ActivityIndicator size="large" color="#EF5A6F" />
            </View>
            ) : (
        <View className='flex flex-col px-6 mb-16 flex-wrap'>
          {properties.length > 0 ? (
            properties.map((property) => ( // Explicitly define the type of 'property'
              <TouchableOpacity 
                key={property.ownerId} 
                className='w-full rounded-xl p-2 my-3 bg-white border-gray-100 shadow-xl'
                onPress={(async () => {
                  try {
                    if (property.propertyId) {
                      await SecureStore.setItemAsync('propertyId', property.propertyId);
                      await SecureStore.setItemAsync('userId', property.ownerId);
                      router.push('../tabs/Property');
                    } else {
                      console.error('property.id is null or undefined.');
                    }
                  } catch (error) {
                    console.error('Failed to store propertyId:', error);
                  }
                })}
              >
                <View className='w-full'>
                  <Image
                    className='w-full h-[150px] object-cover rounded-xl'
                    source={property.image} // Fallback image
                  />
                  {/* Overlay label for property type */}
                  <View className='absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-full shadow-md'>
                    <Text className='text-xs text-white'>{property.type}</Text>
                  </View>
                </View>
                <View className='px-2 flex flex-row items-center justify-between'>
                  <Text className='text-lg text-[#D9534F] font-bold'>₱ {parseInt(property.price).toLocaleString()}/monthly</Text>
                  <TouchableOpacity onPress={() => toggleFavorite(property.ownerId, property.propertyId)}> 
                    <MaterialIcons
                      name={(favorites[`${property.ownerId}_${property.propertyId}`] || property.isFavorite)  ? 'favorite' : 'favorite-outline'}
                      size={20}
                      color={(favorites[`${property.ownerId}_${property.propertyId}`] || property.isFavorite) ? '#D9534F' : 'black'}
                    />
                  </TouchableOpacity>
                </View>
                <View className='px-2 gap-1 flex flex-row items-center justify-start'>
                  <EvilIcons name='location' size={15} color="black" />
                  <Text className='text-xs font-normal'>{property.city}, {property.region}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View>
              <Text className="text-center text-gray-500 mt-5 px-2">
              You have no favorite properties yet. Start exploring and add properties to your favorites!
            </Text>
            </View>
          )}
        </View>
            )}
      </ScrollView>
    </View>
  );
}
