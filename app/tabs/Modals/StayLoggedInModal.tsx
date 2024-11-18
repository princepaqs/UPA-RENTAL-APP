import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface StayLoggedInModalProps {
  visible: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

const StayLoggedInModal: React.FC<StayLoggedInModalProps> = ({ visible, onClose, onYes, onNo }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg p-6 w-2/3">
          <Text className="text-lg font-bold mb-4">Change Pin</Text>
          <Text className="text-sm mb-8">Do you want to stay logged in after setting the new PIN?</Text>
          <View className="flex flex-row justify-around">
            <TouchableOpacity onPress={onYes} className="bg-black px-4 py-2 rounded-lg">
              <Text className="text-white font-bold">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNo} className="border px-4 py-2 rounded-lg">
              <Text className="text-black font-bold">No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StayLoggedInModal;
