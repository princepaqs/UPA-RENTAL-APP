// app/tabs/Modals/ApproveModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Entypo } from '@expo/vector-icons';


interface ApproveModalProps {
  isApproveModalVisible: boolean;
  setApproveModalVisible: (visible: boolean) => void;
  plannedMoveInDate: Date;
  setPlannedMoveInDate: (date: Date) => void;
  handleMoveInDateSubmit: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({
  isApproveModalVisible,
  setApproveModalVisible,
  plannedMoveInDate,
  setPlannedMoveInDate,
  handleMoveInDateSubmit,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isApproveModalVisible}
      onRequestClose={() => setApproveModalVisible(false)}
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white w-2/3 rounded-xl p-6 flex flex-col items-center justify-center'>
          <Image className="w-24 h-24" source={require('../../../../../assets/images/deleteimage.png')} />
          <Text className='text-sm font-bold mt-3 text-center mb-2'>Preferred Date for Repair Visit</Text>
          <Text className='text-xs text-center'>When would you like to visit the property to address this maintenance request?</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className='bg-[#D9D9D9] border flex flex-row items-center justify-start space-x-2 my-8 border-gray-300 rounded-md p-2'
          >
            <Entypo name="calendar" size={20} color="black" />
            <Text className='w-1/2 text-xs'>{plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={plannedMoveInDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || plannedMoveInDate;
                setShowDatePicker(false);
                setPlannedMoveInDate(currentDate);
              }}
            />
          )}
          <View className='w-full flex-row items-center justify-center space-x-3'>
            <TouchableOpacity onPress={() => setApproveModalVisible(false)} className='bg-[#333333] w-2/5 items-center rounded-xl py-2 px-4'>
              <Text className='text-white text-xs font-bold'>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMoveInDateSubmit} className='bg-[#D9534F] w-2/5 items-center rounded-xl py-2 px-4'>
              <Text className='text-white text-xs font-bold'>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ApproveModal;
