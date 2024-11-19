import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationModal from './Modals/NotificationModal';
import notificationsData from './notifications.json';

// TypeScript type for NotificationItem
type NotificationItem = {
  id: number;
  notifStatus: string;
  date: string;
  title: string;
  message: string;
  type: string; // Restricting the type to specific values
  status: string;
};

// Explicitly typing notificationsData as NotificationItem[]
// This ensures notificationsData matches the NotificationItem type
const notifications: NotificationItem[] = notificationsData;

export default function Notification() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalActions, setModalActions] = useState<{ label: string; onPress: () => void; color?: string }[]>([]);
  const [showAllUnread, setShowAllUnread] = useState(false);
  const [showAllRead, setShowAllRead] = useState(false);

  const propertyAddress = 'Caloocan City';

  const handleNotificationPress = (notification: NotificationItem) => {
    if (notification.type === 'lease-extension') {
      setModalTitle('Lease Extension Request');
      setModalMessage(`Do you wish to extend your lease at ${propertyAddress}?`);
      setModalActions([
        { label: 'No', onPress: handleNo, color: '#EF5A6F' },
        { label: 'Yes', onPress: handleYes, color: '#38A169' },
      ]);
    } else {
      setModalTitle(notification.title);
      setModalMessage(notification.message);
      setModalActions([
        { label: 'OK', onPress: handleCloseModal, color: '#38A169' },
      ]);
    }
    setModalVisible(true);
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
      key={notification.id}
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
