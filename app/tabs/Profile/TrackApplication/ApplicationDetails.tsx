import { View, Text, TouchableOpacity, Image, Modal, Pressable, Linking, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Feather, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';

// Dummy data
const applicationDetails = {
  /*applicationId: '123456',
  applicationDate: 'July 20, 2024 - 10:00 AM',
  property: {
    name: 'Unit 124 Apartment',
    location: 'Makati City, Metro Manila',
    price: 'Php 5,500 / Month',
    image: require('../../../../assets/images/property1.png'),
  },
  landlord: {
    name: 'Maria Delacruz',
    image: require('../../../../assets/images/profile.png'),
  },
  status: 'Pending',*/
  feedback: [
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi dolore tempore fuga distinctio esse aperiam.",
    "Ducimus voluptatibus voluptate expedita, nesciunt harum officiis ipsum officia.",
    "Adipisci perspiciatis animi corrupti architecto. Iure! Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    "Nisi dolore tempore fuga distinctio esse aperiam. Ducimus voluptatibus voluptate expedita.",
    "Nisi dolore tempore fuga distinctio esse aperiam. Ducimus voluptatibus voluptate expedita."
  ],
};

interface ApplicationDetails {
  fullName: string;
  tenantImage?: { uri: string } | number;
  phoneNo: string;
  transactionId: string;
  rentalStartDate: string;
  propertyName: string;
  propertyType: string;
  propertyFullAddress: string;
  propertyPrice: string;
  propertyOwner: string;
  propertyId: string;
  tenantId: string;
  transactionStatus: string;
  propertyImage?: { uri: string } | number;
}

export default function ApplicationDetails() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [showMore, setShowMore] = useState(false); // State to control showing more feedback
  const [details, setDetails] = useState<ApplicationDetails | null>(null);

  const { withdrawRent } = useAuth();

  // Function to handle withdrawing the application
  const handleWithdrawApplication = () => {
    if(details){
      withdrawRent(details?.transactionId);
      router.back();
    }
    console.log("Application withdrawn");
    setModalVisible(false); // Close modal after confirmation
  };

  //const phoneNumber = '1234567890';
  const handlePhoneCall = () => {
    Linking.openURL(`tel:${details?.phoneNo}`);
  };

  const getUserImageUrl = async (propertyOwner: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${propertyOwner}-profilepictures`);
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
    const fetchApplicationData = async () => {
      const transactionId = await SecureStore.getItemAsync('transactionId');
      const propertyId = await SecureStore.getItemAsync('propertyId');
      //console.log(transactionId);

      if(transactionId && propertyId){
        const transactionsRef = await getDoc(doc(db, 'propertyTransactions', transactionId));

        if(transactionsRef.exists()){
          const transactionData = transactionsRef.data();

          const rentalStartDate = transactionData?.createdAt?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const transactionStatus = transactionData.status;
          const propertyOwner = transactionData.ownerId;
          const tenantId = transactionData.tenantId;
          console.log(rentalStartDate, transactionStatus, propertyOwner, propertyId, tenantId);

          const userRef = await getDoc(doc(db, 'users', propertyOwner));

          if(userRef.exists()){
            const userData = userRef.data();

            const firstName = userData.firstName;
            const middleName = userData.middleName;
            const lastName = userData.lastName;
            const fullName = `${firstName} ${middleName} ${lastName}`;
            const profilePicture = await getUserImageUrl(propertyOwner);
            const phoneNo = userData.phoneNo;
            

            const propertyRef = doc(db, 'properties', propertyOwner, 'propertyId', propertyId);
            const propertySnapshot = await getDoc(propertyRef);

            if (propertySnapshot.exists()) {
                const propertyData = propertySnapshot.data();

                if (propertyData) {
                  const firstImageUri = propertyData.images && propertyData.images.length > 0
                    ? await getPropertyImageUrl(propertyId, propertyData.images[0])
                    : null;

                    const propertyCity = propertyData.propertyCity;
                    const propertyRegion = propertyData.propertyRegion;
                    const propertyFullAddress = `${propertyCity}, ${propertyRegion}`;

                    // Validate all required data
                    if (!transactionId || !fullName || !rentalStartDate || 
                        !propertyOwner || !propertyId || !tenantId || !transactionStatus) {
                        return;
                    }

                    // Set the transaction data
                    setDetails({
                        transactionId,
                        fullName,
                        phoneNo,
                        rentalStartDate,
                        propertyOwner,
                        propertyId,
                        tenantId,
                        transactionStatus,
                        tenantImage: profilePicture || require('../../../../assets/images/profile.png'),
                        propertyImage: firstImageUri || require('../../../../assets/images/property1.png'),
                        propertyName: propertyData.propertyName,
                        propertyPrice: propertyData.propertyMonthlyRent,
                        propertyType: propertyData.propertyType,
                        propertyFullAddress: propertyFullAddress,
                    });
                }
            }
          }


        }
      }
    }

    fetchApplicationData();
  }, []);

  return (
    <View className="bg-[#B33939] h-full">
      <View className="bg-gray-100 h-full mt-14 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-10 pt-8 mb-2">
              <TouchableOpacity onPress={() => router.back()}>
                <View className="flex flex-row items-center">
                  <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </View>
              </TouchableOpacity>
              <View className="flex-1 items-center justify-center ">
                <Text className="text-sm font-bold text-center">Application Details</Text>
              </View>
            </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
          <View className='px-4'>
            
            {/* Application Details Section */}
            <View className="p-4 bg-[#f5f5f5] rounded-md">
              <View className="flex flex-col bg-black p-3 rounded-md mb-2">
                <Text 
                  className="text-xs text-white font-bold"
                  numberOfLines={1} 
                  ellipsizeMode='tail' 
                  style={{ maxWidth: '80%' }} // Set maxWidth to prevent overflow
                >Application ID: {details? details.transactionId : ''}</Text>
                <Text className="text-xs text-white font-bold">Date & Time: {details? details.rentalStartDate : ''}</Text>
              </View>
              {/* Property Details */}
              <View className="pt-2">
                <Image 
                  className="w-full h-[200px] rounded-md" 
                  source={details ? {uri : details.propertyImage} : require('../../../../assets/images/property1.png')} 
                  />
                  <View
                        className='absolute top-4 left-2 bg-black/60 rounded-full px-3 py-1 shadow-md'
                      >
                        <Text className='text-xs text-white font-normal'>{details? details.propertyType : ''}</Text>
                      </View>
              </View>
              <View className="pt-2 flex flex-col gap-2">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-lg font-bold">
                    {details ? details.propertyName : ''}
                  </Text>
                  <TouchableOpacity className="bg-[#D9534F] flex flex-row rounded-md py-1 px-2" onPress={ async () => {
                    const propertyId = details?.propertyId || '';
                    const propertyOwner = details?.propertyOwner || '';
                    await SecureStore.setItemAsync('propertyId', propertyId);
                    await SecureStore.setItemAsync('userId', propertyOwner);
                    router.push('../../LeaseProperty/PropertyDetails')}}>
                    <Text className="text-white text-xs">View Listing</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Feather name="map-pin" size={15} color="black" />
                    <Text className="pl-3 text-xs font-normal">{details? details.propertyFullAddress : ''}</Text>
                  </View>
                </View>
                <View className="flex flex-row items-center justify-start">
                  <Ionicons name="pricetags" size={15} color="black" />
                  <Text className="pl-3 text-xs font-normal">{details? details.propertyPrice : ''} / Month</Text>
                </View>
              </View>
            </View>

            {/* Landlord Details */}
            <View className='px-4'>
              <TouchableOpacity className="flex flex-row items-center px-3 py-2 bg-white rounded-md shadow" onPress={() => router.push('../../LeaseProperty/OwnerProfile')}>
                <Image className="w-10 h-10 rounded-full mr-4" source={details ? {uri : details.tenantImage} : require('../../../../assets/images/profile.png')} />
                <View className="flex-1">
                  <Text className="text-sm font-bold">{details? details.fullName : ''}</Text>
                  <Text className="text-xs text-[#6C6C6C]">Landlord</Text>
                </View>
                <View className='flex flex-row gap-2'>
                  <TouchableOpacity onPress={async() => {
                    router.push('../../Message/msgDetails');
                    const propertyOwner = details?.propertyOwner || '';
                    await SecureStore.setItemAsync('userId', propertyOwner);
                  }}>
                    <MaterialIcons name="message" size={15} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePhoneCall}>
                    <FontAwesome6 name="phone" size={13} color="gray" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>

            {/* Feedback Section */}
            <View className="p-4 rounded-xl shadow">
              <Text className="text-sm font-bold mb-2">Feedback</Text>
              <View className="bg-gray-200 rounded-xl p-2">
                {applicationDetails.feedback.slice(0, showMore ? applicationDetails.feedback.length : 2).map((feedback, index) => (
                  <Text key={index} className="text-xs">{feedback}</Text>
                ))}
                {!showMore && applicationDetails.feedback.length > 2 && (
                  <TouchableOpacity onPress={() => setShowMore(true)}>
                    <Text className="text-xs text-blue-500 mt-2">Show More</Text>
                  </TouchableOpacity>
                )}
                {showMore && (
                  <TouchableOpacity onPress={() => setShowMore(false)}>
                    <Text className="text-xs text-blue-500 mt-2">Show Less</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal for confirming withdrawal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-lg w-4/5 shadow-lg">
              <Text className="text-lg font-bold mb-4">Withdraw Application</Text>
              <Text className="mb-6">Are you sure you want to withdraw your application for {details? details.transactionId : ''}?</Text>
              <View className="flex flex-row justify-center gap-5">
                <Pressable
                  className="py-2 px-4 bg-black rounded-md"
                  onPress={handleWithdrawApplication}
                >
                  <Text className="text-white font-bold">Yes</Text>
                </Pressable>
                <Pressable
                  className="py-2 px-4 border rounded-md"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className=" font-bold">No</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Application Status Section */}
        <View className="flex flex-row justify-between items-center p-4 bg-white rounded-t-xl fixed w-full bottom-0">
          <View className="flex flex-row items-center space-x-2">
            <View className="flex flex-col">
              <Text className="text-xs">Application Status</Text>
              <View className="flex flex-row items-center gap-1">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                    details?.transactionStatus === 'Approved'
                        ? 'green'
                        : details?.transactionStatus === 'In-review'
                          ? 'black'
                          : 'red', // fallback color for other statuses
                  }}
                ></View>
                <Text className="text-sm font-bold">{details?.transactionStatus}</Text>
              </View>
            </View>
          </View>
          {details && (
  <TouchableOpacity
    className="bg-[#D9534F] rounded-md py-2 px-3"
    onPress={() => setModalVisible(true)} // Open modal on press
  >
    <Text className="text-white text-xs font-bold">Withdraw Application</Text>
  </TouchableOpacity>
)}
        </View>
      </View>
    </View>
  );
}
