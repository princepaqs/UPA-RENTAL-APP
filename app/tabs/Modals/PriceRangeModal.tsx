import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface PriceRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (range: string) => void;
  priceRanges: { value: string; label: string }[];
}

const PriceRangeModal: React.FC<PriceRangeModalProps> = ({ visible, onClose, onSelect, priceRanges }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white rounded-lg p-6 w-3/4'>
          <Text className='text-lg font-semibold mb-2'>Select Price Range</Text>
          {priceRanges.map((range) => (
            <TouchableOpacity 
              key={range.value} 
              onPress={() => { 
                onSelect(range.value); // Change to range.value
                onClose(); 
              }} 
              className='py-1.5 px-2 border-b border-gray-100'
            >
              <Text>{range.label}</Text>
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

export default PriceRangeModal;
