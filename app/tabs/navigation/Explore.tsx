import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, EvilIcons, Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseConfig, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import LoadingModal from '@/components/LoadingModal';
import ErrorModal from '@/components/ErrorModal';
import { useAuth } from '../../../context/authContext';
import { useFilter } from '../FilterContext'; // Import your Firestore configuration
import { onSnapshot } from 'firebase/firestore'; // Import Firestore functions
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

interface Property {
  propertyId: string;
  ownerId: string;
  tenantId: string;
  price: number;
  status: string;
  city: string;
  region: string;
  type: string;
  image: { uri: string };
  isFavorite: boolean;
  propertyName: string;
  noTenants: number;
  noBedrooms: number;
  petPolicy: string;
}

const Explore = () => {
  const router = useRouter();
  const { addFavorite, removeFavorite, logout, listenForLogout } = useAuth();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalMessage('');
    logout();
  };

  const { filters } = useFilter();
  // Debugging

  const filteredProperties = properties.filter(property => {
  const lowerCaseQuery = searchQuery.toLowerCase();

  // Check if the search query matches city or property name
  const isQueryMatch = 
      (property.city && property.city.toLowerCase().includes(lowerCaseQuery)) ||
      (property.propertyName && property.propertyName.toLowerCase().includes(lowerCaseQuery)) ||
      (property.price && property.price.toString().includes(lowerCaseQuery));


  // Check if the city matches
  const isCityMatch = !filters.city || 
      (property.city && property.city.toLowerCase().includes(filters.city.toLowerCase()));

  // Check if the price matches
  const isPriceMatch = !filters.price || (() => {
    const price = Number(property.price); // Convert property price to a number
    if (isNaN(price)) return false; // Handle invalid numbers

    const [minValue, maxValue] = filters.price.split('_').map((v: string) => parseInt(v, 10));

    if (!isNaN(minValue) && filters.price.includes('below')) {
        return price <= minValue;
    } else if (!isNaN(minValue) && filters.price.includes('above')) {
        return price >= minValue;
    } else if (!isNaN(minValue) && !isNaN(maxValue)) {
        return price >= minValue && price <= maxValue;
    }
    return true; // If no valid filter, allow all prices
})();


  // Check if the property type matches
  const isTypeMatch = !filters.propertyType || 
      (property.type && filters.propertyType.includes(property.type));

  // Check if the number of tenants matches
  const isTenantsMatch = !filters.occupants || 
      (property.noTenants && Number(property.noTenants) <= filters.occupants);

  // Check if the number of bedrooms matches
  const isBedroomsMatch = !filters.rooms || 
      (property.noBedrooms && Number(property.noBedrooms) <= filters.rooms);

  // Check if pets are allowed
  const isPetsAllowedMatch = filters.petsAllowed === undefined || 
      (property.petPolicy === 'Allowed' && filters.petsAllowed) || 
      (property.petPolicy !== 'Allowed' && !filters.petsAllowed);

  // Combine all conditions
  return (
      isQueryMatch && // Ensure the property matches the search query
      isCityMatch && 
      isPriceMatch && 
      isTypeMatch && 
      isTenantsMatch && 
      isBedroomsMatch && 
      isPetsAllowedMatch
  );
});

