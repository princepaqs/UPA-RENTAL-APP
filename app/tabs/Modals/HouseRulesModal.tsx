import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';

interface HouseRulesModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  petPolicy: string;
  houseRules: string;
}

const HouseRulesModal: React.FC<HouseRulesModalProps> = ({ modalVisible, setModalVisible, petPolicy, houseRules }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white p-4 rounded-xl w-4/5'>
          <Text className='text-lg font-bold mb-3'>House Rules & Pet Policy</Text>
          <ScrollView className='mb-4'>
            <Text className='text-sm'>
              <Text className='font-semibold'>Pet Policy:</Text> {petPolicy}
            </Text>
            <Text className='text-sm mt-2'>
              <Text className='font-semibold'>House Rules:</Text> {houseRules}
            </Text>
          </ScrollView>
          <TouchableOpacity onPress={() => setModalVisible(false)} className='items-center'>
            <Text className='text-white font-bold bg-black px-4 py-2 rounded-lg'>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default HouseRulesModal;
