import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import walletData from '../walletData.json';
import { setAmount } from '../sharedData';
import CustomModal from '../WalletModal'; // Import the CustomModal
import * as FileSystem from 'expo-file-system';
import { getItemAsync } from 'expo-secure-store';

const walletDataPath = FileSystem.documentDirectory + './walletData.json';

export default function TopUp() {
    const router = useRouter();
    const [amount, setLocalAmount] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [balance, setBalance] = useState('');

    useEffect(() => {
        const fetchRevenueData = async () => {
            const balance = await getItemAsync('revenueBalance');
            if(balance) setBalance(balance);
        }

        fetchRevenueData();
    },[]);

    const handleContinue = () => {
        //const balance = walletData.balance;
        console.log(parseInt(amount));
        if (parseInt(amount) > parseInt(balance)) {
            setModalMessage("Insufficient Balance");
            setModalVisible(true);
        } else if (!amount || parseInt(amount) < 20 || parseInt(amount) > 100000) {
            setModalMessage("Please input a valid amount value (between Php 20 and Php 100,000)");
            setModalVisible(true);
        } else {
            setAmount(parseInt(amount));
            router.replace('./reviewTransaction');
        }
    };

    return (
        <View className="bg-[#B33939] flex-1">
            <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
                <View className='px-6'>
                    <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="flex flex-row items-center">
                                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                            </View>
                        </TouchableOpacity>
                        <View className="flex-1 items-center justify-center pr-5">
                            <Text className="text-sm font-bold text-center">Transfer Revenue</Text>
                        </View>
                    </View>

                    <View className='px-6 mb-28 pt-5'>
                        <View className='px-1 py-1'>
                            <Text className='text-sm font-bold'>Set Amount</Text>
                            <Text className='text-xs text-gray-500'>How much do you want to transfer to your wallet?</Text>
                        </View>
                        <TextInput
                            className='px-4 bg-white py-1 rounded-2xl text-sm text-center'
                            keyboardType='number-pad'
                            value={amount}
                            onChangeText={setLocalAmount}
                        />
                        <View className='p-3 flex-row space-x-2'>
                            <AntDesign name="wallet" size={15} color="gray" />
                            <Text className='text-xs text-gray-500'>Available Balance  : {`Php ${parseInt(balance).toLocaleString()}.00`}</Text>
                        </View>
                    </View>

                    <TouchableOpacity className='items-center pt-28 mt-28' onPress={handleContinue}>
                        <Text className='text-xs text-center py-3 rounded-2xl font-bold text-white w-4/5 bg-[#D9534F]'>Continue</Text>
                    </TouchableOpacity>

                    {/* Custom Modal for Alerts */}
                    <CustomModal 
                        visible={modalVisible} 
                        onClose={() => setModalVisible(false)} 
                        title="Wallet" 
                        message={modalMessage} 
                    />
                </View>
            </View>
        </View>
    );
}
