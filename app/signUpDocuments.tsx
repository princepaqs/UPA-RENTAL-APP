import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, Image, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/authContext';
import { Entypo } from '@expo/vector-icons';

type DocumentState = {
  uri: string | null;
  name: string | null;
};

export default function Document() {
  const router = useRouter();
  const { register } = useAuth();

  // State for handling user inputs
  const [profilePicture, setProfilePicture] = useState<DocumentState>({ uri: null, name: null });
  const [barangayClearance, setBarangayClearance] = useState<DocumentState>({ uri: null, name: null });
  const [nbiClearance, setNbiClearance] = useState<DocumentState>({ uri: null, name: null });
  const [govtID, setGovtID] = useState<DocumentState>({ uri: null, name: null });
  const [proofOfIncome, setProofOfIncome] = useState<DocumentState>({ uri: null, name: null });
  const [loading, setLoading] = useState(false);
  // Checkbox state
  const [isChecked, setIsChecked] = useState(false);

  // State for the modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Set a default function for currentSetter to avoid null
  const [currentSetter, setCurrentSetter] = useState<React.Dispatch<React.SetStateAction<DocumentState>>>(() => () => ({ uri: null, name: null }));

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission is required to use this feature.');
    }
  };

  useEffect(() => {
    requestCameraPermissions();
  }, []);

  const getFileName = (uri: string): string => {
    return uri.split('/').pop() || '';
  };

  const handleImagePicker = async (setter: React.Dispatch<React.SetStateAction<DocumentState>>, useCamera: boolean = false) => {
    try {
      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,

          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });

      if (!result.canceled) {
        const fileName = getFileName(result.assets[0].uri);
        setter({ uri: result.assets[0].uri, name: fileName });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Register', 'Could not open the camera or gallery.');
    }
  };

  const handleSelectImage = (setter: React.Dispatch<React.SetStateAction<DocumentState>>, useCamera: boolean = false) => {
    if (setter === setProfilePicture) {
      handleImagePicker(setter, true); // Directly use camera for profile picture
    } else {
      setCurrentSetter(() => setter); // Set the document setter to the modal
      setIsModalVisible(true); // Show the modal for other documents
    }
};


