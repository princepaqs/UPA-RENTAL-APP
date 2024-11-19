import { View, Text, TouchableOpacity, TextInput, Image, Modal, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/authContext';
import * as SecureStore from 'expo-secure-store';

export default function TrackMaintenance() {
  const router = useRouter();
  const { maintenanceRequest } = useAuth();

  // State for the form
  const [fullName, setFullName] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<{ uri: string; fileName: string }[]>([]); // Define the type explicitly as string[]


  // Modal states for dropdowns
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);

  // Modal state for confirmation
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  // Function to open image picker and allow multiple images
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Enable multiple image selection
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets) {
      const currentImageUris = images.map(img => img.uri)
      const newImages = pickerResult.assets
        .map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName || "Unknown filename",
        }))
        .filter(asset => !currentImageUris.includes(asset.uri));
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  // Options for the dropdowns
  const timeOptions = ["Morning", "Afternoon", "Evening"];
  const issueOptions = ["Plumbing", "Electrical", "General Maintenance"];

  // Function to handle form submission
  const handleSubmit = () => {
    // Open the confirmation modal
    setConfirmationModalVisible(true);
  };

  // Function to confirm submission
  const confirmSubmission = async () => {
    setConfirmationModalVisible(false);
    const uid = await SecureStore.getItemAsync('uid');
    const ownerId = await SecureStore.getItemAsync('userId');
    const propertyId = await SecureStore.getItemAsync('propertyId');
    if(!uid || !ownerId || !propertyId || !fullName || !preferredTime || !issueType || !description || images.length === 0){
      Alert.alert('Error', 'Please input all fields!')
      return;
    }else{
      maintenanceRequest(uid, ownerId, propertyId, fullName, preferredTime, issueType, JSON.stringify(images), description);
    }
    router.replace('../tabs/Profile/TrackMaintenance/trackMaintenance')
  };

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
            <Text className='text-sm font-bold text-center'>Send Maintenance Request</Text>
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
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Preferred Time Dropdown */}
            <View className='p-2'>
              <Text className='px-3 py-1.5 text-sm font-semibold'>Preferred Time for Maintenance</Text>
              <TouchableOpacity onPress={() => setTimeModalVisible(true)}>
                <View className='px-5 py-2.5 bg-gray-200 rounded-2xl'>
                  <Text className='text-gray-500'>
                    {preferredTime || 'Select Preferred Time'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Modal for Preferred Time */}
              <Modal visible={timeModalVisible} transparent={true} animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="bg-white p-5 rounded-lg w-2/3">
                    <Text className='text-sm font-bold mb-2'>Preferred Time</Text>
                    <ScrollView>
                      {timeOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-1.5 border-b border-gray-100"
                          onPress={() => {
                            setPreferredTime(option);
                            setTimeModalVisible(false);
                          }}
                        >
                          <Text className="text-sm px-3">{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity className='items-center justify-center mt-3' onPress={() => setTimeModalVisible(false)}>
                      <Text className='px-2 py-1.5 text-xs font-semibold bg-black rounded-xl text-white'>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            {/* Type of Issue Dropdown */}
            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>Type of Issue</Text>
              <TouchableOpacity onPress={() => setIssueModalVisible(true)}>
                <View className='px-5 py-2.5 bg-gray-200 rounded-2xl'>
                  <Text className='text-gray-500'>
                    {issueType || 'Select Issue Type'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Modal for Type of Issue */}
              <Modal visible={issueModalVisible} transparent={true} animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/50">
                  <View className="bg-white p-5 rounded-lg w-2/3">
                    <Text className='text-sm font-bold mb-2'>Type of Issue</Text>
                    <ScrollView>
                      {issueOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          className="py-2 border-b border-gray-100"
                          onPress={() => {
                            setIssueType(option);
                            setIssueModalVisible(false);
                          }}
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

            {/* Attachments - Image Picker */}
            <View className='p-2'>
              <Text className='px-3 py-1 text-sm font-semibold'>Attachments</Text>
              <TouchableOpacity onPress={pickImage}>
                <View className='px-5 py-2.5 bg-gray-200 rounded-2xl'>
                  <Text className='text-gray-500'>Choose pictures</Text>
                </View>
              </TouchableOpacity>

              {/* Display selected images */}
              <ScrollView horizontal className='flex flex-row mt-2'>
                {images.map((imgUri, index) => (
                  <Image key={index} source={{ uri: imgUri.uri }} className="w-32 h-32 rounded-xl mr-2" />
                ))}
              </ScrollView>
            </View>

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
                style={{ textAlignVertical: 'top' }} // Ensures multiline input aligns from the top
              />
            </View>

            {/* Buttons */}
            <View className='flex flex-row items-center justify-center space-x-5 mt-4'>
              <TouchableOpacity
                className='flex w-1/3 py-2.5  rounded-full bg-black'
                onPress={() => router.back()}
              >
                <Text className='text-center text-white'>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className='flex w-1/3 py-2.5  rounded-full bg-[#B33939]'
                onPress={handleSubmit} // Show confirmation modal
              >
                <Text className='text-center text-white'>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal visible={confirmationModalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-3/4">
              <Text className="text-lg font-bold mb-4">Confirm Submission</Text>
              <Text className="mb-4 text-sm">Are you sure you want to submit this maintenance request?</Text>
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
