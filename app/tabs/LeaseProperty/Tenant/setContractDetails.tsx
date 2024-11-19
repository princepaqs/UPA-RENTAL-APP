import { View, Text, TouchableOpacity, Image, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import contractData from './contractData.json'; 
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { getItemAsync } from 'expo-secure-store';


interface Property {
  id: string;
  propertyName: string;
  homeAddress: string;
  barangay: string;
  city: string;
  region: string;
  propertyLeaseDuration: string;
  propertySecurityDepositMonth: string;
  propertySecurityDepositAmount: string;
  propertyAdvancePaymentAmount: string;
  propertyRentAmount: string;
  image?: number | { uri: string }; 
  images?: Array<number | { uri: string }>; // Make sure this line exists
}

export default function setContractDetails() {
  const router = useRouter();
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [terminationModalVisible, setTerminationModalVisible] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false); // Modal for validation
  const [selectedDay, setSelectedDay] = useState('1st');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [depositRefundDays, setDepositRefundDays] = useState<string>('1');
  const [terminationNoticeDays, setTerminationNoticeDays] = useState<string | null>(null);

  const today = new Date();
  const dayOfMonth = today.getDate(); // Get the current day of the month
  const daysOfMonth = Array.from({ length: 25 }, (_, i) => 
    `${i + 1}${i + 1 === 1 ? 'st' : i + 1 === 2 ? 'nd' : i + 1 === 3 ? 'rd' : 'th'}`
  );
  
  const depositDays = Array.from({ length: 8 }, (_, i) => `${i + 7}`);
  
  const terminationDays = [
    {label: '30'}, 
    {label: '60'}
  ];
  

  const selectDay = (day: string) => {
    setSelectedDay(day);
    setDayModalVisible(false);
  };

  const depositDay = (day: string) => {
    setDepositRefundDays(day);
    setDepositModalVisible(false);
  };

  const terminationDay = (option: typeof terminationDays[0]) => {
    setTerminationNoticeDays(option.label); // Set selected option but do not route yet
    console.log(option.label);
  };

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
  
      // Create a new Date object for endDate to avoid mutating the original selectedDate
      const newEndDate = new Date(selectedDate);
  
      // Check property lease duration and add appropriate months
      if (propertyData?.propertyLeaseDuration === 'Long-term (1 year)') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1); // Add 1 year
      } else {
        newEndDate.setMonth(newEndDate.getMonth() + 6); // Add 6 months
      }
  
      setEndDate(newEndDate); // Update endDate state
    }
  };
  

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatDay = (date: Date) => {
    const day = date.getDate(); // Get the day as a number (1-31)
    return daysOfMonth[day - 1]; // Retrieve the formatted day with suffix from daysOfMonth
  };

  const handleContinue = async () => {
     // Check if all required fields are filled
     if (!startDate || !endDate || !depositRefundDays || !terminationNoticeDays) {
      setValidationModalVisible(true); // Show validation modal if any field is missing
    } else {
      formatDate(startDate)
      await SecureStore.setItemAsync('propertyLeaseStart', formatDate(startDate).toString());
      await SecureStore.setItemAsync('propertyLeaseEnd', formatDate(endDate).toString());
      await SecureStore.setItemAsync('propertyRentAmount', propertyData ? propertyData?.propertyRentAmount : '0');
      /*if(isChecked1 == true){
        await SecureStore.setItemAsync('propertyRentDueDay', formatDay(startDate));
      }else{
        await SecureStore.setItemAsync('propertyRentDueDay', selectedDay);
      }*/
      await SecureStore.setItemAsync('propertyRentDueDay', selectedDay);
      await SecureStore.setItemAsync('propertySecurityDepositRefundPeriod', depositRefundDays);
      await SecureStore.setItemAsync('propertyTerminationPeriod', terminationNoticeDays);
      
      router.replace('./contractPreview');
    }
  }

  const handleViewLease = () => {
    router.push('../PropertyDetails')
 }

  const getAllImageUrls = async (propertyId: string, fileNames: string[]) => {
    try {
      const imageUrls = await Promise.all(
        fileNames.map(async (fileName) => {
          const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
          return await getDownloadURL(storageRef);
        })
      );
      return imageUrls;
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      return [];
    }
  };

  const handleDepositChange = (text: string) => {
    const value = parseInt(text);
    // Allow input only if it's a number and not more than 30
    if (!isNaN(value) && value <= 30) {
      //setDepositRefundDays(text);
    }else{
      return;
    }
  };

  // Function to handle termination notice days input
  const handleTerminationChange = (text: string) => {
    const value = parseInt(text);
    // Allow input only if it's a number and not more than 30
    if (!isNaN(value) && value <= 30) {
      //setTerminationNoticeDays(text);
    }
  };

 useEffect(() => {
  const getData = async () => {
    const propertyId = await SecureStore.getItemAsync('propertyId');
    const ownerId = await SecureStore.getItemAsync('uid');

    if(propertyId && ownerId){
      const propertyRef = doc(db, 'properties', ownerId, 'propertyId', propertyId);
      const propertySnapshot = await getDoc(propertyRef);
      if (propertySnapshot.exists()) {
        const data = propertySnapshot.data();

        if (data) {
          // Fetch all image URLs from Firestore
          const imageUrls = data.images && data.images.length > 0
            ? await getAllImageUrls(propertyId, data.images)
            : [];

          // Set property data state with all images
          setPropertyData({
            id: propertyId.toString(),
            propertyName: data.propertyName,
            propertyLeaseDuration: data.propertyLeaseDuration,
            propertySecurityDepositMonth: data.propertySecurityDepositMonth,
            propertySecurityDepositAmount: data.propertySecurityDepositAmount,
            propertyAdvancePaymentAmount: data.propertyAdvancePaymentAmount,
            propertyRentAmount: data.propertyMonthlyRent,
            homeAddress: data.propertyHomeAddress,
            barangay: data.propertyBarangay,
            city: data.propertyCity,
            region: data.propertyRegion,
            images: imageUrls.length > 0 ? imageUrls.map((url) => ({ uri: url })) : [],
          });
        }
      }
    }
  }

  getData();
 }, []);

  return (
    <View className="bg-[#B33939]">
      <View className="h-screen bg-gray-100 px-2 mt-14 rounded-t-2xl">
        <View className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <TouchableOpacity onPress={async () => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Set Contract Details</Text>
          </View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-5 px-4 mb-20">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold">Lease Information</Text>
            <TouchableOpacity className="bg-[#333333] px-3 py-1 rounded-xl"
            onPress={handleViewLease}>
              <Text className="text-white text-xs">View Lease</Text>
            </TouchableOpacity>
          </View>
          

          <View className="bg-white p-4 rounded-xl my-2">
            <View className="flex-row items-center border-b border-gray-300 pb-3">
              {propertyData?.images && propertyData.images.length > 0 ? (
                <Image 
                  source={typeof propertyData.images[0] === 'number' 
                    ? propertyData.images[0] 
                    : { uri: propertyData.images[0]?.uri }} 
                  className="w-12 h-12 rounded-lg mr-4" 
                />
              ) : (
                <Image 
                  source={require('../../../../assets/images/property1.png')} 
                  className="w-12 h-12 rounded-lg mr-4" 
                />
              )}
              <View className="flex-col space-y-1">
              {propertyData && (
                <>
                  <Text className="text-sm text-gray-500">
                    {propertyData.propertyName?.length > 25
                      ? `${propertyData.propertyName.substring(0, 25)}...`
                      : propertyData.propertyName ?? ''}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {`${propertyData.homeAddress ?? ''}, ${propertyData.barangay ?? ''}, ${propertyData.city ?? ''}, ${propertyData.region ?? ''}`.length > 35
                      ? `${`${propertyData.homeAddress ?? ''}, ${propertyData.barangay ?? ''}, ${propertyData.city ?? ''}, ${propertyData.region ?? ''}`.substring(0, 35)}...`
                      : `${propertyData.homeAddress ?? ''}, ${propertyData.barangay ?? ''}, ${propertyData.city ?? ''}, ${propertyData.region ?? ''}`}
                  </Text>
                </>
              )}
              </View>
            </View>

            <View className="flex-col space-y-1">
              <Text className="text-xs font-bold my-3">Lease Agreement Details</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Lease Term</Text>
                <Text className="text-xs text-gray-500">{propertyData?.propertyLeaseDuration}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Rent Amount / Month</Text>
                <Text className="text-xs text-gray-500">₱ {parseInt(propertyData ? propertyData?.propertyRentAmount : '0').toLocaleString()}.00</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Security Deposit Amount</Text>
                <Text className="text-xs text-gray-500">₱ {parseInt(propertyData ? propertyData?.propertySecurityDepositAmount : '0').toLocaleString()}.00</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-500">Advance Payment Amount</Text>
                <Text className="text-xs text-gray-500">₱ {parseInt(propertyData ? propertyData?.propertyAdvancePaymentAmount : '0').toLocaleString()}.00</Text>
              </View>
            </View>
          </View>

          {/* Contract Details */}
          <View className="bg-white p-4 rounded-xl my-2 flex-col space-y-3">
            <Text className="text-sm font-bold">Set Contract Details</Text>
            <View className="flex-row items-center w-full">
              <Text className="text-xs px-2 w-1/2">Start Date of Lease</Text>
              <TouchableOpacity
                className="text-xs w-1/2 items-center rounded-lg py-1 bg-[#D9D9D9]"
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text className="text-xs font-semibold text-gray-500">{startDate ? formatDate(startDate) : 'Select Date'}</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center w-full">
              <Text className="text-xs px-2 w-1/2">End Date of Lease</Text>
              <TouchableOpacity 
                className="text-xs w-1/2 items-center rounded-lg py-1 bg-[#D9D9D9]">
                <Text className="text-xs font-semibold text-gray-500">
                  {endDate ? formatDate(endDate) : ''}
                </Text>
              </TouchableOpacity>
              {/*<TouchableOpacity
                className="text-xs w-1/2 items-center rounded-lg py-1 bg-[#D9D9D9]"
                //onPress={() => setShowEndDatePicker(true)}

              >
                <Text className="text-xs font-semibold text-gray-500">{endDate ? formatDate(endDate) : 'Select Date'}</Text>
              </TouchableOpacity>*/}
            </View>

            {/* Rent Payment Arrangement */}
            <View>
              <Text className="text-sm font-bold">Rent Payment Arrangement</Text>
              <Text className="text-[10px] text-[#EF5A6F]">How would you like the rent due date to be determined?</Text>
            </View>

            {/*<View className="flex-row space-x-2">
      {dayOfMonth <= 25 && ( // Only render this section if the day is 25 or less
        <>
          <Pressable
            onPress={() => {
              setIsChecked1(true);
              setIsChecked2(false);
            }}
            className={`w-3 h-3 border rounded-full mt-1 ${isChecked1 ? 'bg-black' : 'border-black'}`}
          />
          <Text className="text-xs text-gray-500">
            Rent is due on the same day of the month as the lease start date.
          </Text>
        </>
      )}
    </View>*/}

            <View className="flex-row space-x-2">
              {/*<Pressable
                onPress={() => {
                  setIsChecked2(true);
                  setIsChecked1(false);
                }}
                className={`w-3 h-3 border rounded-full mt-1 ${isChecked2 ? 'bg-black' : 'border-black'}`}
              />*/}
              <View className="flex-col">
                <Text className="text-xs text-gray-500">Set a specific rent due date each month</Text>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-xs text-gray-500">Every </Text>
                  <TouchableOpacity onPress={() => setDayModalVisible(true)} className="bg-gray-200 px-2 py-1 rounded-lg">
                    <Text className="text-xs text-gray-500">{selectedDay}</Text>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500"> of the month</Text>
                </View>
              </View>
            </View>

            <Text>Deposit Refund Timeline</Text>
<Text className='text-[10px] text-[#EF5A6F] '>
  How many days will it take for the deposit to be refunded to the tenant after the end of the lease term?
</Text>
<View className='flex-row px-4 my-3 items-center space-x-4'>
  <View className='w-1/4 text-gray-500 bg-[#D9D9D9] rounded-xl'>
    {/*<TextInput
      className='flex-1 text-xs text-center text-gray-500'
      keyboardType='number-pad'
      maxLength={2} // Limit to 2 characters
      onChangeText={(text) => {
        const value = Math.min(Number(text), 30);
        handleDepositChange(value.toString()); // Use the handler with the validated value
      }}
      //value={depositRefundDays} // Bind the value to state
    />*/}
    <TouchableOpacity onPress={() => setDepositModalVisible(true)} className="bg-gray-200 px-2 py-1 rounded-lg">
                    <Text className="text-xs text-gray-500">{depositRefundDays}</Text>
    </TouchableOpacity>
  </View>
  <Text className='text-xs text-gray-500'>days</Text>
</View>

<View>
  <Text>Termination Notice Period</Text>
  <Text className='text-[10px] text-[#EF5A6F] '>
    What is the notice period (in days) required for either party to terminate this Agreement?
  </Text>
  <View className='flex-row px-4 my-3 items-center space-x-4'>
    {/*<View className='w-1/4 text-gray-500 bg-[#D9D9D9] rounded-xl'>
      <TextInput
        className='flex-1 text-xs text-center text-gray-500'
        keyboardType='number-pad'
        maxLength={2} // Limit to 2 characters
        onChangeText={(text) => {
          const value = Math.min(Number(text), 30);
          handleTerminationChange(value.toString()); // Use the handler with the validated value
        }}
        //value={terminationNoticeDays} // Bind the value to state
      />
      <TouchableOpacity onPress={() => setTerminationModalVisible(true)} className="bg-gray-200 px-2 py-1 rounded-lg">
                    <Text className="text-xs text-gray-500">{terminationNoticeDays}</Text>
    </TouchableOpacity>*/}
    <View className='flex-row'>
            {terminationDays.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => terminationDay(option)}
                className='flex-row space-x-3 px-5'
              >
                <Ionicons
                  name={
                    terminationNoticeDays === option.label
                      ? 'radio-button-on-outline'
                      : 'radio-button-off-outline'
                  }
                  size={18}
                  color={terminationNoticeDays === option.label ? 'black' : 'gray'}
                />
                <Text
                  className={`text-sm ${
                    terminationNoticeDays === option.label ? 'font-semibold text-black' : 'text-gray-500'
                  }`}
                >
                  {option.label} days
                </Text>
                
              </TouchableOpacity>
            ))}
            
          </View>
    </View>
    
  </View>
{/*</View>*/}


          <TouchableOpacity className='items-end' onPress={handleContinue}>
            <Text className='bg-[#D9534F] px-6 py-2.5 mt-2 text-sm text-center text-white font-bold rounded-xl'>Continue</Text>
          </TouchableOpacity>

        </View>
        </View>
        </ScrollView>

        
      </View>

      {/* Custom Dropdown Modal */}
      <Modal visible={dayModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg h-2/3 w-3/4">
            <Text className="text-sm font-semibold mb-3">Select Day</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {daysOfMonth.map((day, index) => (
                <TouchableOpacity key={`${day}-${index}`} onPress={() => selectDay(day)} className="py-2">
                  <Text className="text-gray-500">{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setDayModalVisible(false)} className="mt-4 bg-gray-800 px-3 py-1 rounded-lg">
              <Text className="text-center text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={depositModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg h-2/3 w-3/4">
            <Text className="text-sm font-semibold mb-3">Select Day</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {depositDays.map((deposit, index) => (
                <TouchableOpacity key={`${deposit}-${index}`} onPress={() => depositDay(deposit)} className="py-2">
                  <Text className="text-gray-500">{deposit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setDepositModalVisible(false)} className="mt-4 bg-gray-800 px-3 py-1 rounded-lg">
              <Text className="text-center text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={terminationModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg h-2/3 w-3/4">
            <Text className="text-sm font-semibold mb-3">Select Day</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {terminationDays.map((termination, index) => (
                <TouchableOpacity key={`${termination}-${index}`} onPress={() => terminationDay(termination)} className="py-2">
                  <Text className="text-gray-500">{terminationNoticeDays}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setTerminationModalVisible(false)} className="mt-4 bg-gray-800 px-3 py-1 rounded-lg">
              <Text className="text-center text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Validation Modal */}
      <Modal visible={validationModalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-4 rounded-lg w-2/3">
              <Text className='text-sm font-bold text-center'>Contract Details</Text>
              <Text className="text-xs text-center my-3">Please fill all required fields</Text>
              <TouchableOpacity onPress={() => setValidationModalVisible(false)} className="items-center justify-center">
                <Text className="text-center text-white mt-4 bg-gray-800 px-3 py-1 rounded-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Start Date Picker */}
      {showStartDatePicker && (
  <DateTimePicker
    value={startDate || new Date()}
    mode="date"
    display="default"
    onChange={onStartDateChange}
    minimumDate={new Date()}  // Disable days before the current date
  />
)}


      {/* End Date Picker */}
      {showEndDatePicker && (
        <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={onEndDateChange} />
      )}
    </View>
  );
}
