import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const unreadNotifications = [
  { id: 1, title: "Payment Reminder", message: "Your payment is due soon. Please pay by the due date. Your payment is due soon. Please pay by the due date." },
  { id: 2, title: "Lease Expiration", message: "Your lease is set to expire in 30 days. Please renew your lease." },
  { id: 3, title: "Maintenance Request", message: "Your maintenance request has been received and is being processed." },
  { id: 4, title: "Property Alert", message: "A new property matching your criteria has been listed." },
  { id: 5, title: "Security Update", message: "Please update your password for enhanced security." },
];

const recentNotifications = [
  { id: 1, title: "Application Approved", message: "Congratulations! Your application has been approved." },
  { id: 2, title: "Payment Confirmation", message: "Your payment of $500 has been successfully processed." },
  { id: 3, title: "New Message", message: "You have a new message from your landlord." },
  { id: 4, title: "Property Visit Reminder", message: "Don't forget your property visit scheduled for tomorrow." },
  { id: 5, title: "Lease Renewal", message: "Your lease has been renewed for another year." },
  { id: 6, title: "Feedback Request", message: "Please provide feedback on your recent property experience." },
  { id: 7, title: "Event Invitation", message: "You're invited to the community meeting next week." },
  { id: 8, title: "Policy Update", message: "New policies have been implemented. Please review them." },
  { id: 9, title: "Payment Reminder", message: "Your next payment is due in 5 days." },
  { id: 10, title: "Community Alert", message: "There is a scheduled power outage in your area." },
];

export default function Notification() {
  const router = useRouter();
  
  return (
    <View className='px-4 flex-1'>
      <View className='flex flex-row items-center justify-between mt-10 px-2 py-5 border-b'>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className='text-lg font-bold text-center'>Notifications</Text>
      </View>

      <ScrollView className='flex-1' contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className='py-4'>
          <Text className='pl-4 text-sm font-bold'>Unread Notifications</Text>
          {unreadNotifications.map(notification => (
            <View key={notification.id} className='bg-white rounded-xl p-4 mb-4 shadow-lg'>
              <Text className='text-md font-semibold'>{notification.title}</Text>
              <Text className='text-gray-600 text-sm mt-1' numberOfLines={2}>{notification.message}</Text>
            </View>
          ))}
        </View>

        <View className='py-4'>
          <Text className='pl-4 text-sm font-bold'>Recent Notifications</Text>
          {recentNotifications.map(notification => (
            <View key={notification.id} className='bg-white rounded-xl p-4 mb-4 shadow-lg'>
              <Text className='text-md font-semibold'>{notification.title}</Text>
              <Text className='text-gray-600 text-sm mt-1' numberOfLines={2}>{notification.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
