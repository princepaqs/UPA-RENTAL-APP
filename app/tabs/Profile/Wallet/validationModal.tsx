// ValidationModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface ValidationModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const ValidationModal: React.FC<ValidationModalProps> = ({ visible, onClose, message }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-5 rounded-2xl shadow-lg">
          <Text className="text-lg font-bold text-center mb-4">Error</Text>
          <Text className="text-sm text-center mb-6">{message
            }</Text>
          <TouchableOpacity
            onPress={onClose}
            className='items-center'
          >
            <Text className="text-white bg-black rounded-xl py-1.5 px-3 text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ); 
};

export default ValidationModal;
