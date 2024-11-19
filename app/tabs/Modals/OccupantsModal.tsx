import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface OccupantModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (occupant: string) => void;
  occupantOptions: { value: string; label: string }[];
}

const OccupantModal: React.FC<OccupantModalProps> = ({ visible, onClose, onSelect, occupantOptions }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white rounded-lg p-6 w-3/4'>
          <Text className='text-lg font-semibold mb-2'>Select No. of Occupants</Text>
          {occupantOptions.map((option) => (
            <TouchableOpacity key={option.value} onPress={() => { onSelect(option.value); onClose(); }} className='py-1.5 px-2 border-b border-gray-100'>
              <Text>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} className='mt-4 items-center justify-center'>
            <Text className='bg-black text-white px-3 py-1.5 rounded-2xl text-semibold'>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OccupantModal;
