import { View, Text, TouchableOpacity, Alert, Image, ScrollView, Modal, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref, StorageReference, uploadBytes } from 'firebase/storage'; 
import { db, storage } from '../../_dbconfig/dbconfig'; 
import { onSnapshot, collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
type DocumentState = {
    uri: number | {uri : string};
    name: string | null;
};

interface User {
  roleStatus: string;
  profilepictures: number | {uri : string};
  barangayclearances: number | {uri : string};
  nbiclearances: number | {uri : string};
  govtids: number | {uri : string};
  proofofincome: number | {uri : string};
  ownerpermits: number | {uri : string};
  profilePicUrlStatus: string;
  barangayClearanceStatus: string;
  nbiClearanceStatus: string;
  govtIdStatus: string;
  proofOfIncomeStatus: string;
  ownerPermitStatus: string;
}

export default function ReSubmissionForm() {
  const router = useRouter();

  // State for the modal
  const [isModalVisible, setIsModalVisible] = useState<{ visible: boolean; label: string }>({
    visible: false,
    label: '',
  });
  // Set a default function for currentSetter to avoid null
  const [currentSetter, setCurrentSetter] = useState<React.Dispatch<React.SetStateAction<DocumentState>>>(() => () => ({ uri: null, name: null }));
  const [profilepictures, setProfilePicture] = useState<DocumentState>({ uri: 0, name: null });
  const [barangayclearances, setBarangayClearance] = useState<DocumentState>({ uri: 0, name: null });
  const [nbiclearances, setNbiClearance] = useState<DocumentState>({ uri: 0, name: null });
  const [govtids, setGovtID] = useState<DocumentState>({ uri: 0, name: null });
  const [proofofincome, setProofOfIncome] = useState<DocumentState>({ uri: 0, name: null });
  const [ownerpermits, setOwnerPermit] = useState<DocumentState>({ uri: 0, name: null });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const fetchImagesStatus = async () => {
    try {
      const uid = await SecureStore.getItemAsync('uid');
      if (!uid) return;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) return;

      const data = userDoc.data();

      const fileRefs = {
        profilepictures: ref(storage, `profilepictures/${uid}-profilepictures`),
        barangayclearances: ref(storage, `barangayclearances/${uid}-barangayclearances`),
        nbiclearances: ref(storage, `nbiclearances/${uid}-nbiclearances`),
        govtids: ref(storage, `govtids/${uid}-govtids`),
        proofofincome: ref(storage, `proofofincome/${uid}-proofofincome`),
        ownerpermits: ref(storage, `ownerpermits/${uid}-ownerpermits`),
      };

      const fetchFileUrl = async (fileRef: StorageReference) =>
        await getDownloadURL(fileRef).catch(() => null);

      setUser({
        roleStatus: data.roleStatus,
        profilepictures: (await fetchFileUrl(fileRefs.profilepictures)) || require('../../assets/images/profile.png'),
        barangayclearances: (await fetchFileUrl(fileRefs.barangayclearances)) || require('../../assets/images/profile.png'),
        nbiclearances: (await fetchFileUrl(fileRefs.nbiclearances)) || require('../../assets/images/profile.png'),
        govtids: (await fetchFileUrl(fileRefs.govtids)) || require('../../assets/images/profile.png'),
        proofofincome: (await fetchFileUrl(fileRefs.proofofincome)) || require('../../assets/images/profile.png'),
        ownerpermits: (await fetchFileUrl(fileRefs.ownerpermits)) || require('../../assets/images/profile.png'),
        profilePicUrlStatus: data.profilePicUrlStatus || "Pending",
        barangayClearanceStatus: data.barangayClearanceStatus || "Pending",
        nbiClearanceStatus: data.nbiClearanceStatus || "Pending",
        govtIdStatus: data.govtIdStatus || "Pending",
        proofOfIncomeStatus: data.proofOfIncomeStatus || "Pending",
        ownerPermitStatus: data.ownerPermitStatus || "Pending"
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data or images:", error);
    }
  };

  
    fetchImagesStatus();
  }, []);
  

  const getFileName = (uri: string): string => {
    return uri.split('/').pop() || '';
  };

  const handleImagePicker = async (setter: React.Dispatch<React.SetStateAction<DocumentState>>, label: string) => {
    try {
      const result = (label ? 'Profile Picture' : false)
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
        setter({ uri: {uri: result.assets[0].uri}, name: fileName });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Register', 'Could not open the camera or gallery.');
    }
  };

  const handleSelectImage = (setter: React.Dispatch<React.SetStateAction<DocumentState>>, label: string) => {
    if (setter === setProfilePicture) {
      handleImagePicker(setter, label); // Directly use camera for profile picture
    } else {
      setCurrentSetter(() => setter); // Set the document setter to the modal
      setIsModalVisible({visible: true, label}); // Show the modal for other documents
    }
};

const uploadImageToStorage = async (uri: number | { uri: string }, folderName: string, uid: string): Promise<string> => {
  if (!uri) return ''; // Skip upload if no URI

  try {
    let imageUrl: string;

    // Extract the string URI
    if (typeof uri === 'object' && 'uri' in uri) {
      imageUrl = uri.uri;
    } else {
      throw new Error('Invalid URI format');
    }

    const fileName = `${uid}-${folderName}`;
    const storageRef = ref(storage, `${folderName}/${fileName}`);

    // Fetch the image as a blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob);
    return fileName;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};


const handleSubmit = async () => {
  try {
    const uid = await SecureStore.getItemAsync('uid');
    if (!uid) {
      Alert.alert('Error', 'User ID not found.');
      return;
    }

    // Documents with potentially empty URIs
    const documents = {
      profilepictures,
      barangayclearances,
      nbiclearances,
      govtids,
      proofofincome,
      ownerpermits,
    };

    // Filter to include only documents with valid URIs
    const validDocuments = Object.entries(documents)
      .filter(([_, document]) => document?.uri) // Keep only documents with a valid URI
      .map(([key, document]) => ({
        folderName: key,
        uri: document.uri,
        name: `${uid}-${key}`, // Generate the name dynamically
      }));

    // Log the documents to be uploaded
    console.log('Documents to upload:', validDocuments);

    // Upload the valid documents and handle Firestore updates
    const uploadPromises = validDocuments.map((docu) => {
      const uploadPromise = uploadImageToStorage(docu.uri, docu.folderName, uid);

      // Update Firestore based on folderName
      if (docu.folderName === 'profilepictures') {
        updateDoc(doc(db, 'users', uid), { profilePicUrlStatus: 'Pending' });
      } else if (docu.folderName === 'barangayclearances') {
        updateDoc(doc(db, 'users', uid), { barangayClearanceStatus: 'Pending' });
      } else if (docu.folderName === 'nbiclearances') {
        updateDoc(doc(db, 'users', uid), { nbiClearanceStatus: 'Pending' });
      } else if (docu.folderName === 'govtids') {
        updateDoc(doc(db, 'users', uid), { govtIdStatus: 'Pending' });
      } else if (docu.folderName === 'proofofincome') {
        updateDoc(doc(db, 'users', uid), { proofOfIncomeStatus: 'Pending' });
      } else if (docu.folderName === 'ownerpermits') {
        updateDoc(doc(db, 'users', uid), { ownerPermitStatus: 'Pending' , roleStatus: 'Under-review'});
      }

      return uploadPromise;
    });

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    console.log('Uploaded Files:', uploadedFiles);

    // Perform additional actions like updating Firestore if needed
    Alert.alert('Success', 'Documents uploaded successfully.');
    router.replace('./Dashboard'); // Navigate to Dashboard after upload

  } catch (error) {
    console.error('Error during submission:', error);
    Alert.alert('Submission Error', 'An error occurred while re-submitting documents.');
  }
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

        {(loading) ? (<View className="h-1/2  w-full justify-center items-center">
              <ActivityIndicator size="large" color="#EF5A6F" />
            </View>) : (
          <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className='mb-28 pt-10'
        >
          {[
            ...(user?.roleStatus === 'Rejected' ? [
                { 
                  label: 'Mayor\'s Permit', 
                  value: ownerpermits.uri, 
                  setter: setOwnerPermit, 
                  required: true, 
                  status: user?.ownerPermitStatus 
                }
              ] : [
              { 
                label: 'Profile Picture', 
                value: profilepictures ? profilepictures.uri : require('../../assets/images/profile.png'), 
                setter: setProfilePicture, 
                required: true, 
                status: user?.profilePicUrlStatus 
              },
              { 
                label: 'Barangay Clearance', 
                value: barangayclearances.uri, 
                setter: setBarangayClearance, 
                required: false, 
                status: user?.barangayClearanceStatus 
              },
              { 
                label: 'NBI Clearance', 
                value: nbiclearances.uri, 
                setter: setNbiClearance, 
                required: false, 
                status: user?.nbiClearanceStatus 
              },
              { 
                label: 'Government Issued ID', 
                value: govtids.uri, 
                setter: setGovtID, 
                required: true, 
                status: user?.govtIdStatus 
              },
              { 
                label: 'Proof of Income', 
                value: proofofincome.uri, 
                setter: setProofOfIncome, 
                required: true, 
                status: user?.proofOfIncomeStatus 
              },
            ])
          ].map((item, index) => (
            <View key={index} className='mb-5'>
              <View className='px-2 flex-row items-center space-x-2 mb-2'>
                <Text className='text-xs font-semibold'>{item.label}</Text>
                <Text className={`text-xs text-white font-bold px-4 py-1 rounded-xl ${item.status === 'Approved' ? 'bg-[#0FA958]' : 'bg-[#EF5A6F]'}`}>{item.status}</Text>
              </View>
              {item.status === 'Approved' ? null : 
                <TouchableOpacity className='flex flex-col gap-2' onPress={() => handleSelectImage(item.setter, item.label)}>
                  <View className='flex flex-row px-7 py-2 items-center bg-[#D9D9D9] rounded-xl'>
                    {item.value?.uri ? (
                      <View>
                        <View className='flex flex-col gap-2'>
                          <Text className='text-xs font-normal' numberOfLines={1} ellipsizeMode='tail'>{item.value.name}</Text>
                          <Image source={{ uri: item.value?.uri }} className='w-52 h-52' />
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
        )}

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
        visible={isModalVisible.visible}
        onRequestClose={() => setIsModalVisible({visible: false, label: ''})}
        >
        <View className="flex-1 justify-center items-center bg-[#00000080]">
            <View className="bg-white p-4 rounded-xl w-2/3">
            <Text className="text-sm font-bold mb-5">Select Image Source</Text>
            <View className='flex flex-col space-y-2 items-center justify-center'>
                <TouchableOpacity
                onPress={() => {
                    handleImagePicker(currentSetter, 'Profile Picture');
                    setIsModalVisible({visible: false, label: ''});
                }}
                className='bg-black px-3 py-2 rounded-xl'
                >
                <Text className='text-white text-xs text-center'>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={() => {
                    handleImagePicker(currentSetter, '');
                    setIsModalVisible({visible: false, label: ''});
                }}
                className='bg-black px-3 py-2 rounded-xl'
                >
                <Text className='text-white text-xs text-center'>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={() => setIsModalVisible({visible: false, label: ''})}
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