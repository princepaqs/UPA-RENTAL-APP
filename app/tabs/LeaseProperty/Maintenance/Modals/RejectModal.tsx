import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';

interface RejectModalProps {
    visible: boolean;
    onClose: () => void;
    onReject: (feedback: string) => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ visible, onClose, onReject }) => {
    const [feedback, setFeedback] = React.useState('');

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View className='flex-1 justify-center items-center bg-black/50 px-5'>
                <View className='bg-white w-2/3 p-6 rounded-lg'>
                    <Text className='text-sm font-bold text-center mb-4'>Reject Maintenance Request</Text>
                    <Text className='text-xs text-gray-500 text-center'>What specific reasons do you have for rejecting this maintenance request?</Text>
                    <View className='mt-5'>
                        <View className='p-2 bg-[#D9D9D9] rounded-xl'>
                            <TextInput
                                className='text-xs h-20'
                                placeholder='feedback...'
                                numberOfLines={5}
                                multiline
                                onChangeText={setFeedback}
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>
                    <View className='flex flex-row space-x-5 mt-6 items-center justify-center'>
                        <TouchableOpacity onPress={() => { onReject(feedback); onClose(); }} className='bg-[#D9534F] py-2 w-1/3 items-center rounded-xl'>
                            <Text className='text-white text-xs font-bold'>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} className='bg-[#333333] items-center py-2 w-1/3 rounded-xl'>
                            <Text className='text-white text-xs font-bold'>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default RejectModal;
