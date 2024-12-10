import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Linking, Animated, Modal, Dimensions, Pressable, RefreshControl } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { AntDesign, Entypo, EvilIcons, Feather, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { AirbnbRating } from 'react-native-ratings';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth} from '../../context/authContext';
import HouseRulesModal from './Modals/HouseRulesModal';
import MoveInDateModal from './Modals/MoveInDateModal';
import RentConfirmationModal from './Modals/RentConfirmationModal';
import tenantsData from './Modals/tenantsReviews.json';
import ImageModal from './Modals/ImageModal'; 
const tenants = tenantsData.map(tenant => ({
  ...tenant
}));

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
  accountStatus: string;
}

interface Reviews {
  id: string;
  uid: string;
  name: string;
  profilePicture: { uri: string } | number;
  ratings: number;
  comment: string;
  createdAt: string;
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
  const [review, setReviews] = useState<Reviews[]>([]);
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
    await SecureStore.setItemAsync('moveInDate', plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    console.log(plannedMoveInDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    rentProperty();
    router.push('/tabs/Profile/TrackApplication/TrackApplication');
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

  const getRating = async (ratings: number[]) => {
    if (ratings.length === 0) return 0; // Handle the case where there are no ratings
  
    const total = ratings.reduce((sum, rating) => sum + rating, 0); // Sum all the ratings
    console.log('Total', total);
    const finalRating = total / 4; // Divide the average by 4
  
    return finalRating;
  };

  const convertStringDateTime = async (dateTime: Timestamp) => {
    // Convert Firestore Timestamp to a JavaScript Date object
    const date = new Date(dateTime.seconds * 1000 + dateTime.nanoseconds / 1000000);
  
    // Format the date into MM/DD/YYYY HH:mm
    const formattedDate = date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Use 24-hour format. Change to true for AM/PM
    });
  
    return formattedDate;
  };

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
            role: role,
            accountStatus: userData.accountStatus,
          })
        }
      }
    }
    fetchUserRole();
  }, []);

  // Calculate the average rating and fetch the property ID


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
              : require('../../assets/images/profile.png') // Fallback image
          });
        }
      }

      console.log(propertyId);
      // Fetch reviews
      const reviewQuery = query(
        collection(db, 'reviews', propertyId, 'reviewId'),
        where('feedbackType', '!=', 'UPA')
      );
      const reviewSnapshot = await getDocs(reviewQuery);

      if (!reviewSnapshot.empty) {
        const reviewDatas: Reviews[] = (
          await Promise.all(
            reviewSnapshot.docs.map(async (docu) => {
              const data = docu.data();
              const userRef = doc(db, 'users', data.uid);
              const userDoc = await getDoc(userRef);

              if (userDoc.exists()) {
                const userData = userDoc.data();
                const profilePicture = await getUserImageUrl(userDoc.id);
                const starReview = await getRating(data.ratings);
                const dateString = await convertStringDateTime(data.createdAt);

                return {
                  id: docu.id,
                  uid: data.uid,  
                  name: `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`,
                  profilePicture: profilePicture
                    ? { uri: profilePicture }
                    : require('../../assets/images/profile.png'),
                  ratings: starReview,
                  comment: data.comment || '',
                  createdAt: dateString || '',
                };
              }
              console.log('No data')
              return null; // Return null if no user data
            })
          )
        ).filter((review): review is Reviews => review !== null); // Type guard to remove null

        setReviews(reviewDatas); // Assign only valid Reviews objects
        console.log(reviewDatas);
      }else{
        console.log('Empty ratings');
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
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / Dimensions.get('window').width);

    const scrollPosition = event.nativeEvent.contentOffset.y;

    // Set condition based on scroll position
    if (scrollPosition > 100) {
      setIsScrolled(true);
    } else if (scrollPosition < 100) {
      setIsScrolled(false);
    }
  };

  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the background color when isScrolled changes
    Animated.timing(backgroundColorAnim, {
      toValue: isScrolled ? 1 : 0,
      duration: 300, // duration of the animation
      useNativeDriver: false, // set to false as we are animating background color
    }).start();
  }, [isScrolled]);

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#B33939'], // change colors as needed
  });

  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Keep track of the current image index

  const handleImageClick = (imageUri: string, index: number) => {
    setSelectedImageUri(imageUri);
    setCurrentIndex(index);
    setIsModalVisible(true);
  };
  const images = propertyData?.images || []; // Fallback to an empty array

  useEffect(() => {
    const totalRating = review.reduce((acc, tenant) => acc + tenant.ratings, 0);
    const avgRating = review.length > 0 ? totalRating / review.length : 0;
    setAverageRating(avgRating);
    getDetails(); // Fetch the property ID when component mounts
    fetchPropertyData();
  }, []);
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPropertyData(); // This will shuffle the properties again
    setRefreshing(false);
  };

  return (
    <View className='h-screen bg-gray-100'>
      <View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          

          {/* Property Image */}
          <View className='relative'>

          {/* Scrollable Image Gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {propertyData && propertyData.images && propertyData.images.length > 0 ? (
              propertyData.images.map((image: number | { uri: string }, index: number) => (
                <Pressable key={index} onPress={() => handleImageClick(typeof image === 'number' ? '' : image.uri, index)}>
                  <View style={{ width: Dimensions.get('window').width }} className=''>
                    <Image
                      className="w-full h-[300px] rounded-b-3xl"
                      source={typeof image === 'number' ? image : { uri: image.uri }}
                    />
                  </View>
                </Pressable>
              ))
            ) : (
              <View className='flex items-center justify-center w-full'>
                <Image
                  className="w-full h-[300px] rounded-b-3xl"
                  source={require('../../assets/images/property.png')}
                />
              </View>
            )}
          </ScrollView>

          {/* Fixed Image Index Counter on Top of the Image */}
          <View className="absolute bottom-3 right-8 bg-black/50 px-2.5 py-1 rounded-md">
            <Text className="text-[12px] text-white">{currentIndex + 1}/{propertyData?.images?.length ?? 0}</Text>
          </View>

          {/* Image Modal */}
          {selectedImageUri && propertyData?.images ? (
            <ImageModal
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              images={propertyData.images as (number | { uri: string })[]}
              currentIndex={currentIndex}
            />
          ) : null}
          </View>

          <View className='flex-col pb-2 px-8 my-2'>
            <View className='flex flex-row items-center justify-between pb-1'>
              <Text 
                className={`text-xl font-bold ${propertyData ? '' : 'bg-gray-200 w-2/3 rounded-xl'}`}
              >
                {propertyData ? propertyData.propertyName : ''}
              </Text>
              <View className='flex flex-row items-center space-x-1'>
                {/* Displaying dynamically calculated average rating */}
                <Ionicons name="star" size={20} color="gold" />
                <Text className='text-lg font-bold'>{averageRating}</Text>
              </View>
            </View>
            <View className='gap-3 flex flex-row items-center justify-start border-gray-200'>
              <Feather name='map-pin' size={15} color="black" />
              <Text className={`text-xs font-normal ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? `${propertyData.barangay}, ${propertyData.city}, ${propertyData.region}` : ''}
              </Text>
            </View>
          </View>

          {/* Profile */}
          {userData?.accountStatus === 'Approved' && (
  <View className='px-8'>
    <View className='py-2 flex flex-row items-center gap-2 border-y border-gray-200'>
      <TouchableOpacity
        className='flex flex-row space-x-2'
        onPress={() => router.push('./LeaseProperty/OwnerProfile')}
      >
        <Image
          className='w-[40px] h-[40px] rounded-full'
          source={ownerData?.profilePicture || require('../../assets/images/profile.png')}
        />
        <View className='flex flex-col flex-1'>
          <View className='flex flex-row items-center justify-between'>
            <Text
              className={`text-sm font-semibold ${ownerData ? '' : 'bg-gray-200 w-2/3 rounded-xl'}`}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {ownerData?.firstName} {ownerData?.middleName} {ownerData?.lastName}
            </Text>
            <View className='flex flex-row space-x-2'>
              <TouchableOpacity onPress={() => router.push('./Message/msgDetails')}>
                <AntDesign name="message1" size={18} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePhoneCall}>
                <Feather name="phone-call" size={18} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Account ID and Copy Icon */}
          <View className='flex flex-row items-center'>
            <Text className='text-gray-500 text-xs'>{ownerData?.role}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  </View>
)}


          {/* Property Details */}
          <View className='flex flex-col py-4'>
            <View className='px-8'>
            <Text className='text-lg font-bold'>Property Details</Text>

            <View className='flex flex-row items-center gap-4 py-2'>
              <MaterialIcons name="bed" size={20} color="black" />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.noOfBedrooms} ${parseInt(propertyData.noOfBedrooms) > 1 ? 'Bedrooms' : 'Bedroom'}` 
                  : ''
                }
              </Text>
            </View>

            <View className='flex flex-row items-center gap-4 py-2'>
              <MaterialCommunityIcons name="bathtub-outline" size={20} color="black" />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.noOfBedrooms} ${parseInt(propertyData.noOfBathrooms) > 1 ? 'Bathrooms' : 'Bathroom'}` 
                  : ''
                }
              </Text>
            </View>

            <View className='flex flex-row items-center gap-4 py-2'>
              <MaterialCommunityIcons name="sofa-single-outline" size={20} color="black" />
              <Text className={`text-sm text-[#6B6A6A] ${propertyData ? '' : 'bg-gray-200 w-1/2 rounded-xl'}`}>
                {propertyData ? 
                  `${propertyData.furnishing}` 
                  : ''
                }
              </Text>
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
                    <TouchableOpacity className='bg-gray-100 border border-gray-300 rounded-xl shadow-md mt-2 p-1 items-center justify-center' onPress={() => setModalVisible(true)}>
                      <Text className='text-gray-500 text-xs'>See More</Text>
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
                {propertyData?.latitude && propertyData?.longitude && userData?.accountStatus == 'Approved' ? (
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
                {userData?.accountStatus == 'Approved' && (<View className='flex flex-col items-center justify-center'>
                  <Text className='text-sm font-semibold'>Location</Text>
                  <Text className='text-xs text-center'>{`${propertyData?.homeAddress}, ${propertyData?.barangay}, ${propertyData?.city}, ${propertyData?.region}`}</Text>
                </View>)}
              </View>
            </View>
            </View>

            {/* Review & Rating */}
            <View className='py-10'>
              {/* Display average rating */}
              <View className='flex-1 flex-col px-8 pb-5'>
                <Text className='text-lg font-bold pb-5'>Review & Rating</Text>
                <AirbnbRating 
                  count={5} 
                  defaultRating={averageRating} 
                  size={20} 
                  isDisabled 
                  showRating={false}
                />
              </View>

             {/* Display tenants' reviews */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='px-4 flex flex-row space-x-3'>
                {review.map(rev => (
                  <View 
                    key={rev.id} 
                    className='flex flex-col p-2 items-start border rounded-lg max-w-xs space-y-2' // Added max width to the card
                  >
                    <View className='flex flex-row items-center space-x-1'>
                      <Image source={require("../../assets/images/profile.png")} className='w-8 h-8 rounded-full' />

                      <View className='flex flex-col'>
                        <View className='flex flex-row'>
                          <Text className='text-sm font-bold'>{rev.name}</Text>
                          <View className='flex flex-row items-center'>
                            <AirbnbRating 
                              count={5} 
                              defaultRating={rev.ratings} 
                              size={15} 
                              isDisabled 
                              showRating={false} 
                            />
                          </View>
                        </View>
                        <Text className='text-xs text-gray-300'>{rev.createdAt}</Text>

                      </View>
                    </View>
                    <View className=''>
                    {/* Limit reviews to two lines */}
                      <Text className='text-sm'>
                          {
                            rev.comment.length > 0 && (
                              <>
                                <Text className="text-xs">
                                  {rev.comment.slice(0, showMore ? rev.comment.length : 45)}
                                  {rev.comment.length > 45 && !showMore && "..."}
                                </Text>
                                {rev.comment.length > 45 && (
                                  <TouchableOpacity onPress={() => setShowMore(!showMore)}>
                                    <Text className="text-xs text-blue-500">
                                      {showMore ? "Show Less" : "Show More"}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            )
                          }
                        </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity className='py-4 flex-row item-center justify-center '
          onPress={() => router.push('../tabs/Reports/ReportProperty/reportProperty')}>
          <MaterialIcons name="report" size={20} color="#D9534F" />
            <Text className='text-center text-xs text-[#D9534F]'>Report Property</Text>
          </TouchableOpacity>

            </View>

            
          </View>
        </ScrollView>

        <Animated.View
          style={{
            backgroundColor,
          }}
          className="absolute top-0 flex-row items-center px-3 pt-10 pb-3" 
        >
          <TouchableOpacity
            className={`p-2 rounded-full ${isScrolled ? '' : 'bg-black/50'}`}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={25} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            {isScrolled && (
              <Text className="text-white text-sm font-bold">Details</Text>
            )}
          </View>

          <TouchableOpacity
            className={`p-2 rounded-full ${isScrolled ? '' : 'bg-black/50'}`}
            onPress={() => handleFavoriteToggle(ownerData?.id ?? '', propertyData?.id ?? '')}
          >
            <MaterialIcons
              name={favorites[`${ownerData?.id}_${propertyData?.id}`] ? 'favorite' : 'favorite-outline'}
              size={25}
              color={favorites[`${ownerData?.id}_${propertyData?.id}`] ? (isScrolled ? 'white' : '#D9534F') : 'white'}
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Prices //userData?.role === 'tenant' && */}
        {userData?.uid !== ownerData?.id && userData?.accountStatus == 'Approved' && ( 
        <View className='bg-[#ffffffff] flex-row items-center justify-between border-t border-gray-200 bottom-10 py-4 px-8'>
            <>
              <View className='flex-row items-center space-x-2'>
                <Text className='text-xl font-bold'>₱{propertyData ? parseInt(propertyData.price).toLocaleString(): '0'}</Text>
                <Text className='text-sm text-gray-500 font-semibold'>/mo.</Text>
              </View>
              <TouchableOpacity className='bg-[#D9534F] rounded-full py-2 px-8' onPress={handleRentNow}>
                <Text className='text-center text-sm text-white font-semibold'>Rent Now</Text>
              </TouchableOpacity>
            </>
        </View>
        )}

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
