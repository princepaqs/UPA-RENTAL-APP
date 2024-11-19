import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface ModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const ChangePinModal: React.FC<ModalProps> = ({ visible, message, onClose }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center px-8 bg-black/50">
        <View className="bg-white p-6 rounded-lg shadow-lg">
          <Text className="text-lg font-bold text-center mb-4">{message}</Text>
          <View className='items-center'>
            <TouchableOpacity
              onPress={onClose}
              className="bg-black py-1.5 px-4 rounded-2xl"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePinModal;
