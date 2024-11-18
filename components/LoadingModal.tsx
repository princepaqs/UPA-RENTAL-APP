import React from 'react';
import { Modal, View, ActivityIndicator, Text } from 'react-native';

const LoadingModal = ({ visible }: { visible: boolean }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="none">
      <View className='flex-1 items-center justify-center bg-black/50'>
        <ActivityIndicator size="large" color="#EF5A6F" />
      </View>
    </Modal>
  );
};

export default LoadingModal;
