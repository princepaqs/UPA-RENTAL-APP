// CustomModal.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, title, message }) => {
    return (
        <Modal
            transparent
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 p-6 bg-white rounded-lg shadow-lg">
                    <Text className="text-lg font-bold text-center">{title}</Text>
                    <Text className="mt-2 text-center">{message}</Text>
                    <TouchableOpacity 
                        className="mt-4 px-4 py-2 bg-black rounded-md"
                        onPress={onClose}
                    >
                        <Text className="text-white font-bold text-center">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CustomModal;
