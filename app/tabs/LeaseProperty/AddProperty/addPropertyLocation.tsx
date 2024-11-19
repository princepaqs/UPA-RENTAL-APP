import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, FlatList, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export default function AddPropertyLocation() {
  const router = useRouter();
  const [address, setAddress] = useState<{ address: string; city: string; region: string; barangay: string; zipCode: string }>({
    address: '',
    city: '',
    region: '',
    barangay: '',
    zipCode: ''
  });
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  const [locations, setLocations] = useState<{ code: string; name: string; type: 'region' | 'province' }[]>([]);
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);

  useEffect(() => {
    // Fetch regions and provinces
    Promise.all([
      fetch('https://psgc.gitlab.io/api/regions/').then(response => response.json()),
      fetch('https://psgc.gitlab.io/api/provinces/').then(response => response.json())
    ])
    .then(([regionsData, provincesData]) => {
      const combinedLocations = [
        ...regionsData.map((region: any) => ({ code: region.code, name: region.name, type: 'region' })),
        ...provincesData.map((province: any) => ({ code: province.code, name: province.name, type: 'province' }))
      ].sort((a, b) => a.name.localeCompare(b.name));
      setLocations(combinedLocations);
    })
    .catch(error => {
      console.error('Error fetching locations:', error);
      Alert.alert('Error', 'Failed to load locations.');
    });
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const locationType = locations.find(loc => loc.code === selectedLocation)?.type;
      if (locationType) {
        fetch(`https://psgc.gitlab.io/api/${locationType}s/${selectedLocation}/cities-municipalities/`)
          .then(response => response.json())
          .then(data => {
            const sortedCities = data
              .map((city: any) => ({ code: city.code, name: city.name }))
              .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

            setCities(sortedCities);
          })
          .catch(error => console.error(error));
      }
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedCity) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays/`)
        .then(response => response.json())
        .then(data => {
          const sortedBarangays = data
            .map((barangay: any) => ({ code: barangay.code, name: barangay.name }))
            .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

          setBarangays(sortedBarangays);
        })
        .catch(error => console.error(error));
    }
  }, [selectedCity]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setMarker({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    })();
  }, []);

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleAddressChange = async (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    setAddress(updatedAddress);
    
    // Construct the full address from the updated fields
    const fullAddress = `${updatedAddress.address}, ${updatedAddress.barangay}, ${updatedAddress.city}, ${updatedAddress.region}`;
  
    // Only geocode if enough information is provided
    if (updatedAddress.address && updatedAddress.city && updatedAddress.region && updatedAddress.barangay) {
      try {
        const results = await Location.geocodeAsync(fullAddress);
        if (results.length > 0) {
          const { latitude, longitude } = results[0];
          setMarker({ latitude, longitude });
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    }
  };

  const handleContinue = async() => {
    try {
      if(!address.address || !address.region || !address.city ||
          !address.barangay || !address.zipCode || !marker?.latitude ||
          !marker?.longitude)
      {
        Alert.alert('Error', 'Please input all fields!');
        return
      }else {
        /*const propertyData = {
          propertyHomeAddress: address.address,
          propertyRegion: address.region,
          propertyCity: address.city,
          propertyBarangay: address.barangay,
          propertyZipCode: address.zipCode,
          propertyLatitude: marker?.latitude,
          propertyLongitude: marker?.longitude,
        };

        console.log('Property Data:', propertyData);
        await SecureStore.setItemAsync('propertyLocation', JSON.stringify(propertyData));*/

        await SecureStore.setItemAsync('propertyHomeAddress', address.address);
        await SecureStore.setItemAsync('propertyRegion', address.region);
        await SecureStore.setItemAsync('propertyCity', address.city);
        await SecureStore.setItemAsync('propertyBarangay', address.barangay);
        await SecureStore.setItemAsync('propertyZipCode', address.zipCode);
        await SecureStore.setItemAsync('propertyLatitude', marker?.latitude.toString());
        await SecureStore.setItemAsync('propertyLongitude', marker?.longitude.toString());
        router.replace('./addRentalDetails');
      } 
    } catch (error) {
      Alert.alert('Error', 'Error!');
    }
  }

  // Search state variables
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchBarangay, setSearchBarangay] = useState('');
  // Filter functions
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  const filteredBarangays = barangays.filter(barangay => 
    barangay.name.toLowerCase().includes(searchBarangay.toLowerCase())
  );

  return (
    <View className='bg-[#B33939] py-2'>
      <View className='h-screen bg-white px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          <TouchableOpacity onPress={() => router.replace('../PropertyDashboard')}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-lg font-semibold text-center'>Add Property</Text>
          </View>
        </View>

        <View className="flex flex-col justify-between mt-5 pt-3 pb-1 border-t mb-2">
          <Text className="text-lg font-bold py-2">Property Location</Text>
          <Text className="text-xs ">Enter the full address and pin the location on the map.</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className='mb-20 mt-2'>
            {/* Home Address Input Fields */}
            <TextInputFields
              address={address}
              onAddressChange={handleAddressChange}
              locations={locations}
              cities={cities}
              barangays={barangays}
              onLocationChange={(value) => {
                setSelectedLocation(value);
                setAddress((prev) => ({ ...prev, region: value }));
                setSelectedCity(''); // Reset city and barangay when location changes
                setAddress((prev) => ({ ...prev, city: '', barangay: '' }));
              }}
              onCityChange={(value) => {
                setSelectedCity(value);
                setAddress((prev) => ({ ...prev, city: value }));
                setAddress((prev) => ({ ...prev, barangay: '' })); // Reset barangay when city changes
              }}
              onBarangayChange={(value) => {
                setAddress((prev) => ({ ...prev, barangay: value }));
              }}
              showLocationModal={showLocationModal}
              setShowLocationModal={setShowLocationModal}
              showCityModal={showCityModal}
              setShowCityModal={setShowCityModal}
              showBarangayModal={showBarangayModal}
              setShowBarangayModal={setShowBarangayModal}
            />

            {/* Map Location */}
            <View className='pt-2'>
              <Text className='px-2 text-xs font-semibold'>Map location</Text>
              <Text className='px-2 py-1 text-xs '>Adjust the map pin if the location is inaccurate to ensure precise property placement.</Text>
              {region ? (
                <MapView
                style={{ height: 300, width: '100%' }}
                region={region}
                onPress={handleMapPress}
                showsUserLocation={true}
              >
                {marker && (
                  <Marker
                    coordinate={marker}
                    draggable
                    onDragEnd={(e) => {
                      setMarker({
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                      });
                    }}
                  />
                )}
              </MapView>              
              ) : (
                <Text>Loading map...</Text>
              )}
              {/* { marker && (
                <Text className='pt-2 text-center'>Latitude: {marker.latitude}, Longitude: {marker.longitude}</Text>
              )} */}
            </View>

            <View className='flex flex-row mt-4'>
              <View className='flex flex-row pr-4  gap-1'>
                <TouchableOpacity className='bg-[#333333] py-3 rounded-md w-1/2' onPress={() => router.back()}>
                  <View >
                    <Text className='text-xs text-center text-white'>Back</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className='bg-[#B33939] py-3 rounded-md w-1/2' onPress={handleContinue}>
                  <View >
                    <Text className='text-xs text-center text-white'>Continue</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Location Modal */}
<Modal
  visible={showLocationModal}
  transparent={true}
  animationType='slide'
  onRequestClose={() => setShowLocationModal(false)}
>
  <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
    <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
      <Text className='text-lg font-bold mb-2'>Select Region/Province</Text>
      <TextInput
        className='bg-gray-100 rounded-md p-2 mb-2'
        placeholder='Search Region/Province'
        value={searchLocation}
        onChangeText={setSearchLocation}
      />
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedLocation(item.code);
              setAddress((prev) => ({ ...prev, region: item.name }));
              setShowLocationModal(false);
            }}
            className='py-2'
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Close Button */}
      <TouchableOpacity 
        onPress={() => setShowLocationModal(false)} 
        className='bg-[#333333] rounded-md py-2 mt-4'
      >
        <Text className='text-white text-center'>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* City Modal */}
<Modal
  visible={showCityModal}
  transparent={true}
  animationType='slide'
  onRequestClose={() => setShowCityModal(false)}
>
  <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
    <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
      <Text className='text-lg font-bold mb-2'>Select City/Municipality</Text>
      <TextInput
        className='bg-gray-100 rounded-md p-2 mb-2'
        placeholder='Search City/Municipality'
        value={searchCity}
        onChangeText={setSearchCity}
      />
      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedCity(item.code);
              setAddress((prev) => ({ ...prev, city: item.name }));
              setShowCityModal(false);
            }}
            className='py-2'
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Close Button */}
      <TouchableOpacity 
        onPress={() => setShowCityModal(false)} 
        className='bg-[#333333] rounded-md py-2 mt-4'
      >
        <Text className='text-white text-center'>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Barangay Modal */}
<Modal
  visible={showBarangayModal}
  transparent={true}
  animationType='slide'
  onRequestClose={() => setShowBarangayModal(false)}
>
  <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
    <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
      <Text className='text-lg font-bold mb-2'>Select Barangay</Text>
      <TextInput
        className='bg-gray-100 rounded-md p-2 mb-2'
        placeholder='Search Barangay'
        value={searchBarangay}
        onChangeText={setSearchBarangay}
      />
      <FlatList
        data={filteredBarangays}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setAddress((prev) => ({ ...prev, barangay: item.name }));
              setShowBarangayModal(false);
            }}
            className='py-2'
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Close Button */}
      <TouchableOpacity 
        onPress={() => setShowBarangayModal(false)} 
        className='bg-[#333333] rounded-md py-2 mt-4'
      >
        <Text className='text-white text-center'>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      </View>
    </View>
  );
}

function TextInputFields({
  address,
  onAddressChange,
  locations,
  cities,
  barangays,
  onLocationChange,
  onCityChange,
  onBarangayChange,
  showLocationModal,
  setShowLocationModal,
  showCityModal,
  setShowCityModal,
  showBarangayModal,
  setShowBarangayModal
}: {
  address: {
    address: string;
    city: string;
    region: string;
    barangay: string;
    zipCode: string;
  };
  onAddressChange: (field: string, value: string) => void;
  locations: { code: string; name: string; type: 'region' | 'province' }[];
  cities: { code: string; name: string }[];
  barangays: { code: string; name: string }[];
  onLocationChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onBarangayChange: (value: string) => void;
  showLocationModal: boolean;
  setShowLocationModal: (visible: boolean) => void;
  showCityModal: boolean;
  setShowCityModal: (visible: boolean) => void;
  showBarangayModal: boolean;
  setShowBarangayModal: (visible: boolean) => void;
}) {
  return (
    <View className='p-2'>
      <View className='mb-3'>
        <Text className='text-xs font-semibold mb-1'>Home Address</Text>
        <TextInput
          className='bg-gray-100  rounded-md p-2'
          placeholder='House No., Street Name'
          value={address.address}
          onChangeText={(text) => onAddressChange('address', text)}
        />
      </View>
      <View className='mb-3'>
        <Text className='text-xs font-semibold mb-1'>Region/Province</Text>
        <TouchableOpacity onPress={() => setShowLocationModal(true)} className='bg-gray-100 rounded-md p-3'>
          <Text className=''>{address.region || 'Select Region/Province'}</Text>
        </TouchableOpacity>
      </View>
      <View className='mb-3'>
        <Text className='text-xs font-semibold mb-1'>City/Municipality</Text>
        <TouchableOpacity onPress={() => setShowCityModal(true)} className='bg-gray-100 rounded-md p-3'>
          <Text className=''>{address.city || 'Select City/Municipality'}</Text>
        </TouchableOpacity>
      </View>
      <View className='mb-3'>
        <Text className='text-xs font-semibold mb-1'>Barangay</Text>
        <TouchableOpacity onPress={() => setShowBarangayModal(true)} className='bg-gray-100 rounded-md p-3'>
          <Text className=''>{address.barangay || 'Select Barangay'}</Text>
        </TouchableOpacity>
      </View>
      <View className='mb-3'>
        <Text className='text-xs font-semibold mb-1'>ZIP Code</Text>
        <TextInput
          className='bg-gray-100  rounded-md p-2'
          placeholder='ZIP code'
          value={address.zipCode}
          onChangeText={(text) => onAddressChange('zipCode', text)}
          keyboardType='numeric'
        />
      </View>
    </View>
  );
}
