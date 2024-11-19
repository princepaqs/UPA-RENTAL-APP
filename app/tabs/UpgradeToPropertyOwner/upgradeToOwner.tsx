import { View, Text, TouchableOpacity, Image, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getItemAsync } from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db, storage } from '../../../_dbconfig/dbconfig'; 
import { useAuth } from '@/context/authContext';
import * as SecureStore from 'expo-secure-store';

interface User {
    id: string;
    name: string;
    email: string;
}

export default function upgradeToOwner() {
    const router = useRouter();
    const { upgradeRole } = useAuth();
    const [images, setImages] = useState<{ uri: string; fileName: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          selectionLimit: 1,
          allowsMultipleSelection: true,
        });
    
        if (!result.canceled && result.assets) {
          const currentImageUris = images.map(img => img.uri);
          const newImages = result.assets
            .map(asset => ({
              uri: asset.uri,
              fileName: asset.fileName || "Unknown filename",
            }))
            .filter(asset => !currentImageUris.includes(asset.uri));
          setImages([...images, ...newImages].slice(0, 5));
        }
      };

      const handleSubmit = async () => {
        setLoading(true);
    
        if (images.length === 0) {
            // Display alert if no images are uploaded
            setTimeout(() => {
                Alert.alert('Upgrade to Owner', 'Please upload the required documents.');
                setLoading(false); // Stop loading
            }, 1000);
            return;
        }
    
        // Proceed if images are available
        setTimeout(async () => {
            try {
                const uid = await SecureStore.getItemAsync('uid');
    
                if (uid && images.length > 0) {
                    // Log and pass URIs for upgrade
                    const imageUris = images.map((image) => image.uri); // Assuming `images` is an array
                    console.log('Uploaded Image URIs:', imageUris);
    
                    await upgradeRole(uid, imageUris[0]); // Pass array of URIs
                    Alert.alert('Success', 'Your request to upgrade has been submitted.');
                    
                    // Uncomment and use this if navigating to another route
                    router.replace('./upgradeRequestSubmitted');
                } else {
                    Alert.alert('Error', 'Error uploading required documents.');
                }
            } catch (error) {
                console.error('Error in handleSubmit:', error);
                Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
                setLoading(false); // Stop loading in both success and error cases
            }
        }, 1500);
    };
    

    useEffect(() => {
        const fetchData = async () => {
            const uid = await getItemAsync('uid');
            if(uid){
                const userRef = await getDoc(doc(db, 'users', uid));
                if(userRef.exists()){
                    const data = userRef.data()
                    if(data){
                        setUserData({
                            id: uid,
                            name: `${data.firstName} ${data.middleName} ${data.lastName}`,
                            email: data.email,
                        })
                    }
                }
            }
        }

        fetchData()
    }, [])
    
    
      
    const Users = {   
        name: 'John Doe',
        email: 'johndoe@gmail.com',
    }
  return (
    <View className='bg-[#B33939]'>
        <View className='h-screen bg-white px-8 mt-20 rounded-t-2xl'>
  
            {/* Header */}
            <View className='flex flex-row items-center justify-between px-6 pt-8 pb-4'>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </TouchableOpacity>
                <View className="flex-1 items-center justify-center pr-5">
                    <Text className='text-xs font-bold text-center'>Upgrade to Property Owner Account</Text>
                </View>
            </View>

            <ScrollView
            showsVerticalScrollIndicator={false}
            >
            <View className='mt-4 w-full h-full'>
                <Text className='text-xs text-end'>
                    To upgrade to a Property Owner, fill out the form and upload a Mayor’s Permit or Barangay Permit for your property. We’ll review and notify you when approved.
                </Text>

                <View className='flex-col space-y-5 mt-8'>
                    <View className='flex-col space-y-2'>
                        <Text className='text-xs font-bold'>Full Name</Text>
                        <Text className='text-xs font-bold text-gray-500'>{userData?.name}</Text>
                    </View>
                    <View className='flex-col space-y-2'>
                        <Text className='text-xs font-bold'>Email</Text>
                        <Text className='text-xs font-bold text-gray-500'>{userData?.email}</Text>
                    </View>
                </View>

                <View className='flex-col space-y-3 my-8'>
                    <View>
                        <Text className='text-sm font-bold'>Upload Document</Text>
                    </View>
                    <View className='flex-col space-y-1'>
                        <View className='px-3'>
                            <Text className='text-xs font-bold'>Mayor’s Permit / Barangay Permit</Text>
                        </View>
                        <View className=''>
                        <TouchableOpacity
                            className='flex flex-row px-4 py-2 items-center bg-[#D9D9D9] rounded-3xl'
                            onPress={pickImage}
                        >
                            <Ionicons name="images-outline" size={20} color="gray" />
                            <Text className='pl-3 text-gray-500 text-xs font-semibold'>Upload Permit</Text>
                        </TouchableOpacity>
                        </View>

                        {/* Selected Images */}
                        <View className='items-center justify-center'>
                        <FlatList
                        data={images}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.uri}
                        renderItem={({ item }) => (
                            <View className='items-center'>
                            {/* Image Display */}
                            <Image
                                source={{ uri: item.uri }}
                                className='w-52 h-52 rounded-lg'
                            />

                            {/* X Button to Remove Image */}
                            <TouchableOpacity
                                className='absolute top-1 right-2 p-0.5 bg-black/70 rounded-full'
                                onPress={() => setImages(images.filter((img) => img.uri !== item.uri))}
                            >
                                <Entypo name="cross" size={15} color="white" />
                            </TouchableOpacity>

                            {/* File Name Display */}
                            <Text className='text-xs text-center mt-1' numberOfLines={1}>
                                {item.fileName}
                            </Text>
                            </View>
                        )}
                        />
                        </View>
                    </View>
                </View>
            </View>

            </ScrollView>
            <View className='bottom-0 px-2 mt-2 mb-16 space-y-2'>
                    <Text className='text-xs text-gray-500'>I confirm that the information provided is accurate, and I agree to the terms for listing properties.</Text>
                    <View className='flex-row w-full space-x-2'>
                        <TouchableOpacity className='w-1/2 border rounded-2xl py-2.5 items-center'
                            onPress={() => router.back()}
                            >
                            <Text className='text-xs font-bold'>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='w-1/2 bg-[#D9534F] rounded-2xl py-2.5 items-center'
                            onPress={handleSubmit}
                            disabled={loading} 
                            >
                            {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                            <Text className='text-xs text-white font-bold'>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
        </View>
    </View>
  )
}