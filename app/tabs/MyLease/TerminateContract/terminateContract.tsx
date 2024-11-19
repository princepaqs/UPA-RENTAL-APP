import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TerminationDateModal from '../../Modals/TerminationDateModal';
import SubmitModal from '../../Modals/SubmitModal'; // Import the new SubmitModal component
import ValidationModal from '../../Modals/ValidationModal'; 
import { onSnapshot, doc, getDoc, Timestamp, collection, query, where } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';

interface Contract {
    contractId: string;
    contractFullName: string;
    contractPropertyAddress: string;
    contractTerminationPeriod: string;
}

export default function TerminateContract() {
    const router = useRouter();
    const [contractData, setContractData] = useState<Contract | null>(null);
    const [moveInDateModalVisible, setMoveInDateModalVisible] = useState(false);
    const [submitModalVisible, setSubmitModalVisible] = useState(false); // State for submit modal
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [plannedMoveInDate, setPlannedMoveInDate] = useState(new Date()); // add the days of termination period into the setPlannedMove in date in the minimum
    const [terminationReason, setTerminationReason] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [validationModalVisible, setValidationModalVisible] = useState(false); // State for validation modal
    const [validationMessage, setValidationMessage] = useState(''); 

    const calculateMoveInDate = (terminationPeriod: number) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + terminationPeriod);
        return currentDate;
    };

    const handleRentNow = () => {
        setMoveInDateModalVisible(true);
    };

    const handleMoveInDateSubmit = () => {
        setMoveInDateModalVisible(false);
        console.log(plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    };

     const handleSubmit = () => {
        if (!plannedMoveInDate) {
            setValidationMessage('Please select a termination date.');
            setValidationModalVisible(true);
            return;
        }

        if (!terminationReason) {
            setValidationMessage('Please select a reason for termination.');
            setValidationModalVisible(true);
            return;
        }

        if(contractData?.contractFullName && contractData.contractPropertyAddress && contractData.contractTerminationPeriod && contractData.contractId){
            console.log(contractData.contractId, contractData.contractFullName, contractData.contractPropertyAddress, contractData.contractTerminationPeriod, plannedMoveInDate, terminationReason)
            // add notification here
        }

        // Show submit modal if validation passes
        setSubmitModalVisible(true);
    };

    const handleConfirmSubmit = () => {
        setSubmitModalVisible(false); // Hide the modal
        if (userStatus === 'Owner') {
            //for owner function
            console.log("Termination owner request submitted.");
        } else {
            //for tenant function
            console.log("Termination tenant request submitted.");
        }
        
        router.replace('../../../tabs/Dashboard')
    };

    const fullname = 'Prince Louie Travina Paquiado';
    const propertyAddress = '115 Gonzales, Caloocan City, NCR';
    const userStatus = 'Owner'

    useEffect(() => {
        const fetchContract = async () => {
            const contractId = await SecureStore.getItemAsync('contractId');
            if(contractId){
                const contractRef = await getDoc(doc(db, 'contracts', contractId))
                if(contractRef.exists()){
                    const data = contractRef.data();
                    if(data){
                        setContractData({
                            contractId,
                            contractFullName: data.ownerFullName,
                            contractPropertyAddress: data.propertyAddress,
                            contractTerminationPeriod: data.propertyTerminationPeriod,
                        })
                        const terminationDays = parseInt(data.propertyTerminationPeriod, 10) || 0;
                        setMinimumDate(calculateMoveInDate(terminationDays));
                        setPlannedMoveInDate(calculateMoveInDate(terminationDays));
                    }
                }
            }
        }
        fetchContract()
    }, [])
    return (
        <View className='bg-[#B33939]'>
            <View className='h-screen bg-gray-100 mt-14 py-4 px-6 rounded-t-2xl'>
                <View className='border-b border-gray-400 flex-row items-center justify-between px-4 py-3'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <View className="flex flex-row items-center">
                            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                        </View>
                    </TouchableOpacity>

                    <View className="flex-1 items-center justify-center">
                        <Text className='text-sm font-bold text-center'>Request to Terminate Rental Agreement</Text>
                    </View>
                </View>

                <View className='mt-6 space-y-4 mx-2'>
                    <View className='space-y-1'>
                        <Text className='text-sm font-bold'>Full Name</Text>
                        <Text className='text-sm '>{contractData?.contractFullName}</Text>
                    </View>
                    <View className='space-y-1'>
                        <Text className='text-sm font-bold'>Property Address</Text>
                        <Text className='text-sm '>{contractData?.contractPropertyAddress}</Text>
                    </View>
                    <View className='space-y-1'>
                        <Text className='text-sm font-bold'>Termination Date</Text>
                        <Text className='text-xs text-gray-500 mb-1'>Please select a termination date that meets the required notice period of <Text className='font-bold'>{contractData?.contractTerminationPeriod} days</Text> from today</Text>
                        <TouchableOpacity className='flex-row items-center justify-between bg-[#D9D9D9] px-6 py-1.5 rounded-xl' onPress={handleRentNow}>
                            <Text>
                                {plannedMoveInDate
                                    ? plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : 'Select a date'}
                            </Text>
                            <Entypo name="calendar" size={20} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className='text-sm font-bold'>Reason for Termination</Text>
                        {userStatus === 'Owner' ? (
                            <>
                            {['Property renovation or repairs', 'Violation of lease terms', 'Property sale', 'Personal reasons', 'Other'].map((reason, index) => (
                            <TouchableOpacity
                                key={index}
                                className='flex-row items-center space-x-2 my-2'
                                onPress={() => setTerminationReason(reason)}
                            >
                                <View className='w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center'>
                                    {terminationReason === reason && (
                                        <View className='w-4 h-4 bg-black rounded-full' />
                                    )}
                                </View>
                                <Text className='text-sm'>{reason}</Text>
                            </TouchableOpacity>
                        ))}
                            </>
                        ) : (
                            <>
                           {['Moving to a new location', 'Financial reasons', 'Property issues', 'Personal reasons', 'Other'].map((reason, index) => (
                            <TouchableOpacity
                                key={index}
                                className='flex-row items-center space-x-2 my-2'
                                onPress={() => setTerminationReason(reason)}
                            >
                                <View className='w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center'>
                                    {terminationReason === reason && (
                                        <View className='w-4 h-4 bg-black rounded-full' />
                                    )}
                                </View>
                                <Text className='text-sm'>{reason}</Text>
                            </TouchableOpacity>
                        ))} 
                            </>
                        )}
                        {terminationReason === 'Other' && (
                            <TextInput
                                className='bg-[#D9D9D9] ml-5 text-xs p-2 rounded mt-2'
                                placeholder='Additional Details'
                                value={additionalDetails}
                                onChangeText={setAdditionalDetails}
                                multiline
                            />
                        )}
                    </View>
                </View>

                <View className='flex-col w-screen items-center justify-center p-5 my-8 absolute bottom-0 px-6'>
                    {userStatus == 'Owner' ? (
                        <View className='mb-4'>
                            <Text className='text-xs text-start text-gray-500'>I confirm that I am initiating this termination in accordance with the lease terms and required notice period.</Text>
                        </View>
                    ) : (
                        <></>
                    )}
                    <View className='flex-row space-x-4 px-2'>
                    <TouchableOpacity className='w-1/2 items-center border rounded-full' onPress={() => router.back()}>
                        <Text className='py-3 text-xs font-bold'>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='w-1/2 items-center bg-[#D9534F] rounded-full'
                        onPress={handleSubmit} // Trigger submit modal
                    >
                        <Text className='py-3 text-white text-xs font-bold'>Submit</Text>
                    </TouchableOpacity>
                    </View>
                </View>

                <TerminationDateModal
                    moveInDateModalVisible={moveInDateModalVisible}
                    setMoveInDateModalVisible={setMoveInDateModalVisible}
                    minimum={minimumDate}
                    plannedMoveInDate={plannedMoveInDate}
                    setPlannedMoveInDate={setPlannedMoveInDate}
                    handleMoveInDateSubmit={handleMoveInDateSubmit}
                />

                <SubmitModal
                    visible={submitModalVisible}
                    onClose={() => setSubmitModalVisible(false)}
                    onConfirm={handleConfirmSubmit}
                />

                <ValidationModal
                    visible={validationModalVisible}
                    message={validationMessage}
                    onClose={() => setValidationModalVisible(false)}
                />
            </View>
        </View>
    );
}
