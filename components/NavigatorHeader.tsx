import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onSnapshot, query, where, collection, Timestamp } from 'firebase/firestore';
import { db } from '../_dbconfig/dbconfig';
import * as SecureStore from 'expo-secure-store';

interface Message {
  messageId: string;
  userId1: string;
  userId2: string;
  text: string;
  createdAt: Timestamp;
  time: string;
  status: string;
}

interface Notification {
  id: string;
  uid: string;
  createdAt: Timestamp;
  notifStatus: string;
}

export default function MessageHeader() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [uid, setUID] = useState<string>('');
  const [newMessages, setNewMessages] = useState<number>(0);
  const [newNotifications, setNewNotifications] = useState<number>(0);

  useEffect(() => {
    const initializeAndSubscribe = async () => {
      const userId = await SecureStore.getItemAsync('uid');
      if (userId) {
        setUID(userId);
  
        // Subscribe to messages after setting UID
        subscribeToMessages(userId);
        subscribeToNotifications(userId);
      }
    };
  
    const subscribeToMessages = async (userId: string) => {
      const messageQueries = [
        query(collection(db, 'messages'), where('userId1', '==', userId)),
        query(collection(db, 'messages'), where('userId2', '==', userId)),
      ];
  
      const unsubscribeFunctions = messageQueries.map((messageQuery) =>
        onSnapshot(messageQuery, (snapshot) => {
          const newMessagesList = snapshot.docs.map((doc) => ({
            messageId: doc.id,
            ...doc.data(),
          })) as Message[];
  
          handleNewMessages(newMessagesList);
        })
      );
  
      // Cleanup listeners
      return () => unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  
    const subscribeToNotifications = async (userId: string) => {
      const notificationQueries = [
        query(
          collection(db, 'notifications', userId, 'notificationId'),
          where('uid', '==', userId),
          where('notifStatus', '==', 'Unread')
        ),
      ];
  
      const unsubscribeFunctions = notificationQueries.map((notifQuery) =>
        onSnapshot(notifQuery, (snapshot) => {
          const newNotifList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Notification[];
  
          setNotifications(newNotifList);
          setNewNotifications(newNotifList.length);
        })
      );
  
      // Cleanup listeners
      return () => unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  
    initializeAndSubscribe();
  }, []); // Runs once on mount
  

  // Process new message data, remove duplicates, and update counts
  const handleNewMessages = (allMessages: Message[]) => {
    const uniqueMessagesMap = new Map<string, Message>();

    allMessages.forEach((message) => {
      const pairKey = [message.userId1, message.userId2].sort().join('-');
      const existingMessage = uniqueMessagesMap.get(pairKey);
      if (!existingMessage || message.createdAt.seconds > existingMessage.createdAt.seconds) {
        uniqueMessagesMap.set(pairKey, message);
      }
    });

    const uniqueMessages = Array.from(uniqueMessagesMap.values());
    setMessages(uniqueMessages);

    const unreadCount = uniqueMessages.filter(
      (message) => message.status === 'Unread' && message.userId1 !== uid
    ).length;
    setNewMessages(unreadCount);
  };

  return (
    <View className="w-full bg-[#F6F6F6]">
      <View className="bg-[#F6F6F6] flex flex-row items-center justify-between gap-2 mt-8 pb-4 px-6  shadow-lg">
        <Image className="w-10 h-10" source={require('../assets/images/logo1.png')} />
        <View className='flex-row items-center space-x-3 mr-2 '>
        <View className="">
          <NotificationIcon
            icon={<AntDesign name="message1" size={23} color='#333333' />}
            badgeCount={newMessages}
            onPress={() => router.push('../tabs/Message/MessageDashboard')}
          />
          
        </View>
        <View>
          <NotificationIcon
              icon={<Feather name="bell" size={23} color='#333333' />}
              badgeCount={newNotifications}
              onPress={() => router.push('../tabs/Notification')}
            />
        </View>
        </View>
      </View>
    </View>
  );
}

// Separate component for notification icons with a badge
interface NotificationIconProps {
  icon: React.ReactNode;
  badgeCount: number;
  onPress: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ icon, badgeCount, onPress }) => (
  <TouchableOpacity className="flex-row items-start" onPress={onPress}>
    {icon}
    {badgeCount > 0 && (
      <View className="absolute top-0 left-4 w-5 h-5 bg-[#D9534F] rounded-full">
        <Text className="text-center pt-0.5 text-[10px] font-semibold text-white">
          {badgeCount >= 100 ? '99+' : badgeCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);
