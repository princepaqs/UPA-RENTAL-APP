import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
// import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing'; // Import Sharing to share the file
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
//import contractData from './contractData.json';
import setContractDetails from '../LeaseProperty/Tenant/setContractDetails';

interface Contract {
  createdAt: Timestamp;
  ownerId: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerFullAddress: string;
  ownerContact: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyAddress: string;
  propertyLeaseDuration: string;
  propertyLeaseStart: string;
  propertyLeaseEnd: string;
  propertyRentDueDay: string;
  propertyRentAmount: string;
  propertySecurityDepositRefundPeriod: string;
  propertySecurityDepositAmount: string;
  propertyAdvancePaymentAmount: string;
  propertyHouseRules: string;
  propertyTerminationPeriod: string;
  tenantId: string;
  tenantFullName: string;
  tenantEmail: string;
  tenantContact: string;
  tenantFullAddress: string;
  status: string;
}

export default function ReceivedContract() {
  const router = useRouter();
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [formatDate, setFormatDate] = useState<string>('');
  

  const handleDownload = async () => {
    // Define the file name and path
    const fileName = `Contract_${contractData?.propertyName}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;


    // Create a string from the contract data
    const contractText = `
PROPERTY RENTAL AGREEMENT
This Rental Agreement (the "Agreement") is made and entered into as of ${formatDate}, by and between:

Landlord
Name: ${contractData?.ownerFullName}
Address: ${contractData?.ownerFullAddress}
Contact Number: ${contractData?.ownerContact}
Email: ${contractData?.ownerEmail}

Tenant
Name: ${contractData?.tenantFullName}
Address: ${contractData?.tenantFullAddress}
Contact Number: ${contractData?.tenantContact}
Email: ${contractData?.tenantEmail}

Property Address
${contractData?.propertyName}
${contractData?.propertyAddress}
${contractData?.propertyType}

1. TERM OF LEASE
The term of this lease shall commence on ${contractData?.propertyLeaseStart} and shall terminate on ${contractData?.propertyLeaseEnd}, unless terminated earlier in accordance with this Agreement.

2. RENT
The Tenant agrees to pay the Landlord a monthly rent of ₱${parseInt(contractData?.propertyRentAmount || '0').toLocaleString()} due on the ${contractData?.propertyRentDueDay} of each month. Rent shall be payable via the wallet feature in the UPA application.

3. SECURITY DEPOSIT
The Tenant agrees to pay a security deposit of ₱${parseInt(contractData?.propertySecurityDepositAmount || '0').toLocaleString()} prior to moving in. This deposit will be held by the Landlord and may be used for any damages beyond normal wear and tear. The deposit will be refunded to the Tenant within ${contractData?.propertySecurityDepositRefundPeriod} days after the end of the lease term, subject to any deductions for damages or unpaid rent.

4. ADVANCE PAYMENT
The Tenant agrees to pay an advance rental payment of ₱${parseInt(contractData?.propertyAdvancePaymentAmount || '0').toLocaleString()} (equivalent to one month's rent), which will be applied to the first month’s rent. This amount is due prior to the commencement of the lease term and will be payable through the wallet feature in the UPA application.

5. UTILITIES
The Tenant shall be responsible for the payment of all utilities, including but not limited to water, gas, electricity, and internet, unless otherwise agreed upon.

6. MAINTENANCE AND REPAIRS
The Tenant shall keep the premises clean and in good condition. Any maintenance or repairs required shall be reported to the Landlord in a timely manner.

7. HOUSE RULES
The Tenant agrees to adhere to the following house rules: ${contractData?.propertyHouseRules}

8. TERMINATION
Either party may terminate this Agreement with written notice of ${contractData?.propertyTerminationPeriod} days prior to the intended termination date.

9. PAYMENT METHOD
All payments, including rent, security deposits, and advance payments, must be made through the wallet feature in the UPA application.

10. DATA PRIVACY
Both parties agree to comply with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines. The Landlord shall handle the Tenant's personal information responsibly and shall only use it for purposes related to this Agreement. The Tenant has the right to access their personal data and request corrections if necessary. Any personal data collected will be protected and processed in accordance with applicable data privacy laws.

11. NOTE
This contract is intended for use within the UPA application. For any additional agreements outside of this application, including notarized contracts, it is recommended to seek legal advice.

12. SIGNATURES
By signing below, both parties agree to the terms and conditions outlined in this Rental Agreement.

Landlord Signature: ${contractData?.ownerFullName}  
Date: ${formatDate}

Tenant Signature: ${contractData?.tenantFullName}  
Date: ${formatDate}
`;

    try {
      // Create the file
      await FileSystem.writeAsStringAsync(fileUri, contractText, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Optionally share the file using Expo's Sharing API
      await Sharing.shareAsync(fileUri);

      Alert.alert('Download Complete', `File saved to: ${fileUri}`);
      Alert.alert('Success', 'Contract downloaded successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download the contract.');
    }
  };

// const handleDownload = async () => {
//   const fileName = `Contract_${contractData?.propertyName}.pdf`;

//   // HTML Template for the PDF
//   const contractHTML = `
//     <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           h2 { text-align: center; }
//           p { margin: 5px 0; }
//           .section { margin-bottom: 2px; }
//           .signature { margin-top: 40px; }
//         </style>
//       </head>
//       <body>
//         <h2>PROPERTY RENTAL AGREEMENT</h2>
//         <p>This Rental Agreement (the "Agreement") is made and entered into as of ${formatDate}, by and between:</p>
        
//         <div class="section">
//           <h3>Landlord</h3>
//           <p><strong>Name:</strong> ${contractData?.ownerFullName}</p>
//           <p><strong>Address:</strong> ${contractData?.ownerFullAddress}</p>
//           <p><strong>Contact:</strong> ${contractData?.ownerContact}</p>
//           <p><strong>Email:</strong> ${contractData?.ownerEmail}</p>
//         </div>

//         <div class="section">
//           <h3>Tenant</h3>
//           <p><strong>Name:</strong> ${contractData?.tenantFullName}</p>
//           <p><strong>Address:</strong> ${contractData?.tenantFullAddress}</p>
//           <p><strong>Contact:</strong> ${contractData?.tenantContact}</p>
//           <p><strong>Email:</strong> ${contractData?.tenantEmail}</p>
//         </div>

//         <div class="section">
//           <h3>Property Details</h3>
//           <p><strong>Address:</strong> ${contractData?.propertyAddress}</p>
//           <p><strong>Type:</strong> ${contractData?.propertyType}</p>
//         </div>

//         <div class="section">
//           <h3>1. TERM OF LEASE</h3>
//           <p>The lease starts on <strong>${contractData?.propertyLeaseStart}</strong> and ends on <strong>${contractData?.propertyLeaseEnd}</strong>.</p>
//         </div>

//         <div class="section">
//           <h3>2. RENT</h3>
//           <p>The rent is ₱${parseInt(contractData?.propertyRentAmount || '0').toLocaleString()} due on the ${contractData?.propertyRentDueDay} of each month.</p>
//         </div>

//         <div class="section">
//           <h3>3. SECURITY DEPOSIT</h3>
//           <p>Amount: ₱${parseInt(contractData?.propertySecurityDepositAmount || '0').toLocaleString()}</p>
//           <p>Refundable within ${contractData?.propertySecurityDepositRefundPeriod} days after lease ends.</p>
//         </div>

//         <div class="section">
//           <h3>4. ADVANCE PAYMENT</h3>
//           <p>₱${parseInt(contractData?.propertyAdvancePaymentAmount || '0').toLocaleString()} (equivalent to one month's rent).</p>
//         </div>

//         <div class="section">
//           <h3>5. UTILITIES</h3>
//           <p>The tenant is responsible for utilities like water, gas, electricity, and internet.</p>
//         </div>

//         <div class="section">
//           <h3>6. MAINTENANCE AND REPAIRS</h3>
//           <p>Tenant must keep the premises clean and report maintenance issues.</p>
//         </div>

//         <div class="section" style="margin-top: 20px">
//           <h3>7. HOUSE RULES</h3>
//           <p>${contractData?.propertyHouseRules}</p>
//         </div>

//         <div class="section">
//           <h3>8. TERMINATION</h3>
//           <p>Either party may terminate with ${contractData?.propertyTerminationPeriod} days' notice.</p>
//         </div>

//         <div class="section">
//           <h3>9. PAYMENT METHOD</h3>
//           <p>All payments must be made through the UPA application.</p>
//         </div>

//         <div class="section">
//           <h3>10. DATA PRIVACY</h3>
//           <p>Both parties agreed to comply with the Data Privacy Act of 2012.</p>
//         </div>

//         <div class="section">
//           <h3>11. SIGNATURES</h3>
//           <p>Landlord Signature: <strong>${contractData?.ownerFullName}</strong></p>
//           <p>Date: ${formatDate}</p>
//           <p>Tenant Signature: <strong>${contractData?.tenantFullName}</strong></p>
//           <p>Date: ${formatDate}</p>
//         </div>
//       </body>
//     </html>
//   `;

//   try {
//     // Generate the PDF
//     const { uri } = await Print.printToFileAsync({ html: contractHTML, base64: false });

//     // Save or Share the PDF
//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Contract PDF' });
//     }

//     Alert.alert('Success', 'Contract PDF generated and ready to share!');
//   } catch (error) {
//     console.error(error);
//     Alert.alert('Error', 'Failed to generate the contract PDF.');
//   }
// };

  useEffect(() => {
    const fetchContract = async () => {
      const contractId = await SecureStore.getItemAsync('contractId');
      if(contractId){
        const contractRef = await getDoc(doc(db, 'contracts', contractId))
        if(contractRef.exists()){
          const data = contractRef.data();
          if(data){
            setContractData({
              createdAt: data.createdAt,
              ownerId: data.ownerId,
              ownerFullName: data.ownerFullName,
              ownerEmail: data.ownerEmail,
              ownerFullAddress: data.ownerFullAddress,
              ownerContact: data.ownerContact,
              propertyId: data.propertyId,
              propertyName: data.propertyName,
              propertyType: data.propertyType,
              propertyAddress: data.propertyAddress,
              propertyLeaseDuration: data.propertyLeaseDuration,
              propertyLeaseStart: data.propertyLeaseStart,
              propertyLeaseEnd: data.propertyLeaseEnd,
              propertyRentDueDay: data.propertyRentDueDay,
              propertyRentAmount: data.propertyRentAmount,
              propertySecurityDepositRefundPeriod: data.propertySecurityDepositRefundPeriod,
              propertySecurityDepositAmount: data.propertySecurityDepositAmount,
              propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
              propertyHouseRules: data.propertyHouseRules,
              propertyTerminationPeriod: data.propertyTerminationPeriod,
              tenantId: data.tenantId,
              tenantFullName: data.tenantFullName,
              tenantEmail: data.tenantEmail,
              tenantFullAddress: data.tenantFullAddress,
              tenantContact: data.tenantContact,
              status: data.status,
            })

            const formattedDate = data.createdAt.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
        
            setFormatDate(formattedDate ?? '');
          }
        }
      }
    }

    fetchContract()
  }, [])

  return (
    <View className="bg-[#B33939] flex-1">
      <View className="bg-gray-100 mt-20 rounded-t-2xl flex-1">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">View Contract</Text>
          </View>
        </View>

        {/* Contract Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-4 px-8 mb-5">

            <View>
              <Text className="text-sm font-bold mb-1">PROPERTY RENTAL AGREEMENT</Text>
              <Text className="text-sm mb-4">
                This Rental Agreement (the "Agreement") is made and entered into as of <Text className='text-sm font-bold'>{formatDate}</Text>, by and between:
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
            <Text className="text-sm mb-0.5">{contractData?.propertyName}</Text>
            <Text className="text-sm mb-0.5">{contractData?.propertyAddress}</Text>
            <Text className="text-sm mb-0.5">{contractData?.propertyType}</Text>

            {/* Term of Lease */}
            <Text className="text-sm font-bold mt-4 mb-1">1. TERM OF LEASE</Text>
            <Text className="text-sm mb-1">
              The term of this lease shall commence on <Text className='text-sm font-bold'>{contractData?.propertyLeaseStart}</Text> and shall terminate on <Text className='text-sm font-bold'>{contractData?.propertyLeaseEnd}</Text>, unless terminated earlier in accordance with this Agreement.
            </Text>

            {/* Rent */}
            <Text className="text-sm font-bold mt-4 mb-1">2. RENT</Text>
            <Text className="text-sm mb-1">
              The Tenant agrees to pay the Landlord a monthly rent of <Text className='text-sm font-bold'>₱{parseInt(contractData?.propertyRentAmount || '0').toLocaleString()}</Text> due on the <Text className='text-sm font-bold'>{contractData?.propertyRentDueDay}</Text> of each month. Rent shall be payable via the wallet feature in the UPA application.
            </Text>

            {/* Security Deposit */}
            <Text className="text-sm font-bold mt-4 mb-1">3. SECURITY DEPOSIT</Text>
            <Text className="text-sm mb-1">
              The Tenant agrees to pay a security deposit of <Text className='text-sm font-bold'>₱{parseInt(contractData?.propertySecurityDepositAmount || '0').toLocaleString()}</Text> prior to moving in. This deposit will be held by the Landlord and may be used for any damages beyond normal wear and tear. The deposit will be refunded to the Tenant within <Text className='text-sm font-bold'>{contractData?.propertySecurityDepositRefundPeriod}</Text> days after the end of the lease term, subject to any deductions for damages or unpaid rent.
            </Text>

            {/* Late Payment */}
            <Text className="text-sm font-bold mt-4 mb-1">4. ADVANCE PAYMENT</Text>
            <Text className="text-sm mb-1">
              The Tenant agrees to pay an advance rental payment of <Text className='text-sm font-bold'>₱{parseInt(contractData?.propertyAdvancePaymentAmount || '0').toLocaleString()}</Text> (equivalent to one month's rent), which will be applied to the first month’s rent. This amount is due prior to the commencement of the lease term and will be payable through the wallet feature in the UPA application.
            </Text>

            {/* Utilities */}
            <Text className="text-sm font-bold mt-4 mb-1">5. UTILITIES</Text>
            <Text className="text-sm mb-1">
              The Tenant shall be responsible for the payment of all utilities, including but not limited to water, gas, electricity, and internet, unless otherwise agreed upon.
            </Text>

            {/* Maintenance */}
            <Text className="text-sm font-bold mt-4 mb-1">6. MAINTENANCE AND REPAIRS</Text>
            <Text className="text-sm mb-1">
              The Tenant shall keep the premises clean and in good condition. Any maintenance or repairs required shall be reported to the Landlord in a timely manner.
            </Text>

            {/* House Rules */}
            <Text className="text-sm font-bold mt-4 mb-1">7. HOUSE RULES</Text>
            <Text className="text-sm mb-1">
              The Tenant agrees to adhere to the following house rules: <Text className='text-sm font-bold'>{contractData?.propertyHouseRules}</Text>
            </Text>

            {/* Termination */}
            <Text className="text-sm font-bold mt-4 mb-1">8. TERMINATION</Text>
            <Text className="text-sm mb-1">
              Either party may terminate this Agreement with written notice of <Text className='text-sm font-bold'>{contractData?.propertyTerminationPeriod}</Text> days prior to the intended termination date.
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

            {/* Note */}
            <Text className="text-sm font-bold mt-4 mb-1">11. NOTE</Text>
            <Text className="text-sm mb-1">
              This contract is intended for use within the UPA application. For any additional agreements outside of this application, including notarized contracts, it is recommended to seek legal advice.
            </Text>

            {/* Signatures */}
            <Text className="text-sm font-bold mt-4 mb-1">12. SIGNATURES</Text>
            <Text className="text-sm mb-1">
              By signing below, both parties agree to the terms and conditions outlined in this Rental Agreement.
            </Text>
            <Text className="text-sm font-semibold mb-1">Landlord Signature: <Text className="font-normal">{contractData?.ownerFullName}</Text></Text>
            <Text className="text-sm font-semibold mb-1">Date: <Text className="font-normal">{formatDate}</Text></Text>
            <Text className="text-sm font-semibold mb-1">Tenant Signature: <Text className="font-normal">{contractData?.tenantFullName}</Text></Text>
            <Text className="text-sm font-semibold mb-1">Date: <Text className="font-normal">{formatDate}</Text></Text>

            <View className=' items-center justify-center flex-row my-5 space-x-4 px-4'>
              <TouchableOpacity onPress={() => router.replace('./TerminateContract/terminateContract')} className="w-1/2 flex-row items-center space-x-1 justify-center border rounded-xl py-3">
                <Feather name="x-circle" size={20} color="black" />
                <Text className="text-black text-center text-xs font-bold">Terminate Contract</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDownload} className="w-1/2 flex-row items-center space-x-1 justify-center bg-[#B33939] rounded-xl py-3">
              <Feather name="download" size={20} color="white" />
                <Text className="text-white text-center text-xs font-bold">Download Contract</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        
      </View>
    </View>
  );
}
