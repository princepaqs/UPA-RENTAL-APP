import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Clipboard, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/authContext';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db, storage } from '../../../_dbconfig/dbconfig'; 

const dummyData = {
  user: {
    name: 'Prince Louie Paquiado',
    role: 'Landlord',
    profilePicture: require('../../../assets/images/profile.png'),
    status: "Tenant",
  }
}

export default function Profile() {
  const router = useRouter();
  const { logout, listenForLogout } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState('');
  const [roleStatus, setRoleStatus] = useState('');

  const confirmLogout = () => {
    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      setModalVisible(false);
      await SecureStore.deleteItemAsync('isNotificationSent');
      logout(); // Replace this with your actual logout function
    }, 2000); // Simulate a delay; replace with actual logout process
  };

  const fetchUserData = async () => {
    setRefreshing(true); // Set refreshing to true when starting to fetch
    const accStat = await SecureStore.getItemAsync('accountStatus');
    console.log(accStat);
    if(accStat){
      setAccountStatus(accStat);
    }

    const storedFullName = await SecureStore.getItemAsync('fullName');
    setFullName(storedFullName);

    const accountId = await SecureStore.getItemAsync('accountId');
    setAccountId(accountId);

    const uid = await SecureStore.getItemAsync('uid');

    if (uid) {
      try {
        const userRef = await getDoc(doc(db, 'users', uid))
        if(userRef.exists()){
          const data = userRef.data();
          if(data){
            setRole(data.role);
            setRoleStatus(data.roleStatus)
          }
        }
        const profilePictureFileName = `${uid}-profilepictures`;
        const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
        const downloadURL = await getDownloadURL(profilePictureRef);
        setProfilePicUrl(downloadURL);
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    }

    
    setRefreshing(false); // Reset refreshing state after fetching
  };

  useEffect(() => {
    fetchUserData();
    listenForLogout();
  }, []);

  const handleCopyAccountId = (accountId: string | null) => {
    if (accountId) {
      Clipboard.setString(accountId); // Copy the Account ID to clipboard
      Alert.alert('Copied Successfully', 'Account ID has been copied!'); // Show an alert
    } else {
      Alert.alert('Error', 'No Account ID to copy.'); // Handle case where accountId is not available
    }
  };

  const [isNavigating, setIsNavigating] = useState(false);
  const handleNavigate = (route: Parameters<typeof router.push>[0]) => {
    if (!isNavigating) {
      setIsNavigating(true);
      router.push(route);
      setTimeout(() => {
        setIsNavigating(false);
      }, 2000); // Adjust the delay as needed
    }
  };

  return (
    <View className='bg-[#F6F6F6]'>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchUserData} />
        }
      >
      <View className='px-8'>
        <Text className='text-2xl px-2 font-bold mt-5 mb-2'>Profile</Text>
      </View>

      
        <View className='mb-10'>
          {/* Profile Section */}
          <TouchableOpacity 
            className='mt-2 px-8'
            onPress={() => handleNavigate('../tabs/Profile/profile')}
            disabled={accountStatus === 'Under-review'}
          >
            <View className='flex flex-row items-center py-3 px-5 bg-white rounded-xl shadow-md'>
              {profilePicUrl ? (
                <Image className='w-[50px] h-[50px] rounded-full' source={{ uri: profilePicUrl }} />
              ) : (
                <Image className='w-[50px] h-[50px] rounded-full' source={require('../../../assets/images/profile.png')} />
              )}
              <View className='flex flex-col flex-1 px-2'>
                <Text className='text-lg font-bold' numberOfLines={1} ellipsizeMode='tail'>
                  {fullName || 'Loading...'}
                </Text>
                <View className='flex flex-row items-center'>
                  <Text className='text-gray-500 text-xs' numberOfLines={1} ellipsizeMode='tail'>
                    Account ID: {accountId || 'Loading'}
                  </Text>
                  <TouchableOpacity
                    className='text-sm font-normal ml-3'
                    onPress={() => handleCopyAccountId(accountId)} // Call the copy function
                  >
                    <Feather color={'gray'} name="copy" size={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* My Lease Section */}
          {(role === 'Owner' && accountStatus === 'Approved') ? (
            <TouchableOpacity
            className='px-8' 
            onPress={async () => {
              handleNavigate('../tabs/LeaseProperty/PropertyDashboard')
              await SecureStore.setItemAsync('isPropertyOwner', 'true');
            }}
          >
            <View className='py-4'>
              <View className='p-3 flex flex-row items-center rounded-2xl bg-[#EF5A6F] shadow-md'>
                <Image className='w-[50px] h-[50px]' source={require('../../../assets/images/lease.png')} />
                <View className='flex flex-col flex-1 ml-4'>
                  <Text className='text-sm font-bold text-white'>My Property Dashboard</Text>
                  <Text className='text-[10px] text-gray-200'>
                    View and manage your property details, leases, payments, and maintenance requests in one place.
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          ) : (role === 'Tenant' && roleStatus === 'Under-review') ? (
            <TouchableOpacity
            className='px-8' 
            onPress={() => handleNavigate('../tabs/LeaseProperty/PropertyDashboard')}
            disabled={roleStatus === 'Under-review'}
          >
            <View className='py-4'>
              <View className='p-3 flex flex-row items-center rounded-2xl bg-[#133E87] shadow-md'>
                <Image className='w-[50px] h-[50px]' source={require('../../../assets/images/leasePending.png')} />
                <View className='flex flex-col flex-1 ml-4'>
                  <Text className='text-sm font-bold text-white'>Application Submitted</Text>
                  <Text className='text-[10px] text-gray-200'>
                    Your request to upgrade to property owner status is in progress. We will notify you once it has been reviewed.
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          ) : (
            <TouchableOpacity
            className='px-8' 
            onPress={() => handleNavigate('../tabs/UpgradeToPropertyOwner/upgradeToOwner')} // not clickable if accountStatus !== 'Under-review'
            disabled={accountStatus === 'Under-review'}
          >
            <View className='py-4'>
              <View className='p-3 flex flex-row items-center rounded-2xl bg-[#333333] shadow-md'>
                <Image className='w-[50px] h-[50px]' source={require('../../../assets/images/lease.png')} />
                <View className='flex flex-col flex-1 ml-4'>
                  <Text className='text-sm font-bold text-white'>Lease My Property</Text>
                  <Text className='text-[10px] text-gray-200'>
                    Start leasing your property today and connect with quality tenants quickly and easily!
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          )}
          
          {/* General Section */}
          <View className='px-8 flex-col items-start'>
            <View className='w-full gap-2'>
              <Text className='text-lg font-bold'>General</Text>

              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/AccountInformation')}
                disabled={accountStatus === 'Under-review'}
              >
                <AntDesign name="user" size={20} color="gray" />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Account Information</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/changePassword')}
                disabled={accountStatus === 'Under-review'}
              >
                <Feather name="lock" size={20} color="gray" />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/changePin')}
                disabled={accountStatus === 'Under-review'}
              >
                <Ionicons name="keypad-outline" size={20} color="gray" />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Change Pin</Text>
              </TouchableOpacity> 

              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/Wallet/wallet')}
                disabled={accountStatus === 'Under-review'}
              >
                <Ionicons name='wallet-outline' size={20} color='gray' />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>My Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex flex-row items-center bg-white p-2 border border-gray-100 rounded-lg shadow-md' 
                onPress={() => handleNavigate('../tabs/Profile/DeleteAccount')}
              >
                <Feather name='trash-2' size={20} color='gray' />
                <Text className='text-sm font-normal ml-3'>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Rentals Section */}
          <View className='px-8 flex-col items-start'>
            <View className='w-full gap-2'>
              <Text className='pt-5 text-lg font-bold'>My Rentals</Text>
              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/TrackApplication/TrackApplication')}
                disabled={accountStatus === 'Under-review'}
              >
                <Ionicons name='home-outline' size={20} color='gray' />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Track Property Application</Text>
              </TouchableOpacity>
              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/TrackMaintenance/trackMaintenance')}
                disabled={accountStatus === 'Under-review'}
              >
                <Ionicons name='home-outline' size={20} color='gray' />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Track Maintenance Application</Text>
              </TouchableOpacity>
              <TouchableOpacity className={`flex flex-row items-center p-2 border rounded-lg shadow-md ${accountStatus === 'Under-review' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-100'}`}
                onPress={() => handleNavigate('../tabs/Profile/RentalHistory/RentalHistory')}
                disabled={accountStatus === 'Under-review'}
              >
                <Feather name='clock' size={20} color='gray' />
                <Text className={`text-sm font-normal ml-3 ${accountStatus === 'Under-review' ? 'text-gray-400' : 'text-gray-700'}`}>Rental History</Text>
              </TouchableOpacity>

              <TouchableOpacity className='flex flex-row items-center bg-white p-2 border border-gray-100 rounded-lg shadow-md'
                onPress={() => handleNavigate('../tabs/Profile/LegalDocuments')}
              >
                <Feather name='file-text' size={20} color='gray' />
                <Text className='text-sm font-normal ml-3'>Legal Documents</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* My Rentals Section */}
          <View className='px-8 flex-col items-start'>
            <View className='w-full gap-2'>
            <Text className='pt-5 text-lg font-bold'>Support</Text>
              <TouchableOpacity className='flex flex-row items-center bg-white p-2 border border-gray-100 rounded-lg shadow-md'
                onPress={() => handleNavigate('../tabs/Profile/ReportIssue')}
              >
                <MaterialIcons name="report-gmailerrorred" size={22} color="gray" />
                <Text className='text-sm font-normal ml-3'>Report an issue</Text>
              </TouchableOpacity>

              <TouchableOpacity className='flex flex-row items-center bg-white p-2 border border-gray-100 rounded-lg shadow-md'
                onPress={() => handleNavigate('../tabs/Profile/FAQ')}
              >
                <AntDesign name="questioncircleo" size={20} color="gray" />
                <Text className='text-sm font-normal ml-3'>FAQ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className='px-8 mb-24'>
            <TouchableOpacity className='mt-5 py-2 flex flex-row items-center justify-center bg-[#D9534F] rounded-full shadow-md' onPress={() => setModalVisible(true)}>
                {/* <Feather name="log-out" size={20} color="black" /> */}
                <Text className='text-sm text-white font-semibold'>Logout</Text>
              </TouchableOpacity>
              <View className='items-center justify-center mt-4'>
                <Text className='text-xs font-bold text-gray-400'>v2.0.7</Text>
              </View>
          </View>
          
          <Modal
        transparent={true}
        visible={modalVisible}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View className='flex-1 items-center justify-center bg-black/50'>
          <View className='bg-white rounded-lg p-6 w-3/4 shadow-lg'>
            <Text className='text-sm font-bold text-center mb-4'>Are you sure you want to logout?</Text>
            <View className='flex-row justify-around mt-4'>
              <TouchableOpacity 
                className='bg-[#D9534F] px-4 py-2 rounded-lg' 
                onPress={confirmLogout}
              >
                {isLoading ? (
              <View className='flex items-center px-3 justify-center'>
                <ActivityIndicator size="small" color="white" />
              </View>
            ) : (
                <Text className='text-white font-semibold'>Confirm</Text>
            )}
              </TouchableOpacity>
              <TouchableOpacity 
                className='bg-[#333333] px-4 py-2 rounded-lg' 
                onPress={() => setModalVisible(false)}
              >
                <Text className='text-white font-semibold'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        </View>
      </ScrollView>
    </View>
  );
}