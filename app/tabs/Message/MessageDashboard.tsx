import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onSnapshot, Timestamp, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { collection, query, where, doc } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';

interface Message {
  messageId: string;
  userId1: string;
  userId2: string;
  text: string;
  createdAt: Timestamp;
  time: string;
  status: string
}

interface User {
  uid: string;
  fullName: string;
  profilePicture: { uri: string } | number;
}

export default function MessageDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<Map<string, User>>(new Map());
  const [uid, setUID] = useState<string>(''); 
  const [refreshing, setRefreshing] = useState(false);

  const updateMessageStatus = async (messageId: string) => {
    await updateDoc(doc(db, 'messages', messageId), {status: 'Read', seenTime: new Date()})
  }

  const getUserImageUrl = async (ownerId: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${ownerId}-profilepictures`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const messageRecipientId = await SecureStore.getItemAsync('messageRecipientId');
      const messageSenderId = await SecureStore.getItemAsync('uid');

      if (messageRecipientId || messageSenderId) {
        setUID(messageSenderId ?? '');

        // Query messages where `userId1` or `userId2` is `messageSenderId`
        const queryUser1 = query(
          collection(db, 'messages'),
          where('userId1', '==', messageSenderId)
        );

        const queryUser2 = query(
          collection(db, 'messages'),
          where('userId2', '==', messageSenderId)
        );

        // Using onSnapshot for real-time updates
        const unsubscribeUser1 = onSnapshot(queryUser1, (snapshotUser1) => {
          const allMessages: Message[] = snapshotUser1.docs.map(doc => ({ messageId: doc.id, ...doc.data() } as Message));

          const unsubscribeUser2 = onSnapshot(queryUser2, (snapshotUser2) => {
            allMessages.push(...snapshotUser2.docs.map(doc => ({ messageId: doc.id, ...doc.data() } as Message)));

            // Format messages and remove duplicates by user pair (userId1, userId2)
            const messageMap = new Map<string, Message>();
            allMessages.forEach(message => {
              const pairKey = [message.userId1, message.userId2].sort().join('-');
              const existingMessage = messageMap.get(pairKey);
              if (!existingMessage || message.createdAt.seconds > existingMessage.createdAt.seconds) {
                messageMap.set(pairKey, message);
              }
            });

            // Get the unique messages
            const uniqueMessages = Array.from(messageMap.values());
            setMessages(uniqueMessages);
          });

          // Cleanup on unmount
          return () => {
            unsubscribeUser2();
          };
        });

        // Cleanup on unmount
        return () => {
          unsubscribeUser1();
        };
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    // Dynamically subscribe to user data in real-time
    const userIds = [
      ...new Set(
        messages.flatMap(message => [message.userId1, message.userId2])
          .filter(id => id !== uid)
      ),
    ];

    // Using onSnapshot to listen for user data changes in real-time
    const userSubscriptions = userIds.map((userId) => {
      const userDocRef = doc(db, 'users', userId);
      return onSnapshot(userDocRef, async (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profilePicture = await getUserImageUrl(userId);
          setUser(prevUserMap => new Map(prevUserMap).set(userId, {
            uid: userId,
            fullName: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
            profilePicture: profilePicture ? { uri: profilePicture } : require('../../../assets/images/mainlogo.jpg'),
          }));
        }
      });
    });

    // Cleanup the user subscriptions on unmount
    return () => {
      userSubscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [messages, uid]);

  const filteredMessages = messages
    .filter((message) =>
      message.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const priorityId = "cvz6NsXRDec8hycylRK6vgKOL8d2"; // The specific user ID you're prioritizing

      // Check if one of the messages belongs to the priority ID
      const isPriorityA = [a.userId1, a.userId2].includes(priorityId);
      const isPriorityB = [b.userId1, b.userId2].includes(priorityId);

      if (isPriorityA && !isPriorityB) return -1; // `a` should be at the top
      if (!isPriorityA && isPriorityB) return 1;  // `b` should be at the top
      return 0;  // No change in order if neither or both are priority
    });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="py-2 px-5 flex flex-row items-center bg-white">
        <View className="flex flex-row items-center bg-gray-100 rounded-full flex-1">
          <View className="p-3.5">
            <Feather name="search" size={15} color="gray" />
          </View>
          <TextInput
            className="flex-1 py-2 pr-6 text-xs"
            placeholder="Search"
            placeholderTextColor="gray"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Messages List */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex flex-col space-y-4 px-4 mt-4">
          {filteredMessages.map((message) => {
            const matchedUser = user.get(
              message.userId1 === uid ? message.userId2 : message.userId1
            );

            if (!matchedUser) {
              return null;
            }

            return (
              <TouchableOpacity
                className="flex flex-row items-center py-2"
                key={message.messageId}
                onPress={async () => {
                  router.push(`./msgDetails`);
                  if (message.userId2 === uid) {
                    await SecureStore.setItemAsync('messageRecipientId', message.userId1 ?? '');
                    if(message.status !== 'Read'){
                      updateMessageStatus(message.messageId);
                    }
                  } else {
                    await SecureStore.setItemAsync('messageRecipientId', message.userId2 ?? '');
                  }

                  console.log(message.userId2);
                }}
              >
                {/* User Avatar */}
                <Image
                  source={matchedUser ? matchedUser.profilePicture : require('../../../assets/images/mainlogo.jpg')}
                  className="w-14 h-14 rounded-full mr-4"
                />

                {/* Message Content */}
                <View className="flex-1">
                  <View className="flex flex-row justify-between items-center">
                    {/* Name */}
                    <Text className="text-base font-bold">{matchedUser ? matchedUser.fullName : 'Unknown'}</Text>
                    {/* Time */}
                    <Text className="text-xs text-gray-400">{message.time}</Text>
                  </View>
                  {/* Message Preview */}
                  <Text className="text-sm text-gray-500" numberOfLines={1} ellipsizeMode="tail">
                    {message.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
