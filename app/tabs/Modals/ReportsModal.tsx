import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

export default function CustomModal({ visible, onClose, message }: CustomModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white p-6 rounded-xl w-4/5'>
          <Text className='text-lg font-bold mb-4'>Input Required</Text>
          <Text className='text-sm'>
            {message}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className='mt-4 items-center'
          >
            <Text className='text-white font-bold text-center bg-black py-2 px-6 rounded-md'>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
