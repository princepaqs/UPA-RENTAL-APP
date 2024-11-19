import React, { FC } from 'react';
import { Image } from 'react-native';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface SubmitModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SubmitModal: FC<SubmitModalProps> = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-4/5 bg-white items-center p-8 rounded-lg shadow-lg">
                    <Image className="w-14 h-14" source={require('../../../assets/images/terminationsend.png')} />
                    <Text className="text-lg font-bold text-center mb-4">Acknowledgment</Text>
                    <Text className="text-xs text-center mb-6">
                        Your termination request has been submitted to the tenant. They will be notified, and you will receive updates on the status of this request.
                    </Text>
                    <View className="flex-row justify-around w-full">
                        <TouchableOpacity
                            onPress={onConfirm}
                            className=" bg-[#D9534F] p-3 rounded-full"
                        >
                            <Text className="text-center text-xs font-bold text-white">Return Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SubmitModal;
