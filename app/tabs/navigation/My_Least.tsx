import { View, Text, Image, ScrollView, TouchableOpacity, Linking, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';
import { Alert } from "react-native";
import { getTransactionData } from '../Profile/Wallet/secureStorage'; 

const dummyData = {
  user: {
    name: 'Prince Louie Paquiado',
    role: 'Landlord',
    profilePicture: require('../../../assets/images/profile.png'),
  },
  rentDetails: {
    leaseStatus: "Rented",
    dueDate: 'Oct 15, 2024',
    amountDue: 5500,
    advancePayment: 5500,
    securityDeposite: 5500,
    property: {
      name: 'Unit 124 Apartment',
      location: 'Makati City, Metro Manila',
      price: 'Php 5,500 / Month',
      image: require('../../../assets/images/property1.png'),
      rentStart: 'Jan 01, 2024',
      rentEnd: 'Dec 31, 2024',
      depositAmount: 'Php 11,000',
    },
  },
  transactionHistory: [
    {
      id: 1,
      type: 'Pay Rent',
      amount: 5600,
      date: 'Sep 01, 2024',
    },
    {
      id: 2,
      type: 'Pay Rent',
      amount: 5500,
      date: 'Aug 01, 2024',
    },
  ],
};

interface LeaseData {
  createdAt: Date;
  transactionId: string;
  ownerId: string;
  ownerImage: { uri : string} | number;
  ownerFullName: string;
  ownerRole: string;
  propertyId: string;
  propertyImage: { uri : string} | number;
  propertyName: string;
  propertyType: string;
  propertyCity: string;
  propertyRegion: string;
  propertyPrice: string; //might add later
  propertySecurityDepositAmount: string;  
  rentalStartDate: string;
  rentalEndDate: string;
  status: string
}

interface MultipleLease {
  createdAt: Timestamp;
  id: string;
  propertyName: string;
  propertyMonthlyRent: string;
  propertyPaymentStatus: string;
  type: string;
  city: string;
  region: string;
  moveInDate: string;
  date: string;
  propertyStatus: string;
  endDate: string
  image: { uri : string} | number; // Adjust this type as needed
}

interface Rent {
  // createdAt: Date;
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyLeaseDuration: string;
  propertyRentAmount: string;
  propertyRentDueDay: string;
  propertySecurityDepositAmount: string;
  propertySecurityDepositRefundPeriod: string;
  propertyAdvancePaymentAmount: string;
  paymentDuration: string;
  propertyStatus: string;
  nextDueDate: string;
}

interface TransactionData {
  uid: string;
  transactionId: string;
  transactionType: string;
  paymentTransactionId: string;
  dateTime: string;
  value: number;  // Ensure total is a number
}

export default function MyLease() {
  const router = useRouter();
  const { sendNotification } = useAuth();
  const [activeTab, setActiveTab] = useState('rent'); // State to toggle between "rent" and "contract"
  const [leaseDataMap, setLeaseDataMap] = useState<Record<string, LeaseData>>({});
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [totalLease, setTotalLease] = useState<number>(0);
  const [rentData, setRentData] = useState<Rent | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0); // State to hold wallet balance
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]); 
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const phoneNumber = '1234567890';




  const handlePhoneCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

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

  const getPropertyImageUrl = async (propertyId: string, fileName: string) => {
    try {
      const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  const fetchLeaseData = async () => {
    const tenantId = await SecureStore.getItemAsync('uid');
    if (tenantId) {
      const transactionsRef = collection(db, 'propertyTransactions');
      const q = query(
        transactionsRef,
        where('status', 'in', ['Waiting Signature & Payment', 'Approved']),
        where('tenantId', '==', tenantId),
      );
  
      const transactionsSnapshot = await getDocs(q);
  
      if (!transactionsSnapshot.empty) {
        let totalLeaseData = 0;
        const newLeases: MultipleLease[] = []; // Collect lease data in a new array
  
        const fetchLease = async (transactionDoc: any) => {
          const { transactionId, ownerId, propertyId, moveInDate, rentalStartDate, rentalEndDate, paymentStatus, createdAt } = transactionDoc.data();
          
          // Check if rentalEndDate is today's date
          // Check if rentalEndDate is today's date
        const today = new Date();
        const formattedToday = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
        console.log(formattedToday);
        // router.replace('../tabs/Feedback/PropertyFeedback/propertyFeedback') // Go to Reviews
        if (rentalEndDate === formattedToday) {
          console.log(`Skipping property ${propertyId} as rentalEndDate (${rentalEndDate}) is today.`);
          sendNotification(tenantId, 'lease-end', 'Lease Ended - Share Your Feedback', 'Your lease has ended! We’d love to hear about your experience staying at the property, interacting with the landlord, and using the app. Please take a moment to answer a few questions to help us improve our services.', 'Success', 'Unread')
          router.replace('../tabs/Feedback/PropertyFeedback/propertyFeedback') // Go to Reviews
          await SecureStore.setItemAsync('reviewPropertyId', propertyId);
          await SecureStore.setItemAsync('reviewOwnerId', ownerId);
          return; // Skip this lease
        }
  
        if (ownerId && propertyId && rentalStartDate) {
          const userRef = await getDoc(doc(db, 'users', ownerId));
          if (userRef.exists()) {
            const userData = userRef.data();
            const fullName = `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`;
            const profilePicture = await getUserImageUrl(ownerId);

            const propertyRef = await getDoc(doc(db, 'properties', ownerId, 'propertyId', propertyId));
            if (propertyRef.exists()) {
              const propertyData = propertyRef.data();

              const firstImageUri = propertyData.images?.length > 0
                ? await getPropertyImageUrl(propertyId, propertyData.images[0])
                : null;

              const leaseDetails: LeaseData = {
                createdAt: createdAt,
                transactionId,
                ownerId,
                ownerImage: profilePicture || require('../../../assets/images/profile.png'),
                ownerFullName: fullName,
                ownerRole: userData.role,
                propertyId,
                propertyImage: firstImageUri || require('../../../assets/images/property1.png'),
                propertyName: propertyData.propertyName,
                propertyType: propertyData.propertyType,
                propertyCity: propertyData.propertyCity,
                propertyRegion: propertyData.propertyRegion,
                propertyPrice: propertyData.propertyMonthlyRent,
                propertySecurityDepositAmount: propertyData.propertySecurityDepositAmount,
                rentalStartDate,
                rentalEndDate,
                status: propertyData.status,
              };

              const multipleLease: MultipleLease = {
                createdAt: createdAt,
                id: transactionId,
                propertyName: propertyData.propertyName,
                propertyMonthlyRent: propertyData.propertyMonthlyRent,
                propertyPaymentStatus: paymentStatus,
                type: propertyData.propertyType,
                city: propertyData.propertyCity,
                region: propertyData.propertyRegion,
                moveInDate: moveInDate,
                date: rentalStartDate,
                endDate: rentalEndDate,
                propertyStatus: propertyData.status,
                image: firstImageUri || require('../../../assets/images/property1.png'),
              };

              console.log('MoveInDate', rentalStartDate);
              console.log('CreatedAt', multipleLease.createdAt);

              // Store lease data in the map and new leases array
              setLeaseDataMap((prev) => ({ ...prev, [transactionId]: leaseDetails }));
              newLeases.push(multipleLease);
              totalLeaseData++;
            }
          }
        }
      };

      // Fetch all leases in parallel
      await Promise.all(transactionsSnapshot.docs.map(fetchLease));

      // After collecting all leases, update state once
      setMultipleLeases(newLeases);
      setTotalLease(totalLeaseData);
      } else {
        console.log('No approved transactions found for this tenant.');
      }
    }
  };
  

   useEffect(() => {
    fetchLeaseData();
   }, [])

  const totalLeaseData = totalLease;
  //console.log('Total Lease Data', totalLeaseData);
  const [loading, setLoading] = useState(true);
  const [multipleLeases, setMultipleLeases] = useState<MultipleLease[]>([]); // Use the defined interface

  const loadMultipleLeases = () => {
    setTimeout(() => {
      setMultipleLeases(multipleLeases);
      setLoading(false);
    }, 1000); // Simulate a 1-second loading time
  };
  useEffect(() => {
    // Simulate loading the data
    loadMultipleLeases();
  }, []);

  const loadTransactionData = async () => {
    const data = await getTransactionData();
    
    // Ensure data is always an array
    if (Array.isArray(data)) {
      setTransactionData(data); // Safe to set as TransactionData[]
    } else {
      setTransactionData([]); // Fallback to an empty array if the result isn't an array
    }

    // Load the wallet balance from the file
    await loadWalletData();
  };

  useEffect(() => {
    loadTransactionData();
    loadWalletTransactions();
  }, []);
  

  const loadWalletData = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
      if(uid){
        const walletRef = doc(db, 'wallets', uid); 
        const walletSnap = await getDoc(walletRef);

        if (walletSnap.exists()) {
            const walletData = walletSnap.data();
            const currentBalance = walletData.balance || 0;
            setWalletBalance(currentBalance);
        }
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    }
  };

  const loadWalletTransactions = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
  
      if (uid) {
        const transactionsQuery = query(collection(db, 'walletTransactions', uid, 'walletId'), where('uid', '==', uid));
        const querySnapshot = await getDocs(transactionsQuery);
  
        const transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          return {
            uid: data.uid,
            transactionId: doc.id,
            transactionType: data.transactionType,
            paymentTransactionId: data.paymentTransactionId,
            dateTime: data.date,
            value: parseInt(data.value),  // Ensure the value is correctly retrieved
          };
        });
  
        setTransactionData(transactions as TransactionData[]);
      }
    } catch (error) {
      console.error("Error loading transactions:", error); // Log any errors that occur
    }
  };
  
  const [isLeaseVisible, setIsLeaseVisible] = useState(true); // Step 1: State for visibility
 
  
  
  const onLeaseClick = async (transactionId: string) => {
    // change to ===, pinakita ko lang yung display
    const contractRef = await getDoc(doc(db, 'contracts', transactionId));
    if(contractRef.exists()){
      const data = contractRef.data();
      // console.log("DATA",data)
      if(data){
        if (data.status === "Active"){
          setSelectedLeaseId(transactionId); // Set the clicked lease as the selected one
          //console.log('Transaction Id', transactionId);
          setActiveTab('rent'); // Show the "Rent Section" initially when a lease is clicked\
          setIsLeaseVisible(false); // Step 2: Hide lease listing on click
        } 
          else if (data.status === "Pending") {
            await SecureStore.setItemAsync('contractId', transactionId);
            router.push('./MyLease/ReceivedContract')
        } 
          else if (data.status === "Renewal") {
            await SecureStore.setItemAsync('contractId', transactionId);
            router.push('./Renewal/ReceivedContract')
        }
      }
    }
  };

  const selectedLeaseData = selectedLeaseId ? leaseDataMap[selectedLeaseId] : null;


    const fetchRentData = async () => {
      try {
        const uid = await SecureStore.getItemAsync('uid');
        const transactionId = `${selectedLeaseData?.ownerId}-${selectedLeaseData?.propertyId}-${uid}`;
        console.log('Test', transactionId);
  
        if (transactionId) {
          // Get the collection reference for payment transactions
          const paymentCollectionRef = collection(db, 'rentTransactions');
          const paymentSnapshot = await getDocs(paymentCollectionRef);
  
          if (!paymentSnapshot.empty) {
            // Map over the documents to extract paymentIds
            const paymentIds = paymentSnapshot.docs.map((doc) => doc.id); // doc.id is the paymentId
  
            // Sort paymentIds by numeric value to find the latest
            const latestPaymentId = paymentIds.sort((a, b) => parseInt(b) - parseInt(a))[0];
            const paymentRef = await getDoc(doc(db, 'rentTransactions', transactionId));
  
            if (paymentRef.exists()) {
              const data = paymentRef.data();
              if (data) {
                await SecureStore.setItemAsync('rentTransactionId', transactionId);
  
                const leaseStart = data.propertyLeaseStart; // Sample date in MM/DD/YY format
                const rentDueDay = data.propertyRentDueDay; // Expected format: "1st", "2nd", etc.

                // Remove ordinal suffix from rentDueDay
                const dueDay = parseInt(rentDueDay.replace(/(st|nd|rd|th)$/i, ''));
                // Split the date string by "/"
                const [month, day, year] = leaseStart.split("/").map(Number);

                // Handle year, assuming the century if only two digits are provided
                //const fullYear = year < 50 ? 2000 + year : 1900 + year; // Example rule: if year < 50, assume 21st century; otherwise, 20th

                // Create the Date object with parsed values
                const leaseStartDate = new Date(year, month - 1, dueDay); // Month is zero-indexed in JavaScript Date

                console.log(leaseStartDate);

                // Step to calculate newDueDay based on rentDueDay
                const today = new Date();
                const currentDay = today.getDate();
                //console.log("Current Day:", currentDay); // Debugging line
                const newDueDay = data.propertyRentDueDay.replace(/\D/g, '');
  
                // Get the lease details and compare as described
                const isOtherLeaseDuration = 
                !(data.propertyLeaseDuration === 'Long-term (1 year)' && data.paymentDuration === '12') && 
                !(data.propertyLeaseDuration === 'Short-term (6 months)' && data.paymentDuration === '6');

                if (isOtherLeaseDuration && newDueDay && uid) {
                  // Check if there is a payment for the last month
                  const transactionsRef = collection(db, 'walletTransactions', uid, 'walletId');
                  const transactionsQuery = query(
                    transactionsRef,
                    where('uid', '==', uid),
                    where('transactionType', '==', 'Payment'),
                    orderBy('date', 'desc'),
                    limit(1)
                  );

                  const transactionSnapshot = await getDocs(transactionsQuery);
                
                  //if the tenant already pays the rent
                  if (!transactionSnapshot.empty) {
                    const lastTransaction = transactionSnapshot.docs[0].data();
                    const lastPaymentDate = new Date(lastTransaction.dateTime);
                    const lastPaymentMonth = lastPaymentDate.getMonth();
                    const lastPaymentYear = lastPaymentDate.getFullYear();
                    const currentMonth = leaseStartDate.getMonth();
                    const currentYear = today.getFullYear();
                
                    const isLastMonthPayment = 
                      (currentMonth - lastPaymentMonth === 1) || 
                      (currentMonth === 0 && lastPaymentMonth === 11 && currentYear - lastPaymentYear === 1);
                
                      if (isLastMonthPayment) {
                        let daysUntilDue = newDueDay - currentDay;
                      
                        if (daysUntilDue < 0) {
                          const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                          daysUntilDue = daysInCurrentMonth - currentDay + newDueDay;
                        }
                      
                        // Calculate the next due date
                        const nextDueDate = new Date();
                        nextDueDate.setDate(today.getDate() + daysUntilDue);

                        const paymentCount = transactionData.filter(
                          (transaction) =>
                            transaction.transactionType === 'Payment' && 
                            transaction.paymentTransactionId === transactionId
                        ).length;

                        // Update nextDueDate by adding the count of matching transactions
                        nextDueDate.setMonth(nextDueDate.getMonth() + paymentCount);
                      
                        // Format the next due date into "Month day, year"
                        const formattedDueDate = nextDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                      
                        console.log(`Next payment is due on ${formattedDueDate}`);
                      
                        setRentData({
                          // createdAt: data.createdAt.toDate(),
                          transactionId,
                          ownerId: data.ownerId,
                          propertyId: data.propertyId,
                          tenantId: data.tenantId,
                          propertyLeaseStart: data.propertyLeaseStart,
                          propertyLeaseEnd: data.propertyLeaseEnd,
                          propertyLeaseDuration: data.propertyLeaseDuration,
                          propertyRentAmount: data.propertyRentAmount,
                          propertyRentDueDay: data.propertyRentDueDay,
                          propertySecurityDepositAmount: data.propertySecurityDepositAmount,
                          propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
                          propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
                          paymentDuration: data.paymentDuration,
                          propertyStatus: data.status,
                          nextDueDate: formattedDueDate,
                        });
                      } else {
                        // Handle the case for next due date when no last month payment found
                        const nextDueDate = leaseStartDate;
                        //nextDueDate.setDate(today.getDate() + (newDueDay - currentDay + (newDueDay < currentDay ? 30 : 0)));
                        // Filter transactionData for matching transactions
                        const paymentCount = transactionData.filter(
                          (transaction) =>
                            transaction.transactionType === 'Payment' && 
                            transaction.paymentTransactionId === transactionId
                        ).length;

                        // Update nextDueDate by adding the count of matching transactions
                        nextDueDate.setMonth(nextDueDate.getMonth() + paymentCount);

                        // Format the next due date into "Month day, year"
                        const formattedDueDate = nextDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                        
                        console.log(`Next payment is due on ${formattedDueDate} (no previous payment found1).`);
                        console.log('Status: ', data.status);
                        setRentData({
                          // createdAt: data.createdAt.toDate(),
                          transactionId,
                          ownerId: data.ownerId,
                          propertyId: data.propertyId,
                          tenantId: data.tenantId,
                          propertyLeaseStart: data.propertyLeaseStart,
                          propertyLeaseEnd: data.propertyLeaseEnd,
                          propertyLeaseDuration: data.propertyLeaseDuration,
                          propertyRentAmount: data.propertyRentAmount,
                          propertyRentDueDay: data.propertyRentDueDay,
                          propertySecurityDepositAmount: data.propertySecurityDepositAmount,
                          propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
                          propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
                          paymentDuration: data.paymentDuration,
                          propertyStatus: data.status,
                          nextDueDate: formattedDueDate,
                        });
                      }
                  } else {
                    // If no previous payment found, handle as first payment
                    console.log('No previous payment found. Handling as first payment.');
                    
                    const firstPaymentDueDate = new Date();
                    const formattedFirstPaymentDueDate = firstPaymentDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                
                    const firstRentAmount = parseInt(data.propertyAdvancePaymentAmount) + parseInt(data.propertySecurityDepositAmount);
                
                    setRentData({
                      // createdAt: data.createdAt.toDate(),
                      transactionId,
                      ownerId: data.ownerId,
                      propertyId: data.propertyId,
                      tenantId: data.tenantId,
                      propertyLeaseStart: data.propertyLeaseStart,
                      propertyLeaseEnd: data.propertyLeaseEnd,
                      propertyLeaseDuration: data.propertyLeaseDuration,
                      propertyRentAmount: firstRentAmount.toString(),
                      propertyRentDueDay: data.propertyRentDueDay,
                      propertySecurityDepositAmount: data.propertySecurityDepositAmount,
                      propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
                      propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
                      paymentDuration: data.paymentDuration,
                      propertyStatus: data.status,
                      nextDueDate: formattedFirstPaymentDueDate,
                    });
                  }
                } else {
                    // Handle the case for next due date when no last month payment found
                    const nextDueDate = new Date();
                    nextDueDate.setDate(today.getDate() + (newDueDay - currentDay + (newDueDay < currentDay ? 30 : 0)));
                    // Format the next due date into "Month day, year"
                    const formattedDueDate = nextDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    
                    console.log(`Next payment is due on ${formattedDueDate} (no previous payment found).`);
                    const firstRentAmount = parseInt(data.propertyAdvancePaymentAmount) + parseInt(data.propertySecurityDepositAmount);
                    setRentData({
                      // createdAt: data.createdAt,
                      transactionId,
                      ownerId: data.ownerId,
                      propertyId: data.propertyId,
                      tenantId: data.tenantId,
                      propertyLeaseStart: data.propertyLeaseStart,
                      propertyLeaseEnd: data.propertyLeaseEnd,
                      propertyLeaseDuration: data.propertyLeaseDuration,
                      propertyRentAmount: firstRentAmount.toString(),
                      propertyRentDueDay: data.propertyRentDueDay,
                      propertySecurityDepositAmount: data.propertySecurityDepositAmount,
                      propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
                      propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
                      paymentDuration: data.paymentDuration,
                      propertyStatus: data.status,
                      nextDueDate: formattedDueDate,
                    });
                }
              }
            }
            // console.log("CREATED AT",rentData?.createdAt);
            console.log(rentData?.nextDueDate);
            //checkDate(rentData ? rentData.nextDueDate : '');
            console.log('Latest paymentId:', latestPaymentId, rentData?.propertyStatus);
            const check = await SecureStore.getItemAsync('isNotificationSent');
            if(check == 'true'){
              setIsChecked(true);
            }else{
              setIsChecked(false);
            }
            
          } else {
            console.log('No payments found for this transaction.');
          }
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
      }
    };

  useEffect(() => {
    fetchRentData();
  }, [selectedLeaseData]);

  const formatDate = (dateString: string) => {
    //console.log('Date String: ', dateString);
    const [month, day, year] = dateString.split('/').map(Number);
    if(isChecked == false){
      checkDate(dateString);
    }
    
    // Validate if the date is correct
    if (!month || !day || !year) {
      return "Invalid Date";
    }
  
    const date = new Date(year, month - 1, day);
  
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
  
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const checkDate = async (dateString: string) => {
    await SecureStore.setItemAsync('isNotificationSent', 'true');
    const uid = await SecureStore.getItemAsync('uid');
    // Convert the date string (Month dd, YYYY) into a Date object
    console.log(dateString);
    const targetDate = new Date(dateString);
  
    // Get today's date (without time part)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
  
    // Get the date 3 days before the target date
    const threeDaysBefore = new Date(targetDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  
    // Check the conditions
    if (today.getTime() === threeDaysBefore.getTime() && uid) {
      sendNotification(uid, 'approval', 
        `Rent Due on ${dateString}`, `Reminder: Your rent is due on ${dateString}. Please ensure timely payment to avoid any issues.`, 'Urgent', 'Unread')
      console.log('Today is 3 days before the target date.');
    } else if (today.getTime() === targetDate.getTime() && uid) {
      sendNotification(uid, 'approval', 
        `Rent Due on ${dateString}`, `Reminder: Your rent is due today. Please complete your payment to avoid any issues.`, 'Urgent', 'Unread')
      console.log('Today is the target date.');
    } else if (today.getTime() > targetDate.getTime() && uid) {
      sendNotification(uid, 'approval', 
        `Rent Due on ${dateString}`, `Your rent payment was due yesterday and has not been received. Please complete the payment as soon as possible to avoid late fees.`, 'Urgent', 'Unread')
      console.log('Today exceeds the target date.');
    } else if (today.getTime() < threeDaysBefore.getTime() && uid) {
      sendNotification(uid, 'approval', 
        `Rent Due on ${dateString}`, `Reminder: Your rent was due on ${dateString}, and payment has not been received. Please make your payment immediately to avoid further action.`, 'Urgent', 'Unread')
      console.log('Error: Today is more than 3 days before the target date.');
    } else {
      console.log('Today is either more or less than the target date.');
      console.log(uid, dateString);
      // sendNotification(rentData ? rentData.tenantId : '', 'approval', 
      //   `Rent Due on ${dateString}`, `Reminder: Your rent is due on ${dateString}. Please ensure timely payment to avoid any issues.`, 'Urgent', 'Unread')
    }
  };
  
  
  const handleBackToLeaseListing = () => {
    setSelectedLeaseId(null); // Reset selected lease
    setIsLeaseVisible(true); // Show lease listings again
  };

  const [isDetailsVisible, setIsDetailsVisible] = useState(false); 
  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible); // Toggle visibility
  };

  const handlePayment = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
      const rent = parseInt(rentData?.propertyRentAmount || '0');
      if(uid && rent){
        // Reference to the user's wallet document in the 'wallets' collection
        const walletDocRef = doc(db, 'wallets', uid);
        const walletDoc = await getDoc(walletDocRef);
    
        if (walletDoc.exists()) {
          // Parse the balance for comparison
          const walletData = walletDoc.data();
          const balance = parseInt(walletData?.balance || '0');
    
          if (balance >= rent) {
            // Balance is greater than or equal to rent, proceed with payment
            await SecureStore.setItemAsync('rent', rent.toString());
            await SecureStore.setItemAsync('nextDueDate', rentData?.nextDueDate || '');
            router.push('../tabs/Profile/Wallet/Payment/paymentReview');
          } else {
            // Insufficient balance
            Alert.alert('Error', `Insufficient balance. Top-up first. \nBalance: ${balance}\nAmount Due: ${rent}`);
          }
        } else {
          // Wallet does not exist
          Alert.alert('Error', 'Insufficient balance. Top-up first.');
        }
      }
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      Alert.alert('Error', 'An error occurred while processing the payment. Please try again.');
    }
  };
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactionData();
    await loadWalletTransactions();
    await fetchLeaseData();
    await fetchRentData(); 
    setRefreshing(false);
  };
  
  const formattedDate = (
    input: { seconds: number; nanoseconds: number },
    id: string
  ) => {
    if (!input) {
      console.error("Invalid input provided.");
      return { remainingHours: 0 };
    }
  
    // Convert Firestore timestamp to milliseconds
    const timestampMs = input.seconds * 1000 + input.nanoseconds / 1e6;
    console.log("Original Timestamp in ms:", timestampMs);
    console.log("Readable Timestamp:", new Date(timestampMs).toString());
  
    // Add 1 day (24 hours) to the timestamp
    const timestampPlusOneDayMs = timestampMs + 24 * 60 * 60 * 1000;
    console.log("Timestamp + 1 day in ms:", timestampPlusOneDayMs);
    console.log("Readable +1 Day:", new Date(timestampPlusOneDayMs).toString());
  
    // Get the current time in milliseconds
    const currentTimeMs = Date.now();
    console.log("Current Time in ms:", currentTimeMs);
    console.log("Readable Current Time:", new Date(currentTimeMs).toString());
  
    // Compare the times
    if (currentTimeMs > timestampPlusOneDayMs) {
      console.log("The timestamp + 1 day has already passed.");
      // Call removeContract if the time has passed
      removeContract(id);
    } else {
      // Calculate remaining hours
      const remainingHours = Math.round(
        (timestampPlusOneDayMs - currentTimeMs) / (1000 * 60 * 60)
      );
      console.log(`Remaining hours until timestamp + 1 day: ${remainingHours}`);
      return { remainingHours };
    }
  
    return { remainingHours: 0 };
  };
  
  

  const removeContract = async (id: string) => {
    if (!id) {
      console.error("Invalid contract ID");
      return;
    }
  
    try {
      // Split the ID into parts: ownerId, propertyId, tenantId
      const [ownerId, propertyId, tenantId] = id.split("-");
      if (!ownerId || !propertyId || !tenantId) {
        console.error("Invalid contract ID structure");
        return;
      }
  
      console.log("Owner ID:", ownerId);
      console.log("Property ID:", propertyId);
      console.log("Tenant ID:", tenantId);
  
      // Update the property status to 'Available'
      const propertyRef = doc(db, "properties", ownerId, "propertyId", propertyId);
      await updateDoc(propertyRef, { status: "Available" });
  
      console.log(`Property ${propertyId} status updated to 'Available'.`);
  
      // Delete the rent transaction
      const rentTransactionRef = doc(db, "rentTransactions", id);
      await deleteDoc(rentTransactionRef);
  
      console.log(`Rent transaction ${id} deleted.`);
  
      // Delete the property transaction
      const propertyTransactionRef = doc(db, "propertyTransactions", id);
      await deleteDoc(propertyTransactionRef);
  
      console.log(`Property transaction ${id} deleted.`);
  
      // Delete the contract
      const contractRef = doc(db, "contracts", id);
      await deleteDoc(contractRef);
  
      console.log(`Contract ${id} deleted.`);
    } catch (error) {
      console.error("Error removing contract:", error);
    }
  };
  
  
  
  return (
    <View className="px-8 bg-[#F6F6F6] h-screen">
<ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              className="h-5/6"
              contentContainerStyle={{ flexGrow: 1 }}
            >
      {totalLeaseData > 0 ? (
        // Multiple Leases View
        <View className="w-full">
          {isLeaseVisible && <Text className="text-2xl font-bold my-5">My Lease</Text>}
  
          {/* Lease Listing */}
          <View className=" flex-col items-center ">
          <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              className="h-5/6"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View className='flex flex-col mb-20 flex-wrap space-y-4'>
                {loading ? (
                  <View className="flex-1 w-full h-full justify-center items-center">
                    <ActivityIndicator size="large" color="gray" />
                  </View>
                ) : isLeaseVisible && multipleLeases.length > 0 ? (
                multipleLeases.map((multipleLease) => (
                  <TouchableOpacity
                    className="py-1.5 px-2 flex w-full items-center justify-center bg-white rounded-xl shadow-xl border border-gray-200"
                    key={multipleLease.id}
                    onPress={() => onLeaseClick(multipleLease.id)}
                  >
                    <View className="w-full p-1 flex-row items-center">
                      <Image
                        className="w-[100px] h-[100px] object-cover rounded-2xl"
                        source={
                          multipleLease
                            ? { uri: multipleLease.image }
                            : require('../../../assets/images/property1.png')
                        }
                      />
                      <View className="flex-col gap-1 px-2">
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {multipleLease.propertyName}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {multipleLease.city}, {multipleLease.region}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          ₱{parseInt(multipleLease.propertyMonthlyRent).toLocaleString()}/monthly
                        </Text>
                        {multipleLease.propertyStatus === 'Rented' ? (
                        <View className='flex-row items-center space-x-1'>
                          <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {multipleLease.propertyStatus === 'Rented' ? "Application Status:" : "Renewal Status:"} 
                          </Text>
                          <Text
                          className="w-2.5 h-2.5 rounded-full bg-[#0FA958]"
                          ></Text>
                          <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold text-[#0FA958]">
                            Approved
                          </Text>
                        </View>
                        ) : (
                          <View>
                            <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                              Lease Start: {formatDate(multipleLease.date)}
                            </Text>
                            <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                              Lease End: {multipleLease.endDate === 'no date' ? 'Invalid Date' : formatDate(multipleLease.endDate)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {(multipleLease.propertyStatus === 'Rented') ?  (
                            <View className='border-t border-gray-400 py-1.5 mt-2'>
                              <Text className='text-[10px]'><Text className='text-[#0FA958] font-bold'>Congratulations!</Text> Your application is approved. Please sign the contract and complete the downpayment and advance payment within <Text className='text-[#EF5A6F] font-bold'>{formattedDate(multipleLease.createdAt, multipleLease.id).remainingHours} hours</Text> to secure your lease</Text>
                            </View>
                        ) : multipleLease.propertyStatus === 'Renewal' ? (
                            <View className='border-t border-gray-400 py-1.5 mt-2'>
                              <Text className='text-[10px]'><Text className='text-[#0FA958] font-bold'>Congratulations!</Text> Your application is approved. Please sign the contract and complete the downpayment and advance payment within <Text className='text-[#EF5A6F] font-bold'>7 days</Text> to secure your lease</Text>
                            </View>
                        ) : null }
                  </TouchableOpacity>
                ))
              ) : null}
              </View>
            </ScrollView>
  
            {selectedLeaseId && !isLeaseVisible && (
              <>
                <View className="px-3">
                  <View className="flex-row w-full items-center justify-between mt-5 mb-5">
                    <Text className="text-2xl font-bold">My Lease</Text>
                    <TouchableOpacity onPress={handleBackToLeaseListing}>
                      <Ionicons name="return-up-forward" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
  
                  {/* Toggle Buttons */}
                  <View className="flex flex-row justify-between mb-4 space-x-2">
                    <TouchableOpacity
                      className={`flex-1 py-2 rounded-md ${
                        activeTab === 'rent' ? 'bg-[#D9534F]' : 'bg-white'
                      }`}
                      onPress={() => setActiveTab('rent')}
                    >
                      <Text className={`text-center font-semibold ${activeTab === 'rent' ? 'text-white' : 'text-gray-400'}`}>
                        My Rent
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-2 rounded-md ${
                        activeTab === 'contract' ? 'bg-[#D9534F]' : 'bg-white'
                      }`}
                      onPress={() => setActiveTab('contract')}
                    >
                      <Text className={`text-center font-semibold ${activeTab === 'contract' ? 'text-white' : 'text-gray-400'}`}>
                        My Contract
                      </Text>
                    </TouchableOpacity>
                  </View>
  
                  {/* Rent Section */}
                  {activeTab === 'rent' && (
                <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                 className='h-full pb-20 space-y-2'
                >
                  <TouchableOpacity className='w-full items-end' onPress={async () => {
                    router.push('../tabs/MyLease/paymentHistorySchedule')
                    await SecureStore.setItemAsync('paymentTransactionId', rentData ? rentData.transactionId : '')
                    }}>
                    <Text className='text-xs text-[#D9534F]'>Payment History & Schedule</Text>
                  </TouchableOpacity>
                  <View className="flex-col  rounded-lg mb-4">
                    
                  {rentData?.paymentDuration !== '0' && (
                      <View className="flex-col items-center bg-white pb-4 rounded-xl shadow-xl">
                        <View className="px-4 flex-row items-center">
                          <View className="flex-col w-1/2">
                            <Text className="text-sm font-bold">My Rent</Text>
                            {/* Conditional Rendering Based on Lease Status */}
                            {rentData?.propertyStatus !== 'Rented' ? (
                              <Text className="text-gray-500 text-left text-[10px]">
                                Settle all payments and deposits within
                                <Text className="text-[#D9534F] font-bold"> 24 hours </Text>
                                to avoid losing the property.
                              </Text>
                            ) : (
                              <>
                                <Text className="text-gray-500 text-xs">Your bill is due on</Text>
                                <Text className="text-[#D9534F] text-xs">{rentData?.nextDueDate}</Text>
                              </>
                            )}
                          </View>
                          <View className="w-1/2 flex flex-col pr-4 mt-4 items-end">
                            <Text className="text-xs">Total amount to pay</Text>
                            <Text className="text-sm">
                              ₱ {parseInt(rentData ? rentData?.propertyRentAmount : '0').toLocaleString()}.00
                            </Text>
                            <TouchableOpacity
                              className="bg-[#D9534F] mt-2 py-1 px-3.5 rounded-md"
                              onPress={async () => await handlePayment()}
                            >
                              <Text className="text-white text-center font-semibold">Pay Now</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View className="w-full">
                          <TouchableOpacity onPress={toggleDetails} className="flex flex-row items-center px-6">
                            <Text className="text-start text-xs">View Details </Text>
                            <Feather name={isDetailsVisible ? 'chevron-up' : 'chevron-down'} size={16} />
                          </TouchableOpacity>
                          {isDetailsVisible && (
                            <View className="px-4 py-2">
                              <View className="border-t-0.5 space-y-1">
                                <Text className="text-xs font-bold py-2">Billing Summary</Text>
                                <View className="flex-row items-center justify-between">
                                  <Text className="text-xs">Advance Payment:</Text>
                                  <Text className="text-xs">
                                    {(
                                      (rentData?.propertyLeaseDuration === 'Long-term (1 year)' && rentData?.paymentDuration == '12') ||
                                      (rentData?.propertyLeaseDuration === 'Short-term (6 months)' && rentData?.paymentDuration == '6')
                                    )
                                      ? parseInt(rentData.propertyAdvancePaymentAmount).toLocaleString()
                                      : '0'}
                                  </Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                  <Text className="text-xs">Security Deposit:</Text>
                                  <Text className="text-xs">
                                    {(
                                      (rentData?.propertyLeaseDuration === 'Long-term (1 year)' && rentData?.paymentDuration == '12') ||
                                      (rentData?.propertyLeaseDuration === 'Short-term (6 months)' && rentData?.paymentDuration == '6')
                                    )
                                      ? parseInt(rentData.propertySecurityDepositAmount).toLocaleString()
                                      : '0'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

          
                  {/* Transaction History */}
                  {selectedLeaseData && transactionData?.length > 0 && (
                    <ScrollView showsVerticalScrollIndicator={false} className="h-[300px] w-full pb-20 space-y-2">
                      <View className="mb-4 gap-2">
                        <Text className="text-xl font-semibold mb-2">Transaction</Text>
                        {transactionData
                          .filter(
                            (transaction) =>
                              transaction.transactionType === 'Payment' &&
                              transaction.paymentTransactionId === selectedLeaseData.transactionId
                          )
                          .map((transaction) => (
                            <View
                              key={`${transaction.uid}-${transaction.transactionId}`}
                              className="flex flex-col px-2 p-3 rounded-xl shadow-xl bg-white border-gray-100"
                            >
                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-bold">{transaction.transactionType}</Text>
                                <Text className="text-green-500 text-xs font-bold">
                                  ₱{parseInt(transaction.value.toFixed(2)).toLocaleString()}
                                </Text>
                              </View>
                              <Text className="text-gray-400 text-xs">{transaction.dateTime}</Text>
                            </View>
                          ))}
                      </View>
                    </ScrollView>
                  )}
                </ScrollView>
              )}
  
                  {/* Contract Section */}
                  {activeTab === 'contract' && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {/* Contract Details */}
                      {selectedLeaseData ? (
                      <View className="rounded-lg">
                        {/* Profile */}
                        <TouchableOpacity className="p-3 mb-2 rounded-xl bg-white" onPress={async () => {
                          router.push('./LeaseProperty/OwnerProfile')
                          await SecureStore.setItemAsync('userId', selectedLeaseData.ownerId);
                          }}>
                          <View className="flex flex-row items-center gap-2 border-gray-200">
                            <Image
                              className="w-[40px] h-[40px] rounded-xl"
                              source={selectedLeaseData ? { uri: selectedLeaseData.ownerImage } : require('../../../assets/images/profile.png')}
                            />
                            <View className="flex flex-col flex-1">
                              <View className="flex flex-row items-center justify-between">
                                <Text className="text-sm font-semibold" numberOfLines={1} ellipsizeMode="tail">
                                  {selectedLeaseData?.ownerFullName}
                                </Text>
                                <View className="flex flex-row gap-2">
                                  <TouchableOpacity onPress={async () => {
                                    await SecureStore.setItemAsync('messageRecipientId', selectedLeaseData?.ownerId);
                                    router.push('./Message/msgDetails')

                                    }}>
                                    <MaterialIcons name="message" size={15} color="gray" />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={handlePhoneCall}>
                                    <FontAwesome6 name="phone" size={13} color="gray" />
                                  </TouchableOpacity>
                                </View>
                              </View>
                              {/* Account ID and Copy Icon */}
                              <View className="flex flex-row items-center">
                                <Text className="text-gray-500 text-xs">{selectedLeaseData?.ownerRole}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
            
                        {/* Property Details */}
                        <View className="pt-2">
                          <Image
                            className="w-full h-[140px] rounded-xl"
                            source={selectedLeaseData ? { uri: selectedLeaseData.propertyImage } : require('../../../assets/images/property1.png')}
                          />
                        </View>
                        <View className="pt-2 flex flex-col space-y-2">
                          <View className="flex flex-row items-center justify-between">
                            <Text className="text-xl font-bold">{selectedLeaseData?.propertyName}</Text>
                            <View className="flex flex-row items-center px-3 py-1 rounded-full border">
                              <TouchableOpacity
                                onPress={async () => {
                                  if (selectedLeaseData) {
                                    await SecureStore.setItemAsync('propertyId', selectedLeaseData.propertyId);
                                    await SecureStore.setItemAsync('userId', selectedLeaseData.ownerId);
                                    router.push('../tabs/LeaseProperty/PropertyDetails');
                                  } else {
                                    console.log('Lease data is not available');
                                  }
                                }}
                              >
                                <Text className="text-xs font-semibold">View Lease</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="flex flex-row items-center">
                            <Feather name="map-pin" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">
                              {selectedLeaseData?.propertyCity}, {selectedLeaseData?.propertyRegion}
                            </Text>
                          </View>
                          <View className="flex flex-row items-center">
                            <Ionicons name="pricetags" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">₱ {parseInt(selectedLeaseData?.propertyPrice).toLocaleString()} / Month</Text>
                          </View>
                          <View className="flex flex-row items-center">
                            <Ionicons name="pricetags" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">₱ {parseInt(selectedLeaseData?.propertyPrice).toLocaleString()} / Month</Text>
                          </View>
                          <View className="flex flex-row items-center">
                            <Ionicons name="pricetags" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">
                            {new Date(
                            new Date(selectedLeaseData?.rentalStartDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'))
                              .setDate(new Date(selectedLeaseData?.rentalStartDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')).getDate() + 1)
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                                                    -{" "}
                                                    {new Date(
                            new Date(selectedLeaseData?.rentalEndDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'))
                              .setDate(new Date(selectedLeaseData?.rentalEndDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')).getDate() + 1)
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          </Text>

                          </View>
                          <View className="flex flex-row items-center">
                            <Ionicons name="pricetags" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">
                              Deposit Amount: ₱ {parseInt(selectedLeaseData?.propertySecurityDepositAmount).toLocaleString()}.00
                            </Text>
                          </View>
                          <View className="flex flex-row items-center">
                            <Ionicons name="pricetags" size={15} color="black" />
                            <Text className="pl-3 text-xs font-normal">
                              Advance Payment Amount: ₱ {parseInt(rentData? rentData.propertyAdvancePaymentAmount : '0').toLocaleString()}.00
                            </Text>
                          </View>
                        </View>
            
                        <View className="w-full flex-row pt-6 justify-between space-x-2 px-2">
                          <TouchableOpacity
                            className="flex-row items-center justify-center w-1/2 py-1 rounded-full border"
                            onPress={async () => {
                              if (selectedLeaseData) {
                                await SecureStore.setItemAsync('propertyId', selectedLeaseData.propertyId);
                                console.log(selectedLeaseData.propertyId);
                                await SecureStore.setItemAsync('userId', selectedLeaseData.ownerId);
                                router.push('../tabs/MaintenanceRequest')
                              } else {
                                console.log('Lease data is not available');
                              }
                            }}
                          >
                            <Text className="text-xs text-center font-bold">Maintenance Request</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="flex-row items-center justify-center w-1/2 py-2 rounded-full bg-[#D9534F]"
                            onPress={async () => {
                              router.push('../tabs/MyLease/ViewContract')
                              if(rentData){
                                await SecureStore.setItemAsync('contractId', rentData.transactionId);
                              }}}
                            >
                            <Text className="text-xs text-center font-bold text-white">Contract</Text>
                          </TouchableOpacity>
                          
                        </View>
                        <TouchableOpacity className='py-4 flex-row item-center justify-center '
                        onPress={() => router.push('../tabs/Reports/ReportProfile/reportProfile')}>
                          <MaterialIcons name="report" size={20} color="#D9534F" />
                          <Text className='text-center text-xs text-[#D9534F]'>Report the owner</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text className="text-center mt-4 text-gray-500">
                        It looks like you haven't rented any property. Browse available listings and find your new place!
                      </Text>
                    )}
                    </ScrollView>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              className="h-5/6"
              contentContainerStyle={{ flexGrow: 1 }}
            >
        <View className="px-2 ">
          <View className="flex-row w-full items-center justify-between my-5">
            <Text className="text-2xl font-bold">My Lease</Text>
          </View>
          <Text className="text-center mt-4 text-gray-500">
            It looks like you haven't rented any property. Browse available listings and find your new place!
          </Text>
        </View>
        </ScrollView>
      )}
      </ScrollView>
    </View>
  );
}  