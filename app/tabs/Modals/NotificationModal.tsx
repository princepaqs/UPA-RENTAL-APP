import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

type ActionButton = {
  label: string;
  onPress: () => void;
  color?: string;
};

type NotificationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  actions: ActionButton[];
  onClose: () => void;
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  title,
  message,
  actions,
  onClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg py-6 px-2.5 w-5/6">
          <Text className="text-lg font-bold mb-4 text-center">{title}</Text>
          <Text className="text-gray-700 mb-10">{message}</Text>
          <View className="w-full flex-row items-center justify-evenly px-2 space-x-5">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="w-1/2 py-2 rounded-xl items-center"
                style={{ backgroundColor: action.color || '#38A169' }}
              >
                <Text className="text-white font-bold">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
