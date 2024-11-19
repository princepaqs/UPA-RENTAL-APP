import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Clipboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage'; // Firebase Storage import
import { db, storage } from '../../../_dbconfig/dbconfig'; // Import your Firebase config

export default function Profile() {
  const router = useRouter();
  const [fullName, setFullName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [accountId, setAccountID] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const formatDate = (timestamp: Timestamp): string => {
    const { seconds, nanoseconds } = timestamp;
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        //day: 'numeric',
    })
};

// Fetch full name from SecureStore
useEffect(() => {
    const fetchUserData = async () => {
        const ownerId = await SecureStore.getItemAsync('userId');
        setAccountID(ownerId);

        if (ownerId) {
            const userRef = await getDoc(doc(db, 'users', ownerId?.toString()));
            if (userRef.exists()) {
                const userData = userRef.data();

                setFullName(`${userData.firstName} ${userData.middleName} ${userData.lastName}`);
                setEmail(`${userData.email}`);
                setAccountID(userData.accountId);

                // Check if createdAt is a Timestamp
                if (userData.createdAt instanceof Timestamp) {
                    setCreatedAt(formatDate(userData.createdAt)); // Format and set createdAt
                } else {
                    console.error('createdAt is not a valid Firestore Timestamp');
                }

                if (ownerId) {
                    try {
                        // Create profile picture file name using the email
                        const profilePictureFileName = `${ownerId}-profilepictures`;

                        // Get the profile picture URL from Firebase Storage
                        const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
                        const downloadURL = await getDownloadURL(profilePictureRef);

                        // Set the profile picture URL
                        setProfilePicUrl(downloadURL);
                    } catch (error) {
                        console.error('Error fetching profile picture:', error);
                    }
                }
            }
        }
    };

    fetchUserData();
}, []);
  
  // Dummy reviews data
  const reviews = [
    {
      id: 1,
      name: 'Marites Dela Cruz',
      date: 'January 01, 2024',
      rating: 5,
      reviewText: 'Mabait siya as a tenant. Laging nagbabayad on time ng rent.',
      profileImage: require('../../../assets/images/profile.png'),
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      date: 'February 14, 2024',
      rating: 4,
      reviewText: 'Magaling makisama at napapanatili ang kalinisan ng bahay.',
      profileImage: require('../../../assets/images/profile.png'),
    },
    {
      id: 3,
      name: 'Ana Santos',
      date: 'March 22, 2024',
      rating: 5,
      reviewText: 'Very respectful and always pays on time.',
      profileImage: require('../../../assets/images/profile.png'),
    },

  ];

  // Function to calculate the average rating
  const calculateAverageRating = () => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0); // Sum of all ratings
    return (totalRating / reviews.length).toFixed(1); // Calculate average and round to 1 decimal place
  };

  const handleCopyAccountId = (accountId: string | null) => {
    if (accountId) {
      Clipboard.setString(accountId); // Copy the Account ID to clipboard
      Alert.alert('Copied Successfully', 'Account ID has been copied!'); // Show an alert
    } else {
      Alert.alert('Error', 'No Account ID to copy.'); // Handle case where accountId is not available
    }
  };

  const averageRating = calculateAverageRating();

  return (
    <View className='bg-[#B33939] flex-1'>
      
      {/* Top Profile Section */}
      <View className='flex-1 bg-white px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>

          {/* Profile Title */}
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-lg font-semibold text-center'>Owner Profile</Text>
          </View>
        </View>
        
        {/* Profile Information */}
        <View className='items-center mt-4 pb-5 border-b border-gray-300'>
          {/* Red Background */}
          <View className='w-full h-[100px] bg-[#FF6B6B] rounded-2xl justify-center items-center'>
          </View>
          
          {/* Profile Image */}
          <View className='-mt-[50px]'>
            <View className='border rounded-full'>
              {profilePicUrl ? (
            <Image
              className='w-[80px] h-[80px] rounded-full'
              source={{ uri: profilePicUrl }} // Use the fetched URL from Firebase Storage
            />
          ) : (
            <Image
              className='w-[80px] h-[80px] rounded-full'
              source={require('../../../assets/images/profile.png')} // Fallback image if no profile picture found
            />
          )}
            </View>
          </View>

          {/* Name and Account Details */}
          <Text className='text-xl font-semibold mt-4'>{fullName || ''}</Text>
          <View className="flex-row items-center">
            <Text className='text-sm' numberOfLines={1} ellipsizeMode='tail'>
              Account ID : {accountId || ''}
            </Text>
            <TouchableOpacity
              className='text-sm font-normal ml-3'
              onPress={() => handleCopyAccountId(accountId)} // Call the copy function
            >
              <Feather color={'gray'} name="copy" size={15} />
            </TouchableOpacity>
          </View>
          <Text className='text-xs text-gray-500'>Joined {createdAt || ''}</Text>
        </View>

        {/* Reviews Section */}
        <View className='mt-6 flex-1'>
          <View className='flex flex-row justify-between items-center px-4'>
            <Text className='text-lg font-semibold'>Reviews</Text>
            <View className='flex flex-row items-center'>
              {/* Displaying dynamically calculated average rating */}
              <Text className='text-lg font-bold mr-2'>{averageRating}</Text>
              <Ionicons name="star" size={20} color="gold" />
            </View>
          </View>
          
          {/* Review Cards - Mapping over dummy reviews */}
          <ScrollView className='px-4 mt-4' contentContainerStyle={{ flexGrow: 1, paddingBottom: 10, paddingTop: 6 }} showsVerticalScrollIndicator={false}>
            {reviews.length === 0 ? (
              <Text className='text-center text-sm text-gray-500 mt-4'>No reviews yet. Be the first to leave a review!</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} className='py-4'>
                  <View className='bg-gray-100 p-4 rounded-lg flex flex-row items-start'>
                    {/* Reviewer Image */}
                    <Image
                      className='w-[30px] h-[30px] mr-4 rounded-full'
                      source={review.profileImage}
                    />
                    
                    {/* Review Text */}
                    <View className='flex-1'>
                      <View className='flex flex-row justify-between items-center'>
                        <Text className='font-bold'>{review.name}</Text>
                        <View className='flex flex-row items-center'>
                          {/* Display star ratings based on the review rating */}
                          {Array.from({ length: review.rating }, (_, index) => (
                            <Ionicons key={index} name="star" size={15} color="gold" />
                          ))}
                        </View>
                      </View>
                      <Text className='text-xs text-gray-500 py-1'>{review.date}</Text>
                      <Text className='text-sm text-gray-700'>{review.reviewText}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

        </View>
      </View>
    </View>
  );
}
