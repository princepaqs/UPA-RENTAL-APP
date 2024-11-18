import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';

interface City {
  code: string;
  name: string;
}

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  cities: City[];
}

const CityModal: React.FC<CityModalProps> = ({ visible, onClose, onSelect, cities }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities based on search query
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className='flex-1 justify-center items-center py-28 bg-black/50'>
        <View className='bg-white rounded-lg p-6 w-3/4'>
          <Text className='text-lg font-semibold mb-2'>Select City</Text>
          
          {/* Search Input */}
          <TextInput
            placeholder="Search city..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className='border border-gray-300 rounded-md px-2 mb-4'
          />

          <FlatList
            data={filteredCities}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => { onSelect(item.name); onClose(); }} 
                className='py-1.5 px-2 border-b border-gray-100'
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity onPress={onClose} className='mt-4 items-center justify-center'>
            <Text className='bg-black text-white px-3 py-1.5 rounded-2xl text-semibold'>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CityModal;
