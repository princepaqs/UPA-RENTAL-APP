import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location'; // For getting GPS data
import Animated, { withRepeat, withTiming, Easing, useSharedValue, useAnimatedStyle } from 'react-native-reanimated'; // Import necessary animated functions
import { TouchableOpacity } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();
  // Shared value for scaling
  const scale = useSharedValue(1);

  // Create an animated style that will control the scale of the property details
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

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
    })();

    // Apply the scaling animation (in-out, in-out)
    scale.value = withRepeat(
      withTiming(1.1, { duration: 500, easing: Easing.ease }), // Grow to 1.1x size
      -1, // Repeat infinitely
      true // Alternate between growing and shrinking
    );
  }, [scale]);

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

  // Array of property locations with latitudes, longitudes, and property details
  const propertyLocations = [
    { latitude: 14.6501858, longitude: 120.9934021, title: 'Trillion Game Inc.', price: '10,000' },
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

  // Function to get the nearest property to the user's location
  function getNearestProperty() {
    if (!location) return null;

    const userLat = location.coords.latitude;
    const userLong = location.coords.longitude;
    console.log(userLat, userLong);
    // Calculate distances for all properties
    const distances = propertyLocations.map(property => {
      const distance = haversineDistance(userLat, userLong, property.latitude, property.longitude);
      console.log('Properties Distance:', distance)
      return { ...property, distance };
    });
    
    // Filter out properties with a distance greater than 5 meters
    const filteredProperties = distances.filter(property => property.distance <= 50);

    // If there are no properties within 5 meters, return null
    if (filteredProperties.length === 0) {
      return null;
    }

    // Return the closest property within 5 meters
    return filteredProperties.sort((a, b) => a.distance - b.distance)[0];
  }

  const nearestProperty = getNearestProperty();

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
                    onPress={() => router.push('./Property')} 
                    >
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
    fontSize: 12,
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
