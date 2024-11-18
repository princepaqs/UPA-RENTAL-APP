import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';  // Import Feather icon
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../../../_dbconfig/dbconfig'; // Import Firestore instance
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'; // Import Firebase storage functions
import * as SecureStore from 'expo-secure-store';

export default function DeleteAccount() {
  const router = useRouter();
  const { removeUser } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  // Dummy correct password for validation
  //const correctPassword = 'Test123';

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleDelete = async () => {
    try{
      const auth = getAuth();
      const tenantId = await SecureStore.getItemAsync('uid');
    // Retrieve user's email from Firebase or SecureStore
    const user = auth.currentUser;
    const email = user ? user.email : null;

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (email && password && user && tenantId) {
      // Create credential with email and password
      const credential = EmailAuthProvider.credential(email, password);

      try {
        // Define the reference to the `propertyTransactions` collection
        const propertyTransactionsRef = collection(db, 'propertyTransactions');
    
        // Create a query to check if any documents have the specified tenantId
        const transactionsQuery = query(propertyTransactionsRef, where('tenantId', '==', tenantId));
        const querySnapshot = await getDocs(transactionsQuery);
    
        if (!querySnapshot.empty) {
            // If there are existing transactions, alert and return
            Alert.alert('Notice', 'You have active transactions and cannot delete the account.');
            return;
        }
    
        // Continue to delete the user if no transactions are found
        Alert.alert('Success', 'Account deleted successfully');
        await removeUser(email, password, tenantId);  // Call your function to delete the user
        router.replace('../../signIn')
    } catch (error) {
        // If re-authentication fails, show an error alert
        Alert.alert('Error', 'Wrong password. Please try again.');
    }
    
    } else {
      Alert.alert('Error', 'Error. Please try again');
    }
    }catch(error){
      console.log(error);
    }
  };

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>

        <View className='flex flex-row items-center justify-between px-6 pt-12 mb-10'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Delete Account</Text>
          </View>
        </View>

        <View className='flex items-center justify-center gap-5 px-6'>
          <Image
          className='w-[150px] h-[150px]'
            source={require('../../../assets/images/deleteimage.png')}  
          />
          <View>
            <Text className='text-sm font-bold text-center'>Are you sure you want to delete your account?</Text>
          </View>
          <View>
            <Text className='text-xs text-red-500 text-center'>This action cannot be undone, and all your data will be permanently removed.</Text>
          </View>
        </View>

        <View className='flex my-10 px-6'>
          <Text className='text-start text-xs font-semibold'>Enter password to continue</Text>
          <View className='flex flex-row items-center bg-white rounded-xl mt-2 py-1.5 pl-6 pr-4'>
            <TextInput
              className='flex-1 text-xs'
              placeholder='Password'
              secureTextEntry={!passwordVisible}  // Toggle password visibility
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity className='pl-2' onPress={togglePasswordVisibility}>
              <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={15} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View className='px-6 mt-20'>
          <TouchableOpacity className='py-2.5 bg-[#D9534F] rounded-xl' onPress={handleDelete}>
            <Text className='text-white text-center font-bold'>Delete Permanently</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