const handleSignup = async () => {
  setLoading(true);

  try {
    // const email = (await SecureStore.getItemAsync('email')) || '';
    // const password = (await SecureStore.getItemAsync('password')) || '';
    // const firstName = (await SecureStore.getItemAsync('firstName')) || '';
    // const middleName = (await SecureStore.getItemAsync('middleName')) || '';
    // const lastName = (await SecureStore.getItemAsync('lastName')) || '';
    // const fullName = `${firstName} ${middleName} ${lastName}`.trim();

    if (!isChecked) {
      Alert.alert('Register', 'You must agree to the terms and conditions to sign up.');
      setLoading(false); // Stop loading
      return;
    }

    if (!profilePicture.uri || !govtID.uri || !proofOfIncome.uri) {
      Alert.alert('Register', 'Please upload all required documents');
      setLoading(false); // Stop loading
      return;
    }

    if (!barangayClearance.uri && !nbiClearance.uri) {
      Alert.alert('Register', 'Please upload at least one of the Barangay Clearance or NBI Clearance');
      setLoading(false); // Stop loading
      return;
    }

    // await SecureStore.setItemAsync('profilePictureURL', profilePicture.uri || '');
    // await SecureStore.setItemAsync('barangayClearanceURL', barangayClearance.uri || '');
    // await SecureStore.setItemAsync('nbiClearanceURL', nbiClearance.uri || '');
    // await SecureStore.setItemAsync('govtIDURL', govtID.uri || '');
    // await SecureStore.setItemAsync('proofOfIncomeURL', proofOfIncome.uri || '');

    // await register(email, password, fullName);

  } catch (error) {
    Alert.alert('Register', 'An error occurred during sign up. Please try again.');
  } finally {
    setLoading(false); // Stop loading regardless of success or failure
  }
};


  return (
    <View className='bg-[#FFFFFF]' style={{ flex: 1 }}>

        <View className="flex py-28 items-start justify-center bg-[#B33939]">
          <View className='pt-28'></View>

          <View className='w-full px-12 rounded-t-2xl mb-28 bg-[#FFFFFF]'>
          <View className='px-2 py-5'>
              <Text className='text-lg font-semibold'>Upload Documents</Text>
              <View className='flex flex-col gap-2'>
                <Text className='text-xs font-normal'>These documents verify your identity, legal status, and financial capability for renting.</Text>
                <Text className='text-xs font-normal'>Please ensure that the documents are clear and in the accepted formats (JPG, PNG).</Text>
              </View>
            </View>
          <View className='px-2'>
            <Text className='text-xs'>Fileds marked <Text className='text-red-500'>*</Text> are required.</Text>
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >



{[
  { label: 'Profile Picture', value: profilePicture, setter: setProfilePicture, required: true },
  { label: 'Barangay Clearance', value: barangayClearance, setter: setBarangayClearance, required: false },
  { label: 'NBI Clearance', value: nbiClearance, setter: setNbiClearance, required: false },
  { label: 'Government Issued ID', value: govtID, setter: setGovtID, required: true },
  { label: 'Proof of Income', value: proofOfIncome, setter: setProofOfIncome, required: true },
].map((item, index) => (
  <View key={index} className='pt-5'>
    <View className='px-2'>
      <Text className='text-xs font-semibold'>{item.label} {item.required && <Text className='text-red-500'>*</Text>}</Text>
    </View>
    <TouchableOpacity className='flex flex-col gap-2' 
          onPress={() => handleSelectImage(item.setter, item.label === 'Profile Picture')}
    >
      <View className='flex flex-row px-7 py-2 items-center bg-gray-100 rounded-xl'>
        {item.value.uri ? (
          <View>
            <View className='flex flex-col gap-2'>
              <Text className='text-xs font-normal' numberOfLines={1} ellipsizeMode='tail'>{item.value.name}</Text>
              <Image source={{ uri: item.value.uri }} className='w-52 h-52' />
            </View>
          </View>
        ) : (
          <Text className='text-xs font-normal'>Select Image</Text>
        )}
      </View>
    </TouchableOpacity>
  </View>
))}

            <View className='mb-20 pt-10'>
              {/* Checkbox */}
              <View className='flex flex-row items-center pb-4'>
                <Pressable
                  onPress={() => setIsChecked(prev => !prev)}
                  className={`w-4 h-4 border-2 rounded-xl ${isChecked ? 'bg-black' : 'border-gray-400'}`}
                />
                <Text className='text-xs ml-2'>By clicking sign up, I agree to the terms and conditions</Text>
              </View>

              <Pressable 
                className={`py-3 rounded-xl ${isChecked ? 'bg-[#D9534F]' : 'bg-gray-300'}`} 
                onPress={handleSignup} 
                disabled={!isChecked || loading} // Disable if not checked or loading
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className='text-white font-semibold text-xs text-center tracking-wider'>Sign Up</Text>
                )}
              </Pressable>
              <TouchableOpacity className='flex-row space-x-1 items-center justify-center my-5'
          onPress={() => router.replace('./signIn')}
          >
          <Entypo name="chevron-left" size={15} color="black" />
          <Text className='text-xs font-semibold'>Back to  log in</Text>
        </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
      

      {/* Modal for choosing between camera and gallery */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View className="flex-1 justify-center items-center bg-[#00000080]">
    <View className="bg-white p-4 rounded-xl w-2/3">
      <Text className="text-sm font-bold mb-5">Select Image Source</Text>
      <View className='flex flex-col space-y-2 items-center justify-center'>
        <TouchableOpacity
          onPress={() => {
            handleImagePicker(currentSetter, true);
            setIsModalVisible(false);
          }}
          className='bg-black px-3 py-2 rounded-xl'
        >
          <Text className='text-white text-xs text-center'>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleImagePicker(currentSetter, false);
            setIsModalVisible(false);
          }}
          className='bg-black px-3 py-2 rounded-xl'
        >
          <Text className='text-white text-xs text-center'>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsModalVisible(false)}
          className='border px-3 py-2 rounded-xl'
        >
          <Text className='text-black text-xs text-center'>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
}

