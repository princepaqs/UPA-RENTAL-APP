import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Alert, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'; // Added 'doc' import
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth} from '../../../../context/authContext';

interface TransactionData {
    transactionId: string;
    createdDate: {
        seconds: number;
        nanoseconds: number;
    };
    fullName: string;
    fullAddress: string;
    moveInDate: string;
    ownerId: string;
    propertyId: string;
    tenantId: string;
    transactionStatus: string;
    tenantImage?: number | { uri: string };
    propertyImage?: number | { uri: string };
    propertyName: string;
    propertyPrice: string;
    propertyType: string;
}

export default function PendingApplication() {
    const router = useRouter();
    const { sendNotification, rejectTenant } = useAuth();
    
    const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
    // State for modals
    const [isApproveModalVisible, setApproveModalVisible] = useState(false);
    const [isRejectModalVisible, setRejectModalVisible] = useState(false);

    // Dummy data
    const applicationData = {
        applicant: {
            documents: [
                'Barangay Clearance',
                'NBI Clearance',
                'Government ID',
                'Proof of Income',
            ]
        }
    };

    const handleProperty = async(propertyId: string) => {
        await SecureStore.setItemAsync('propertyId', propertyId);
        router.push('../PropertyDetails')
      }
    
    // Handlers for modal actions
    const handleApprove =  async (propertyId: string) => {
        // Implement approve logic here
        // if(transactionData){
        //     approveTenant(transactionData?.transactionId);
        //     router.replace('/tabs/LeaseProperty/Tenant/tenants')
        // }
        
        // Alert.alert("Approved", "Application has been approved.", [{ text: "OK", onPress: () => setApproveModalVisible(false) }]);
        await SecureStore.setItemAsync('propertyId', propertyId);
        setApproveModalVisible(false);
        //console.log('approved');
        router.push('./setContractDetails');
    };

    const handleReject = () => {
        // Implement reject logic here
        if(transactionData){
            rejectTenant(transactionData?.transactionId);
            sendNotification(transactionData?.tenantId, 'rejection', 'Application Rejected', `Unfortuntely, your application for the ${transactionData.propertyType} at ${transactionData.fullAddress} has been rejected. Please review your details and consider applying for another property.`, 'Rejected', 'Unread', '', '')
            router.replace('./tenants')
        }
        Alert.alert("Rejected", "Application has been rejected.", [{ text: "OK", onPress: () => setRejectModalVisible(false) }]);
    };

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return ''; // Handle empty string case
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    const getUserImageUrl = async (tenantId: string) => {
        try {
          const storageRef = ref(storage, `profilepictures/${tenantId}-profilepictures`);
          const url = await getDownloadURL(storageRef);
          return url;
        } catch (error) {
          console.error("Error fetching image URL:", error);
          return null;
        }
    };

    const getPropertyImageUrl = async (propertyId: string, fileName: string) => {
        try {
          const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
          const url = await getDownloadURL(storageRef);
          return url;
        } catch (error) {
          console.error("Error fetching image URL:", error);
          return null;
        }
    };

      useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const transactionId = await SecureStore.getItemAsync('transactionId');
                //console.log(transactionId);
    
                if (transactionId) {
                    const transactionRef = await getDoc(doc(db, 'propertyTransactions', transactionId.toString()));
                    await SecureStore.setItemAsync('transactionId', transactionId);
    
                    if (transactionRef.exists()) {
                        const transactionData = transactionRef.data();
    
                        const createdDate = transactionData.createdAt;
                        const moveInDate = transactionData.moveInDate;
                        const transactionStatus = transactionData.status;
                        const propertyId = transactionData.propertyId;
                        const ownerId = transactionData.ownerId;
                        const tenantId = transactionData.tenantId;
                        const userRef = await getDoc(doc(db, 'users', tenantId));
    
                        if (userRef.exists()) {
                            const userData = userRef.data();
    
                            const firstName = userData.firstName;
                            const middleName = userData?.middleName || '';
                            const lastName = userData.lastName;
                            const homeAddress = userData.homeAddress;
                            const barangay = userData.barangay;
                            const city = userData.city;
                            const region = userData.region;
                            const fullName = `${firstName} ${middleName} ${lastName}`;
                            const fullAddress = `${homeAddress}, ${barangay}, ${city}, ${region}`;
                            const profilePicture = await getUserImageUrl(tenantId);

                            const propertyRef = doc(db, 'properties', ownerId, 'propertyId', propertyId);
                            const propertySnapshot = await getDoc(propertyRef);

                            if (propertySnapshot.exists()) {
                                const propertyData = propertySnapshot.data();

                                if (propertyData) {
                                const firstImageUri = propertyData.images && propertyData.images.length > 0
                                    ? await getPropertyImageUrl(propertyId, propertyData.images[0])
                                    : null;

                                    // Validate all required data
                                    if (!transactionId || !createdDate || !fullName || !fullAddress || !moveInDate || 
                                        !ownerId || !propertyId || !tenantId || !transactionStatus) {
                                        return;
                                    }
            
                                    // Set the transaction data
                                    setTransactionData({
                                        transactionId,
                                        createdDate,
                                        fullName,
                                        fullAddress,
                                        moveInDate,
                                        ownerId,
                                        propertyId,
                                        tenantId,
                                        transactionStatus,
                                        tenantImage: profilePicture || require('../../../../assets/images/profile.png'),
                                        propertyImage: firstImageUri || require('../../../../assets/images/property1.png'),
                                        propertyName: propertyData.propertyName,
                                        propertyPrice: propertyData.propertyMonthlyRent,
                                        propertyType: propertyData.propertyType
                                    });
                                }
                            }
    
                            
                        } else {
                            console.error('User document not found');
                        }
                    } else {
                        console.error('Transaction document not found');
                    }
                } else {
                    console.error('Transaction ID not found in SecureStore');
                }
            } catch (error) {
                console.error('Error fetching transaction data:', error);
            }
        };
    
        fetchTransaction();
    }, []);
    
    

    return (
        <View className='bg-[#B33939]'>
            <View className='h-screen bg-gray-100 mt-14 rounded-t-2xl'>
                <View className='flex flex-row items-center justify-between px-6 pb-5 pt-8 mx-6 border-b'>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                            </TouchableOpacity>
                            <View className='flex-1 items-center justify-center pr-5 '>
                                <Text className='text-sm font-semibold text-center'>Application</Text>
                            </View>
                        </View>

                {/* Scrollable content */}
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <View className='px-6 mt-4 mb-10 '>
                        {/* Application ID and Date */}
                        <View className='bg-black py-3 px-4 rounded-lg mb-4 '>
                            <Text 
                                numberOfLines={1} 
                                ellipsizeMode='tail' 
                                className='text-xs text-white'
                                style={{ maxWidth: '80%' }} // Set maxWidth to prevent overflow
                            >
                                Application ID: {transactionData?.transactionId}
                            </Text>
                            <Text className='text-white text-xs'>
                                Date: {transactionData?.createdDate ? 
                                    (() => {
                                        // Ensure createdDate is an object with seconds and nanoseconds
                                        const { seconds, nanoseconds } = transactionData.createdDate;

                                        // Create a Date object from Firestore timestamp
                                        const date = new Date(seconds * 1000 + nanoseconds / 1000000);
                                        return date.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }) + ', ' + date.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        });
                                    })() : 'Loading'}
                            </Text>
                        </View>
                        {/* Profile Application */}
                        <Text className='text-sm font-semibold text-gray-800 mb-2'>Profile Application</Text>
                        <View className='bg-gray-100 rounded-lg mb-4'>
                            <View className='flex flex-row items-center bg-white rounded-xl border-gray-100 shadow-xl p-2'>
                                {/* Image */}
                                <Image
                                    source={transactionData ? {uri : transactionData.tenantImage} : require('../../../../assets/images/profile.png')}
                                    className='w-12 h-12 rounded-full mr-4'
                                />
                                <View style={{ flex: 1 }}>
                                    <Text className='text-sm font-semibold'>{transactionData?.fullName}</Text>
                                    <Text 
                                        numberOfLines={1} 
                                        ellipsizeMode='tail' 
                                        className='text-xs text-gray-600'
                                        style={{ maxWidth: '80%' }} // Set maxWidth to prevent overflow
                                    >
                                        {transactionData?.fullAddress}
                                    </Text>
                                </View>
                            </View>
                            {/* Planned Move-In Date */}
                            <View className='mt-4 flex flex-row items-center justify-between bg-white rounded-xl border-gray-100 shadow-xl p-2'>
                                <View className='flex flex-row items-center gap-2'>
                                    <Entypo name="calendar" size={15} color="black" />
                                    <Text className='text-sm font-semibold'>Planned to Move-In</Text>
                                </View>
                                <Text className='text-xs text-gray-500'>{transactionData?.moveInDate}</Text>
                            </View>
                        </View>

                        {/* Applicant Documents */}
                        <Text className='text-lg font-semibold text-gray-800'>Applicant Documents</Text>
                        <View className='bg-gray-100 rounded-lg mb-4'>
                            <Text className='text-xs text-gray-600 mb-2'>
                                The tenant has submitted the following documents, verified by our admin team.
                            </Text>
                            <View className='bg-white rounded-xl border-gray-100 shadow-xl p-2'>
                                {applicationData.applicant.documents.map((doc, index) => (
                                    <View key={index} className='flex flex-row items-center mb-2'>
                                        <Ionicons name="checkmark-circle" size={18} color="green" />
                                        <Text className='ml-2 text-sm'>{doc}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Property Application */}
                        <Text className='text-sm font-semibold text-gray-800 mb-2'>Property Application</Text>
                        <View className='bg-white rounded-xl border-gray-100 shadow-xl p-3'>
                            <View className='flex flex-row'>
                                {/* Image */}
                                <Image
                                    source={transactionData ? {uri : transactionData.propertyImage} : require('../../../../assets/images/property1.png')}
                                    className='w-16 h-16 rounded-lg mr-4'
                                />
                                <View className='flex-1'>
                                    <Text className='text-sm font-semibold'>{transactionData?.propertyName}</Text>
                                    <View className='flex flex-row items-center gap-1'>
                                        <MaterialCommunityIcons name="cash-multiple" size={15} color="black" />
                                        <Text className='text-xs text-gray-500'>₱ {parseInt(transactionData ? transactionData?.propertyPrice : '0').toLocaleString()}.00</Text>
                                    </View>
                                    <View className='flex flex-row items-center gap-1'>
                                        <MaterialIcons name="apartment" size={15} color="black" />
                                        <Text className='text-xs text-gray-500'>{transactionData?.propertyType}</Text>
                                    </View>
                                    <View className='items-end'>
                                        <TouchableOpacity className='bg-red-500 py-1 px-4 rounded-lg'
                                          onPress={() => handleProperty(transactionData?.propertyId || "")}>
                                            <Text className='text-xs text-white text-center'>View Lease</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {transactionData?.transactionStatus !== 'Approved' && (
                <View className='bg-white border-t border-gray-300 px-6 py-2'>
                    <View className='flex flex-row items-center justify-between py-2 mb-5'>
                    <View className='flex flex-col items-start justify-start'>
                        <Text className='text-xs'>Application Status</Text>
                        <View className='flex flex-row items-center gap-1'>
                        <FontAwesome
                            name="circle"
                            size={15}
                            color={
                            transactionData?.transactionStatus === 'Approved'
                                ? 'green'   // Green for 'Approved'
                                : transactionData?.transactionStatus === 'In-review'
                                ? 'black'   // Black for 'Under Review'
                                : 'red'     // Default or fallback color for other statuses
                            }
                        />
                        <Text className='text-sm font-bold'>
                            {capitalizeFirstLetter(transactionData?.transactionStatus || '')}
                        </Text>
                        </View>
                    </View>
                    <View className='flex flex-row gap-2'>
                        <TouchableOpacity onPress={() => setRejectModalVisible(true)} className='bg-[#D9534F] py-2 px-6 rounded-lg'>
                        <Text className='text-white text-xs'>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setApproveModalVisible(true)} className='bg-[#508D4E] py-2 px-6 rounded-lg'>
                        <Text className='text-white text-xs'>Approve</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </View>
                )}
            </View>

            {/* Approve Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isApproveModalVisible}
                onRequestClose={() => setApproveModalVisible(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/50 px-5'>
                    <View className='bg-white p-6 rounded-lg'>
                        <Text className='text-sm font-bold mb-4 text-center'>Tenant Application Confirmation</Text>
                        <Text className='text-xs text-center text-gray-500'>If you are ready to accept this application, please click the "Accept Application" button below. This action will initiate the next steps, including sending the rental agreement and preparing for the tenant's move-in.</Text>
                        <View className='flex flex-row justify-center space-x-5 mt-6'>
                            
                            <TouchableOpacity onPress={() => setApproveModalVisible(false)} className='bg-[#333333] py-2 px-4 rounded-lg'>
                                <Text className='text-white'>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleApprove(transactionData?.propertyId || "")} className='bg-[#508D4E] py-2 px-4 rounded-lg'>
                                <Text className='text-white'>Approve</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Reject Modal */}
            <Modal
            transparent={true}
            animationType="slide"
            visible={isRejectModalVisible}
            onRequestClose={() => setRejectModalVisible(false)}
        >
            <View className='flex-1 justify-center items-center bg-black/50 px-5'>
                <View className='bg-white p-6 rounded-lg'>
                    <Text className='text-sm font-bold text-center mb-4'>Reject Application</Text>
                    <Text className='text-xs text-gray-500 text-center'>What specific reasons do you have for rejecting this application?</Text>
                    <View className='mt-5'>
                        <View className='p-2 bg-gray-100 rounded-xl'>
                            <TextInput
                                className='text-xs h-20'
                                placeholder='feedback...'
                                numberOfLines={5}
                                multiline
                                style={{ textAlignVertical: 'top' }}
                            />
                        </View>
                    </View>
                    <View className='flex flex-row space-x-5 mt-6 items-center justify-center'>
                        <TouchableOpacity onPress={handleReject} className='bg-[#D9534F] py-2 w-1/3 items-center rounded-lg'>
                            <Text className='text-white'>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRejectModalVisible(false)} className='bg-[#333333] items-center py-2 w-1/3 rounded-lg'>
                            <Text className='text-white'>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        </View>
    );
}
