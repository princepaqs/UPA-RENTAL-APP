import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-2/3">
          <Text className="text-sm font-bold mb-4 text-center">Confirm Delete</Text>
          <Text className="text-xs text-gray-700 mb-6 text-center">Are you sure you want to delete this property?</Text>
          <View className="flex-row justify-center space-x-5">
            <TouchableOpacity onPress={onCancel} className="px-4 py-2 bg-[#333333] rounded">
              <Text className='text-white font-bold text-xs'>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="px-4 py-2 bg-[#D9534F] rounded">
              <Text className="text-white font-bold text-xs">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmationModal;
