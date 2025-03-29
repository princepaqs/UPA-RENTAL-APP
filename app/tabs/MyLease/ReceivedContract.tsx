import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
//import contractData from './contractData.json'; 
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';

interface Contract {
  createdAt: Timestamp;
  transactionId: string;
  ownerId: string;
  propertyId: string;
  tenantId: string;
  ownerFullName: string;
  ownerFullAddress: string;
  ownerContact: string;
  ownerEmail: string;
  tenantFullName: string;
  tenantFullAddress: string;
  tenantContact: string;
  tenantEmail: string;
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
  status: string;
}

export default function ReceivedContract() {
  const router = useRouter();
  const Fullname = useRef("");
  const { sendNotification } = useAuth();
  const [contractData, setContractData] = useState<Contract | null>(null);

  const handleNext = () => {
    
    if (!Fullname.current) {
      Alert.alert('Contract', "Please enter your fullname!");
      return;
    }
    else if(contractData?.tenantFullName !== Fullname.current){
      Alert.alert('Contract', "Please enter your correct fullname!");
      return;
    }else{
      router.replace('./payDepositeAdvance');
      SecureStore.setItemAsync('rent', contractData.propertyRentAmount);
      sendNotification(contractData?.tenantId, 'approval', 'Contract Successfully Signed', `Your lease contract has been successfully signed. Your lease is now secured, and you can now view and review the contract details.`, 'Success', 'Unread')
      sendNotification(contractData?.ownerId, 'approval', 'Lease Contract Signed', `The lease contract for ${contractData.propertyName} has been successfully signed by ${contractData.tenantFullName}. The lease is now secured.`, 'Success', 'Unread')
    }
  }

  useEffect(() => {
    const getContract = async () => {
      const contractId = await SecureStore.getItemAsync('contractId');
      console.log(contractId);
      if(contractId){
        const contractRef = await getDoc(doc(db, 'contracts', contractId));
        if(contractRef.exists()){
          const data = contractRef.data();
          if(data){

            setContractData({
              transactionId: data.transacionId,
              ownerId: data.ownerId,
              propertyId: data.propertyId,
              tenantId: data.tenantId,
              ownerFullName: data.ownerFullName,
              ownerFullAddress: data.ownerFullAddress,
              ownerContact: data.ownerContact,
              ownerEmail: data.ownerEmail,
              tenantFullName: data.tenantFullName,
              tenantFullAddress: data.tenantFullAddress,
              tenantContact: data.tenantContact,
              tenantEmail: data.tenantEmail,
              propertyName: data.propertyName,
              propertyType: data.propertyType,
              propertyAddress: data.propertyAddress,
              propertyLeaseStart: data.propertyLeaseStart,
              propertyLeaseEnd: data.propertyLeaseEnd,
              propertyLeaseDuration: data.propertyLeaseDuration,
              propertyRentAmount: data.propertyRentAmount,
              propertyRentDueDay: data.propertyRentDueDay,
              propertySecurityDepositAmount: data.propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
              propertyHouseRules: data.propertyHouseRules,
              propertyTerminationPeriod: data.propertyTerminationPeriod,
              status: 'Pending',  // Optionally, add a status for the contract
              createdAt: data.createdAt
            })
          }
        }
      }
    }

    getContract();
  },[])


  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-20 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Sign Agreement & Secure Your Lease</Text>
          </View>
        </View>

        <View className='flex-row py-3 items-center justify-center space-x-8 bg-[#D9D9D9] '>
          <View className='flex-col items-center'>
            <Text className='px-2 py-0.5 bg-[#EF5A6F] text-white rounded-full font-bold text-sm '>1</Text>
            <Text className='font-bold text-xs '>STEP 1</Text>
            <Text className='text-xs '>Sign contract</Text>
          </View>
          <View className='flex-col items-center'>
            <Text className='px-2 py-0.5 bg-[#828282] text-white rounded-full font-bold text-sm '>2</Text>
            <Text className='font-bold text-xs '>STEP 2</Text>
            <Text className='text-xs '>Make Payment</Text>
          </View>
          <View className='flex-col items-center'>
            <Text className='px-2 py-0.5 bg-[#828282] text-white rounded-full font-bold text-sm '>2</Text>
            <Text className='font-bold text-xs '>STEP 3</Text>
            <Text className='text-xs '>Lease Confirmed</Text>
          </View>
        </View>

        {/* Contract Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-4 px-8 mb-5">

            <View>
              <Text className="text-sm mb-4">
                Read through the agreement to confirm all details. Sign the contract by typing your full name in the designated field.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-bold mb-1">PROPERTY RENTAL AGREEMENT</Text>
              <Text className="text-sm mb-4">
                This Rental Agreement (the "Agreement") is made and entered into as of{' '}
                <Text className="text-sm font-bold">
                  {contractData?.createdAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', // Full month name
                    day: '2-digit',
                  })}
                </Text>, by and between:
              </Text>
            </View>

            <View className='mb-4'>
              <Text className="text-sm font-bold mb-1">Landlord</Text>
              <Text className="text-sm mb-0.5">Name: {contractData?.ownerFullName}</Text>
              <Text className="text-sm mb-0.5">Address: {contractData?.ownerFullAddress}</Text>
              <Text className="text-sm mb-0.5">Contact Number: {contractData?.ownerContact}</Text>
              <Text className="text-sm mb-0.5">Email: {contractData?.ownerEmail}</Text>
            </View>

            <View className='mb-4'>
              <Text className="text-sm font-bold mb-1">Tenant</Text>
              <Text className="text-sm mb-0.5">Name: {contractData?.tenantFullName}</Text>
              <Text className="text-sm mb-0.5">Address: {contractData?.tenantFullAddress}</Text>
              <Text className="text-sm mb-0.5">Contact Number: {contractData?.tenantContact}</Text>
              <Text className="text-sm mb-0.5">Email: {contractData?.tenantEmail}</Text>
            </View>

            <Text className="text-sm font-bold mb-1">Property Address</Text>
            <Text className="text-sm mb-0.5">{contractData?.propertyAddress}</Text>
            <Text className="text-sm mb-0.5">{contractData?.propertyName}</Text>

          {/* Term of Lease */}
          <Text className="text-sm font-bold mt-4 mb-1">1. TERM OF LEASE</Text>
          <Text className="text-sm mb-1">
            The term of this lease shall commence on <Text className='text-sm font-bold'>{contractData?.propertyLeaseStart}</Text> and shall terminate on <Text className='text-sm font-bold'>{contractData?.propertyLeaseEnd}</Text>, unless terminated earlier in accordance with this Agreement.
          </Text>

          {/* Rent */}
          <Text className="text-sm font-bold mt-4 mb-1">2. RENT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay the Landlord a monthly rent of <Text className='text-sm font-bold'>{contractData?.propertyRentAmount}</Text> due on the <Text className='text-sm font-bold'>{contractData?.propertyRentDueDay}</Text> of each month. Rent shall be payable via the wallet feature in the UPA application.
          </Text>

          {/* Security Deposit */}
          <Text className="text-sm font-bold mt-4 mb-1">3. SECURITY DEPOSIT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay a security deposit of <Text className='text-sm font-bold'>{contractData?.propertySecurityDepositAmount}</Text> prior to moving in. This deposit will be held by the Landlord and may be used for any damages beyond normal wear and tear. The deposit will be refunded to the Tenant within <Text className='text-sm font-bold'>{contractData?.propertySecurityDepositRefundPeriod}</Text> days after the end of the lease term, subject to any deductions for damages or unpaid rent.
          </Text>

          {/* Late Payment */}
          <Text className="text-sm font-bold mt-4 mb-1">4. ADVANCE PAYMENT</Text>
          <Text className="text-sm mb-1">
            The Tenant agrees to pay an advance rental payment of <Text className='text-sm font-bold'>{contractData?.propertyAdvancePaymentAmount}</Text> (equivalent to one month's rent), which will be applied to the first month’s rent. This amount is due prior to the commencement of the lease term and will be payable through the wallet feature in the UPA application.
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
           <Text className='text-sm font-bold'>{contractData?.propertyHouseRules}</Text> 
          </Text>

          {/* Termination */}
          <Text className="text-sm font-bold mt-4 mb-1">8. TERMINATION</Text>
          <Text className="text-sm mb-1">
            Either party may terminate this Agreement with written notice of <Text className='text-sm font-bold'>{contractData?.propertyTerminationPeriod}</Text>  days prior to the intended termination date.
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

          <View>
          <Text className="text-sm mt-4">
            Landlord Signature : {contractData?.ownerFullName}
          </Text>
          <Text className="text-sm mb-1">
            Date : {contractData?.createdAt.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long', // Full month name
              day: '2-digit',
            })}
          </Text>
          </View>

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
          <TouchableOpacity className="bg-[#333333] w-2/5 py-2.5 px-4 rounded-xl" onPress={() => router.back()}>
            <Text className="text-center text-xs text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#EF5A6F] w-2/5 py-2.5 px-2 rounded-xl"
            onPress={handleNext}>
            <Text className="text-center text-xs text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
        </View>
        </ScrollView>

        
      </View>
    </View>
  );
}
