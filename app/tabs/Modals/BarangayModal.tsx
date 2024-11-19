import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';

interface Barangay {
  code: string;
  name: string;
}

interface BarangayModalProps {
  visible: boolean;
  onClose: () => void;
  barangays: Barangay[];
  onSelectBarangay: (name: string) => void;
}

const BarangayModal: React.FC<BarangayModalProps> = ({
  visible,
  onClose,
  barangays,
  onSelectBarangay,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType='slide' onRequestClose={onClose}>
      <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
        <View className='bg-white mx-5 p-5 rounded-lg'>
          <Text className='text-lg font-bold mb-2'>Select Barangay</Text>
          <FlatList
            data={barangays}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelectBarangay(item.name);
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

export default BarangayModal;
