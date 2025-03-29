import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Linking, Animated, Modal, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Entypo, EvilIcons, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { AirbnbRating } from 'react-native-ratings';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth} from '../../../context/authContext';
import HouseRulesModal from '.././Modals/HouseRulesModal';
import MoveInDateModal from '.././Modals/MoveInDateModal';
import RentConfirmationModal from '.././Modals/RentConfirmationModal';
import tenantsData from '.././Modals/tenantsReviews.json';
import ImageModal from '.././Modals/ImageModal'; 
const tenants = tenantsData.map(tenant => ({
  ...tenant
}));


interface Property {
  id: string;
  propertyName: string;
  propertyType: string;
  noOfBedrooms: string;
  noOfTenants: string;
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
  isFavorite: boolean;
}

interface Owner {
  id: string;
  role: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNo: string;
  profilePicture: { uri: string } | number;
}

interface User {
  uid: string;
  role: string;
}

export default function Tenants() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filteredTenants, setFilteredTenants] = useState(tenants);
  const inputWidth = useRef(new Animated.Value(40)).current;
  const [averageRating, setAverageRating] = useState(0);
  const [propertyId, setPropertyId] = useState('');
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [moveInDateModalVisible, setMoveInDateModalVisible] = useState(false);
  const [rentConfirmationModalVisible, setRentConfirmationModalVisible] = useState(false);
  const [plannedMoveInDate, setPlannedMoveInDate] = useState(new Date()); // Change to Date object
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show/hide DatePicker
  const { rentProperty, addFavorite, removeFavorite } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  
  const phoneNumber = '1234567890';
