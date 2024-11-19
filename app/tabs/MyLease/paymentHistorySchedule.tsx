import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'; // Added 'doc' import
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';


interface History {
    paymentDuration: string;
    propertyLeaseDuration: string;
    propertyLeaseStart: string;
    propertyLeaseEnd: string;
    propertyRentAmount: string;
    propertyRentDueDay: string;
    paymentTransactionId: string;
    date: string;
    value: string;
    status: string;
    paymentTransactionType: string;
    adjustedLeaseStarts: string; // Array of adjusted dates
    adjustedMonths: string;
}

export default function tenantPaymentHistorySchedule() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState<History[]>([]);

    useEffect(() => {
        const parseCustomDate = (dateString: string) => {
            const [datePart, timePart] = dateString.split(', ');
            const [month, day, year] = datePart.split('/').map(Number);
            const [time, period] = timePart.split(' ');
    
            let [hours, minutes, seconds] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
    
            return new Date(year, month - 1, day, hours, minutes, seconds);
        };

        const parseCustomMonth = (dateString: string) => {
            const [datePart, timePart] = dateString.split(', ');
            const [month, day, year] = datePart.split('/').map(Number);
            const [time, period] = timePart.split(' ');
    
            let [hours, minutes, seconds] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
    
            return new Date(year, month - 1, day, hours, minutes, seconds);
        };
    
        const fetchWalletData = async () => {
            const paymentId = await SecureStore.getItemAsync('paymentTransactionId');
            const tenantId = await SecureStore.getItemAsync('uid');
        
            if (paymentId && tenantId) {
                const paymentQuery = query(
                    collection(db, 'walletTransactions', tenantId, 'walletId'),
                    where('transactionType', '==', 'Payment'),
                    where('paymentTransactionId', '==', paymentId)
                );
    
                const rentSnapshot = await getDoc(doc(db, 'rentTransactions', paymentId));
                if (rentSnapshot.exists()) {
                    const data = rentSnapshot.data();
    
                    if (data) {
                        try {
                            const querySnapshot = await getDocs(paymentQuery);
    
                            const [month, day, year] = data.propertyLeaseStart.split('/');
                            let leaseStart = new Date(`${year}-${month}-${day}`);
    
                            if (isNaN(leaseStart.getTime())) {
                                console.error('Invalid lease start date:', data.propertyLeaseStart);
                                return;
                            }
    
                            const rentDueDay = parseInt(data.propertyRentDueDay.replace(/\D/g, ''), 10);
                            const paidMonths = data.paymentDuration;
    
                            const isLongTerm = data.propertyLeaseDuration === "Long-term (1 year)";
                            const maxLeaseMonths = isLongTerm ? 12 : 6;
                            const remainingMonths = maxLeaseMonths - paidMonths;
    
                            const startMonth = leaseStart.getMonth();
                            const startYear = leaseStart.getFullYear();
                            const dateRange: Date[] = [];
    
                            for (let i = 0; i < maxLeaseMonths; i++) {
                                const currentDate = new Date(startYear, startMonth + i, rentDueDay);
                                dateRange.push(currentDate);
                            }
    
                            let paymentDetails: History[] = querySnapshot.docs.map((doc, index) => ({
                                paymentTransactionId: doc.id,
                                paymentTransactionType: doc.data().transactionType ? 'Rent' : '',
                                date: doc.data().date,
                                value: doc.data().value,
                                status: doc.data().status,
                                paymentDuration: data.paymentDuration,
                                propertyLeaseDuration: data.propertyLeaseDuration,
                                propertyLeaseStart: data.propertyLeaseStart,
                                propertyLeaseEnd: data.propertyLeaseEnd,
                                propertyRentAmount: data.propertyRentAmount,
                                propertyRentDueDay: data.propertyRentDueDay,
                                adjustedLeaseStarts: '',
                                adjustedMonths: ''
                            }));
    
                            paymentDetails = paymentDetails
                                .filter(payment => payment.paymentTransactionId !== 'next-due')
                                .sort((a, b) => {
                                    const dateA = parseCustomDate(a.date);
                                    const dateB = parseCustomDate(b.date);
                                    return dateA.getTime() - dateB.getTime();
                                });
    
                            // Assign adjusted lease start dates from dateRange
                            paymentDetails.forEach((payment, index) => {
                                payment.adjustedLeaseStarts = dateRange[index]?.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) || '';
                                payment.adjustedMonths = dateRange[index]?.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                }) || '';
                                
                            });
    
                            // Label the first payment as "Downpayment"
                            if (paymentDetails.length > 0) {
                                paymentDetails[0].paymentTransactionType = 'Downpayment';
                            }
    
                            // Add dummy entries for remaining months and set "Next Due" label
                            let firstUnpaid = true;
                            for (let i = paymentDetails.length; i < maxLeaseMonths; i++) {
                                paymentDetails.push({
                                    paymentTransactionId: `dummy-${i}`,
                                    paymentTransactionType: 'Rent',
                                    date: dateRange[i]?.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) || '',
                                    value: data.propertyRentAmount,
                                    status: firstUnpaid ? 'NEXT DUE' : 'UNPAID',
                                    paymentDuration: data.paymentDuration,
                                    propertyLeaseDuration: data.propertyLeaseDuration,
                                    propertyLeaseStart: data.propertyLeaseStart,
                                    propertyLeaseEnd: data.propertyLeaseEnd,
                                    propertyRentAmount: data.propertyRentAmount,
                                    propertyRentDueDay: data.propertyRentDueDay,
                                    adjustedLeaseStarts: dateRange[i]?.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) || '',
                                    adjustedMonths: dateRange[i]?.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                    }) || '',
                                });
                                firstUnpaid = false;
                            }
    
                            setHistoryData(paymentDetails);
                            console.log('Final paymentDetails with sorted adjustedLeaseStarts:', paymentDetails);
                        } catch (error) {
                            console.error("Error fetching payment transactions:", error);
                        }
                    }
                }
            }
        };
    
        fetchWalletData();
    }, []);
    
    
    
    

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
                        {historyData.map((item, index) => (
                            <View key={item.paymentTransactionId} className="flex-row">
                                {/* Vertical line and bullet */}
                                <View className="items-center">
                                    <View className={`w-[2px] ${index === 0 ? 'h-0' : 'h-2'} bg-gray-300`} />
                                    <View className={`w-3 h-3 bg-black rounded-full`} style={{
                                        backgroundColor:
                                        item?.status === 'PAY_ONTIME'
                                            ? '#0FA958'
                                            : item?.status === 'PAY_LATE'
                                              ? '#FF6500'
                                              : item?.status === 'OVERDUE'
                                                ? '#EF5A6F'
                                                : '#333333', // fallback color for other statuses
                                    }} />
                                    <View className={`w-[2px] ${index === historyData.length - 1 ? 'h-0' : 'flex-1'} bg-gray-300`} />
                                </View>

                                {/* Payment details */}
                                <View className="flex-1 ml-2 mb-4 pt-1.5">
                                    <View className="w-full flex-row items-center justify-between">
                                        <View className='flex-row items-center space-x-1'>
                                            <Text className="text-xs font-bold">{item.paymentTransactionType} - {item.adjustedMonths}</Text>
                                            {item.status && (
                                                <View className="px-2 py-0.5 rounded-full" style={{
                                                    backgroundColor:
                                                    item?.status === 'PAY_ONTIME'
                                                        ? '#0FA958'
                                                        : item?.status === 'PAY_LATE'
                                                          ? '#FF6500'
                                                          : item?.status === 'OVERDUE'
                                                            ? '#EF5A6F'
                                                            : '#333333',
                                                }}>
                                                    <Text className="text-white text-[10px] font-bold">
                                                    {item.status === 'PAY_ONTIME' || item.status === 'PAY_LATE' ? 'PAID' : item.status}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-end font-bold text-xs text-black">₱{parseInt(item.value).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                    {/* Adjusted Lease Start Dates */}
                                    <View className="flex-row items-center">
                                    <Text className="text-xs text-gray-400">{item.adjustedLeaseStarts}</Text>
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
