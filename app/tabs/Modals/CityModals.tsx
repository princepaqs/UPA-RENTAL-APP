import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';

interface City {
  code: string;
  name: string;
}

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  cities: City[];
  onSelectCity: (item: City) => void;
}

const CityModal: React.FC<CityModalProps> = ({
  visible,
  onClose,
  cities,
  onSelectCity,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType='slide' onRequestClose={onClose}>
      <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
        <View className='bg-white mx-5 p-5 rounded-lg'>
          <Text className='text-lg font-bold mb-2'>Select City/Municipality</Text>
          <FlatList
            data={cities}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelectCity(item);
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

export default CityModal;