const handlePhoneCall = () => {
  Linking.openURL(`tel:${ownerData?.phoneNo}`);
};


  const handleRentNow = () => {
    setMoveInDateModalVisible(true);
  };

  const handleMoveInDateSubmit = () => {
    setMoveInDateModalVisible(false);
    setRentConfirmationModalVisible(true);
    //console.log('Stored Rental Start Date:', plannedMoveInDate);
  };

  const handleConfirm = async() => {
    await SecureStore.setItemAsync('rentDate', plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    //console.log(plannedMoveInDate);
    rentProperty();
    //router.push('/tabs/Profile/TrackApplication/TrackApplication');
    setRentConfirmationModalVisible(false);
  };

  const getDetails = async () => {
    try {
      const id = await SecureStore.getItemAsync('propertyId');
      if (id) {
        setPropertyId(id);
      } else {
        console.error('No propertyId found in SecureStore.');
      }
    } catch (error) {
      console.error('Failed to retrieve propertyId:', error);
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
    const fetchUserRole = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      if(uid){
        const userRef = await getDoc(doc(db, 'users', uid));
        if(userRef.exists()){
          const userData = userRef.data();
          const role = userData.role;

          //console.log(uid, role);
          setUserData({
            uid: uid,
            role: role
          })
        }
      }
    }
    fetchUserRole();
  }, []);

  // Calculate the average rating and fetch the property ID
  useEffect(() => {
    const totalRating = tenants.reduce((acc, tenant) => acc + tenant.rating, 0);
    const avgRating = tenants.length > 0 ? totalRating / tenants.length : 0;
    setAverageRating(avgRating);
    getDetails(); // Fetch the property ID when component mounts

    const fetchPropertyData = async () => {
      const propertyId = await SecureStore.getItemAsync('propertyId');
      const ownerId = await SecureStore.getItemAsync('userId');
      const tenantId = await SecureStore.getItemAsync('uid');
      if (!propertyId || !ownerId || !tenantId) {
        console.error('PropertyId or UID is null or undefined');
        return;
      }

      const userRef = await getDoc(doc(db, 'users', ownerId));

      if (userRef.exists()) {
        const data = userRef.data();

        if (data) {
          const email = data.email;
          const profilePicture = await getUserImageUrl(ownerId);

          setOwnerData({
            id: ownerId,
            role: data.role,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phoneNo: data.phoneNo,
            profilePicture: profilePicture
              ? { uri: profilePicture }
              : require('../../../assets/images/profile.png') // Fallback image
          });
        }
      }

      const propertyRef = doc(db, 'properties', ownerId, 'propertyId', propertyId);
      const propertySnapshot = await getDoc(propertyRef);

      const favoritesRef = collection(db, 'favorites', tenantId, 'owner');
      const favoritesSnapshot = await getDocs(favoritesRef);

      // Check if the property is marked as favorite for the specific propertyId and ownerId
      const isFavorite = !favoritesSnapshot.empty && favoritesSnapshot.docs.some(doc => {
        const data = doc.data();
        return data.propertyId === propertyId && data.tenantId === tenantId && data.ownerId === ownerId;
      });

      if (propertySnapshot.exists()) {
        const data = propertySnapshot.data();

        if (data) {
          // Fetch all image URLs from Firestore
          const imageUrls = data.images && data.images.length > 0
            ? await getAllImageUrls(propertyId, data.images)
            : [];

          // Set property data state with all images
          setPropertyData({
            id: propertyId.toString(),
            propertyName: data.propertyName,
            propertyType: 'Condo',
            noOfBedrooms: data.noOfBedrooms,
            noOfTenants: data.noOfTenants,
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
            isFavorite: isFavorite,
          });

          setFavorites(prevState => ({
            ...prevState,
            [`${ownerId}_${propertyId}`]: isFavorite, // Set the favorite status for the current property
          }));
        }
      } else {
        //console.log(`Property with ID ${propertyId} does not exist.`);
      }
    };
    fetchPropertyData();
    //console.log("Images array:", propertyData?.images)
  }, []);

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const handleFavoriteToggle = async (ownerId: string, propertyId: string) => {

    const key = `${ownerId}_${propertyId}`;
    const isFavorite = favorites[key]; // Check if the property is currently a favorite

    // Add or remove the favorite based on the current state
    if (isFavorite) {
        await removeFavorite(ownerId, propertyId); // If it's already a favorite, remove it
    } else {
        await addFavorite(ownerId, propertyId); // If it's not a favorite, add it
    }

    setFavorites(prevState => ({
        ...prevState,
        [key]: !isFavorite, // Toggle the favorite state
    }));
  };

  const [showMore, setShowMore] = useState(false); // State to control showing more feedback

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / Dimensions.get('window').width);
  };

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Keep track of the current image index

  const handleImageClick = (imageUri: string, index: number) => {
    setSelectedImageUri(imageUri);
    setCurrentIndex(index);
    setIsModalVisible(true);
  };
  const images = propertyData?.images || []; // Fallback to an empty array
  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 mt-14 py-8 rounded-t-2xl'>
      <View className='flex flex-row items-center justify-between px-8 py-3'>
                <TouchableOpacity onPress={() => 
                  // router.replace('./PropertyDashboard') // test first
                  router.back()
                  }>
                <View className="flex flex-row items-center">
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </View>
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center pl-5">
                {/* <Text className='text-lg font-bold text-center'>Property Details</Text> */}
                </View>
{/*
                <View className='flex flex-row items-center gap-3'>
                   <Ionicons name="share-social-sharp" size={20} color="black" /> 
                  <TouchableOpacity onPress={() => handleFavoriteToggle(ownerData?.id ?? '', propertyData?.id ?? '')}>
                    <MaterialIcons
                      name={favorites[`${ownerData?.id}_${propertyData?.id}`] ? 'favorite' : 'favorite-outline'}
                      size={20}
                      color={favorites[`${ownerData?.id}_${propertyData?.id}`] ? 'red' : 'black'}
                    />
                  </TouchableOpacity>
                </View>*/}
          </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          

          {/* Property Image */}
          <View className='flex flex-row pt-5'>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {propertyData && propertyData.images && propertyData.images.length > 0 ? (
                propertyData.images.map((image: number | { uri: string }, index: number) => (
                  <TouchableOpacity key={index} onPress={() => handleImageClick(typeof image === 'number' ? '' : image.uri, index)}>
                    <View style={{ width: Dimensions.get('window').width }} className='px-5'>
                      <Image
                        className="w-full h-[200px] rounded-xl"
                        source={typeof image === 'number' ? image : { uri: image.uri }}  // Handle both number and URI types
                      />
                      <View className="absolute bottom-2.5 right-8 bg-gray-100/70 px-2 py-0.5 border border-gray-300 rounded-full">
                        <Text className=" text-[11px]">{index + 1}/{images.length}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className='flex items-center justify-center w-full px-5'>
                  <Image
                    className="w-full h-[200px] rounded-xl mr-2"
                    source={require('../../../assets/images/property.png')}
                  />
                </View>
              )}
            </ScrollView>

            {/* Image Modal */}
            {selectedImageUri && propertyData?.images ? (
              <ImageModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                images={propertyData.images as (number | { uri: string })[]} // Assert the type to avoid TypeScript error
                currentIndex={currentIndex}
              />
            ) : null}
          </View>

          <View className='px-8 py-1 '>
            <View className='flex flex-row items-center justify-between pb-1'>
              <Text 
                className={`text-2xl font-bold ${propertyData ? '' : 'bg-gray-200 w-2/3 rounded-xl'}`}
              >
                {propertyData ? propertyData.propertyName : ''}
              </Text>
              <View className='flex flex-row items-center space-x-1'>
                {/* Displaying dynamically calculated average rating */}
                <Ionicons name="star" size={20} color="gold" />
                <Text className='text-lg font-bold'>{averageRating}</Text>
              </View>
            </View>
            <View className='gap-3 flex flex-row items-center justify-start pb-5 border-b border-gray-200'>
              <Feather name='map-pin' size={15} color="black" />
              <Text className={`text-xs font-normal ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? `${propertyData.homeAddress}, ${propertyData.barangay}, ${propertyData.city}, ${propertyData.region}` : ''}
              </Text>
            </View>
          </View>


          {/* Profile */}
          <View className='px-8'>
            <View className='py-4 flex flex-row items-center gap-2 border-b border-gray-200'>
              <TouchableOpacity className='flex flex-row space-x-2' 
              onPress={() => {
                if (ownerData?.id !== userData?.uid) {
                  router.push('./OwnerProfile');
                }
              }}
              disabled={ownerData?.id === userData?.uid}
              >
              <Image
                className='w-[40px] h-[40px] rounded-full'
                source={ownerData?.profilePicture || require('../../../assets/images/profile.png')}
              />
              <View className='flex flex-col flex-1'>
                <View className='flex flex-row items-center justify-between'>
                <Text className={`text-sm font-semibold ${ownerData ? '' : 'bg-gray-200 w-2/3 rounded-xl'}`} numberOfLines={1} ellipsizeMode='tail'>
                    {ownerData?.firstName} {ownerData?.middleName} {ownerData?.lastName}
                  </Text>
                  {/*<View className='flex flex-row gap-2'>
                    <TouchableOpacity onPress={() => router.push('./Message/msgDetails')}>
                      <MaterialIcons name="message" size={15} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePhoneCall}>
                      <FontAwesome6 name="phone" size={13} color="gray" />
                    </TouchableOpacity>
                  </View>*/}
                </View>
                {/* Account ID and Copy Icon */}
                <View className='flex flex-row items-center'>
                  <Text className='text-gray-500 text-xs'>{ownerData?.role}</Text>
                </View>
              </View>
              </TouchableOpacity>
            </View>
          </View>


          {/* Property Details */}
          <View className='flex flex-col py-4'>
            <View className='px-8'>
            <Text className='text-lg font-bold'>Property Details</Text>

            <View className='flex flex-row items-center gap-4 py-2'>
              <Feather name='home' size={20} color='black' />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.noOfBedrooms} ${parseInt(propertyData.noOfBedrooms) > 1 ? 'Bedrooms' : 'Bedroom'}` 
                  : ''
                }
              </Text>
            </View>

            <View className='flex flex-row items-center gap-4 py-2'>
              <Feather name='droplet' size={20} color='black' />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.noOfBathrooms} ${parseInt(propertyData.noOfBathrooms) > 1 ? 'Bathrooms' : 'Bathroom'}` 
                  : ''
                }
              </Text>
            </View>

            <View className='flex flex-row items-center gap-4 py-2'>
              <Feather name='home' size={20} color='black' />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.noOfTenants} ${parseInt(propertyData.noOfTenants) > 1 ? 'Tenants' : 'Tenant'}` 
                  : ''
                }
              </Text>
            </View>

            <View className='flex flex-row items-center gap-4 py-2'>
              <Ionicons name='bed-outline' size={20} color='black' />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.furnishing}` 
                  : ''
                }
              </Text>
            </View>

            {/* Utilities Fees */}
            {/* <View className='flex flex-col px-1 pt-2'>
              <Text className='text-lg font-bold mb-3'>Utilities Fees</Text>

              <View className='flex flex-col gap-3'>
                {!propertyData?.propertyWaterFee ? (
                  <Text className='bg-gray-200 w-2/3 rounded-xl'>

                  </Text>
                ) : (
                  <View className='flex flex-row items-center justify-between'>
                    <Text className='text-sm text-[#6B6A6A]'>
                      Water:
                    </Text>
                    <Text className='text-sm text-[#6B6A6A]'>
                      ₱{parseInt(propertyData?.propertyWaterFee).toLocaleString()}.00
                    </Text>
                  </View>
                )}
                {!propertyData?.propertyElectricFee ? (
                  <Text className='bg-gray-200 w-2/3 rounded-xl'>

                  </Text>
                ) : (
                  <View className='flex flex-row items-center justify-between'>
                    <Text className='text-sm text-[#6B6A6A]'>
                      Electricity: 
                    </Text>
                    <Text className='text-sm text-[#6B6A6A]'>
                      ₱{parseInt(propertyData?.propertyElectricFee).toLocaleString()}.00
                    </Text>
                  </View>
                  
                )}

                {!propertyData?.propertyGasFee ? (
                  <Text className='bg-gray-200 w-2/3 rounded-xl'>

                  </Text>
                ) : (
                  <View className='flex flex-row items-center justify-between'>
                    <Text className='text-sm text-[#6B6A6A]'>
                      Gas: 
                    </Text>
                    <Text className='text-sm text-[#6B6A6A]'>
                      ₱{parseInt(propertyData?.propertyGasFee).toLocaleString()}.00
                    </Text>
                  </View>
                )}

                {!propertyData?.propertyInternetFee ? (
                  <Text className='bg-gray-200 w-2/3 rounded-xl'>

                  </Text>
                ) : (
                  <View className='flex flex-row items-center justify-between'>
                    <Text className='text-sm text-[#6B6A6A]'>
                      Internet: 
                    </Text>
                    <Text className='text-sm text-[#6B6A6A]'>
                      ₱{parseInt(propertyData?.propertyInternetFee).toLocaleString()}.00
                    </Text>
                  </View>
                )}
              </View>
            </View> */}



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
                    Security Deposit Month
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
                    Security Deposit Amount
                  </Text>
                  <Text className='text-sm text-[#6B6A6A]'>      
                    ₱{parseInt(propertyData?.propertySecurityDepositAmount).toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Advance Payment Amount */}
              {!propertyData?.propertyAdvancePaymentAmount ? (
                <Text className='bg-gray-200 w-2/3 rounded-xl'></Text>
              ) : (
                <View className='flex flex-row items-center justify-between'>
                  <Text className='text-sm text-[#6B6A6A]'>
                    Advance Payment Amount
                  </Text>
                  <Text className='text-sm text-[#6B6A6A]'>      
                    ₱{parseInt(propertyData?.propertyAdvancePaymentAmount).toLocaleString()}
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
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                      <Text className='text-blue-500 text-sm'>See More</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* House Rules Modal */}
              <HouseRulesModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                petPolicy={propertyData?.propertyPetPolicy || ''}  // Fallback to an empty string
                houseRules={propertyData?.propertyHouseRules || ''}  // Fallback to an empty string
              />
            </View>

            {/* Map Location */}
            <View className='px-1 pt-5'>
              <Text className='text-lg font-bold'>Where you’ll be</Text>
              <View className='h-[200px] rounded-lg overflow-hidden mt-2'>
                {propertyData?.latitude && propertyData?.longitude ? (
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: parseFloat(propertyData.latitude),
                      longitude: parseFloat(propertyData.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(propertyData.latitude),
                        longitude: parseFloat(propertyData.longitude),
                      }}
                      title={propertyData.propertyName}
                      description={`${propertyData.homeAddress}, ${propertyData.barangay}, ${propertyData.city}, ${propertyData.region}`}
                    />
                  </MapView>
                ) : (
                  <Text className='text-center text-gray-500'>Location not available.</Text>
                )}
                <View className='flex flex-col items-center justify-center'>
                  <Text className='text-sm font-semibold'>Location</Text>
                  <Text className='text-xs text-center'>{`${propertyData?.homeAddress}, ${propertyData?.barangay}, ${propertyData?.city}, ${propertyData?.region}`}</Text>
                </View>
              </View>
            </View>
            </View>

            {/* Review & Rating */}
            <View className='pt-10'>
              {/* Display average rating */}
              <View className='flex-1 flex-col px-8 pb-5'>
                <Text className='text-lg font-bold pb-5'>Review & Rating</Text>
                {/* <AirbnbRating 
                  count={5} 
                  defaultRating={averageRating} 
                  size={20} 
                  isDisabled 
                  showRating={false}
                /> */}
              </View>

             {/* Display tenants' reviews */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='px-4 flex flex-row space-x-3'>
                {filteredTenants.map(tenant => (
                  <View 
                    key={tenant.id} 
                    className='flex flex-col p-2 items-start border rounded-lg max-w-xs space-y-2' // Added max width to the card
                  >
                    <View className='flex flex-row items-center space-x-1'>
                      <Image source={require("../../../assets/images/profile.png")} className='w-8 h-8 rounded-full' />

                      <View className='flex flex-col'>
                        <View className='flex flex-row'>
                          <Text className='text-sm font-bold'>{tenant.name}</Text>
                          <View className='flex flex-row items-center'>
                            {/* <AirbnbRating 
                              count={5} 
                              defaultRating={tenant.rating} 
                              size={15} 
                              isDisabled 
                              showRating={false} 
                            /> */}
                          </View>
                        </View>
                        <Text className='text-xs text-gray-300'>{tenant.date}</Text>

                      </View>
                    </View>
                    <View className=''>
                                  {/* Limit reviews to two lines */}
                                  <Text 
                          className='text-sm' // Ensure the text also respects width limits
                        >
                          {tenant.reviews.slice(0, showMore ? tenant.reviews.length : 1).map((reviews, index) => (
                              <Text key={index} className="text-xs">{reviews}</Text>
                            ))}
                            {!showMore && tenant.reviews.length > 2 && (
                              <TouchableOpacity onPress={() => setShowMore(true)}>
                                <Text className="text-xs text-blue-500">Show More</Text>
                              </TouchableOpacity>
                            )}
                            {showMore && (
                              <TouchableOpacity onPress={() => setShowMore(false)}>
                                <Text className="text-xs text-blue-500">Show Less</Text>
                              </TouchableOpacity>
                            )}
                        </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/*<TouchableOpacity className='py-4 flex-row item-center justify-center '
          onPress={() => router.push('../tabs/Reports/ReportProperty/reportProperty')}>
          <MaterialIcons name="report" size={20} color="#D9534F" />
            <Text className='text-center text-xs text-[#D9534F]'>Report the owner</Text>
          </TouchableOpacity>*/}

            </View>

            
          </View>
        </ScrollView>

        {/* Prices //userData?.role === 'tenant' && 
        {userData?.uid !== ownerData?.id && ( 
        <View className='flex flex-row items-center justify-between border-t border-gray-300 bottom-[-0.1px] py-1 pt-4 px-8'>
            <>
              <Text className='text-xl font-bold'>₱{propertyData ? parseInt(propertyData.price).toLocaleString(): '0'}/month</Text>
              <TouchableOpacity className='bg-[#D9534F] rounded-md py-2 px-8' onPress={handleRentNow}>
                <Text className='text-center text-sm text-white'>Rent Now</Text>
              </TouchableOpacity>
            </>
        </View>
        )}*/}

        <MoveInDateModal
          moveInDateModalVisible={moveInDateModalVisible}
          setMoveInDateModalVisible={setMoveInDateModalVisible}
          plannedMoveInDate={plannedMoveInDate}
          setPlannedMoveInDate={setPlannedMoveInDate}
          handleMoveInDateSubmit={handleMoveInDateSubmit}
        />

        <RentConfirmationModal
          rentConfirmationModalVisible={rentConfirmationModalVisible}
          setRentConfirmationModalVisible={setRentConfirmationModalVisible}
          plannedMoveInDate={plannedMoveInDate}
          handleConfirm={handleConfirm}
        />

      </View>
    </View>
  );
}
