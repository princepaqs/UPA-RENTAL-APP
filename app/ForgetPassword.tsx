import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../_dbconfig/dbconfig'; // Import Firestore instance

export default function ForgetPassword() {
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
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, where('email', '==', email));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocSnap = querySnapshot.docs[0]; // Assume the email is unique and take the first match
        const userData = userDocSnap.data();

        const userEmail = userData.email;
        if (userEmail === email) {
          resetPassword(email);
          Alert.alert('Success', 'The reset password has been sent to your email.');
          router.replace('/ForgetPasswordVerify');
        } else {
          Alert.alert('Error', 'Please enter your email address.');
        }
      } else {
        Alert.alert('Error', 'No user found with this email address.');
      }
    }
  };

  return (
    <View className='bg-[#B33939]'>

      <View className='h-screen bg-white px-6 mt-28 rounded-t-2xl'>
        <View className='flex flex-col items-center'>
          <View className='pt-10 pb-5'>
            <Image
              className='w-12 h-12'
              source={require('../assets/images/forgeticon.png')}
            />
          </View>
          <View className="">
            <Text className='text-xl font-bold text-center'>Forget Password</Text>
            <Text className='text-xs text-[#B5B5B5] '>Enter the email address you used to register with. </Text>
          </View>
        </View>

        <View className='flex flex-col p-5 mt-10'>
          <Text>Email Address</Text>
          <View className='bg-gray-100 flex-row items-center p-2 rounded-xl mt-2'>
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
        </View>

        <View className='h-full flex flex-col items-center justify-center mx-5 bottom-28'>
          <TouchableOpacity className='w-full py-3.5 flex items-center bg-[#D9534F] rounded-xl' onPress={handleResetPassword}>
            <Text className='text-xs text-white font-bold'>Reset Password</Text>
          </TouchableOpacity>
          <TouchableOpacity className='p-2 mt-2 flex items-center' onPress={() => router.back()}>
            <Text className='text-xs'>Back to log in</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
