import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location'; // For getting GPS data
import Animated, { withRepeat, withTiming, Easing, useSharedValue, useAnimatedStyle } from 'react-native-reanimated'; // Import necessary animated functions
import { TouchableOpacity } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/_dbconfig/dbconfig';
import * as SecureStore from 'expo-secure-store';

interface PropertyLocations {
  title: string;
  propertyId: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  price: string;
}

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [propertyLocationsArray, setPropertyLocationsArray] = useState<PropertyLocations[] | null>(null);
  const [uid, setUid] = useState('');
  const router = useRouter();
  // Shared value for scaling
  const scale = useSharedValue(1);

  // Create an animated style that will control the scale of the property details
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const fetchPropertyLocations = async (location: Location.LocationObject) => {
    
const uid = await SecureStore.getItemAsync('uid');
if(uid){
  setUid(uid);
}
    if (!location) {
      console.log('No users');
      return null;
    }

    const userLat = location.coords.latitude;
    const userLong = location.coords.longitude;
    console.log('Test user lat and long', userLat, userLong);
  
    const userRef = await getDocs(collection(db, 'users'));
    if (userRef.empty) {
      console.log('No users');
      return null;
    }
    // let allProperties: PropertyLocations[] = []; // Initialize an empty array

    // Loop through all users and fetch properties
    for (const doc of userRef.docs) {
      const userData = doc.data();
      console.log(userData);
      // Check if the user has properties
      const propertyRef = await getDocs(collection(db, 'properties', doc.id, 'propertyId'));
      if(doc.id != uid){
        for(const pdoc of propertyRef.docs){
          const propertyData = pdoc.data();
          console.log(propertyData.propertyId);
          if (!propertyRef.empty) {
            // Assuming you have location data for each property, e.g., coordinates
            propertyRef.forEach((propertyDoc) => {
                const propertyData = propertyDoc.data();
                console.log('Property Data:', propertyData);
                if (propertyData && propertyData.propertyLatitude && propertyData.propertyLongitude && propertyData.status !== 'Occupied') {
                    // Calculate distance between the user's location and the property's location
                    const propertyLat = parseFloat(propertyData.propertyLatitude);
                    const propertyLong = parseFloat(propertyData.propertyLongitude);
  
                    const distance = calculateDistance(userLat, userLong, propertyLat, propertyLong);
                    console.log('Distance to property:', distance);
  
                    // Optionally, add properties within a certain radius
                    if (distance < 50) {  // example: properties within 50 km
                      setPropertyLocationsArray((prevLocations) => {
                          const updatedLocations = [
                              ...(prevLocations || []),  // Spread the existing array, default to empty array if null
                              {
                                  title: propertyData.propertyName,
                                  price: propertyData.propertyMonthlyRent,
                                  latitude: propertyLat,
                                  longitude: propertyLong,
                                  propertyId: propertyData.propertyId,
                                  ownerId: doc.id
                              }
                          ];
                          console.log('Updated Array:', updatedLocations);  // Log the updated array
                          return updatedLocations;  // Return the new state
                      });
                  } else {
                      console.log('No properties within the radius');
                  }
                  
                }
            });
          } else {
            console.log('No property')
          }
        }
      }
    }
  }  

