import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Button } from 'react-native';
// import * as SecureStore from 'expo-secure-store';
// import { getDownloadURL, ref } from 'firebase/storage'; 
// import { db, storage } from '../_dbconfig/dbconfig'; 
// import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
// import { useAuth } from '@/context/authContext';

export default function SignIn() {
  const bgOpacity = useRef(new Animated.Value(0)).current;  // Animation for background opacity
  const logoOpacity = useRef(new Animated.Value(0)).current; // Animation for logo opacity
  const textOpacity = useRef(new Animated.Value(0)).current; // Animation for text opacity
  const [isVisible, setIsVisible] = useState(true);  // State to track visibility
  // const { login } = useAuth();
  useEffect(() => {
    fadeIn();
      setTimeout(() => {
        fadeOut();
        router.replace('./signIn')
      }, 1500);
  }, [])

  // useEffect(() => {
  //   fadeIn();
  //   const getData = async () => {
  //     try {
  //       const email = await SecureStore.getItemAsync('email');
  //       const password = await SecureStore.getItemAsync('password') || '';
  //       const token = await SecureStore.getItemAsync('token');
  //       const tenantId = await SecureStore.getItemAsync('uid');
  //       const usePassword = await SecureStore.getItemAsync('usePassword');
  //       console.log(tenantId);

  //       if(!password){
  //         router.replace('./signIn');
  //       } else if (email && password && token && tenantId) {
  //         const userRef = doc(db, 'users', tenantId);
  //         const userSnap = await getDoc(userRef);
          
  //         if (userSnap.exists()) {
  //           const userData = userSnap.data();
  //           const uLog = userData.userLoginTime; 
  

  //           if (uLog) {
  //             let lastLoginTime;

  //             if (uLog.toMillis) {
 
  //               lastLoginTime = uLog.toMillis();
  //             } else if (typeof uLog === 'number') {
  
  //               lastLoginTime = uLog;
  //             } else if (typeof uLog === 'string') {

  //               lastLoginTime = new Date(uLog).getTime();
  //             }


  //             const oneHourInMs = 3600000;
  //             if (Date.now() - lastLoginTime < oneHourInMs && email && password) {
  //               login(email, password);
  //             } else {
  //               router.replace('/signIn');
  //             }
  //           } else {
 
  //             return;
  //           }
  //         }
          
  //       }
  //       else {
  //         setTimeout(() => {
  //           router.replace('/signIn');
  //         }, 1500);
  //       }

  //     } catch (e) {
  //       console.error("Error retrieving user data: ", e);

  //     }
  //   };
  
  //   getData();
  // }, []); 

  // Function to trigger fade-in
  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 1000, 
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const fadeOut = () => {

    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 2000, // 1 second fade-out
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      
    ]).start(() => setIsVisible(false));  // After fading out, hide the component
  };

  const router = useRouter();
  return (
    isVisible && (
      <View className=" bg-white h-screen w-full items-start justify-center">
        {/* Animated Background Image */}
        <Animated.Image
          className="w-full h-full absolute"
          source={require('../assets/images/bg.png')}
          style={{ opacity: bgOpacity }} // Apply opacity animation
          resizeMode='cover'
        />

        {/* Animated Logo */}
        <Animated.Image
          className="w-16 h-16 absolute top-14 left-8"
          source={require('../assets/images/logo1.png')}
          style={{ opacity: logoOpacity }} // Apply opacity animation
        />

        {/* Animated Text */}
        <Animated.Text
          className="absolute mt-10 top-14 p-10 text-[#973030] text-4xl font-bold"
          style={{ opacity: textOpacity }} // Apply opacity animation
        >
          The Heartbeat of
        </Animated.Text>

        <Animated.Text
          className="absolute mt-20 top-16 px-10 py-10 text-[#973030] text-4xl font-bold"
          style={{ opacity: textOpacity }} // Apply opacity animation
        >
          Urban Rentals
        </Animated.Text>

      </View>
    )
  );
}