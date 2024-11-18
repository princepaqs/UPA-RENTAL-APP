// app/tabs/Modals/MoveInDateModal.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Entypo } from '@expo/vector-icons';


interface MoveInDateModalProps {
  moveInDateModalVisible: boolean;
  setMoveInDateModalVisible: (visible: boolean) => void;
  minimum: Date;
  plannedMoveInDate: Date;
  setPlannedMoveInDate: (date: Date) => void;
  handleMoveInDateSubmit: () => void;
}

const TerminationDateModal: React.FC<MoveInDateModalProps> = ({
  moveInDateModalVisible,
  setMoveInDateModalVisible,
  minimum,
  plannedMoveInDate,
  setPlannedMoveInDate,
  handleMoveInDateSubmit,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={moveInDateModalVisible}
      onRequestClose={() => setMoveInDateModalVisible(false)}
    >
      <View className='flex-1 justify-center items-center bg-black/50'>
        <View className='bg-white rounded-xl p-6 flex flex-col items-center justify-center'>
          <Image className="w-20 h-20" source={require('../../../assets/images/deleteimage.png')} />
          <Text className='text-lg font-bold mt-3'>Termination Date</Text>
  
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className='bg-gray-100 border flex flex-row items-center justify-start space-x-2 my-5 border-gray-300 rounded-md p-2'
          >
            <Entypo name="calendar" size={20} color="black" />
            <Text className='w-1/2 text-xs'>{plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={plannedMoveInDate}
              mode="date"
              display="default"
              minimumDate={minimum}
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || plannedMoveInDate;
                setShowDatePicker(false); // Ensure this state change is stable.
                setPlannedMoveInDate(currentDate);
                console.log(currentDate);
              }}
            />
          )}
          <View className='flex-row items-center justify-center gap-5'>
            <TouchableOpacity onPress={handleMoveInDateSubmit} className='bg-black rounded-md py-2 px-4'>
              <Text className='text-white text-sm'>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMoveInDateModalVisible(false)} className='border rounded-md py-2 px-4'>
              <Text className='text-black text-sm'>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TerminationDateModal;