// Function to calculate the distance between two latitude/longitude points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Function to convert degrees to radians
const toRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

  // Request camera and location permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      console.log('Test fetch');
      fetchPropertyLocations(loc);
    })();

    // Apply the scaling animation (in-out, in-out)
    scale.value = withRepeat(
      withTiming(1.1, { duration: 500, easing: Easing.ease }), // Grow to 1.1x size
      -1, // Repeat infinitely
      true // Alternate between growing and shrinking
    );
  }, [scale]);

  // Array of property locations with latitudes, longitudes, and property details
  const propertyLocations = [
    { latitude: 14.6501399, longitude: 120.9933554, title: 'Trillion Game Inc.', price: '10,000' },
    { latitude: 14.6551901, longitude: 120.9757201 , title: 'Skyline Towers', price: '50,000' },
    { latitude: 14.6170150, longitude: 120.9835250, title: 'Oceanview Residence', price: '30,000' },
    { latitude: 14.5944130, longitude: 120.9798530, title: 'City Plaza', price: '15,500' },
    { latitude: 14.6022820, longitude: 120.9831670, title: 'Sunset Apartments', price: '80,000' },
    { latitude: 14.5679050, longitude: 120.9746950, title: 'Greenfield Residences', price: '20,000' },
    { latitude: 14.6391120, longitude: 120.9852800, title: 'The Grand Palace', price: '120,000' },
    { latitude: 14.6489840, longitude: 120.9913640, title: 'Central Business Hub', price: '60,000' },
    { latitude: 14.6131340, longitude: 120.9865840, title: 'Lakeside Condos', price: '35,000' },
    { latitude: 14.6002650, longitude: 120.9686420, title: 'Bayview Residences', price: '90,000' }
  ];

  // Function to calculate the distance between two points using the Haversine formula
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180; // Convert latitude to radians
    const φ2 = lat2 * Math.PI / 180; // Convert latitude to radians
    const Δφ = (lat2 - lat1) * Math.PI / 180; // Latitude difference in radians
    const Δλ = (lon2 - lon1) * Math.PI / 180; // Longitude difference in radians

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  function getNearestProperty(uid: string) {
    if (!location || !propertyLocationsArray) {
        console.log('Error: location or propertyLocationsArray is null');
        return null;  // Ensure propertyLocationsArray is not null
    }

    console.log(propertyLocationsArray);

    const userLat = location.coords.latitude;
    const userLong = location.coords.longitude;
    console.log('User Location:', userLat, userLong);

    // Use reduce to find the closest property within 50 meters
    const nearestProperty = propertyLocationsArray.reduce<{
        distance: number;
        title: string;
        propertyId: string;
        ownerId: string;
        latitude: number;
        longitude: number;
        price: string;
    } | null>((closest, property) => {
        const distance = haversineDistance(userLat, userLong, property.latitude, property.longitude);
        console.log('Property Distance:', distance);

        // Only consider properties within 50 meters and not owned by the current user (uid)
        if (distance <= 50 && property.ownerId !== uid) {
            // If no closest property or the current one is closer, update the closest property
            if (!closest || distance < closest.distance) {
                return { ...property, distance }; // Add distance to the property object
            }
        }
        return closest; // Return the closest property found so far
    }, null);  // Start with null as there's no closest property initially

    // If no property is found within 50 meters, return null
    if (!nearestProperty) {
        console.log('No properties within 50 meters or owned by the current user');
        return null;
    }

    // Return the closest property within 50 meters that is not owned by the current user
    return nearestProperty;
}

// Call the function with the current user's uid
const nearestProperty = getNearestProperty(uid);
console.log('Nearest Property:', nearestProperty);



  
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Display the nearest property with animated scale if within 5 meters */}
        {nearestProperty && (
          <Animated.View style={[styles.logo, animatedStyle]}>
            <Text style={styles.propertyTitle}>{nearestProperty.title}</Text>
            <Text className='mt-1' style={styles.propertyPrice}>₱ {nearestProperty.price} / Monthly</Text>
            <View className='w-full items-center justify-center'>
                <TouchableOpacity
                    className="flex-row items-center space-x-2 bg-[#333333] rounded-lg px-4 py-1.5 mt-4 border border-gray-500 shadow-md"
                    onPress={async () => {
                      await SecureStore.setItemAsync('propertyId', nearestProperty.propertyId)
                      await SecureStore.setItemAsync('userId', nearestProperty.ownerId)
                      router.push('./Property')
                    }}>
                    <AntDesign name="eyeo" size={15} color="white" />
                    <Text className=" text-xs text-white font-semibold">
                        View
                    </Text>
                </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        <View className='absolute left-5 top-12'>
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center space-x-2 bg-white rounded-full p-1.5 border border-gray-400 shadow-md">
          <Ionicons name="arrow-back-outline" size={20} color="black" />
        </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content horizontally
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '100%', // Ensure the camera view takes full width
    height: '100%', // Ensure the camera view takes full height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  logo: {
    position: 'absolute', // Position it absolutely inside the camera view
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    opacity: 0.8, // Optional: make it slightly transparent
    alignItems: 'flex-start', // Flex-start the text inside the container
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  propertyPrice: {
    fontSize: 18,
    color: '#D9534F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
