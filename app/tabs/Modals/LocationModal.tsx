import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';

interface Location {
  code: string;
  name: string;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  locations: Location[];
  onSelectLocation: (item: Location) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  locations,
  onSelectLocation,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType='slide' onRequestClose={onClose}>
      <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
        <View className='bg-white mx-5 p-5 rounded-lg'>
          <Text className='text-lg font-bold mb-2'>Select Region/Province</Text>
          <FlatList
            data={locations}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelectLocation(item);
                  onClose();
                }}
                className='py-2'
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;
