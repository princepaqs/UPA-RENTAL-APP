import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

type ValidationModalProps = {
    visible: boolean;
    message: string;
    onClose: () => void;
};

export default function ValidationModal({ visible, message, onClose }: ValidationModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white p-8 rounded-lg w-3/4 items-center">
                    <Text className="text-lg font-bold mb-4">Termination Request</Text>
                    <Text className="text-sm mb-6 text-center">{message}</Text>
                    <TouchableOpacity
                        className="bg-[#333333] rounded-full py-2 px-6 items-center"
                        onPress={onClose}
                    >
                        <Text className="text-white text-xs font-bold">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
