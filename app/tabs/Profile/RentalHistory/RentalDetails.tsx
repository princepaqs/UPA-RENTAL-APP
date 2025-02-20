import { View, Text, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons, Feather, MaterialIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RentalDetails() {
  const router = useRouter();
  const [rentalHistory, setRentalHistory] = useState<any>(null);
  const [propertyImage, setPropertyImage] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const { rentalData } = useLocalSearchParams();

  useEffect(() => {
    const getRentalData = async () => {
      if (rentalData) {
        setRentalHistory(JSON.parse(rentalData as string)); // Parse and set rental data
        const pImage = await SecureStore.getItemAsync('selectedPropertyImage');
        const uImage = await SecureStore.getItemAsync('selectedUserImage');
        // await SecureStore.setItemAsync('contractID', contractID);
        
        setPropertyImage(pImage);
        setUserImage(uImage);
  
        // Log the images to check if they are passed correctly
        console.log('Property Image: ', pImage);
        console.log('User Image: ', uImage);
  
        console.log('Rental Data:', JSON.parse(rentalData as string));
      }
    }
  
    getRentalData();
  }, [rentalData]);

  const handleViewAgreement = async () => {
    const uid = await SecureStore.getItemAsync('uid');
    if (rentalHistory?.ownerId && rentalHistory?.propertyId && uid) {
      const contractId = `${rentalHistory.ownerId}-${rentalHistory.propertyId}-${uid}`;
      
      // Ensure contractId is stored before navigating
      await SecureStore.setItemAsync('contractId', contractId);
      
      console.log("Contract ID stored:", contractId);
      
      // Navigate after storing the contract ID
      router.push('../../MyLease/ViewContractDetails');
    }
  };
  
  const handleViewLease = async () => {
    if (rentalHistory?.propertyId) {
      
      // Ensure contractId is stored before navigating
      await SecureStore.setItemAsync('propertyId', rentalHistory.propertyId);
      
      console.log("Contract ID stored:", rentalHistory.propertyId);
      
      // Navigate after storing the contract ID
      router.push('../../LeaseProperty/PropertyDetails');
    }
  };

  const handleOwnerProfile = async () => {
    if (rentalHistory?.ownerId) {

      // Ensure ownerId is stored before navigating
      await SecureStore.setItemAsync('userId', rentalHistory.ownerId);
      
      console.log("Owner ID stored:", rentalHistory.ownerId);
      
      // Navigate after storing the contract ID
      router.push('../../LeaseProperty/OwnerProfile');
    }
  }

  const handleMessage = async () => {
    if (rentalHistory?.ownerId) {

      // Ensure ownerId is stored before navigating
      await SecureStore.setItemAsync('messageRecipientId', rentalHistory.ownerId);
      
      console.log("Owner ID stored:", rentalHistory.ownerId);
      
      // Navigate after storing the contract ID
      router.push('../../Message/msgDetails');
    }
  }

  const handlePhoneCall = async () => {
    if (rentalHistory?.phoneNumber) {
      const phoneNumber = rentalHistory.phoneNumber;
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url);
    }
  };

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-14 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-10 pt-8 mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Rent Details History</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View className="px-6">
            {/* Check if rental history exists */}
            {!rentalHistory ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-xs font-normal text-gray-500">No rental history found. Start your rental journey today!</Text>
              </View>
            ) : (
              <>
                {/* Application Details Section */}
                <View className="p-4 bg-[#f5f5f5] rounded-md">
                  {/* Property Details */}
                  <View className="">
                  <Image
                    className="w-full h-[150px] rounded-md"
                    source={{ uri: propertyImage || '../../../assets/images/property1.png' }} 
                  />
                  </View>
                  <View className="pt-2 flex flex-col gap-2">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-bold">{rentalHistory.propertyName}</Text>
                      <TouchableOpacity className="bg-[#D9534F] flex flex-row rounded-md py-1 px-2" onPress={() => handleViewLease()}>
                        <Text className="text-white text-xs">View Lease</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex flex-row items-center">
                        <Feather name="map-pin" size={15} color="black" />
                        <Text className="pl-3 text-xs font-normal">{rentalHistory.propertyBarangay}, {rentalHistory.propertyCity}, {rentalHistory.propertyRegion}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Landlord Details */}
                <View className="px-4">
                  <TouchableOpacity className="flex flex-row items-center p-3 bg-white rounded-xl shadow" onPress={handleOwnerProfile}>
                    <Image className="w-10 h-10 rounded-full mr-4" source={{ uri: userImage || '../../../assets/images/profile.png' }} />
                    <View className="flex-1">
                      <Text className="text-sm font-bold">{rentalHistory.firstName} {rentalHistory.middleName} {rentalHistory.lastName}</Text>
                      <Text className="text-xs text-[#6C6C6C]">Landlord</Text>
                    </View>
                    <View className="flex flex-row gap-2">
                      <TouchableOpacity onPress={handleMessage}>
                        <MaterialIcons name="message" size={15} color="gray" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handlePhoneCall}>
                        <FontAwesome6 name="phone" size={13} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Rental Details */}
                <View className="flex flex-col p-5 gap-3">
                  <View className="flex flex-row items-center">
                    <Feather name="calendar" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Rent Period: {rentalHistory.rentalStartDate} - {rentalHistory.rentalEndDate}</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <MaterialCommunityIcons name="cash-multiple" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Rent Fee:₱ {parseFloat(rentalHistory.propertyCurrentRentAmount).toFixed(2)}</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <Feather name="shield" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Deposit Amount:₱ {parseFloat(rentalHistory.propertyCurrentRentDeposit).toFixed(2)}</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <Feather name="file-text" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Lease Agreement: {rentalHistory.leaseAgreement}</Text>
                    <TouchableOpacity className="bg-[#D9534F] flex flex-row rounded-md py-1 px-2" onPress={handleViewAgreement}>
                      <Text className="text-white text-xs">View Agreement</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex flex-col">
                    <Text className="text-xs font-bold">Payment History:</Text>
                    {/* Payment History Section */}
                    {/* {rentalHistory.paymentHistory.map((payment, index) => (
                      <Text key={index} className="text-xs">{payment.date} - {payment.amount}</Text>
                    ))} */}
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
