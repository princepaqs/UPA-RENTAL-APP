import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Image, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location'; // Import Expo Locationimport { collection, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

interface Properties {
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyLatitude: number;
  propertyLongitude: number;
  propertyImage: { uri: string};
}

const DirectionsMap = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Properties[] | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null); // State to store user location
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchUserImage = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      
          if (uid) {
            try {
              const profilePictureFileName = `${uid}-profilepictures`;
              const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
              const downloadURL = await getDownloadURL(profilePictureRef);
              setProfilePicUrl(downloadURL);
            } catch (error) {
              console.error('Error fetching profile picture:', error);
            }
          }
    }

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

    const fetchProperties = async () => {
      try {
        const tenantId = await SecureStore.getItemAsync('uid') || '';
        console.log('TenantId:', tenantId);
    
        // Fetch all documents from the 'users' collection
        const userQuerySnapshot = await getDocs(collection(db, 'users'));
    
        // Filter out documents where the ID matches the tenantId
        const filteredUserIds = userQuerySnapshot.docs
          .filter(doc => doc.id !== tenantId)
          .map(doc => doc.id);
    
        console.log('Filtered User IDs:', filteredUserIds);
    
        const propertiesArray: Properties[] = [];

      for (const userId of filteredUserIds) {
        try {
          const propertyQuerySnapshot = await getDocs(collection(db, 'properties', userId, 'propertyId'));

          for (const doc of propertyQuerySnapshot.docs) {
            const propertyData = doc.data();

            // Resolve the image URI
            const firstImageUri = 
              propertyData.images && propertyData.images.length > 0
                ? await getImageUrl(doc.id, propertyData.images[0]) // Await ensures the promise resolves
                : require('../../../assets/images/property1.png'); // Fallback image

            // Add resolved data to propertiesArray
            propertiesArray.push({
              userId,
              propertyId: doc.id,
              propertyName: propertyData.propertyName,
              propertyAddress: `${propertyData.propertyHomeAddress}, ${propertyData.propertyBarangay}, ${propertyData.propertyCity}, ${propertyData.propertyRegion}`,
              propertyLatitude: parseFloat(propertyData.propertyLatitude) || 0,
              propertyLongitude: parseFloat(propertyData.propertyLongitude) || 0,
              propertyImage: {uri: firstImageUri}, // Resolved URI
            });
          }
        } catch (error) {
          console.error(`Error fetching properties for userId ${userId}:`, error);
        }
      }

        console.log('Fetched Properties:', propertiesArray);
        setProperties(propertiesArray); // Set the properties in state
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchUserImage();
    fetchUserLocation();
    fetchProperties();
  }, []);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');

  const handleMarkerPress = (userId: string, propertyId: string) => {
    setSelectedUserId(userId === selectedUserId ? '' : userId);
    setSelectedMarkerId(propertyId === selectedMarkerId ? '' : propertyId); // Toggle visibility
    setSelectedId(`${userId}-${propertyId}` === `${selectedUserId}-${selectedMarkerId}` ? '' : `${userId}-${propertyId}`);
  };

  const handleViewProperty = async () => {
    if (selectedMarkerId !== null && selectedUserId !== null) {
      console.log(`Navigating to Property with ID: ${selectedUserId} ${selectedMarkerId}`);
      await SecureStore.setItemAsync('propertyId', selectedMarkerId);
      await SecureStore.setItemAsync('userId', selectedUserId);
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
          {properties?.map((property) => (
            <Marker
              key={`${property.userId}-${property.propertyId}`}
              coordinate={{
                latitude: property.propertyLatitude,
                longitude: property.propertyLongitude,
              }}
              onPress={() => handleMarkerPress(property.userId, property.propertyId)} // Handle Marker press
            >
              <View className="flex-col items-center space-y-1">
                {/* Custom view for marker */}
                {selectedId === `${property.userId}-${property.propertyId}` && (
                  <View className="bg-black/80 w-[150px] p-2 rounded-md border shadow-md">
                    <Text className="text-white" style={styles.markerTitle}>{property.propertyName}</Text>
                    <Text className="text-white" style={styles.markerDescription}>{property.propertyAddress}</Text>
                    <Image source={property.propertyImage} style={styles.propertyImage } />
                  </View>
                )}
                <Image
                  source={require('../../../assets/images/markerUPA.png')}
                  style={{
                    width: 40,
                    height: 40,
                    opacity: selectedMarkerId === property.propertyId ? 1 : 0.8,
                  }}
                />
              </View>
            </Marker>
          ))}
          {/* User location marker */}
          {userLocation && (
            <Marker coordinate={userLocation}>
              <Image source={profilePicUrl ? { uri: profilePicUrl} : require('../../../assets/images/profile.png')} style={{ width: 30, height: 30, borderRadius: 15 }} />
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
