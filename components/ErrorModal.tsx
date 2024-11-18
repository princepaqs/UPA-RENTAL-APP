// ErrorModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface ErrorModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, message, onClose }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 p-4 bg-white rounded-xl shadow-lg">
                <Text className='text-lg font-bold mb-4'>Login</Text>
                    <Text className="mb-4 text-center">{message}</Text>
                    <View className='flex items-center justify-center'>
                    <TouchableOpacity onPress={onClose} className="bg-gray-900 px-2 py-1.5 rounded-lg">
                        <Text className="text-white text-center">Close</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ErrorModal;
