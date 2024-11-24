import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import NotificationModal from './Modals/NotificationModal';
// import notificationsData from './notifications.json';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './type'; // Adjust path accordingly
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { db, storage } from '../../_dbconfig/dbconfig'; 
import { onSnapshot, collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;


// TypeScript type for NotificationItem
type NotificationItem = {
  id: string; // change this to string later
  notifStatus: string;
  date: string;
  title: string;
  message: string;
  type: string; // Restricting the type to specific values
  status: string;
};

// Explicitly typing notificationsData as NotificationItem[]
// This ensures notificationsData matches the NotificationItem type
// const notifications: NotificationItem[] = notificationsData;

export default function Notification() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalActions, setModalActions] = useState<{ label: string; onPress: () => void; color?: string }[]>([]);
  const [showAllUnread, setShowAllUnread] = useState(false);
  const [showAllRead, setShowAllRead] = useState(false);
  const [uid, setUID] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const propertyAddress = 'Caloocan City';
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchNotifications = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      if (uid) {
        try {
          setUID(uid);
          // Create a reference to the notifications collection for the user
          const notifQuery = collection(db, 'notifications', uid, 'notificationId');
          
          // Set up a real-time listener using onSnapshot
          const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
            const fetchedNotifications: NotificationItem[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              fetchedNotifications.push({
                id: doc.id, // Use document ID
                notifStatus: data.notifStatus,
                date: data.createdAt ? formatDate(data.createdAt.toDate()) : 'No Date Available', // Check if date exists
                title: data.title,
                message: data.message,
                type: data.type,
                status: data.status,
              });
            });
  
            console.log(fetchedNotifications);
            // Update the notifications state with the real-time data
            setNotifications(fetchedNotifications);
          });
  
          // Optionally, return the unsubscribe function to stop listening when the component unmounts
          return () => unsubscribe();
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
  
    fetchNotifications();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const readNotification = async (uid: string, notificationId: string) => {
    if(!uid || !notificationId) {
      return Alert.alert('Error', 'Cannot read notification');
    }

    await updateDoc(doc(db, 'notifications', uid, 'notificationId', notificationId), {notifStatus: 'Read'})
    console.log('Notification has been read.');
  }
  
  
  const accountStatus = 'Owner'

  const handleNotificationPress = (notification: NotificationItem) => {
    if (notification.type === 'lease-extension' && notification.status !== 'Approved' && notification.status !== 'Rejected') {
      setModalVisible(true);
      setModalTitle('Lease Extension Request');
      setModalMessage(`Do you wish to extend your lease at ${propertyAddress}?`);
      setModalActions([
        { label: 'No', onPress: accountStatus !== 'Owner' 
          ? handleNo 
          : () => { 
              handleCloseModal(); 
              router.replace('./OwnerLeaseAvailability/setRentalDetails'); 
            }, color: '#EF5A6F' },

        { label: 'Yes', onPress: accountStatus !== 'Owner' 
          ? handleYes 
          : () => { 
              handleCloseModal(); 
              router.replace('./OwnerLeaseExtend/rentalDetails'); 
            }, color: '#38A169' },
      ]);
    } 
      else if (notification.type === 'lease-extension' && notification.status === 'Approved') {
        navigation.navigate('Dashboard', { screen: 'My_Least' });

    } 
      else if (notification.type === 'account-registration' && notification.status === 'Rejected') {
        setModalVisible(true);
        setModalTitle('Request Re-Submission Form');
        setModalMessage(`Do you want to request re-submit your documents?`);  
        setModalActions([
            
            { 
                label: 'Yes', 
                onPress: () => {
                    handleCloseModal();
                    router.push('./ReSubmissionForm');
                }, 
                color: '#EF5A6F',
            },
            { label: 'No', onPress: handleCloseModal, color: '#333333' },
        ]);
    }  
     else {
      setModalVisible(true);
      setModalTitle(notification.title);
      setModalMessage(notification.message);
      setModalActions([
        { label: 'OK', onPress: handleCloseModal, color: '#38A169' },
      ]);
    }

    if(notification.notifStatus !== 'Read'){
      readNotification(uid, notification.id);
    }
  };

  const handleYes = () => {
    setModalTitle('Lease Extension Request');
    setModalMessage(`Your request to extend the lease at ${propertyAddress} has been received. Your request will be reviewed by the property owner shortly.`);
    setModalActions([
      { label: 'Confirm', onPress: handleCloseModal, color: '#EF5A6F' },
      { label: 'Cancel', onPress: handleCloseModal, color: '#333333' },
    ]);
  };

  const handleNo = () => {
    setModalTitle('Lease Extension Request');
    setModalMessage(`Thank you for letting us know. You have chosen not to extend your lease at ${propertyAddress}. We’ll provide further instructions for lease end preparations.`);
    setModalActions([
      { label: 'Confirm', onPress: handleCloseModal, color: '#EF5A6F' },
      { label: 'Cancel', onPress: handleCloseModal, color: '#333333' },
    ]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderNotificationItem = (notification: NotificationItem) => (
    <TouchableOpacity
      key={notification.id.toString()}
      onPress={() => handleNotificationPress(notification)}
      className="bg-white rounded-lg p-4 shadow-md mb-4"
    >
      <View className="w-full flex-row justify-between border-b border-gray-400 pb-1">
        <View className='w-3/4'>
          <Text
            className="text-xs font-bold"
            style={{
              color: notification.status === 'Urgent' || notification.status === 'Important' || notification.status === 'Rejected' ? 'red' : 
                    notification.status === 'Approved' || notification.status === 'Success' ? 'green' : 
                    'black',
            }}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
        </View>
        <View className='w-1/4'>
          <Text className="text-xs text-gray-500">{notification.date}</Text>
        </View>
      </View>
      <Text className="text-gray-600 text-xs mt-1" numberOfLines={3}>{notification.message}</Text>
    </TouchableOpacity>
  );

  // Use the data from notifications.json
  const unreadNotifications = notifications.filter((n) => n.notifStatus === 'Unread');
  const readNotifications = notifications.filter((n) => n.notifStatus === 'Read');

  return (
    <View className="p-4 flex-1">
      <View className="flex-row items-center justify-between mt-10 pb-5 px-4 border-b border-gray-300">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-xs font-bold text-center">Notification</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          <>
            <View className='flex-row items-center space-x-2'>
              <Text className="pl-4 text-sm font-bold mt-4 mb-2">Unread Notifications</Text>
              <Text className='text-[11px] font-bold mt-4 mb-2 text-white py-0.5 px-2 bg-[#EF5A6F] rounded-full'>{unreadNotifications.length}</Text>
            </View>
            {unreadNotifications.slice(0, showAllUnread ? unreadNotifications.length : 3).map(renderNotificationItem)}
            {unreadNotifications.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllUnread(!showAllUnread)} className=" items-center px-4 pl-4 mb-4">
                <Text className="text-sm text-gray-500">
                  {showAllUnread ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}
            <View className='w-full border-t border-gray-300'></View>

            <Text className="pl-4 text-sm font-bold mt-4 mb-2">Read Notifications</Text>
            {readNotifications.slice(0, showAllRead ? readNotifications.length : 1).map(renderNotificationItem)}
            {readNotifications.length > 1 && (
              <TouchableOpacity onPress={() => setShowAllRead(!showAllRead)} className="items-center pl-4 mb-4">
                <Text className="text-sm text-gray-500">
                  {showAllRead ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text>No notifications</Text>
        )}
      </ScrollView>

      <NotificationModal
        visible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        actions={modalActions}
        onClose={handleCloseModal}
      />
    </View>
  );
}
