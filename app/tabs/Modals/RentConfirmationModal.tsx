// app/tabs/Modals/RentConfirmationModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface RentConfirmationModalProps {
  rentConfirmationModalVisible: boolean;
  setRentConfirmationModalVisible: (visible: boolean) => void;
  plannedMoveInDate: Date;
  handleConfirm: () => void;
}

const RentConfirmationModal: React.FC<RentConfirmationModalProps> = ({
  rentConfirmationModalVisible,
  setRentConfirmationModalVisible,
  plannedMoveInDate,
  handleConfirm,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={rentConfirmationModalVisible}
      onRequestClose={() => setRentConfirmationModalVisible(false)}
    >
      <View className='flex-1 justify-center items-center bg-black/50 px-6'>
        <View className='bg-white rounded-xl p-6'>
          <Text className='text-lg font-bold mb-4'>Rent Confirmation</Text>
          <Text>
            Are you sure you want to rent this property starting on {plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}?
          </Text>
          <View className='flex-row items-center justify-evenly mt-4'>
            <TouchableOpacity onPress={handleConfirm} className='bg-black rounded-md py-2 px-8'>
              <Text className='text-white'>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRentConfirmationModalVisible(false)} className='border rounded-md py-2 px-8'>
              <Text className='text-black'>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RentConfirmationModal;
