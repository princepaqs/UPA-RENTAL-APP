import { View, Text, TouchableOpacity, Pressable, TextInput, Alert } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import WrongPinModal from '../../../tabs/Modals/ChangePinModal';
import * as SecureStore from 'expo-secure-store';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../../_dbconfig/dbconfig';
import LoadingModal from '@/components/LoadingModal';
import { useAuth } from '@/context/authContext';

// Define the keys for the number pad
const numberPadKeys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '⌫', '0', 'C', // Added "Clear" button
];

const MAX_ATTEMPTS = 3; // Max failed attempts allowed
const TIMEOUT_DURATION = 10 * 1000; // Timeout in milliseconds (10 seconds)
const IDLE_DURATION = 60 * 1000;

export default function LoginPin() {
  const router = useRouter();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<TextInput | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [timeoutEnd, setTimeoutEnd] = useState<number | null>(null);
  const { topUpWallet, payRent, addWalletTransaction } = useAuth();

  const userPin = async (pin: string) => {
    setLoading(true);
    try {
      const tenantId = await SecureStore.getItemAsync('uid');
      console.log('Tenant ID:', tenantId);
  
      if (pin && tenantId && pin.length === 6) {
        const userRef = doc(db, 'users', tenantId);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists() && userSnap.data().userPin === pin) {
          setFailedAttempts(0);
          setError('');
          console.log('Test Login Pin');
  
          const routes = await SecureStore.getItemAsync('routes') || '';
          const route = await checkRoute(tenantId, routes);
          console.log(route);
          if (route) {
            router.replace(`./${route}`); // Replace only if route is valid
          } else {
            console.error('Invalid route returned from checkRoute');
          }
        } else {
          handleFailedAttempt();
        }
      }
    } catch (error) {
      console.error('Error during PIN verification:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const checkRoute = async (uid: string, routes: string) => {
    const transactionType = await SecureStore.getItemAsync('transactionType') || 'no value';
    const transactionPaymentId = await SecureStore.getItemAsync('transactionPaymentId') || 'no value';
    const transactionOwnerId = await SecureStore.getItemAsync('transactionOwnerId') || 'no value';
    const transactionDate = await SecureStore.getItemAsync('transactionDate') || 'no value';
    const transactionLeaseStart = await SecureStore.getItemAsync('transactionLeaseStart') || 'no value';
    const transactionLeaseEnd = await SecureStore.getItemAsync('transactionLeaseEnd') || 'no value';
    const transactionAmount = await SecureStore.getItemAsync('transactionAmount') || 'no value';
    const transactionStatus = await SecureStore.getItemAsync('transactionStatus') || 'no value';
    if(!transactionType || !transactionPaymentId || !transactionOwnerId || !transactionDate || !transactionLeaseStart || !transactionLeaseEnd || !transactionAmount || !transactionStatus){
      Alert.alert('Error', 'Missing fields')
      return routes = '';
    }
    switch(routes){
      case '/TopUp/receiptTransaction': 
        topUpWallet(uid, transactionAmount);
        addWalletTransaction(uid, transactionType, '', transactionDate, transactionAmount, '');
        return '/TopUp/receiptTransaction';
      case '/Payment/paymentReceipt': 
        payRent(transactionPaymentId, transactionOwnerId, uid, transactionAmount, transactionLeaseStart, transactionLeaseEnd);
        addWalletTransaction(uid, transactionType, transactionPaymentId, transactionDate, transactionAmount, transactionStatus);
        return '/Payment/paymentReceipt';
      default: return 'defaultFallbackRoute';
    }
  }  

  const handleFailedAttempt = () => {
    setFailedAttempts((prev) => prev + 1);
    if (failedAttempts + 1 >= MAX_ATTEMPTS) {
      setIsTimeout(true);
      setTimeoutEnd(Date.now() + TIMEOUT_DURATION); // Set when the timeout ends
      setPin(''); // Clear PIN input
    } else {
      setModalVisible(true); // Show error modal on incorrect PIN
      setError('Incorrect PIN. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimeout && timeoutEnd) {
      timer = setInterval(() => {
        if (Date.now() >= timeoutEnd) {
          setIsTimeout(false); // End timeout after duration
          setFailedAttempts(0); // Reset failed attempts
        }
      }, 1000);
    }

    // Check if the user hasn't entered a PIN and redirect to sign in
    const redirectIfNoPin = async () => {
      if (!pin) {
        router.replace('/signIn');
        await SecureStore.deleteItemAsync('password');
      }
    };

    const idleTimer = setTimeout(redirectIfNoPin, IDLE_DURATION);

    return () => {
      clearInterval(timer);
      clearTimeout(idleTimer); // Clear the idle timer on component unmount
    };
  }, [isTimeout, timeoutEnd, pin]);

  const handleChange = (key: string) => {
    if (isTimeout) return; // Disable keypad input during timeout
    if (key === 'C') {
      setPin('');
    } else if (key === '⌫') {
      setPin(prevPin => prevPin.slice(0, -1));
    } else if (/^\d$/.test(key)) {
      setPin(prevPin => {
        const newPin = prevPin.length < 6 ? prevPin + key : prevPin;
        if (newPin.length === 6) {
          console.log('Attempting to login with PIN:', newPin);
          userPin(newPin);
        }
        return newPin;
      });
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setPin('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <View className='bg-[#B33939]'>
      <LoadingModal visible={loading} />
      <View className='h-screen items-center justify-center bg-white px-6 mt-20 rounded-t-2xl'>
        <View className='flex flex-col items-center px-6'>
          <Text className='text-2xl mb-2 font-bold text-center'>Enter your PIN</Text>
          <Text className='text-xs text-gray-500'>Make sure you enter the correct PIN</Text>
        </View>

        {/* Circle PIN Input Section */}
        <View className='flex flex-row justify-center space-x-5 mt-6 mb-8'>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index}>
              <View
                className={`w-6 h-6 border rounded-full justify-center items-center ${
                  index < pin.length ? 'bg-[#333333]' : 'border-gray-400'
                }`}
              />
            </View>
          ))}
        </View>

        {/* Numeric Keypad */}
        <View className='flex flex-col items-center'>
          {numberPadKeys.reduce<string[][]>((rows, key, index) => {
            if (index % 3 === 0) {
              rows.push([]);
            }
            rows[rows.length - 1].push(key);
            return rows;
          }, []).map((row, rowIndex) => (
            <View key={rowIndex} className='flex flex-row justify-center'>
              {row.map((key, index) => (
                <Pressable
                  key={index}
                  className='w-16 h-16 bg-[#D9534F] rounded-full flex justify-center items-center m-2.5'
                  onPress={() => handleChange(key)}
                >
                  <Text className='text-2xl text-white font-normal'>{key}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Timeout Message */}
        {isTimeout && (
          <Text className='text-center text-red-500 mt-4'>
            Too many attempts. Try again in {Math.ceil((timeoutEnd! - Date.now()) / 1000)} seconds.
          </Text>
        )}

        {/* "Forgot PIN?" text */}
        {/* <TouchableOpacity
          className='mt-4'
          onPress={async () => {
            router.replace('/signIn');
            await SecureStore.deleteItemAsync('password');
            await SecureStore.deleteItemAsync('token');
            const usePassword = 'true';
            if (usePassword) {
              await SecureStore.setItemAsync('usePassword', usePassword);
            }
          }}
        >
          <Text className='text-xs text-center'>
            Forgot your PIN? <Text className='text-red-500 underline'>Login with password</Text>
          </Text> 
        </TouchableOpacity>*/}

        {/* Modal for incorrect PIN */}
        <WrongPinModal
          visible={modalVisible}
          message="Incorrect PIN. Please try again."
          onClose={handleModalClose}
        />
      </View>
    </View>
  );
}
