import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, Image, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Entypo, Feather } from '@expo/vector-icons';
import { onSnapshot, doc, Timestamp, collection, query, where } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';

interface Message {
  messageId: string;
  userId1: string;
  userId2: string;
  text: string;
  createdAt: Timestamp;
  time: string;
  status: string;
}

interface User {
  uid: string;
  fullName: string;
  profilePicture: { uri: string } | number;
}

const MsgDetails: React.FC = () => {
  // const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [showTimeMap, setShowTimeMap] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { sendMessage } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const getUserImageUrl = async (ownerId: string) => {
    try {
      const storageRef = ref(storage, `profilepictures/${ownerId}-profilepictures`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const messageRecipientId = await SecureStore.getItemAsync('messageRecipientId');
      const messageSenderId = await SecureStore.getItemAsync('uid');
  
      if (messageRecipientId && messageSenderId) {
        const userRef = doc(db, 'users', messageRecipientId);
        const unsubscribeUser = onSnapshot(userRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const profilePicture = await getUserImageUrl(messageRecipientId);
  
            setUser({
              uid: messageRecipientId,
              fullName: `${userData.firstName} ${userData.middleName} ${userData.lastName}`,
              profilePicture: profilePicture ? { uri: profilePicture } : require('../../../assets/images/mainlogo.jpg')
            });
          }
        });

        const q = query(
          collection(db, 'messages'),
          where('userId1', 'in', [messageSenderId, messageRecipientId]),
          where('userId2', 'in', [messageSenderId, messageRecipientId])
        );
        
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const allMessages: Message[] = snapshot.docs.map(doc => ({
            messageId: doc.id,
            ...doc.data(),
          }))
          .map((message: any) => ({
            ...message,
            time: new Date(message.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
          .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
  
          setMessages(allMessages);
        });
  
        return () => {
          unsubscribeUser();
          unsubscribeMessages();
        };
      }
    };
  
    fetchMessages();
  }, []);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const messageRecipientId = await SecureStore.getItemAsync('messageRecipientId');
      const messageSenderId = await SecureStore.getItemAsync('uid');
      
      if (messageSenderId && messageRecipientId) {
        // Truncate the message if it exceeds 500 characters
        const truncatedMessage = newMessage.length > 500 ? newMessage.substring(0, 500) : newMessage;

        sendMessage(messageSenderId, messageRecipientId, truncatedMessage);
        
        const newMessageObject: Message = {
          messageId: `${Date.now()}`,
          userId1: messageSenderId,
          userId2: messageRecipientId,
          text: truncatedMessage,
          createdAt: Timestamp.now(),
          time: Timestamp.now().toString(),
          status: 'Unread'
        };

        setMessages((prevMessages) => [...prevMessages, newMessageObject]);
        setNewMessage('');
        setInputHeight(35);
      }
    }
  };

  const handleFollowup = async () => {
    router.push('../Reports/FollowUpReports/followUpReports')
  }

  const hanleReportIssue = async () => {
    router.push('../Profile/ReportIssue')
  }


  const report ={
    reportId: "202411290001",
    fullName: "Prince Louie Paquiado",
    accountNo: "2024-1129-0001",
    category: "Techinical",
    applicationId: "TECH-20211129-0001",
    description: "Issue with account login."
  }

  const hasReport = 1

  const followUp = async () => {
    // Create the auto-generated message
    const autoGeneratedMessage = `FOLLOW UP REPORT\n\n[Insert Report ID]\n[Insert Full Name]\n[Insert Account No]\n[Insert Category]\n[Insert Application ID]\n[Insert Description]`;
  
    const newMessage = autoGeneratedMessage
      .replace("[Insert Report ID]", report.reportId)
      .replace("[Insert Full Name]", report.fullName)
      .replace("[Insert Account No]", report.accountNo)
      .replace("[Insert Category]", report.category)
      .replace("[Insert Application ID]", report.applicationId)
      .replace("[Insert Description]", report.description);
  
    if (newMessage.trim()) {
      const messageRecipientId = await SecureStore.getItemAsync('messageRecipientId');
      const messageSenderId = await SecureStore.getItemAsync('uid');
      
      if (messageSenderId && messageRecipientId) {
        sendMessage(messageSenderId, messageRecipientId, newMessage);
      
        const newMessageObject: Message = {
          messageId: `${Date.now()}`,
          userId1: messageSenderId,
          userId2: messageRecipientId,
          text: newMessage,
          createdAt: Timestamp.now(),
          time: Timestamp.now().toString(),
          status: 'Unread'
        };
  
        setMessages((prevMessages) => [...prevMessages, newMessageObject]);
        setNewMessage(''); // Clear the message input
        setInputHeight(35); // Reset input height
      }
    }
  };
  

  const toggleTimeVisibility = (messageId: string) => {
    setShowTimeMap((prevMap) => ({
      ...prevMap,
      [messageId]: !prevMap[messageId]
    }));
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.userId2 === user?.uid;
    const isTimeVisible = showTimeMap[item.messageId] || false;
  
    // Identify if the text contains "REPORT AN ISSUE" or "FOLLOW UP REPORT"
    const text = item.text;
    const isReportIssue = text.includes('REPORT AN ISSUE');
    const isFollowUpReport = text.includes('FOLLOW UP REPORT');
  
    // Helper function to bold specific phrases
    const renderTextWithBold = (text: string) => {
      return text.split(/(REPORT AN ISSUE|FOLLOW UP REPORT)/g).map((part, index) => {
        if (part === 'REPORT AN ISSUE' || part === 'FOLLOW UP REPORT') {
          return (
            <Text key={index} className="font-bold">
              {part}
            </Text>
          );
        }
        return part;
      });
    };
  
    return (
      <TouchableOpacity onPress={() => toggleTimeVisibility(item.messageId)}>
        <View className={`flex-row items-center p-2 ${isUserMessage ? 'justify-end' : 'justify-start'} my-2`}>
          {!isUserMessage && (
            <Image 
              source={user?.profilePicture} 
              className="w-8 h-8 rounded-full mr-2" 
            />
          )}
          <View className={`p-2 rounded-lg ${isUserMessage ? 'bg-[#de6460]' : 'bg-gray-200'} max-w-[60%]`}>
            <Text className={`${isUserMessage ? 'text-white' : 'text-black'} text-base`}>
              {isReportIssue || isFollowUpReport ? renderTextWithBold(text) : text}
            </Text>
            {isTimeVisible && (
              <Text className={`${isUserMessage ? 'text-white/70 text-[11px] mt-1' : 'text-gray-500 text-[11px] mt-1'}`}>
                {new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header Section */}
      <View className="bg-[#B33939]">
        <View className="flex flex-row items-center justify-start space-x-3 mt-8 px-5 py-3 shadow-lg">
          <TouchableOpacity onPress={() => router.back()}>
            <Entypo name="chevron-left" color="white" size={20} />
          </TouchableOpacity>
          <Image source={user?.profilePicture} className="w-9 h-9 rounded-full" />
          <View className="flex flex-row">
            <Text className="text-lg font-semibold text-white">{user?.fullName || 'Name'}</Text>
          </View>
        </View>
      </View>
  
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        showsVerticalScrollIndicator={false}
        className='bg-gray-100'
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      
      {/* Conditional Message Input Section */}
      {messages.some(
        message => message.userId1 === 'syiHymdlVKYFVGCNBKVW1Rxgba33' || message.userId2 === 'syiHymdlVKYFVGCNBKVW1Rxgba33'
      ) ? (
        <View className="w-screen absolute bottom-0 flex-row items-center justify-center py-8 space-x-4">
          {hasReport > 0 ? (
            <TouchableOpacity onPress={handleFollowup} className='p-2 bg-white w-1/3 items-center shadow-lg border border-gray-300 rounded-xl'>
              <Text className='text-xs font-semibold'>Follow up Report</Text>
            </TouchableOpacity>
          ) : null} 
          <TouchableOpacity  onPress={hanleReportIssue} className='p-2 bg-white w-1/3 items-center shadow-lg border border-gray-300 rounded-xl'>
            <Text className='text-xs font-semibold'>Report an issue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center justify-center px-5 py-3">
          {/* Text Input for New Message */}
          <TextInput
            className="flex-1 bg-gray-200 rounded-xl p-3"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            onContentSizeChange={(event) => setInputHeight(event.nativeEvent.contentSize.height)}
            style={{ height: Math.min(inputHeight, 140), maxHeight: 120 }}
          />
          <TouchableOpacity onPress={handleSend} className="pl-4">
            <Feather name="send" size={24} color="#D9534F" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
};

export default MsgDetails;
