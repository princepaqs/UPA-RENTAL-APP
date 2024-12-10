import { View, Text, Linking, ScrollView, Image, TouchableOpacity, Dimensions, TextInput, Modal, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, getDoc, doc, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';
// import RejectModal from './Modals/RejectModal';
import ApproveModal from './Modals/ApproveModal';

// import ApproveModal from './Modals/ApproveModal';
// import RejectModal from './Modals/RejectModal';

interface Maintenance {
    id: string;
    date: string;
    time: string;
    tenantId: string;
    ownerId: string;
    ownerFullName: string;
    ownerImage?: number | { uri: string };
    ownerContact: string;
    propertyId: string;
    propertyName: string;
    propertyType: string;
    propertyFullAddress: string;
    preferredTime: string;
    issueType: string;
    description: string;
    propertyImage?: number | { uri: string };
    maintenanceImages?: Array<number | { uri: string }>;
    submittedAtDate: string;
    submittedAt: string;
    approvedAtDate: string;
    approvedAt: string;
    progressAtDate: string;
    progressAt: string;
    completedAtDate: string;
    completedAt: string;
    maintenanceStatus: string;
    accountStatus: string;
}

interface RequestHistoryItem {
    id: string;
    reqStatus: string;
    date: string;
    time: string;
    prefDate?: string;
  }  

export default function ViewPropertyDetails() {
  const router = useRouter();
  const { updateMaintenance, sendNotification } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isApproveModalVisible, setApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [plannedMoveInDate, setPlannedMoveInDate] = useState(new Date());
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);


  const handleMoveInDateSubmit = async () => {
    // Submit the move-in date
    console.log(plannedMoveInDate);
    console.log(new Date());
    if(maintenance){
        await SecureStore.setItemAsync('prefTime', plannedMoveInDate.toString());
        updateMaintenance(maintenance?.tenantId, maintenance?.id, 'approvedAt', new Date(), 'Approved');
        sendNotification(maintenance?.tenantId, 'maintenance-approve', 'Maintenance Request Approved', `The maintenance request for ${maintenance.propertyName} has been approved. The maintenance personnel will arrive on ${plannedMoveInDate.toString()} to perform the necessary work.`, 'Success', 'Unread');
        sendNotification(maintenance?.ownerId, 'maintenance-approve', 'Maintenance Request Approved', `You have approved the maintenance request for ${maintenance.propertyName} at ${maintenance.propertyFullAddress}. The maintenance personnel is scheduled to arrive on ${plannedMoveInDate.toString()} to perform the work.`, 'Success', 'Unread');
    }
    setApproveModalVisible(false);
  };

  const handleReject = () => {
    // Submit the move-in date
    setRejectModalVisible(false);
  };

  const handleStartWork = async () => {
    if(maintenance){
        updateMaintenance(maintenance?.tenantId, maintenance?.id, 'progressAt', new Date(), 'In Progress')
        sendNotification(maintenance?.tenantId, 'maintenance-inprogress', 'Maintenance In-Progress', 'The maintenance personnel have arrived and started working on your request. ', 'Success', 'Unread');
        sendNotification(maintenance?.ownerId, 'maintenance-inprogress', 'Maintenance In-Progress', `The maintenance for your property, ${maintenance.propertyName} at ${maintenance.propertyFullAddress} started today. Please ensure that everything is in order and continue monitoring the progress.`, 'Success', 'Unread');
    }
  }

  const handleComplete = async () => {
    if(maintenance){
        updateMaintenance(maintenance?.tenantId, maintenance?.id, 'completedAt', new Date(), 'Completed')
        sendNotification(maintenance?.tenantId, 'maintenance-completed', 'Maintenance Completed', `Your maintenance request has been successfully completed. Please send again if something doesn't seem to work right. Thank you.`, 'Success', 'Unread');
        sendNotification(maintenance?.tenantId, 'maintenance-completed', 'Maintenance Completed', `You have successfully completed the maintenance for ${maintenance.propertyName} at ${maintenance.propertyFullAddress}.`, 'Success', 'Unread');
    }
  }

  const formatDate = (timestamp: Timestamp | null | undefined) =>
    timestamp ? timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  
  const formatTime = (timestamp: Timestamp | null | undefined) =>
    timestamp ? timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : '';
  
  
  const requestHistory: RequestHistoryItem[] = [];
  
  if (maintenance?.submittedAt) {
    requestHistory.push({
      id: maintenance.id + '-submitted',
      reqStatus: 'Request Submitted',
      date: maintenance.submittedAtDate,
      time: maintenance.submittedAt,
    });
  }
  
  if (maintenance?.approvedAt) {
    requestHistory.push({
      id: maintenance.id + '-approved',
      reqStatus: 'Request Approved',
      date: maintenance.approvedAtDate,
      time: maintenance.approvedAt,
      prefDate: maintenance.preferredTime,
    });
  }
  
  if (maintenance?.progressAt) {
    requestHistory.push({
      id: maintenance.id + '-in-progress',
      reqStatus: 'Work In Progress',
      date: maintenance.progressAtDate,
      time: maintenance.progressAt,
    });
  }
  
  if (maintenance?.completedAt) {
    requestHistory.push({
      id: maintenance.id + '-completed',
      reqStatus: 'Completed',
      date: maintenance.completedAtDate,
      time: maintenance.completedAt,
    });
  }

  const handlePhoneCall = () => {
    Linking.openURL(`tel:${maintenance?.ownerContact || '09123456789'}`);
  };

  const handleNextImage = () => {
    const images = maintenance?.maintenanceImages ?? [];
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };
  
  const handlePreviousImage = () => {
    const images = maintenance?.maintenanceImages ?? [];
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  // Function to handle withdrawing the maintenance
//   const handleWithdrawMaintenance = () => {
//     // Logic to withdraw the maintenance
//     if(maintenance?.tenantId && maintenance.id){
//         withdrawMaintenance(maintenance.tenantId, maintenance.id);
//         router.back();
//     }
//     //console.log("Maintenance withdrawn");
//     setModalVisible(false); // Close modal after confirmation
//   };

  const getAllImageUrls = async (propertyId: string, fileNames: string[]) => {
    try {
      const imageUrls = await Promise.all(
        fileNames.map(async (fileName) => {
          const storageRef = ref(storage, `maintenances/${propertyId}/images/${fileName}`);
          return await getDownloadURL(storageRef);
        })
      );
      return imageUrls;
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      return [];
    }
  };

  const getImageUrl = async (uid: string, fileName: string) => {
    try {
      const storageRef = ref(storage, `properties/${uid}/images/${fileName}`);
      const url = await getDownloadURL(storageRef);
      return { uri: url };
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };
  

  const getUserImageUrl = async (ownerId: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${ownerId}-profilepictures`);
      const url = await getDownloadURL(storageRef);
      return { uri: url };
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  }

  useEffect(() => {
    const fetchMaintenance = async () => {
        try {
            const id = await SecureStore.getItemAsync('maintenanceId');
            const tenantId = await SecureStore.getItemAsync('maintenanceTenantId');
            const propertyId = await SecureStore.getItemAsync('maintenancePropertyId');
            const ownerId = await SecureStore.getItemAsync('maintenanceOwnerId');

            if (id && tenantId && propertyId && ownerId) {
                const maintenanceRef = doc(db, 'maintenances', tenantId, 'maintenanceId', id);

                const unsubscribeMaintenance = onSnapshot(maintenanceRef, async (maintenanceDoc) => {
                    if (!maintenanceDoc.exists()) return;

                    const maintenanceData = maintenanceDoc.data();

                    const userRef = doc(db, 'users', tenantId);
                    const propertyRef = doc(db, 'properties', ownerId, 'propertyId', propertyId);

                    const [userDoc, propertyDoc] = await Promise.all([
                        getDoc(userRef),
                        getDoc(propertyRef),
                    ]);

                    if (!userDoc.exists() || !propertyDoc.exists()) return;

                    const userData = userDoc.data();
                    const propertyData = propertyDoc.data();

                    const ownerImage = userData.profilePicture
                        ? await getUserImageUrl(tenantId)
                        : require('../../../../assets/images/property1.png');
                    const propertyImage = propertyData.images?.[0]
                        ? await getImageUrl(propertyId, propertyData.images[0])
                        : require('../../../../assets/images/property1.png');
                    const imageUrls = maintenanceData.images?.length
                        ? await getAllImageUrls(tenantId, maintenanceData.images)
                        : [];

                    const preferredDate = new Date(maintenanceData.preferredTime);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);

                    setMaintenance({
                        id,
                        date: formatDate(maintenanceData.submittedAt),
                        time: formatTime(maintenanceData.submittedAt),
                        tenantId,
                        ownerId,
                        ownerFullName: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
                        ownerContact: userData.phoneNo,
                        ownerImage,
                        propertyId,
                        propertyName: propertyData.propertyName,
                        propertyType: propertyData.propertyType,
                        propertyFullAddress: `${propertyData.propertyCity}, ${propertyData.propertyRegion}`,
                        preferredTime: maintenanceData.time,
                        issueType: maintenanceData.issueType,
                        description: maintenanceData.description,
                        propertyImage,
                        maintenanceImages: imageUrls.length
                            ? imageUrls.map((url) => ({ uri: url }))
                            : [],
                        submittedAtDate: formatDate(maintenanceData.submittedAt),
                        submittedAt: formatTime(maintenanceData.submittedAt),
                        approvedAtDate: formatDate(maintenanceData.approvedAt),
                        approvedAt: formatTime(maintenanceData.approvedAt),
                        progressAtDate: formatDate(maintenanceData.progressAt),
                        progressAt: formatTime(maintenanceData.progressAt),
                        completedAtDate: formatDate(maintenanceData.completedAt),
                        completedAt: formatTime(maintenanceData.completedAt),
                        maintenanceStatus: maintenanceData.status,
                        accountStatus: 'Active',
                    });

                    if (
                        preferredDate.toDateString() === today.toDateString()
                    ) {
                        sendNotification(
                            tenantId, 
                            'maintenance-startwork', 
                            'Maintenance Scheduled Today', 
                            'Your scheduled maintenance is today. The maintenance personnel will arrive as planned. Please ensure the property is accessible.', 
                            'Success', 
                            'Unread');
                        sendNotification(
                            ownerId,
                            'maintenance-today',
                            'Maintenance Scheduled - Today',
                            `Today is the scheduled maintenance day for your property, ${propertyData.propertyName} at ${propertyData.propertyFullAddress}. Please ensure you go to the property to complete the necessary maintenance tasks.`,
                            'Success',
                            'Unread'
                        );
                    } else if (
                        preferredDate.toDateString() === tomorrow.toDateString()
                    ) {
                        sendNotification(
                            ownerId,
                            'maintenance-tomorrow',
                            'Maintenance Scheduled - Tomorrow',
                            `Reminder: The scheduled maintenance for your property, ${propertyData.propertyName} at ${propertyData.propertyFullAddress}, is tomorrow. Please ensure you have taken the necessary actions and provided access for the maintenance team.`,
                            'Success',
                            'Unread'
                        );
                    }
                });

                // Clean up maintenance listener on unmount
                return () => unsubscribeMaintenance();
            }
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    };

    fetchMaintenance();
}, []);


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
                <Text className='text-sm font-bold text-center'>View Maintenance Request</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View className='mb-28'>
                    <View className='flex-col items-center justify-between mt-2 bg-white p-4 rounded-lg'>
                        <View className='w-full flex-row items-center justify-between border-b border-gray-400 pb-4 mx-2'>
                            <View className='flex-row items-center justify-center space-x-1'>
                                <FontAwesome name="home" size={24} color="black" />
                                <Text className='text-sm font-bold'>Maintenance Request</Text>
                            </View>
                            <View className='flex-row items-center space-x-2 justify-center'>
                                <Text className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                        maintenance?.maintenanceStatus === 'Approved'
                                            ? '#0FA958'
                                            : maintenance?.maintenanceStatus === 'Pending'
                                            ? '#333333'
                                            : maintenance?.maintenanceStatus === 'In Progress'
                                                ? '#FF6500'
                                                : 'green', // fallback color for other requestStatuses
                                    }}
                                    >
                                </Text>
                                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                                        color:
                                        maintenance?.maintenanceStatus === 'Approved'
                                            ? '#0FA958'
                                            : maintenance?.maintenanceStatus === 'Pending'
                                            ? '#333333'
                                            : maintenance?.maintenanceStatus === 'In Progress'
                                                ? '#FF6500'
                                                : 'green', // fallback color for other requestStatuses
                                    }}>
                                    {maintenance?.maintenanceStatus}
                                </Text>
                            </View>
                        </View>
                        <View className='flex-col space-y-1 mt-2'>
                            <View className='w-full flex-row justify-between'>
                                <Text className='text-xs font-bold'>Maintenance ID</Text>
                                <Text className='text-xs font-bold'>{maintenance?.id}</Text>
                            </View>
                            <View className='w-full flex-row justify-between'>
                                <Text className='text-xs font-bold'>Date & Time Request</Text>
                                <View className='flex-col items-end justify-end'>
                                <Text className='text-xs text-gray-500'>{maintenance?.date}</Text>
                                <Text className='text-xs text-gray-500'>{maintenance?.time}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className='mx-2'>
                    <View className='flex-row justify-between mt-4 mb-1 mx-4'>
                        <Text className='text-sm font-bold'>Property & Tenant Information</Text>
                    </View>
                    <View className='bg-white p-4 rounded-lg'>
                                <View className='flex-col'>
                                    <View className='flex-row space-x-4 border-b border-gray-400 pb-3'>
                                        <Image 
                                            className="w-11 h-11 rounded-full" 
                                            source={maintenance ? maintenance.ownerImage : require('../../../../assets/images/profile.png')} 
                                        />
                                        <View className='flex-1 flex-row items-center justify-between'>
                                        <View className='flex-col'>
                                            <Text className='text-sm'>{maintenance?.ownerFullName}</Text>
                                            <View className='flex-row items-center space-x-1'>
                                                <Text className="w-2.5 h-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                        maintenance?.accountStatus === 'Approved'
                                                            ? 'blue'
                                                            : maintenance?.accountStatus === 'Occupied'
                                                            ? 'black'
                                                            : 'green', // fallback color for other statuses
                                                    }}
                                                    >
                                                </Text>
                                                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                                                        color:
                                                        maintenance?.accountStatus === 'Approved'
                                                            ? 'blue'
                                                            : maintenance?.accountStatus === 'Occupied'
                                                            ? 'black'
                                                            : 'green', // fallback color for other statuses
                                                    }}>
                                                    {maintenance?.accountStatus}
                                                </Text>
                                            </View>
                                        </View>

                                            <View className='flex-row space-x-2'>
                                                <TouchableOpacity onPress={async () => {
                                                    router.push('../../Message/msgDetails')
                                                    await SecureStore.setItemAsync('messageRecipientId', maintenance?.tenantId ?? '');
                                                    }}>
                                                <MaterialIcons name="message" size={18} color="gray" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handlePhoneCall}>
                                                <FontAwesome6 name="phone" size={15} color="gray" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    <View className='mt-3 flex-row space-x-4'>
                                        <Image 
                                            className="w-16 h-16 rounded-lg" 
                                            source={maintenance ? maintenance.propertyImage : require('../../../../assets/images/property1.png')} 
                                        />
                                        <View>
                                            <Text className='text-xs font-bold text-gray-500'>Address: </Text>
                                            <Text className='text-sm text-gray-500'>{maintenance?.propertyName}</Text>
                                            {/* <Text className='text-sm text-gray-500'>{maintenance?.propertyType}</Text> */}
                                            <Text className='text-sm text-gray-500'>{maintenance?.propertyFullAddress}</Text>
                                        </View>
                                    </View>
                                </View>
                    </View>
                    </View>

                    <View className='flex-col mt-4 mb-2 mx-2'>
                            <View className='mx-4 mb-2'>
                                <Text className='text-sm font-bold'>Request Details</Text>
                            </View>
                            <View className='bg-white p-4 rounded-lg flex-col space-y-4'>
                                <View className='flex-col space-y-1'>
                                    <Text className='text-sm font-bold'>Preferred Time for Maintenance</Text>
                                    <Text className='text-xs text-gray-500'>{maintenance?.preferredTime}</Text>
                                </View>

                                <View className='flex-col space-y-1'>
                                    <Text className='text-sm font-bold'>Type of Issue</Text>
                                    <Text className='text-xs text-gray-500'>{maintenance?.issueType}</Text>
                                </View>

                                <View className='flex-col space-y-1'>
                                    <Text className='text-sm font-bold'>Description</Text>
                                    <Text className='text-xs text-gray-500'>{maintenance?.description}</Text>
                                </View>
                            </View>
                    </View>

                    {/* Image Slider Section */}
                    <View className='mx-2'>
                        <View className='mx-4 mt-4 mb-2'>
                            <Text className='text-sm font-bold'>Attachment</Text>
                        </View>
                        <View className='bg-white p-4 rounded-lg'>
                            {/* Sliding Images with Arrows and Number Indicator */}
                            <View className="relative items-center justify-center">
                                <Image
                                    style={{ width: Dimensions.get('window').width - 90, height: 200, resizeMode: 'cover' }}
                                    className='rounded-xl'
                                    source={maintenance?.maintenanceImages ? maintenance.maintenanceImages[currentIndex] : require('../../../../assets/images/property1.png')}
                                />

                                {/* Left Arrow */}
                                <TouchableOpacity 
                                    onPress={handlePreviousImage} 
                                    style={{ position: 'absolute', left: 10, top: '50%', transform: [{ translateY: -12 }] }}
                                    className='bg-black/50 p-1 rounded-full'
                                >
                                    <Entypo name="chevron-left" size={20} color="white" />
                                </TouchableOpacity>

                                {/* Right Arrow */}
                                <TouchableOpacity 
                                    onPress={handleNextImage} 
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -12 }] }}
                                    className='bg-black/50 p-1 rounded-full'
                                >
                                    <Entypo name="chevron-right" size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Image Number Indicator */}
                            <View className="absolute bottom-6 right-8 transform -translate-x-1/2">
                                <Text className="text-[10px] text-white bg-black/50 rounded-md px-2 py-0.5">
                                    {currentIndex + 1}/{maintenance?.maintenanceImages ? maintenance.maintenanceImages.length : 0}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Request History */}
                    <View className='mx-2 mt-4'>
                        <View className='mx-4'>
                            <Text className='text-sm font-bold'>Request History</Text>
                        </View>
                        <View className='bg-white p-4 mt-2 rounded-lg'>
                            {requestHistory.map((request, index) => (
                                <View key={request.id} className='flex-row'>
                                    {/* Vertical line and bullet */}
                                    <View className='items-center'>
                                        {/* Line above bullet */}
                                        <View
                                            className={`w-[2px] ${index === 0 ? 'h-0' : 'h-2'} bg-gray-300`}
                                        />
                                        {/* Bullet point */}
                                        <View className='w-2 h-2 bg-black rounded-full' />
                                        {/* Line below bullet */}
                                        <View
                                            className={`w-[2px] ${index === requestHistory.length - 1 ? 'h-0' : 'flex-1'} bg-gray-300`}
                                        />
                                    </View>

                                    {/* Request details */}
                                    <View className='flex-1 ml-4 mb-4'>
                                        <View className='w-full flex-row items-center justify-between'>
                                            <Text className='text-xs font-bold'>{request.reqStatus}</Text>
                                            <Text className='text-[10px] text-gray-400'>{request.date} {request.time}</Text>
                                        </View>
                                        {request.reqStatus === 'Request Submitted' ? (
                                            <Text className='text-[11px]'>Maintenance request submitted by tenant.</Text>
                                        ) : request.reqStatus === 'Request Approved' ? (
                                            <Text className='text-[11px]'>Maintenance request approved. A technician will visit on {request.prefDate} to fix the issue.</Text>
                                        ) : request.reqStatus === 'Work In Progress' ? (
                                            <Text className='text-[11px]'>Maintenance work is currently in progress.</Text>
                                        ) : request.reqStatus === 'Completed' ? (
                                            <Text className='text-[11px]'>Maintenance completed.</Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
            
            
        </View>

        <View className='w-full flex-row items-center justify-between bg-white px-8 py-4 absolute bottom-5 border-t border-gray-200'>
            <View className='flex-col '>
                <Text className='text-xs'>Maintenance Request Status</Text>
                <View className='flex-row items-center space-x-2 r'>
                    <Text className="w-2.5 h-2.5 rounded-full"
                        style={{
                            backgroundColor:
                            maintenance?.maintenanceStatus === 'Approved'
                                ? '#0FA958'
                                : maintenance?.maintenanceStatus === 'Pending'
                                    ? '#333333'
                                    : maintenance?.maintenanceStatus === 'In Progress'
                                        ? '#FF6500'
                                        : 'green', // fallback color for other requestStatuses
                        }}
                                        >
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-sm font-bold" 
                        style={{
                            color:
                            maintenance?.maintenanceStatus === 'Approved'
                                ? '#0FA958'
                                : maintenance?.maintenanceStatus === 'Pending'
                                    ? '#333333'
                                    : maintenance?.maintenanceStatus === 'In Progress'
                                        ? '#FF6500'
                                        : 'green', // fallback color for other requestStatuses
                        }}>
                        {maintenance?.maintenanceStatus}
                    </Text>
                </View>
            </View>

            <View className=' flex-row space-x-2'>
                { maintenance?.maintenanceStatus === 'Approved' ? (
                    <>
                    <TouchableOpacity className='bg-[#508D4E] py-2 px-6 rounded-lg' onPress={handleStartWork}>
                            <Text className='text-white text-xs font-bold'>Start Work</Text>
                        </TouchableOpacity>
                    </>
                ) : maintenance?.maintenanceStatus === 'In Progress' ? (
                        <>
                            <TouchableOpacity className='bg-[#508D4E] py-2 px-6 rounded-lg' onPress={handleComplete}>
                                    <Text className='text-white text-xs font-bold'>Mark as Complete</Text>
                                </TouchableOpacity>
                        </>
                ) : maintenance?.maintenanceStatus === 'Completed' ? (
                    <>
                      
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setRejectModalVisible(true)} className='bg-[#D9534F] py-2 px-6 rounded-lg'>
                            <Text className='text-white text-xs font-bold'>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setApproveModalVisible(true)} className='bg-[#508D4E] py-2 px-6 rounded-lg'>
                            <Text className='text-white text-xs font-bold'>Approve</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>

        <ApproveModal
        isApproveModalVisible={isApproveModalVisible}
        setApproveModalVisible={setApproveModalVisible}
        plannedMoveInDate={plannedMoveInDate}
        setPlannedMoveInDate={setPlannedMoveInDate}
        handleMoveInDateSubmit={handleMoveInDateSubmit}
        />

        {/* <RejectModal
            visible={isRejectModalVisible}
            onClose={() => setRejectModalVisible(false)}
            onReject={handleReject}
        /> */}
        
    </View>

  )
}