// ConfirmModal.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, onConfirm, onCancel, message, title }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-2/3">
          <Text className="text-lg font-bold mb-4 text-center">{title}</Text>
          <Text className="mb-6 text-center">{message}</Text>
          <View className="flex-row justify-center space-x-5">
            <TouchableOpacity
              className="bg-gray-800 py-2 px-4 rounded-lg"
              onPress={onConfirm}
            >
              <Text className="text-white">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border py-2 px-4 rounded-lg"
              onPress={onCancel}
            >
              <Text>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
