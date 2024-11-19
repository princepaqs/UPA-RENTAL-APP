import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { useTailwind } from 'nativewind';

interface PasswordConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

const PasswordConfirmationModal: React.FC<PasswordConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/20">
        <View className="bg-white p-6 rounded-xl w-4/5">
          <Text className="text-lg font-bold mb-6 text-center">Confirm Password</Text>
          <Text className="text-sm mb-2 text-center">Enter your password to proceed:</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            className="bg-gray-200 text-center px-4 py-2 rounded-xl mb-8"
          />
          <View className="flex-row justify-center space-x-4">
            <Pressable
              onPress={onClose}
              className="px-4 py-2 bg-[#333333] rounded-xl"
            >
              <Text className='text-white text-sm font-bold'>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm(password);
                console.log(password);
                setPassword('');
                onClose();
              }}
              className="px-4 py-2 bg-[#D9534F] rounded-xl items-center justify-center"
            >
              <Text className="text-white font-bold text-sm">Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PasswordConfirmationModal;
