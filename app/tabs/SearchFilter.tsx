import { View, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CityModal from './Modals/CityModal';
import PropertyTypeModal from './Modals/PropertyTypeModal';
import PriceRangeModal from './Modals/PriceRangeModal';
import OccupantModal from './Modals/OccupantsModal';
import RoomModal from './Modals/RoomsModal';
import { useFilter } from './FilterContext';

interface City {
  code: string;
  name: string;
}

const priceRanges = [
  { value: '5000_below', label: '₱5,000 - below' },
  { value: '5001_10000', label: '₱5,000 - ₱10,000' },
  { value: '10001_15000', label: '₱10,001 - ₱15,000' },
  { value: '15001_20000', label: '₱15,001 - ₱20,000' },
  { value: '20001_above', label: '₱20,001 - above' },
];

const propertyTypes = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'House', label: 'House' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Studio Unit', label: 'Studio Unit' },
];

const occupantOptions = [
  { value: '1', label: '1 Occupant' },
  { value: '2', label: '2 Occupants' },
  { value: '3', label: '3 Occupants' },
  { value: '4', label: '4 Occupants' },
  { value: '5', label: '5 Occupants' },
];

const roomOptions = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5', label: '5 Bedrooms' },
];


export default function SearchFilter() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [selectedOccupant, setSelectedOccupant] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [petsAllowed, setPetsAllowed] = useState<boolean | null>(null);

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [propertyModalVisible, setPropertyModalVisible] = useState(false);
  const [occupantModalVisible, setOccupantModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://psgc.gitlab.io/api/cities-municipalities/');
        const data = await response.json();
        const sortedCities = data.map((city: any) => ({
          code: city.code,
          name: city.name,
        })).sort((a: City, b: City) => a.name.localeCompare(b.name));

        setCities(sortedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  const handleSearch = () => {
    setSearchResultsVisible(true);
  };
  const { setFilters } = useFilter();

  const handleFilterSearch = () => {
    // Determine the pet allowance message based on the petsAllowed state
    const petAllow = petsAllowed === true ? 'Pets allowed' : (petsAllowed === false ? 'No pets allowed' : null);
  
    const filters = {
      city: selectedCity ?? undefined,
      price: selectedPrice ?? undefined,
      propertyType: Array.isArray(selectedPropertyType) && selectedPropertyType.length > 0 
        ? selectedPropertyType 
        : undefined,  // Ensure it's an array if not empty
      occupants: parseInt(selectedOccupant ?? '0'),
      rooms: parseInt(selectedRoom ?? '0'),
      petsAllowed: petAllow === 'Pets allowed' ? true : petAllow === 'No pets allowed' ? false : undefined,
    };
  
    setFilters(filters); // Set the filters in context
    // Navigate to Explore
    router.back();
  };
  



  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white px-6 my-20 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 mb-5 pb-5 border-b-2 border-gray-300'>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Search Filter</Text>
          </View>
        </View>

        {/* City or Municipality Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>City or Municipality</Text>
          <TouchableOpacity
            className='bg-gray-100 px-4 py-2 rounded-lg mt-1'
            onPress={() => setCityModalVisible(true)}
          >
            <Text>{selectedCity || 'Select City or Municipality'}</Text>
          </TouchableOpacity>
        </View>

        {/* Property Type Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>Property Type</Text>
          <TouchableOpacity
            className='bg-gray-100 px-4 py-2 rounded-lg mt-1'
            onPress={() => setPropertyModalVisible(true)}
          >
            <Text>{selectedPropertyType || 'Select Property Type'}</Text>
          </TouchableOpacity>
        </View>

        {/* Price Range Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>Price Range</Text>
          <TouchableOpacity
            className='bg-gray-100 px-4 py-2 rounded-lg mt-1'
            onPress={() => setPriceModalVisible(true)}
          >
            <Text>{selectedPrice ? priceRanges.find(range => range.value === selectedPrice)?.label : 'Select Price Range'}</Text>
          </TouchableOpacity>
        </View>


        {/* No. of Occupants Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>No. of Occupants</Text>
          <TouchableOpacity
            className='bg-gray-100 px-4 py-2 rounded-lg mt-1'
            onPress={() => setOccupantModalVisible(true)}
          >
            <Text>{selectedOccupant || 'Select Occupants'}</Text>
          </TouchableOpacity>
        </View>

        {/* No. of Rooms Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>No. of Bedrooms</Text>
          <TouchableOpacity
            className='bg-gray-100 px-4 py-2 rounded-lg mt-1'
            onPress={() => setRoomModalVisible(true)}
          >
            <Text>{selectedRoom || 'Select Room'}</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Allowed Section */}
        <View className='mt-4'>
          <Text className='text-sm pl-2 font-semibold'>Pet Allowed</Text>
          <View className='flex flex-row justify-around mt-1'>
            <TouchableOpacity
              className='flex flex-row items-center'
              onPress={() => setPetsAllowed(true)}
            >
              <View className={`h-4 w-4 mr-2 rounded-full ${petsAllowed === true ? 'bg-black' : 'border-2 border-gray-300'}`} />
              <Text>Pets Allowed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='flex flex-row items-center'
              onPress={() => setPetsAllowed(false)}
            >
              <View className={`h-4 w-4 mr-2 rounded-full ${petsAllowed === false ? 'bg-black' : 'border-2 border-gray-300'}`} />
              <Text>Not Pets Allowed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Button */}
        <View className='mt-10 mb-8 items-end justify-center'>
          <TouchableOpacity
            className='bg-[#D9534F] py-2 px-3 rounded-2xl flex flex-row items-center justify-center'
            onPress={handleFilterSearch}
          >
            <Ionicons name="search" size={15} color="white" />
            <Text className='text-white text-sm ml-2'>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results Modal */}
        {/* <Modal visible={searchResultsVisible} transparent={true} animationType="slide">
          <View className='flex-1 justify-center items-center bg-black/50'>
            <View className='bg-white rounded-lg p-6 w-3/4'>
              <Text className='text-lg font-semibold mb-2'>Search Results</Text>
              {selectedCity && <Text>City: {selectedCity}</Text>}
              {selectedPropertyType && <Text>Property Type: {selectedPropertyType}</Text>}
              {selectedPrice && <Text>Price Range: {selectedPrice}</Text>}
              {selectedOccupant && <Text>Occupants: {selectedOccupant}</Text>}
              {selectedRoom && <Text>Rooms: {selectedRoom}</Text>}
              {petsAllowed !== null && (
                <Text>Pets Allowed: {petsAllowed ? 'Pets Allowed' : 'Not Pets Allowed'}</Text>
              )}
              <View className='flex flex-row items-center justify-center space-x-4'>
                <TouchableOpacity onPress={handleFilterSearch} className='mt-4 items-center justify-center'>
                  <Text className='bg-black text-white px-3 py-1.5 rounded-2xl text-semibold'>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSearchResultsVisible(false)} className='mt-4 items-center justify-center'>
                  <Text className='border px-5 py-1.5 rounded-2xl text-semibold'>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal> */}

        {/* Modals */}
        <CityModal
          visible={cityModalVisible}
          cities={cities}
          onSelect={setSelectedCity}
          onClose={() => setCityModalVisible(false)}
        />
        <PropertyTypeModal
          visible={propertyModalVisible}
          propertyTypes={propertyTypes}
          onSelect={setSelectedPropertyType}
          onClose={() => setPropertyModalVisible(false)}
        />
        <PriceRangeModal
          visible={priceModalVisible}
          priceRanges={priceRanges}
          onSelect={setSelectedPrice}
          onClose={() => setPriceModalVisible(false)}
        />
        <OccupantModal
          visible={occupantModalVisible}
          occupantOptions={occupantOptions}
          onSelect={setSelectedOccupant}
          onClose={() => setOccupantModalVisible(false)}
        />
        <RoomModal
          visible={roomModalVisible}
          roomOptions={roomOptions}
          onSelect={setSelectedRoom}
          onClose={() => setRoomModalVisible(false)}
        />
      </View>
    </View>
  );
}