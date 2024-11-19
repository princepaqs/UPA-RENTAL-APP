import { View, Text, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons, Feather, MaterialIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Dummy data
const rentalHistory = {
  applicationId: '123456',
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
  status: 'Pending',
  rentPeriod: 'July 2024 - December 2024',
  depositAmount: 'Php 11,000',
  leaseAgreement: 'Lease Agreement Document',
  paymentHistory: [
    { date: 'July 1, 2024', amount: 'Php 5,500' },
    { date: 'August 1, 2024', amount: 'Php 5,500' },
  ],
};

export default function RentalHistory() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const phoneNumber = '1234567890';
  const handlePhoneCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
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
          <View className='px-6'>
            {/* Check if rental history exists */}
            {Object.keys(rentalHistory).length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-lg font-semibold text-gray-500">No rental history found. Start your rental journey today!</Text>
              </View>
            ) : (
              <>
                {/* Application Details Section */}
                <View className="p-4 bg-[#f5f5f5] rounded-md">
                  {/* Property Details */}
                  <View className="">
                    <Image className="w-full h-[150px] rounded-md" source={rentalHistory.property.image} />
                  </View>
                  <View className="pt-2 flex flex-col gap-2">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-xl font-bold">{rentalHistory.property.name}</Text>
                      <TouchableOpacity className="bg-[#D9534F] flex flex-row rounded-md py-1 px-2" onPress={() => router.push('/tabs/Profile/LegalDocuments')}>
                        <Text className="text-white text-xs">View Lease</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex flex-row items-center">
                        <Feather name="map-pin" size={15} color="black" />
                        <Text className="pl-3 text-xs font-normal">{rentalHistory.property.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Landlord Details */}
                <View className='px-4'>
                  <TouchableOpacity className="flex flex-row items-center p-3 bg-white rounded-xl shadow" onPress={() => router.push('./profile')}>
                    <Image className="w-10 h-10 rounded-full mr-4" source={rentalHistory.landlord.image} />
                    <View className="flex-1">
                      <Text className="text-sm font-bold">{rentalHistory.landlord.name}</Text>
                      <Text className="text-xs text-[#6C6C6C]">Landlord</Text>
                    </View>
                    <View className='flex flex-row gap-2'>
                      <TouchableOpacity onPress={async() => {
                        //await SecureStore.setItemAsync('messageRecipientId', selectedLeaseData?.ownerId);
                        router.push('../Message/msgDetails')
                        }}>
                        <MaterialIcons name="message" size={15} color="gray" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handlePhoneCall}>
                        <FontAwesome6 name="phone" size={13} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Rental Details */}
                <View className='flex flex-col p-5 gap-3'>
                  <View className='flex flex-row items-center'>
                    <Feather name="calendar" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Rent Period: {rentalHistory.rentPeriod}</Text>
                  </View>
                  <View className='flex flex-row items-center'>
                    <MaterialCommunityIcons name="cash-multiple" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Rent Fee: {rentalHistory.property.price}</Text>
                  </View>
                  <View className='flex flex-row items-center'>
                    <Feather name="shield" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Deposit Amount: {rentalHistory.depositAmount}</Text>
                  </View>
                  <View className='flex flex-row items-center'>
                    <Feather name="file-text" size={15} color="black" />
                    <Text className="text-xs font-bold pl-2">Lease Agreement: {rentalHistory.leaseAgreement}</Text>
                  </View>

                  <View className='flex flex-col'>
                    <Text className="text-xs font-bold">Payment History:</Text>
                    {rentalHistory.paymentHistory.map((payment, index) => (
                      <Text key={index} className="text-xs">{payment.date} - {payment.amount}</Text>
                    ))}
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
