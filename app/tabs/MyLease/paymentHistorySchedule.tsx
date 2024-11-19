import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PaymentHistorySchedule() {
    const router = useRouter();

    // Dummy data for payment history
    const paymentHistory = [
        { id: 1, title: "Downpayment", status: "PAID",  payStatus: "onDue", amount: "P 15,000.00", date: "September 20,2024" },
        { id: 2, title: "Monthly Rent - October", status: "PAID",  payStatus: "late", amount: "P 10,000.00", date: "October 20,2024" },
        { id: 3, title: "Monthly Rent - November", status: "OVERDUE",  payStatus: "overDue", amount: "P 10,000.00", date: "November 20,2024" },
        { id: 4, title: "Monthly Rent - December", status: "",  payStatus: "", amount: "P 10,000.00", date: "December 20,2024" },
        { id: 5, title: "Monthly Rent - January", status: "",  payStatus: "", amount: "P 10,000.00", date: "January 20,2025" },
        { id: 6, title: "Monthly Rent - February", status: "",  payStatus: "", amount: "P 10,000.00", date: "February 20,2025" },
        { id: 7, title: "Monthly Rent - March", status: "",  payStatus: "", amount: "P 10,000.00", date: "March 20,2025" },
    ];

    return (
        <View className='bg-[#B33939]'>
            <View className='h-screen bg-white px-6 my-14 rounded-t-2xl'>
        
                {/* Header */}
                <View className='flex flex-row items-center justify-between px-6 pt-8 pb-4 border-b'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center justify-center pr-5">
                        <Text className='text-sm font-bold text-center'>Payment History & Schedule</Text>
                    </View>
                </View>

                {/* Download Button */}
                <TouchableOpacity className="self-end pt-4">
                    <Text className="text-red-500 text-xs font-semibold">Download Payment History</Text>
                </TouchableOpacity>

                {/* Payment History List */}
                <ScrollView className="mt-4">
                    <View className="bg-[#F9F9F9] p-4 rounded-lg">
                        {paymentHistory.map((item, index) => (
                            <View key={item.id} className="flex-row">
                                {/* Vertical line and bullet */}
                                <View className="items-center">
                                    {/* Line above bullet */}
                                    <View className={`w-[2px] ${index === 0 ? 'h-0' : 'h-2'} bg-gray-300`} />
                                    {/* Bullet point */}
                                    <View className={`w-3 h-3 bg-black rounded-full`} style={{
                                                    backgroundColor:
                                                    item?.payStatus === 'onDue'
                                                        ? '#0FA958'
                                                        : item?.payStatus === 'late'
                                                          ? '#FF6500'
                                                          : item?.payStatus === 'overDue'
                                                            ? '#EF5A6F'
                                                            : '#333333', // fallback color for other statuses
                                                  }} />
                                    {/* Line below bullet */}
                                    <View className={`w-[2px] ${index === paymentHistory.length - 1 ? 'h-0' : 'flex-1'} bg-gray-300`} />
                                </View>

                                {/* Payment details */}
                                <View className="flex-1 ml-2 mb-4 pt-1.5">
                                    <View className="w-full flex-row items-center justify-between">
                                        <View className='flex-row items-center space-x-1'>
                                            <Text className="text-xs font-bold">{item.title}</Text>
                                            
                                            {item.status && (
                                                <View className="px-2 py-0.5 rounded-full " style={{
                                                    backgroundColor:
                                                    item?.payStatus === 'onDue'
                                                        ? '#0FA958'
                                                        : item?.payStatus === 'late'
                                                          ? '#FF6500'
                                                          : item?.payStatus === 'overDue'
                                                            ? '#EF5A6F'
                                                            : '#333333', // fallback color for other statuses
                                                  }}>
                                                    <Text className="text-white text-[10px] font-bold">{item.status}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-end font-bold text-xs text-black">{item.amount}</Text>
                                        </View>
                                    </View>
                                    {/* Status and amount */}
                                    <View className="flex-row items-center">
                                    <Text className="text-xs text-gray-400">{item.date}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
