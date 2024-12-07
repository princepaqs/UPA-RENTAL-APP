import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Image, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location'; // Import Expo Location
import dummyProperties from "./dummyProperties.json";

const DirectionsMap = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null); // State to store user location

  useEffect(() => {
    // Get the user's location when the component mounts
    const fetchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          Alert.alert("Permission Denied", "Location permission is required to access your location.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Unable to fetch location.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, []);

  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);

  const handleMarkerPress = (propertyId: number) => {
    setSelectedMarkerId(propertyId === selectedMarkerId ? null : propertyId); // Toggle visibility
  };

  const handleViewProperty = () => {
    if (selectedMarkerId !== null) {
      console.log(`Navigating to Property with ID: ${selectedMarkerId}`);
      router.push('./Property');
    } else {
      // Handle case where no marker is selected
      Alert.alert('Please select a property marker first.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 14.5995, // Default region if user location is not available
            longitude: 120.9842, // Default region if user location is not available
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
          region={
            userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 3,
                  longitudeDelta: 3,
                }
              : undefined
          }
        >
          {/* Markers for Properties */}
          {dummyProperties.map((property) => (
            <Marker
              key={property.id}
              coordinate={{
                latitude: property.propertyLatitude,
                longitude: property.propertyLongitude,
              }}
              onPress={() => handleMarkerPress(property.id)} // Handle Marker press
            >
              <View className="flex-col items-center space-y-1">
                {/* Custom view for marker */}
                {selectedMarkerId === property.id && (
                  <View className="bg-black/80 w-[150px] p-2 rounded-md border shadow-md">
                    <Text className="text-white" style={styles.markerTitle}>{property.propertyName}</Text>
                    <Text className="text-white" style={styles.markerDescription}>{property.propertyAddress}</Text>
                    <Image source={require('../../../assets/images/property1.png')} style={styles.propertyImage } />
                  </View>
                )}
                <Image
                  source={require('../../../assets/images/markerUPA.png')}
                  style={{
                    width: 40,
                    height: 40,
                    opacity: selectedMarkerId === property.id ? 1 : 0.8,
                  }}
                />
              </View>
            </Marker>
          ))}
          {/* User location marker */}
          {userLocation && (
            <Marker coordinate={userLocation}>
              <Image source={require('../../../assets/images/profile.png')} style={{ width: 30, height: 30 }} />
            </Marker>
          )}
        </MapView>
      )}

      <View className="absolute top-12 right-5 w-full flex-row space-x-5 items-center justify-end">
        <TouchableOpacity onPress={() => router.push('./AugmentReality')} className="flex-row items-center space-x-2 bg-white rounded-full p-1 border border-gray-400 shadow-md">
          <MaterialIcons name="camera" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-[100px] w-full flex-row space-x-5 items-center justify-center">
        {selectedMarkerId ? (
          <TouchableOpacity
            className="flex-row items-center space-x-2 bg-white rounded-lg px-4 py-1 border border-gray-500 shadow-lg"
            onPress={handleViewProperty}
          >
            <AntDesign name="eye" size={15} color="black" />
            <Text className=" text-sm font-bold">
              View
            </Text>
          </TouchableOpacity>
        ) : ''}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  markerDescription: {
    textAlign: "center",
    fontSize: 10,
    marginVertical: 5,
  },
  viewPropertyButton: {
    backgroundColor: "#333333",
    padding: 5,
    borderRadius: 5,
  },
  viewPropertyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  propertyImage: {
    width: 120,
    height: 80,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default DirectionsMap;