// console.log(filteredProperties);


  
  const { setFilters } = useFilter();
  const handleFilterPress = (filter: string) => {
    const isSelected = selectedFilters.includes(filter);
    
    // Reset logic based on the filter type
    if (filter === 'city') {
      setFilters({
        city: isSelected ? undefined : filters.city, // Reset city
        propertyType: undefined, // Reset property type filters
        price: undefined, // Reset price filters
        occupants: undefined, // Reset number of tenants filter
        rooms: undefined, // Reset number of bedrooms filter
        petsAllowed: undefined, // Reset pets allowed filter
      });
      setSelectedFilters(isSelected ? [] : ['city']); // Manage selected filters
    } else if (filter === 'price') {
      setFilters({
        price: isSelected ? undefined : filters.price, // Reset price
        city: undefined, // Reset city filter
        propertyType: undefined, // Reset property type filters
        occupants: undefined, // Reset number of tenants filter
        rooms: undefined, // Reset number of bedrooms filter
        petsAllowed: undefined, // Reset pets allowed filter
      });
      setSelectedFilters(isSelected ? [] : ['price']); // Manage selected filters
    } else if (filter === 'tenants') {
      const updatedOccupants = isSelected ? undefined : 1; // Set to the desired value
      setFilters({
        ...filters,
        occupants: updatedOccupants,
        rooms: undefined, // Reset bedrooms filter
        petsAllowed: undefined, // Reset pets filter
        city: undefined, // Reset city filter
        propertyType: undefined, // Reset property type filters
        price: undefined, // Reset price filters
      });
      setSelectedFilters(updatedOccupants ? ['tenants'] : []);
    } else if (filter === 'bedrooms') {
      const updatedRooms = isSelected ? undefined : 1; // Set to the desired value
      setFilters({
        ...filters,
        rooms: updatedRooms,
        occupants: undefined, // Reset tenants filter
        petsAllowed: undefined, // Reset pets filter
        city: undefined, // Reset city filter
        propertyType: undefined, // Reset property type filters
        price: undefined, // Reset price filters
      });
      setSelectedFilters(updatedRooms ? ['bedrooms'] : []);
    } else if (filter === 'pets') {
      const updatedPetsAllowed = !isSelected; // Toggle pet policy
      setFilters({
        ...filters,
        petsAllowed: updatedPetsAllowed,
        occupants: undefined, // Reset tenants filter
        rooms: undefined, // Reset bedrooms filter
        city: undefined, // Reset city filter
        propertyType: undefined, // Reset property type filters
        price: undefined, // Reset price filters
      });
      setSelectedFilters(updatedPetsAllowed ? ['pets'] : []);
    } else {
      const updatedFilters = isSelected ? [] : [filter];
      setSelectedFilters(updatedFilters);
      setFilters({
        ...filters,
        propertyType: updatedFilters.length > 0 ? updatedFilters : undefined,
        city: undefined, // Reset city filter
        price: undefined, // Reset price filters
        occupants: undefined, // Reset tenants filter
        rooms: undefined, // Reset bedrooms filter
        petsAllowed: undefined, // Reset pets filter
      });
    }
  };


  const shuffleArray = (array: Property[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
    // Fetch and listen to favorites
    useEffect(() => {
      const fetchFavorites = async () => {
        const tenantId = await SecureStore.getItemAsync('uid') || '';
        const favoritesRef = collection(db, 'favorites', tenantId, 'owner');
    
        const unsubscribe = onSnapshot(favoritesRef, (favoritesSnapshot) => {
          const favoritesList: { [key: string]: boolean } = {};
          listenForLogout();
          favoritesSnapshot.forEach(doc => {
            const data = doc.data();
            const key = `${data.ownerId}_${data.propertyId}`;

            favoritesList[key] = true; // Mark as favorite
          });
          setFavorites(favoritesList); // Update favorites state
        });
        
    
        return () => unsubscribe(); // Cleanup listener
      };
    
      fetchFavorites();
    }, []);


  const toggleFavorite = async (ownerId: string, propertyId: string) => {
    const key = `${ownerId}_${propertyId}`;
    const isFavorite = favorites[key];

    // Add or remove the favorite based on the current state
    if (isFavorite) {
        await removeFavorite(ownerId, propertyId);
    } else {
        await addFavorite(ownerId, propertyId);
    }
    
    // Update the local favorites state
    setFavorites(prevState => ({
        ...prevState,
        [key]: !isFavorite,
    }));
  };

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

  // Fetch property data and shuffle the list once
  const fetchPropertyData = async () => {
    console.log('Test fetch property data')
    try {
      const tenantId = await SecureStore.getItemAsync('uid') || '';
  
      // Set up listeners for property transactions and users
      const transactionsQuery = query(
        collection(db, 'propertyTransactions'),
        where('status', 'in', ['In-review', 'Approved']),
        where('tenantId', '==', tenantId)
      );
  
      const unsubscribeTransactions = onSnapshot(transactionsQuery, async (transactionsSnapshot) => {
        const transactions = transactionsSnapshot.docs.map(doc => ({
          tenantId: doc.data().tenantId,
          ownerId: doc.data().ownerId,
          propertyId: doc.data().propertyId,
          status: doc.data().status
        }));
  
        // Check if the number of transactions for each propertyId and ownerId exceeds 10
        const propertyTransactionCounts: Record<string, number> = {};
  
        transactions.forEach(transaction => {
          const key = `${transaction.propertyId}-${transaction.ownerId}`;
          propertyTransactionCounts[key] = (propertyTransactionCounts[key] || 0) + 1;
        });
  
        // Filter out the propertyId-ownerId combinations where count exceeds 5
        const excludedPropertyIds = Object.keys(propertyTransactionCounts)
          .filter(key => propertyTransactionCounts[key] > 5)
          .map(key => key.split('-')[0]); // Get the propertyIds where transactions exceed 5
  
        const unsubscribeUsers = onSnapshot(collection(db, 'users'), async (usersSnapshot) => {
          const propertiesListPromises: Promise<Property[]>[] = usersSnapshot.docs.map(async (userDoc) => {
            const ownerId = userDoc.id;
  
            if (ownerId === tenantId) {
              return []; // Skip the tenant's own properties
            }
  
            const propertiesRef = collection(db, 'properties', ownerId, 'propertyId');
            const userPropertiesPromise = new Promise<Property[]>((resolve) => {
              const unsubscribeProperties = onSnapshot(propertiesRef, async (propertiesSnapshot) => {
                const userProperties = await Promise.all(
                  propertiesSnapshot.docs.map(async (propertyDoc) => {
                    const propertyId = propertyDoc.id;
                    const propertyData = propertyDoc.data();
  
                    // Skip properties if the combination of propertyId and ownerId has more than 10 transactions
                    if (excludedPropertyIds.includes(propertyId)) {
                      console.log('ExcludedIds: ',excludedPropertyIds);
                      return null;
                    }
  
                    // Check if the property status is 'Approved' or 'Rented'
                    if (propertyData.status === 'Approved' || propertyData.status === 'Rented' || propertyData.status === 'Occupied') {
                      return null;
                    }
  
                    // Check if the property is marked as favorite
                    const favoritesRef = collection(db, 'favorites', tenantId, 'owner');
                    const isFavorite = await new Promise<boolean>((resolve) => {
                      onSnapshot(favoritesRef, (favoritesSnapshot) => {
                        resolve(favoritesSnapshot.docs.some(doc => {
                          const data = doc.data();
                          return data.propertyId === propertyId && data.tenantId === tenantId && data.ownerId === ownerId;
                        }));
                      });
                    });
  
                    // Get the first image of the property
                    const firstImageUri = propertyData.images && propertyData.images.length > 0
                      ? await getImageUrl(propertyId, propertyData.images[0])
                      : require('../../../assets/images/property1.png');
  
                    return {
                      propertyId,
                      ownerId,
                      tenantId,
                      price: propertyData.propertyMonthlyRent,
                      status: propertyData.status || 'Available',
                      city: propertyData.propertyCity,
                      region: propertyData.propertyRegion,
                      type: propertyData.propertyType || 'Condo',
                      image: { uri: firstImageUri },
                      isFavorite,
                      propertyName: propertyData.propertyName,
                      noTenants: propertyData.noOfTenants,
                      noBedrooms: propertyData.noOfBedrooms,
                      petPolicy: propertyData.propertyPetPolicy
                    } as Property; // Cast to Property type
                  })
                );
                resolve(userProperties.filter(property => property !== null));
                return () => unsubscribeProperties();
              });
            });
            return userPropertiesPromise;
          });
  
          const propertiesList = (await Promise.all(propertiesListPromises)).flat();
          setProperties(shuffleArray(propertiesList));
        });
  
        // Cleanup listeners on unmount
        return () => {
          unsubscribeUsers();
        };
      });
  
      // Cleanup listener on unmount
      return () => {
        unsubscribeTransactions();
      };
    } catch (error) {
      console.error('Failed to retrieve property data from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };
  

  
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPropertyData(); // This will shuffle the properties again
    setRefreshing(false);
  };
  
  useEffect(() => {
    console.log('fetching data')
    fetchPropertyData();
    listenForLogout();
    console.log('Test Explore')
  }, []);

  return (
    <View className='h-screen bg-[#F6F6F6]'>
      <LoadingModal visible={loading} />
      <ErrorModal visible={modalVisible} message={modalMessage} onClose={closeModal} />
      <View className='px-8 pt-5 pb-2 flex flex-row items-center'>
        <View className='flex flex-row items-center bg-[#ECECEC] rounded-full flex-1'>
          <TextInput
            className='flex-1 pl-8 text-xs'
            placeholder='Search'
            placeholderTextColor='gray'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className='flex flex-row items-center justify-center gap-2'>
            <TouchableOpacity onPress={() => router.push('../tabs/SearchFilter')}>
              <Ionicons name='filter-outline' size={15} color="gray" />
            </TouchableOpacity>
            <View className='bg-[#D9534F] p-2.5 rounded-full'>
              <Feather name='search' size={15} color="white" />
            </View>
          </View>
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className='flex flex-row gap-4 px-8 pb-3 pt-2'>
            {[
              { label: 'Condo', icon: <FontAwesome5 name="building" size={20} color="black" /> },
              { label: 'Apartment', icon: <FontAwesome name="building-o" size={20} color="black" /> },
              { label: 'Studio Unit', icon: <FontAwesome6 name="building" size={20} color="black" /> },
              { label: 'House', icon: <AntDesign name="home" size={20} color="black" /> },
            ].map(({ label, icon }) => (
              <View className={` shadow-md pb-1 ${selectedFilters.includes(label) ? 'border-b-2 rounded-b border-[#EF5A6F]' : ''}`}>
                <TouchableOpacity
                key={label}
                className={`flex flex-row items-center w-[100px] px-2 py-1 space-x-2 ${selectedFilters.includes(label) ? 'bg-white' : 'bg-white/90'} rounded-lg`}
                onPress={() => handleFilterPress(label)}
                style={{ opacity: selectedFilters.includes(label) ? 1 : 0.85 }}
              >
                {React.cloneElement(icon, { color: selectedFilters.includes(label) ? '#EF5A6F' : '#EF5A6F' })}
                <Text className='text-[#EF5A6F] text-sm font-sm'>
                  {label}
                </Text>
              </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className='px-4 mb-24 pb-24'>
        {/* <Text className='text-xl px-4  font-bold pb-3'>Property Listing</Text> */}
         <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
          <View className='flex flex-col mb-10 flex-wrap'>
          {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <View key={`${property.ownerId}-${property.propertyId}-${property.tenantId}`} className='w-full p-2 space-y-1'>
                  <TouchableOpacity
                    className='flex flex-col bg-white rounded-xl border-gray-100 p-3 shadow-md'
                    onPress={async () => {
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
                    }}
                  >
                    <View className='relative'>
                      <Image
                        className='w-full h-[150px] object-cover rounded-xl'
                        source={property.image}
                      />
                      <View
                        className='absolute top-2 left-2 bg-black/60 rounded-full px-3 py-1 shadow-md'
                      >
                        <Text className='text-xs text-white font-normal'>{property.type}</Text>
                      </View>
                    </View>
                    <View className='flex flex-row items-center justify-between pt-1'>
                      {/* <Text className='text-lg px-2 font-semibold'>{property.propertyName}</Text> */}
                     <View className='px-2 flex flex-col '>
                     
                        <View className='flex-row items-center space-x-1'>
                          <Text className='text-lg text-[#D9534F] font-bold'>
                            ₱{property.price.toLocaleString()}
                          </Text>
                          <Text className='text-sm text-[#D9534F] font-semibold'>/monthly</Text>
                        </View>
                        <View className='gap-1 flex flex-row items-center justify-start'>
                        <Octicons name="location" size={15} color="black" />
                        <Text className='text-xs font-normal'>{property.city}, {property.region}</Text>
                      </View>

                      </View>
                      
                      <TouchableOpacity onPress={() => toggleFavorite(property.ownerId, property.propertyId)}> 
                          <Ionicons
                            name={(favorites[`${property.ownerId}_${property.propertyId}`] || property.isFavorite)  ? 'heart' : 'heart-outline'}
                            size={20}
                            color={(favorites[`${property.ownerId}_${property.propertyId}`] || property.isFavorite) ? '#D9534F' : 'black'}
                          />
                        </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center">
        <Text className="text-center text-gray-500 mt-4">
          No properties available. You can add properties by being a Landlord. Check out now.
        </Text>
      </View>
            )}
          </View>
        </ScrollView>
        
      </View>
    </View>
  );
}


export default Explore