import { View, Text, TouchableOpacity, TextInput, Image, Modal, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/authContext';
import { User } from 'firebase/auth';

interface Users {
    userFullName: string;
    userAccountId: string;
    userId: string;
}

export default function ReportIssue() {
  const router = useRouter();
  const { reportIssue, sendMessage } = useAuth();

  // State for the form
  const [fullName, setFullName] = useState('');
  const [accountID, setAccountID] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [transactionID, setTransactionID] = useState('');
  const [idType, setIdType] = useState(''); // State for ID type
  const [user, setUser] = useState<Users | null>(null);

  // Modal states for dropdowns
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  
  // Modal state for confirmation
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  // Options for the dropdowns
  const issueOptions = ["Payment Issue", "Maintenance Request", "Lease Agreement Issue"];

  // Function to handle form submission
  const handleSubmit = () => {
    // Open the confirmation modal
    setConfirmationModalVisible(true);
  };

  // Function to confirm submission
  const confirmSubmission = () => {
    setConfirmationModalVisible(false);
    if(!user || !issueType){
      Alert.alert("Report Issue", "Please select an issue.")
      return
    }

    if(!user || !transactionID && issueType === "Payment Issue"){
      Alert.alert("Report Issue", "Transaction ID is required.")
      return
    }

    if(!user || !transactionID && issueType === "Maintenance Request"){
      Alert.alert("Report Issue", "Maintenance ID is required.")
      return
    }

    if(!user || !transactionID && issueType === "Lease Agreement Issue"){
      Alert.alert("Report Issue", "Application ID is required.")
      return
    }

    if(!user || !description){
      Alert.alert("Report Issue", "Detailed description is required.")
      return
    }

    if(user){
      console.log(user?.userFullName, user?.userAccountId, issueType, transactionID, description);
      reportIssue(user.userFullName, user.userAccountId, issueType, transactionID, description);

      router.back();
    }
    Alert.alert("Report Issue", "Your report has been successfully submitted. It will be reviewed and handled promptly.")
  };

  // Function to handle the selection of the issue type
  const handleIssueSelection = (option: string) => {
    setIssueType(option);
    setIssueModalVisible(false);
    
    // Set the ID type based on the selected issue
    if (option === "Payment Issue") {
      setIdType("Transaction ID");
    } else if (option === "Maintenance Request") {
      setIdType("Maintenance ID");
    } else if (option === "Lease Agreement Issue") {
      setIdType("Application ID");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      if(uid){
        const userRef = await getDoc(doc(db, 'users', uid))
        if(userRef){
          const data = userRef.data();
          if(data){
            setUser({
              userFullName: `${data.firstName} ${data.middleName} ${data.lastName}`,
              userAccountId: data.accountId,
              userId: uid,
            })
          }
        }
      }
    }

    fetchUserData();
  }, [])

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 border-b-2 border-gray-300 pb-3'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Report an issue</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Form Section */}
          <View className='mt-2 mb-20'>
            {/* Full Name Input */}
            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>Full Name</Text>
              <TextInput
                className='px-5 py-1.5 bg-gray-200 rounded-2xl'
                placeholder='Enter your Full Name'
                value={user?.userFullName}
                editable={false}
              />
            </View>

            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>AccountID</Text>
              <TextInput
                className='px-5 py-1.5 bg-gray-200 rounded-2xl'
                placeholder='Enter your AccountID'
                value={user?.userAccountId}
                editable={false}
              />
            </View>

            {/* Issue Category Dropdown */}
            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>Issue Category</Text>
              <TouchableOpacity onPress={() => setIssueModalVisible(true)}>
                <View className='px-5 py-2.5 bg-gray-200 rounded-2xl'>
                  <Text className='text-gray-500'>
                    {issueType || 'Select Issue Category'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Modal for Issue Category */}
              <Modal visible={issueModalVisible} transparent={true} animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="bg-white p-5 rounded-lg w-2/3">
                    <Text className='text-sm font-bold mb-2'>Issue Category</Text>
                    <ScrollView>
                      {issueOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-2 border-b border-gray-100"
                          onPress={() => handleIssueSelection(option)} // Update to use new function
                        >
                          <Text className="text-sm px-2">{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity className='items-center justify-center mt-3' onPress={() => setIssueModalVisible(false)}>
                      <Text className='px-2 py-1.5 text-xs font-semibold bg-black rounded-xl text-white'>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            {/* Conditional ID Input */}
            {idType && (
              <View className='p-2'>
                <Text className='px-3 py-1 text-sm font-semibold'>{idType}</Text>
                <TextInput
                  className='px-5 py-1.5 bg-gray-200 rounded-2xl'
                  placeholder={`Enter your ${idType}`}
                  value={transactionID}
                  keyboardType='numeric'
                  onChangeText={setTransactionID}
                />
              </View>
            )}

            {/* Detailed Descriptions */}
            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>Detailed Descriptions</Text>
              <TextInput
                className='px-5 py-1.5 bg-gray-200 rounded-2xl'
                placeholder='A clear description of the issue or repair needed.'
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={1000}
                style={{ textAlignVertical: 'top' }} // Ensures multiline input aligns from the top
              />
            </View>

            {/* Buttons */}
            <View className='flex flex-row items-center justify-center space-x-5 mt-4'>
              <TouchableOpacity
                className='flex w-full py-2.5 px-2 rounded-full bg-[#D9534F]'
                onPress={handleSubmit} // Show confirmation modal
              >
                <Text className='text-center text-white'>Submit Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal visible={confirmationModalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-3/4">
              <Text className="text-lg font-bold mb-4">Confirm Submission</Text>
              <Text className="mb-4 text-sm">Are you sure you want to submit this report issue?</Text>
              <View className="flex-row items-center justify-center gap-5">
                <TouchableOpacity
                  className="px-4 py-2 bg-black rounded-lg"
                  onPress={confirmSubmission} // Proceed with submission
                >
                  <Text className="text-white text-xs">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 border rounded-lg"
                  onPress={() => setConfirmationModalVisible(false)}
                >
                  <Text className="text-xs">No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
