import { View, Text, TouchableOpacity, Alert, Image, ScrollView, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { db, storage } from '../../_dbconfig/dbconfig'; 
import { onSnapshot, collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
type DocumentState = {
    uri: string | null;
    name: string | null;
};

interface User {
  profilePicture: number | {uri : string};
  barangayClearance: number | {uri : string};
  nbiClearance: number | {uri : string};
  govtID: number | {uri : string};
  proofOfIncome: number | {uri : string};
  profilePicUrlStatus: string;
  barangayClearanceStatus: string;
  nbiClearanceStatus: string;
  govtIdStatus: string;
  proofOfIncomeStatus: string;
}

export default function ReSubmissionForm() {
  const router = useRouter();

  // State for the modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Set a default function for currentSetter to avoid null
  const [currentSetter, setCurrentSetter] = useState<React.Dispatch<React.SetStateAction<DocumentState>>>(() => () => ({ uri: null, name: null }));
  const [profilePicture, setProfilePicture] = useState<DocumentState>({ uri: null, name: null });
  const [barangayClearance, setBarangayClearance] = useState<DocumentState>({ uri: null, name: null });
  const [nbiClearance, setNbiClearance] = useState<DocumentState>({ uri: null, name: null });
  const [govtID, setGovtID] = useState<DocumentState>({ uri: null, name: null });
  const [proofOfIncome, setProofOfIncome] = useState<DocumentState>({ uri: null, name: null });
  const [user, setUser] = useState<User | null>(null);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission is required to use this feature.');
    }
  };

  useEffect(() => {
    requestCameraPermissions();
  }, []);

  useEffect(() => {
    const fetchImagesStatus = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      if (uid) {
        const userRef = await getDoc(doc(db, 'users'))
        if(userRef.exists()){
          const data = userRef.data();
          if(data){
            try {
              // File references
              const profilePictureFileName = `${uid}-profilepictures`;
              const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
              const barangayClearanceFileName = `${uid}-barangayclearances`;
              const barangayClearanceRef = ref(storage, `barangayclearances/${barangayClearanceFileName}`);
              const nbiClearanceName = `${uid}-nbiclearances`;
              const nbiClearanceRef = ref(storage, `nbiclearances/${nbiClearanceName}`);
              const govtIdName = `${uid}-govtids`;
              const govtIdRef = ref(storage, `govtids/${govtIdName}`);
              const proofOfIncomeName = `${uid}-proofofincome`;
              const proofOfIncomeRef = ref(storage, `proofofincome/${proofOfIncomeName}`);
      
              // Fetch URLs with error handling
              const profilePicUrl = await getDownloadURL(profilePictureRef).catch(() => null);
              const barangayClearanceUrl = await getDownloadURL(barangayClearanceRef).catch(() => null);
              const nbiClearanceUrl = await getDownloadURL(nbiClearanceRef).catch(() => null);
              const govtIdUrl = await getDownloadURL(govtIdRef).catch(() => null);
              const proofOfIncomeUrl = await getDownloadURL(proofOfIncomeRef).catch(() => null);
      
              // Update state
              setUser({
                profilePicture: profilePicUrl ? { uri: profilePicUrl } : require('../../assets/images/profile.png'),
                barangayClearance: barangayClearanceUrl
                  ? { uri: barangayClearanceUrl }
                  : require('../../assets/images/profile.png'),
                nbiClearance: nbiClearanceUrl
                  ? { uri: nbiClearanceUrl }
                  : require('../../assets/images/profile.png'),
                govtID: govtIdUrl ? { uri: govtIdUrl } : require('../../assets/images/profile.png'),
                proofOfIncome: proofOfIncomeUrl
                  ? { uri: proofOfIncomeUrl }
                  : require('../../assets/images/profile.png'),
                profilePicUrlStatus: data.profilePicUrlStatus,
                barangayClearanceStatus: data.barangayClearanceStatus,
                nbiClearanceStatus: data.nbiClearanceStatus,
                govtIdStatus: data.govtIdStatus,
                proofOfIncomeStatus: data.proofOfIncomeStatus,
              });
            } catch (error) {
              console.error('Error fetching images:', error);
            }
          }
        }
      }
    };
  
    fetchImagesStatus();
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

const handleSubmit = () => {
    router.replace('./Dashboard')
};


  return (
    <View className="h-screen py-4 px-6">
      <View className="flex-row items-center justify-between mt-10 pb-5 px-4 border-b border-gray-300">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-xs font-bold text-center">Document Re-Submission Form</Text>
      </View>

      <View className='mt-5 space-y-4 h-full'>
        <Text className='text-lg font-bold'>Upload Documents</Text>
        <Text className='text-sm'>Please re-upload the <Text className='font-bold'>rejected documents</Text> to verify your identity, legal status, and financial eligibility for renting.</Text>
        <Text className='text-sm'>Please ensure that the documents are clear and in the accepted formats (JPG, PNG).</Text>

        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className='mb-28'
          >
        {[
        { label: 'Profile Picture', value: user ? user.profilePicture : require('../../assets/images/profile.png'), setter: setProfilePicture, required: true, status: user?.profilePicUrlStatus },
        { label: 'Barangay Clearance', value: user?.barangayClearance, setter: setBarangayClearance, required: false, status: user?.barangayClearanceStatus },
        { label: 'NBI Clearance', value: user?.nbiClearance, setter: setNbiClearance, required: false, status: user?.nbiClearanceStatus },
        { label: 'Government Issued ID', value: user?.govtID, setter: setGovtID, required: true, status: user?.govtIdStatus },
        { label: 'Proof of Income', value: user?.proofOfIncome, setter: setProofOfIncome, required: true, status: user?.proofOfIncomeStatus },
        ].map((item, index) => (
        <View key={index} className='mb-5'>
            <View className='px-2 flex-row items-center space-x-2 mb-2'>
            <Text className='text-xs font-semibold'>{item.label}</Text>
            <Text className={`text-xs text-white font-bold px-4 py-1 rounded-xl ${item.status === 'Approved' ? 'bg-[#0FA958]' : 'bg-[#EF5A6F]'}`}>{item.status}</Text>
            </View>
            {item.status === 'Approved' ? null : 
                <TouchableOpacity className='flex flex-col gap-2' 
                onPress={() => handleSelectImage(item.setter, item.label === 'Profile Picture')}
                >
                    <View className='flex flex-row px-7 py-2 items-center bg-[#D9D9D9] rounded-xl'>
                    {item.value.uri ? (
                        <View>
                        <View className='flex flex-col gap-2'>
                            <Text className='text-xs font-normal' numberOfLines={1} ellipsizeMode='tail'>{item.value.name}</Text>
                            <Image source={{ uri: item.value.uri }} className='w-52 h-52' />
                        </View>
                        </View>
                    ) : (
                        <Text className='text-xs p-1 text-gray-400 font-bold'>Upload {item.label}</Text>
                    )}
                    </View>
                </TouchableOpacity>
            }
        </View>
        ))}
        </ScrollView>

        <View className=' w-full mb-16 absolute bottom-0'>
            
                    <View className='w-full flex-row space-x-4 items-center justify-center px-4'>
                        
                    <TouchableOpacity className='w-1/2 items-center border rounded-xl' onPress={() => router.back()}>
                        <Text className='py-3 text-xs font-bold'>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='w-1/2 items-center bg-[#D9534F] rounded-xl'
                        onPress={handleSubmit}
                    >
                        <Text className='py-3 text-white text-xs font-bold'>Submit</Text>
                    </TouchableOpacity>
                    </View>
        </View>

      </View>


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
  )
}