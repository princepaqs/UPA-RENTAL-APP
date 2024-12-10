import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Loading from '@/components/Loading';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import * as SecureStore from 'expo-secure-store';
import { getDoc, doc } from 'firebase/firestore'; 
import { db } from '../_dbconfig/dbconfig';
import ErrorModal from '@/components/ErrorModal'; // Import the ErrorModal

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [modalMessage, setModalMessage] = useState(''); // Modal message

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const getData = async () => {
      try {
        const email = await SecureStore.getItemAsync('email');
        if(email){
          setEmail(email);
        }
      } catch (error) {
        
      }
    }

    getData();
  }, [])

  useEffect(() => {
    const getData = async () => {
      try {
        const email = await SecureStore.getItemAsync('email');
        const password = await SecureStore.getItemAsync('password');
        const token = await SecureStore.getItemAsync('token');
        const tenantId = await SecureStore.getItemAsync('uid');
        const usePassword = await SecureStore.getItemAsync('usePassword');
        console.log(tenantId);

        
        if(usePassword === 'true' && email && password){
          login(email, password);
        }

        if(email){
          setEmail(email);
        }
        
        if (tenantId) {
          const userRef = doc(db, 'users', tenantId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const uLog = userData.userLoginTime; // Assuming this is stored as a timestamp in Firestore
  
            // Check if uLog exists and handle different possible types
            if (uLog) {
              let lastLoginTime;

              if (uLog.toMillis) {
                // If uLog is a Firestore Timestamp object
                lastLoginTime = uLog.toMillis();
              } else if (typeof uLog === 'number') {
                // If uLog is a Unix timestamp (in milliseconds)
                lastLoginTime = uLog;
              } else if (typeof uLog === 'string') {
                // If uLog is stored as a string (e.g., ISO 8601 date)
                lastLoginTime = new Date(uLog).getTime();
              }

              //console.log(lastLoginTime, token, email, password);

              const oneHourInMs = 3600000;
              if (Date.now() - lastLoginTime < oneHourInMs && email && password) {
                setLoading(false); // Hide loading indicator
                login(email, password); // Ensure email and password are strings
              } else {
                return; // Token expired or login time exceeded
              }
            } else {
              //console.error("userLoginTime is undefined");
              return;
            }
          }
        }
      } catch (e) {
        console.error("Error retrieving user data: ", e);
        // Handle error
      }
    };
  
    getData();
  }, []); // Empty dependency array to run once on mount
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setModalMessage('Please enter all fields');
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      //router.replace('./tabs/Dashboard')
    } catch (error: any) {
      // Check for specific Firebase error codes
      if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
        setModalMessage('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setModalMessage('User not found. Please try again.');
      } else {
        setModalMessage(error.message || 'Login failed. Please try again.');
      }
      setModalVisible(true); // Show modal with error message
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View>
      <View className="flex items-start px-12 pb-10 justify-center rounded-b-3xl bg-[#B33939]">
        <View className='py-14'>
          <Image
            className='w-12 h-12'
            source={require('../assets/images/logo.png')}
          />
        </View>
        <Text className='text-white text-3xl font-bold'>Welcome Back!</Text>
        <Text className='text-gray-100 text-xs'>Enter your credentials to continue</Text>
      </View>

      <View className='px-8 pt-10'>
        <Text className='px-2 pb-1 text-sm font-semibold'>Email</Text>
        <View className='flex flex-row px-4 py-2 items-center bg-gray-100 rounded-xl'>
          <Feather name='mail' size={15} color="gray" />
          <TextInput
            style={{ flex: 1, paddingLeft: 8, fontSize: 12, color: 'black' }}
            placeholder='Email Address'
            value={email}
            keyboardType='email-address'
            onChangeText={setEmail}
          />
        </View>
      </View>

      <View className='px-8 pt-5'>
        <Text className='px-2 pb-1 text-sm font-semibold'>Password</Text>
        <View className='flex flex-row px-4 py-2 items-center bg-gray-100 rounded-xl'>
          <Feather name='lock' size={15} color="gray" />
          <TextInput
            style={{ flex: 1, paddingLeft: 8, fontSize: 12, color: 'black' }}
            placeholder='Password'
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={15} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <View className='flex items-end justify-center pr-8 py-4'>
        <TouchableOpacity onPress={() => router.push('./ForgetPassword')}>
          <Text className='text-red-500 text-xs'>Forget Password?</Text>
        </TouchableOpacity>
      </View>

      <View>
        {
          loading ? (
            <View className='px-8 pt-4'>
              <View className=' items-center rounded-xl'>
                <Loading />
              </View>
            </View>
          ) : (
            <View className='px-8 pt-4'>
              <TouchableOpacity onPress={handleLogin} className='bg-[#D9534F] py-3.5 rounded-xl'>
                <Text className='text-white font-bold text-xs text-center tracking-wider'>Login</Text>
              </TouchableOpacity>
            </View>
          )
        }
      </View>

      <View className='flex items-center justify-center pt-20 pb-2'>
        <Text className='text-gray-400 text-xs font-semibold'>Ready to find your dream home? Create an account now!</Text>
      </View>

      <View className='px-8'>
        <TouchableOpacity className='bg-[#D9534F] py-3 rounded-xl' onPress={() => router.push('/signUpData')}>
          <Text className='text-white font-bold text-xs text-center tracking-wider'>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View className='items-center py-5'>
        <Text className='text-xs text-gray-300 font-bold'>v2.0.2</Text>
      </View>

      {/* Error Modal */}
      <ErrorModal 
        visible={modalVisible} 
        message={modalMessage} 
        onClose={closeModal} 
      />
    </View>
  );
}
