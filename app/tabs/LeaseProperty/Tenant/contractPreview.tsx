import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import contractData from './contractData.json'; 
import { setItemAsync } from 'expo-secure-store';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import { useAuth } from '@/context/authContext';
import * as SecureStore from 'expo-secure-store';

interface Transaction {
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
}

interface Owner {
  ownerId: string;
  ownerFullName: string;
  ownerFullAddress: string;
  ownerContact: string;
  ownerEmail: string;
}

interface Tenant {
  tenantId: string;
  tenantFullName: string;
  tenantFullAddress: string;
  tenantContact: string;
  tenantEmail: string;
}

interface Property {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyLeaseDuration: string;
  propertyRentAmount: string;
  propertyRentDueDay: string;
  propertySecurityDepositAmount: string;
  propertySecurityDepositRefundPeriod: string;
  propertyAdvancePaymentAmount: string;
  propertyHouseRules: string;
  propertyTerminationPeriod: string;
}

export default function ContractPreview() {
  const router = useRouter();
  const { approveTenant, sendNotification } = useAuth();
  const Fullname = useRef("");
  const [transactionData, setTransactionData] = useState<Transaction | null>(null);
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [propertyData, setPropertyData] = useState<Property | null>(null);

  const formatDate = () => {
    const date = new Date(); // Just use `new Date()` to get the current date
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };


  const handleSendContract = () => {
    
    if (!Fullname.current) {
      Alert.alert('Contract', "Please enter your fullname!");
      return;
    }
    else if(Fullname.current == tenantData?.tenantFullName || Fullname.current == ownerData?.ownerFullName){
      console.log("success!");
      approveTenant(
          transactionData?.transactionId!,
          transactionData?.ownerId!,
          transactionData?.propertyId!,
          transactionData?.tenantId!,
          ownerData?.ownerFullName!,
          ownerData?.ownerFullAddress!,
          ownerData?.ownerContact!,
          ownerData?.ownerEmail!,
          tenantData?.tenantFullName!,
          tenantData?.tenantFullAddress!,
          tenantData?.tenantContact!,
          tenantData?.tenantEmail!,
          propertyData?.propertyName!,
          propertyData?.propertyType!,
          propertyData?.propertyAddress!,
          propertyData?.propertyLeaseStart!,
          propertyData?.propertyLeaseEnd!,
          propertyData?.propertyLeaseDuration!,
          propertyData?.propertyRentAmount!,
          propertyData?.propertyRentDueDay!,
          propertyData?.propertySecurityDepositAmount!,
          propertyData?.propertySecurityDepositRefundPeriod!,
          propertyData?.propertyAdvancePaymentAmount!,
          propertyData?.propertyHouseRules!,
          propertyData?.propertyTerminationPeriod!,
      );
      router.replace('./contractSuccess')

      sendNotification(transactionData? transactionData.tenantId : '', 'approval', 'Application Approved', 'Congratulations! Your application has been approved', 'Success', 'Unread');
    }else{
      Alert.alert('Contract', "Please enter your correct fullname!");
      return;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const transactionId = await SecureStore.getItemAsync('transactionId');
      console.log('transactionId', transactionId);
  
      if (transactionId) {
        const transactionRef = await getDoc(doc(db, 'propertyTransactions', transactionId));
  
        if (transactionRef.exists()) {
          const data = transactionRef.data();
  
          if (data) {
            setTransactionData({
              transactionId: data.transactionId,
              ownerId: data.ownerId,
              propertyId: data.propertyId,
              tenantId: data.tenantId,
            });
          }
        } else {
          console.log('Error on fetching data');
        }
      }
    };
  
    fetchData();
  }, []); // Run on initial mount
  
  // Fetch owner data once transactionData is set
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (transactionData?.ownerId) {
        const userRef = await getDoc(doc(db, 'users', transactionData.ownerId));
  
        if (userRef.exists()) {
          const data = userRef.data();
          if (data) {
            setOwnerData({
              ownerId: transactionData.ownerId,
              ownerFullName: `${data.firstName} ${data.middleName} ${data.lastName}`,
              ownerFullAddress: `${data.homeAddress}, ${data.barangay}, ${data.city}, ${data.region}`,
              ownerContact: data.phoneNo,
              ownerEmail: data.email,
            });
          }
        }
      }
    };
  
    fetchOwnerData();
  }, [transactionData?.ownerId]); // Run when ownerId is updated
  
  // Fetch tenant data once transactionData is set
  useEffect(() => {
    const fetchTenantData = async () => {
      if (transactionData?.tenantId) {
        const userRef = await getDoc(doc(db, 'users', transactionData.tenantId));
  
        if (userRef.exists()) {
          const data = userRef.data();
          if (data) {
            setTenantData({
              tenantId: transactionData.tenantId,
              tenantFullName: `${data.firstName} ${data.middleName} ${data.lastName}`,
              tenantFullAddress: `${data.homeAddress}, ${data.barangay}, ${data.city}, ${data.region}`,
              tenantContact: data.phoneNo,
              tenantEmail: data.email,
            });
          }
        }
      }
    };
  
    fetchTenantData();
  }, [transactionData?.tenantId]); // Run when tenantId is updated
  
  // Fetch property data once transactionData is set
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (transactionData?.propertyId) {
        const propertyRef = await getDoc(
          doc(db, 'properties', transactionData.ownerId, 'propertyId', transactionData.propertyId)
        );
  
        if (propertyRef.exists()) {
          const data = propertyRef.data();
          const propertyLeaseStart = await SecureStore.getItemAsync('propertyLeaseStart');
          const propertyLeaseEnd = await SecureStore.getItemAsync('propertyLeaseEnd');
          const propertyRentAmount = await SecureStore.getItemAsync('propertyRentAmount');
          const propertyRentDueDay = await SecureStore.getItemAsync('propertyRentDueDay');
          const propertySecurityDepositRefundPeriod = await SecureStore.getItemAsync('propertySecurityDepositRefundPeriod');
          const propertyTerminationPeriod = await SecureStore.getItemAsync('propertyTerminationPeriod');
  
          if (data && propertyLeaseStart && propertyLeaseEnd && propertyRentAmount && propertyRentDueDay && propertySecurityDepositRefundPeriod && propertyTerminationPeriod) {
            setPropertyData({
              propertyId: transactionData.propertyId,
              propertyName: data.propertyName,
              propertyType: data.propertyType,
              propertyAddress: `${data.propertyHomeAddress}, ${data.propertyBarangay}, ${data.propertyCity}, ${data.propertyRegion}`,
              propertyLeaseStart: propertyLeaseStart,
              propertyLeaseEnd: propertyLeaseEnd,
              propertyLeaseDuration: data.propertyLeaseDuration,
              propertyRentAmount: propertyRentAmount,
              propertyRentDueDay: propertyRentDueDay,
              propertySecurityDepositAmount: data.propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod: propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
              propertyHouseRules: data.propertyHouseRules,
              propertyTerminationPeriod: propertyTerminationPeriod,
            });
          }
        }
      }
    };
  
    fetchPropertyData();
  }, [transactionData?.propertyId]); // Run when propertyId is updated
  


  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 px-2 mt-20 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Contract Preview</Text>
          </View>
        </View>

        {/* Contract Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-4 px-4 mb-5">
            <View>
              <Text className="text-sm font-bold mb-1">PROPERTY RENTAL AGREEMENT</Text>
              <Text className="text-sm mb-4">
                This Rental Agreement (the "Agreement") is made and entered into as of <Text className='text-sm font-bold'>{formatDate()}</Text>, by and between:
              </Text>
            </View>

            <View className='mb-4'>
              <Text className="text-sm font-bold mb-1">Landlord</Text>
              <Text className="text-sm mb-0.5">Name: {ownerData?.ownerFullName}</Text>
              <Text className="text-sm mb-0.5">Address: {ownerData?.ownerFullAddress}</Text>
              <Text className="text-sm mb-0.5">Contact Number: {ownerData?.ownerContact}</Text>
              <Text className="text-sm mb-0.5">Email: {ownerData?.ownerEmail}</Text>
            </View>

            <View className='mb-4'>
              <Text className="text-sm font-bold mb-1">Tenant</Text>
              <Text className="text-sm mb-0.5">Name: {tenantData?.tenantFullName}</Text>
              <Text className="text-sm mb-0.5">Address: {tenantData?.tenantFullAddress}</Text>
              <Text className="text-sm mb-0.5">Contact Number: {tenantData?.tenantContact}</Text>
              <Text className="text-sm mb-0.5">Email: {tenantData?.tenantEmail}</Text>
            </View>

            <Text className="text-sm font-bold mb-1">Property Address</Text>
            <Text className="text-sm mb-0.5">{propertyData?.propertyName}</Text>
            <Text className="text-sm mb-0.5">{propertyData?.propertyType}</Text>
            <Text className="text-sm mb-0.5">{propertyData?.propertyAddress}</Text>

          {/* Term of Lease */}
          <Text className="text-sm font-bold mt-4 mb-1">1. TERM OF LEASE</Text>
          <Text className="text-sm mb-1">
            The term of this lease shall commence on <Text className='text-sm font-bold'>{propertyData?.propertyLeaseStart}</Text> and shall terminate on <Text className='text-sm font-bold'>{propertyData?.propertyLeaseEnd}</Text>, unless terminated earlier in accordance with this Agreement.
          </Text>

          {/* Rent */}
          <Text className="text-sm font-bold mt-4 mb-1">2. RENT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay the Landlord a monthly rent of <Text className='text-sm font-bold'>₱ {parseInt(propertyData ? propertyData?.propertyRentAmount : '0').toLocaleString()}.00</Text> due on the <Text className='text-sm font-bold'>{propertyData?.propertyRentDueDay}</Text> of each month. Rent shall be payable via the wallet feature in the UPA application.
          </Text>

          {/* Security Deposit */}
          <Text className="text-sm font-bold mt-4 mb-1">3. SECURITY DEPOSIT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay a security deposit of <Text className='text-sm font-bold'>₱ {parseInt(propertyData ? propertyData.propertySecurityDepositAmount : '0').toLocaleString()}.00</Text> prior to moving in. This deposit will be held by the Landlord and may be used for any damages beyond normal wear and tear. The deposit will be refunded to the Tenant within <Text className='text-sm font-bold'>{propertyData ? propertyData.propertySecurityDepositRefundPeriod : '0'}</Text> days after the end of the lease term, subject to any deductions for damages or unpaid rent.
          </Text>

          {/* Late Payment */}
          <Text className="text-sm font-bold mt-4 mb-1">4. ADVANCE PAYMENT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay an advance rental payment of <Text className='text-sm font-bold'>₱ {parseInt(propertyData ? propertyData.propertyAdvancePaymentAmount : '0').toLocaleString()}.00</Text> (equivalent to one month's rent), which will be applied to the first month’s rent. This amount is due prior to the commencement of the lease term and will be payable through the wallet feature in the UPA application.
          </Text>

          {/* Utilities */}
          <Text className="text-sm font-bold mt-4 mb-1">5. UTILITIES</Text>
          <Text className="text-sm mb-1">
            The Tenant shall be responsible for the payment of all utilities, including but not limited to water, gas, electricity, and internet, unless otherwise agreed upon.
          </Text>

          {/* Maintenance and Repairs */}
          <Text className="text-sm font-bold mt-4 mb-1">6. MAINTENANCE AND REPAIRS</Text>
          <Text className="text-sm mb-1">
            The Tenant shall keep the premises clean and in good condition. Any maintenance or repairs required shall be reported to the Landlord in a timely manner.
          </Text>

          {/* House Rules */}
          <Text className="text-sm font-bold mt-4 mb-1">7. HOUSE RULES</Text>
          <Text className="text-sm mb-1">
           The Tenant agrees to adhere to the following house rules: {"\n"}
           <Text className='text-sm font-bold'>{propertyData?.propertyHouseRules}</Text> 
          </Text>

          {/* Termination */}
          <Text className="text-sm font-bold mt-4 mb-1">8. TERMINATION</Text>
          <Text className="text-sm mb-1">
            Either party may terminate this Agreement with written notice of <Text className='text-sm font-bold'>{propertyData?.propertyTerminationPeriod}</Text> days prior to the intended termination date.
          </Text>

          {/* Payment Method */}
          <Text className="text-sm font-bold mt-4 mb-1">9. PAYMENT METHOD</Text>
          <Text className="text-sm mb-1">
            All payments, including rent, security deposits, and advance payments, must be made through the wallet feature in the UPA application.
          </Text>

          {/* Data Privacy */}
          <Text className="text-sm font-bold mt-4 mb-1">10. DATA PRIVACY</Text>
          <Text className="text-sm mb-1">
            Both parties agree to comply with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. The Landlord shall handle the Tenant's personal information responsibly and shall only use it for purposes related to this Agreement. The Tenant has the right to access their personal data and request corrections if necessary. Any personal data collected will be protected and processed in accordance with applicable data privacy laws.
          </Text>

          {/* General Provisions */}
          <Text className="text-sm font-bold mt-4 mb-1">11. NOTE</Text>
          <Text className="text-sm mb-1">
            This contract is intended for use within the UPA application. For any additional agreements outside of this application, including notarized contracts, it is recommended to seek legal advice.
          </Text>

          {/* Signatures */}
          <Text className="text-sm font-bold mt-4 mb-1">12. SIGNATURES</Text>
          <Text className="text-sm mb-1">
            By signing below, both parties agree to the terms and conditions outlined in this Rental Agreement.

          </Text>

          <View className='mb-4'>
            <Text className="text-xs mt-4">Please enter your full name below to sign the contract</Text>
            <TextInput 
                onChangeText={value => Fullname.current = value}
              className=' my-2 px-4 bg-[#D9D9D9] rounded-md'
              placeholder='Enter your full name'
            />
            <Text className='text-xs mt-3'>By entering your name, you agree to the terms and conditions outlined in this Rental Agreement.</Text>
          </View>

          {/* Bottom Buttons */}
        <View className="flex-row items-center space-x-2 justify-end py-6">
          <TouchableOpacity className="bg-[#333333] w-2/5 py-2.5 px-4 rounded-xl">
            <Text className="text-center text-xs text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#508D4E] w-2/5 py-2.5 px-2 rounded-xl"
            onPress={handleSendContract}>
            <Text className="text-center text-xs text-white font-semibold">Send Contract</Text>
          </TouchableOpacity>
        </View>
        </View>
        </ScrollView>

        
      </View>
    </View>
  );
}
