import { View, Text, Linking, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import HouseRulesModal from '../../Modals/HouseRulesModal';
import DeleteConfirmationModal from '../../Modals/DeleteConfirmationModal';
import { useAuth } from '@/context/authContext';

const tenant = {
  name: "Prince Louie Paquiado",
  status: "Active",
  tenantContactNo: "09924183277"
};

interface Contract {
    createdAt: Timestamp;
    transactionId: string;
    ownerId: string;
    //ownerFullName: string;
    //ownerEmail: string;
    //ownerFullAddress: string;
    //ownerContact: string;
    propertyId: string;
    //propertyName: string;
    //propertyType: string;
    //propertyAddress: string;
    //propertyLeaseDuration: string;
    propertyLeaseStart: string;
    propertyLeaseEnd: string;
    //propertyRentDueDay: string;
    //propertyRentAmount: string;
    //propertySecurityDepositRefundPeriod: string;
    //propertySecurityDepositAmount: string;
    //propertyAdvancePaymentAmount: string;
    //propertyHouseRules: string;
    //propertyTerminationPeriod: string;
    tenantId: string;
    //tenantFullName: string;
    //tenantEmail: string;
    //tenantContact: string;
    status: string;
  }

interface Property {
    id: string;
    propertyName: string;
    propertyType: string;
    noOfBedrooms: string;
    noOfBathrooms: string;
    furnishing: string;
    propertyWaterFee: string;
    propertyElectricFee: string;
    propertyGasFee: string;
    propertyInternetFee: string;
    propertyLeaseDuration: string;
    propertySecurityDepositMonth: string;
    propertySecurityDepositAmount: string;
    propertyAdvancePaymentAmount: string;
    propertyHouseRules: string;
    propertyPetPolicy: string;
    price: string;
    status: string;
    homeAddress: string;
    barangay: string;
    city: string;
    region: string;
    latitude: string;
    longitude: string;
    image?: number | { uri: string };
    images?: Array<number | { uri: string }>; // Make sure this line exists
  }

interface Tenant {
    tenantId: string;
    tenantFullName: string;
    tenantImage: number | { uri: string };
}

export default function ViewPropertyDetails() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContract, setHasContract] = useState(true);
  const { deleteProperty } = useAuth();

  const handlePhoneCall = () => {
    Linking.openURL(`tel:${tenant?.tenantContactNo || '09123456789'}`);
  };

  const handleDeleteConfirm = () => {
    // Handle the delete action here
    setDeleteModalVisible(false);
    if(contractData){
        deleteProperty(contractData?.propertyId, contractData?.propertyId);    
        console.log("Property deleted");
    }else{
        console.log("Error");
    }
    
    
  };

  const getAllImageUrls = async (propertyId: string, fileNames: string[]) => {
    try {
      const imageUrls = await Promise.all(
        fileNames.map(async (fileName) => {
          const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
          return await getDownloadURL(storageRef);
        })
      );
      return imageUrls;
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      return [];
    }
  };

  const getUserImageUrl = async (ownerId: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${ownerId}-profilepictures`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
        const propertyId = await SecureStore.getItemAsync('propertyId');
        const ownerId = await SecureStore.getItemAsync('uid');

        if(propertyId && ownerId){
            const propertyRef = await getDoc(doc(db, 'properties', ownerId, 'propertyId', propertyId))
            if(propertyRef.exists()){
                const data = propertyRef.data();
                if(data){

                    const imageUrls = data.images && data.images.length > 0
                    ? await getAllImageUrls(propertyId, data.images)
                    : [];

                    setPropertyData({
                        id: propertyId,
                        propertyName: data.propertyName,
                        propertyType: 'Condo',
                        noOfBedrooms: data.noOfBedrooms,
                        noOfBathrooms: data.noOfBathrooms,
                        furnishing: data.furnishing,
                        propertyWaterFee: data.propertyWaterFee,
                        propertyElectricFee: data.propertyElectricFee,
                        propertyGasFee: data.propertyGasFee,
                        propertyInternetFee: data.propertyInternetFee,
                        propertyLeaseDuration: data.propertyLeaseDuration,
                        propertySecurityDepositMonth: data.propertySecurityDepositMonth,
                        propertySecurityDepositAmount: data.propertySecurityDepositAmount,
                        propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
                        propertyHouseRules: data.propertyHouseRules,
                        propertyPetPolicy: data.propertyPetPolicy,
                        price: data.propertyMonthlyRent,
                        status: data.status || 'Available',
                        homeAddress: data.propertyHomeAddress,
                        barangay: data.propertyBarangay,
                        city: data.propertyCity,
                        region: data.propertyRegion,
                        latitude: data.propertyLatitude,
                        longitude: data.propertyLongitude,
                        images: imageUrls.length > 0 ? imageUrls.map((url) => ({ uri: url })) : [],
                    })

                    const contractRef = await getDocs(query(collection(db, 'contracts'), 
                    where('propertyId', '==', propertyId),
                    where('ownerId', '==', ownerId)));

                    if(!contractRef.empty){
                        const contract = contractRef.docs[0];
                        const data = contract.data()
                        if(data){
                            setContractData({
                                createdAt: data.createdAt,
                                transactionId: data.transactionId,
                                ownerId: ownerId,
                                propertyId: propertyId,
                                propertyLeaseStart: data.propertyLeaseStart,
                                propertyLeaseEnd: data.propertyLeaseEnd,
                                tenantId: data.tenantId,
                                status: data.status,
                            })
                        }
                        setHasContract(false);
                    }
                }
                setIsLoading(false);
            }
        }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchTenant = async () => {
        if(contractData){
            const userRef = await getDoc(doc(db, 'users', contractData?.tenantId))
            if(userRef.exists()){
                const data = userRef.data()
                if(data){
                    const profilePicture = await getUserImageUrl(contractData.tenantId)

                    setTenantData({
                        tenantId: contractData.tenantId,
                        tenantFullName: `${data.firstName} ${data.middleName} ${data.lastName}`,
                        tenantImage: profilePicture ? { uri: profilePicture }
                        : require('../../../../assets/images/profile.png') // Fallback image
                    })
                }
            }
            else{
                console.log('No tenants')
            }
        }
    }

    fetchTenant();
  },[contractData])

  if (isLoading) {
    return <Text></Text>; // Show a loading state or spinner here
  }

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
                <Text className='text-sm font-bold text-center'>Property Details</Text>
                </View>
            </View>

            <View className='flex-row items-center justify-between mt-5 bg-white p-2 rounded-lg'>
                <View className='flex-row items-center justify-center space-x-1'>
                    <FontAwesome name="home" size={24} color="black" />
                    <Text className='text-xs font-bold'>Property Status</Text>
                </View>
                <View className='flex-row items-center space-x-2 justify-center'>
                    <Text className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                            propertyData?.status === 'Rented'
                                ? 'blue'
                                : propertyData?.status === 'Occupied'
                                  ? 'green'
                                  : 'black', // fallback color for other statuses
                          }}
                        >
                    </Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                            color:
                            propertyData?.status === 'Rented'
                                ? 'blue'
                                : propertyData?.status === 'Occupied'
                                  ? 'green'
                                  : 'black', // fallback color for other statuses
                          }}>
                          {propertyData?.status}
                    </Text>
                </View>
            </View>

            <View>
            <View className='flex-row justify-between mt-5 mb-1'>
                <Text className='text-sm font-bold'>Tenant Information</Text>
                <TouchableOpacity className='flex-row space-x-1' 
                onPress={async () => {
                    router.push('../../MyLease/ViewContract')
                    if(contractData){
                        await SecureStore.setItemAsync('contractId', contractData.transactionId);
                    }}}
                disabled={hasContract}
                >
                    <AntDesign name="eye" size={15} color="#D9534F" />
                    <Text className='text-xs text-[#D9534F] '>View Contract</Text>
                </TouchableOpacity>
            </View>
            <View className='bg-white p-3 rounded-lg'>
                {propertyData?.status === 'Occupied' ? (
                    <>
                        <View className='flex-col'>
                            <View className='flex-row space-x-2 border-b border-gray-400 pb-3'>
                                <Image 
                                    className="w-11 h-11 rounded-full" 
                                    source={tenantData?.tenantImage} 
                                />
                                <View className='flex-1 flex-row items-center justify-between'>
                                <View className='flex-col'>
                                    <Text className='text-sm'>{tenantData?.tenantFullName}</Text>
                                    <View className='flex-row items-center space-x-1'>
                                        <Text className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                contractData?.status === 'Approved'
                                                    ? 'blue'
                                                    : contractData?.status === 'Active'
                                                    ? 'green'
                                                    : 'black', // fallback color for other statuses
                                            }}
                                            >
                                        </Text>
                                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                                                color:
                                                contractData?.status === 'Approved'
                                                    ? 'blue'
                                                    : contractData?.status === 'Active'
                                                    ? 'green'
                                                    : 'black', // fallback color for other statuses
                                            }}>
                                            {tenant.status}
                                        </Text>
                                    </View>
                                </View>

                                    <View className='flex-row space-x-2'>
                                        <TouchableOpacity onPress={async () => {
                                            await SecureStore.setItemAsync('messageRecipientId', tenantData?.tenantId ?? '');
                                            router.push('../../Message/msgDetails')
                                            }}>
                                        <MaterialIcons name="message" size={18} color="gray" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handlePhoneCall}>
                                        <FontAwesome6 name="phone" size={15} color="gray" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View className='mt-3'>
                                <Text className='text-sm font-bold'>Lease Agreement Details</Text>
                                <View className='mt-2 space-y-1 flex-col'>
                                    <View className='flex-row items-center justify-between'>
                                        <Text className='text-xs text-gray-500'>Start Date</Text>
                                        <Text className='text-xs text-gray-500'>{contractData?.propertyLeaseStart}</Text>
                                    </View>
                                    <View className='flex-row items-center justify-between'>
                                        <Text className='text-xs text-gray-500'>End Date</Text>
                                        <Text className='text-xs text-gray-500'>{contractData?.propertyLeaseEnd}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Text className='text-xs text-gray-500'>No tenant assigned. Property is currently available.</Text>
                    </>
                )}
            </View>
            </View>

            <View className='flex-row items-center justify-between mt-4 mb-2'>
                    <Text className='text-lg font-bold'>Property Details</Text>
                    <View className='flex-row space-x-1'>
                        <TouchableOpacity className='flex-row items-center space-x-1 bg-[#333333] px-2 py-1 rounded-lg'
                        onPress={async() => {
                            
                            if(propertyData?.status == 'Occupied'){
                                router.push('./EditProperty/editTerms&Condition');
                            }else {
                                router.push('./EditProperty/editProperty')
                            }
                        }}>
                            
                            <MaterialIcons name="edit" size={15} color="white" />
                            <Text className=' text-white text-xs font-bold'>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='flex-row items-center space-x-1 bg-[#D9534F] px-2 py-1 rounded-lg'
                            onPress={async () => {
                                if(propertyData?.status == 'Occupied'){
                                    Alert.alert('Error', 'Property still occupied. Unable to delete the property')
                                }else{
                                    setDeleteModalVisible(true)
                                }
                            }} 
                        >
                            <MaterialIcons name="delete" size={15} color="white" />
                            <Text className=' text-white text-xs font-bold'>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View className='mb-12'>
                <View className='mt-2 bg-white p-4 rounded-lg'>
                <Image
                    className="w-full h-[150px] rounded-lg"
                    source={
                        propertyData?.images && propertyData.images.length > 0
                        ? propertyData.images[0]  // Directly use the first image object
                        : require('../../../../assets/images/property1.png') // Fallback image
                    }  
                    onLoad={() => console.log('Image:', propertyData?.images)}
                    />
                    <View className='mt-2 border-b border-gray-400 pb-2'>
                        <Text className='text-lg font-bold'>{propertyData?.propertyName}</Text>
                        <Text className='text-md font-bold'>{propertyData?.propertyType}</Text>
                        <View className='flex-row space-x-2 items-center'>
                            <Octicons name="location" size={14} color="black" />
                            <Text className='text-xs'>
                            {`${propertyData?.homeAddress}, ${propertyData?.barangay}, ${propertyData?.city}, ${propertyData?.region}`.length > 40
                                ? `${propertyData?.homeAddress}, ${propertyData?.barangay}, ${propertyData?.city}, ${propertyData?.region}`.slice(0, 40) + '...'
                                : `${propertyData?.homeAddress}, ${propertyData?.barangay}, ${propertyData?.city}, ${propertyData?.region}`}
                            </Text>
                        </View>
                    </View>
                    <View className='py-4 space-y-2'>
                        <View className='flex flex-row items-center space-x-4'>
                            <MaterialIcons name="bed" size={18} color="black" />
                            <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                                {propertyData ? 
                                `${propertyData?.noOfBedrooms} ${parseInt(propertyData?.noOfBedrooms) > 1 ? 'Bedrooms' : 'Bedroom'}` 
                                : ''
                                }
                            </Text>
                        </View>

                        <View className='flex flex-row items-center space-x-4'>
                            <MaterialCommunityIcons name="bathtub-outline" size={18} color="black" />
                            <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                                {propertyData ? 
                                `${propertyData?.noOfBathrooms} ${parseInt(propertyData.noOfBathrooms) > 1 ? 'Bathrooms' : 'Bathroom'}` 
                                : ''
                                }
                            </Text>
                        </View>

                        <View className='flex flex-row items-center space-x-4'>
                            <MaterialCommunityIcons name="sofa-single-outline" size={18} color="black" />
                            <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                                {propertyData ? 
                                `${propertyData?.furnishing}` 
                                : ''
                                }
                            </Text>
                        </View>
                    </View>
                    
                    {/* Rental Terms & Condition */}
                    <View className='flex flex-col px-1 pt-4 gap-3'>
                    <Text className='text-lg font-bold'>Rental Terms & Conditions</Text>

                    {/* Lease Duration */}
                    {!propertyData?.propertyLeaseDuration ? (
                        <Text className='bg-gray-200 w-2/3 rounded-xl'></Text>
                    ) : (
                        <View className='flex flex-row items-center justify-between'>
                        <Text className='text-sm text-[#6B6A6A]'>
                            Lease Duration
                        </Text>
                        <Text className='text-sm text-[#6B6A6A]'>
                            {propertyData?.propertyLeaseDuration}
                        </Text>
                        </View>
                    )}

                    {/* Deposit Month */}
                    {!propertyData?.propertySecurityDepositMonth ? (
                        <Text className='bg-gray-200 w-2/3 rounded-xl'></Text>
                    ) : (
                        <View className='flex flex-row items-center justify-between'>
                        <Text className='text-sm text-[#6B6A6A]'>
                            Deposit Month
                        </Text>
                        <Text className='text-sm text-[#6B6A6A]'>
                            
                            {propertyData?.propertySecurityDepositMonth}
                        </Text>
                        </View>
                    )}

                    {/* Deposit Amount */}
                    {!propertyData?.propertySecurityDepositAmount ? (
                        <Text className='bg-gray-200 w-2/3 rounded-xl'></Text>
                    ) : (
                        <View className='flex flex-row items-center justify-between'>
                        <Text className='text-sm text-[#6B6A6A]'>
                            Deposit Amount
                        </Text>
                        <Text className='text-sm text-[#6B6A6A]'>      
                            ₱{parseInt(propertyData?.propertySecurityDepositAmount).toLocaleString()}
                        </Text>
                        </View>
                    )}


                    {/* House Rules and Pet Policy */}
                    {!propertyData?.propertyHouseRules ? (
                        <Text className='bg-gray-200 w-2/3 rounded-xl'></Text>
                    ) : (
                        <View className='space-y-2'>
                        {/* House Rules label */}
                        <Text className='text-sm text-[#6B6A6A]'>
                            <Text className='text-sm font-semibold'>House Rules: </Text>
                        </Text>

                        {/* Pet Policy */}
                        <Text className='text-sm text-[#6B6A6A]'>
                            Pet Policy: {propertyData?.propertyPetPolicy}
                        </Text>

                        <View>
                            {/* House Rules with 1 line clamp */}
                            <Text className='text-sm text-[#6B6A6A]' numberOfLines={2} ellipsizeMode="tail">
                            {propertyData?.propertyHouseRules}
                            </Text>

                            {/* "See More" button */}
                            <TouchableOpacity className='bg-gray-100 border border-gray-300 rounded-xl shadow-md mt-2 p-1 items-center justify-center' onPress={() => setModalVisible(true)}>
                            <Text className='text-gray-500 text-xs'>See More</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    )}

                    
                    </View>
                </View>
            </View>
            </ScrollView>
            
                    {/* House Rules Modal */}
                    <HouseRulesModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        petPolicy={propertyData?.propertyPetPolicy || ''}  // Fallback to an empty string
                        houseRules={propertyData?.propertyHouseRules || ''}  // Fallback to an empty string
                    />
                    <DeleteConfirmationModal
                    visible={deleteModalVisible}
                    onConfirm={handleDeleteConfirm} // Action on "Yes"
                    onCancel={() => setDeleteModalVisible(false)} // Action on "No"
                    />
        </View>
    </View>
  )
}