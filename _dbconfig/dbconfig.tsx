import { initializeApp, getApps, getApp } from 'firebase/app'; // Import Firebase functions
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getStorage } from 'firebase/storage';  // Import Firebase Storage

// Firebase configuration using environment variables
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL, // Fix: should be `databaseURL` instead of `database_url`
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase app if none exists already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore instance
export const db = getFirestore(app);

// Firebase Storage instance
export const storage = getStorage(app);



// Function to store image URLs in Firestore
/*export const storeImageURL = async (url: string) => {
  try {
    const docRef = await addDoc(collection(db, 'userImages'), {
      imageUrl: url,
      uploadedAt: new Date(),
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};*/



// Firebase configuration 
// NOTE: REMOVE WHEN DEPLOYING
/*
const firebaseConfig = {
  apiKey: "AIzaSyAnfIZZW44p0CCGaFCsUAgXxoMMIxrYB70",
  authDomain: "fir-auth-tutorial-54841.firebaseapp.com",
  projectId: "fir-auth-tutorial-54841",
  storageBucket: "fir-auth-tutorial-54841.appspot.com",
  messagingSenderId: "262220114819",
  appId: "1:262220114819:web:b04e86c51d6223f9d824b6",
  measurementId: "G-H81TZN9JS3"
};

email = 20210250m.guevara.lexus@gmail.com
password = 1234567890
*/