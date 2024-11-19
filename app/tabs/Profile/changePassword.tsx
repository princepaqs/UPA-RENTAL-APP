import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../../context/authContext';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../../../_dbconfig/dbconfig'; // Import Firestore instance

export default function changePassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { resetPassword } = useAuth();

  // Function to validate email format
  const validateEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to handle the button press
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    else {
      const tenantId = await SecureStore.getItemAsync('uid');

      if(tenantId && email){
        const userDocRef = doc(db, 'users', tenantId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          const userEmail = userData.email;
          if(userEmail === email){
            resetPassword(email);
            //Alert.alert('Success', 'The reset password has been sent to your email.');
            router.push('/ForgetPasswordVerify');
          }
          else{
            Alert.alert('Error', 'Please enter your email address.');
          }
        }
      }
    }
  };

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-white px-6 mt-28 rounded-t-2xl'>

        <TouchableOpacity className='px-4 pt-10' onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={24} color="black" />
        </TouchableOpacity>
        <View className='flex flex-col items-center'>
          <View className='pt-10 pb-5'>
            <Image
              className='w-24 h-24'
              source={require('../../../assets/images/forgeticon.png')}
            />
          </View>
          <View className="">
            <Text className='text-xl font-bold text-center'>Change Password</Text>
            <Text className='text-xs text-[#B5B5B5] '>Enter the email address you used to register with. </Text>
          </View>
        </View>

        <View className='flex flex-col p-5 mt-10'>
          <Text>Email Address</Text>
          <View className='bg-gray-100 flex-row items-center p-2 rounded-xl mt-2 mb-20'>
          <Feather name='mail' size={18} color="gray" />
            <TextInput
              className='pr-4 pl-2'
              placeholder='Enter your email'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
            />  
          </View>

            <View className='flex flex-col items-center justify-center mt-20'>
                <TouchableOpacity className='w-full py-3.5 flex items-center bg-[#D9534F] rounded-xl' onPress={handleResetPassword}>
                    <Text className='text-xs text-white font-bold'>Reset Password</Text>
                </TouchableOpacity>
            </View>
        </View>

        

      </View>
    </View>
  );
}
