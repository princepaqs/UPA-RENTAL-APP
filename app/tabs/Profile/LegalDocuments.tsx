import { View, Text, TouchableOpacity, Modal, Alert, Image, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../../../_dbconfig/dbconfig';
import * as FileSystem from 'expo-file-system'; // Import FileSystem

// Define a type for the Document
type Document = {
  id: number;
  fileName: string;
  file: string; // Store file URL here
};

export default function LegalDocuments() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null); // Allow null type
  const [documents, setDocuments] = useState<Document[]>([]); // State to store document data

  const handleDownload = async (document: Document) => {
    if (Platform.OS === 'android') {
      const uri = document.file;

      // Request directory permissions
      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permission.granted) {
        try {
          // Fetch the file from the URI
          const response = await fetch(uri);
          const blob = await response.blob();

          // Convert the blob to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const mimeType = 'image/jpeg'; // Change to the appropriate mime type if necessary

          // Create the file
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permission.directoryUri,
            document.fileName,
            mimeType // Add the mimeType argument here
          );

          // Write the base64 string to the file
          await FileSystem.writeAsStringAsync(fileUri, base64.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });

          Alert.alert('Download Complete', `File saved to: ${fileUri}`);
        } catch (error: any) {
          console.error('Error downloading the file:', error);
          Alert.alert('Download Failed', `An error occurred while downloading the file: ${error}`);
        }
      }
    }
  };
  

  

  const handleImagePreview = (document: Document) => {
    setSelectedDocument(document);
    setImageModalVisible(true);
  };

  useEffect(() => {
    const getData = async () => {
      const uid = await SecureStore.getItemAsync('uid');

      if (!uid) {
        return;
      }

      try {
        // Get URLs for each document
        const barangayClearanceFileName = `${uid}-barangayclearances`;
        const nbiClearanceFileName = `${uid}-nbiclearances`;
        const governmentIdFileName = `${uid}-govtids`;
        const proofOfIncomeFileName = `${uid}-proofofincome`;

        const barangayClearanceUrl = await getDownloadURL(ref(storage, `barangayclearances/${barangayClearanceFileName}`));
        const nbiClearanceUrl = await getDownloadURL(ref(storage, `nbiclearances/${nbiClearanceFileName}`));
        const governmentIdUrl = await getDownloadURL(ref(storage, `govtids/${governmentIdFileName}`));
        const proofOfIncomeUrl = await getDownloadURL(ref(storage, `proofofincome/${proofOfIncomeFileName}`));

        // Update the documents state with the actual data from Firebase
        setDocuments([
          { id: 1, fileName: 'Barangay_Clearance', file: barangayClearanceUrl },
          { id: 2, fileName: 'NBI_Clearance', file: nbiClearanceUrl },
          { id: 3, fileName: 'Government_ID', file: governmentIdUrl },
          { id: 4, fileName: 'Proof_of_Income', file: proofOfIncomeUrl },
        ]);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    getData();
  }, []);

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 mb-10'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="gray" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Legal Documents</Text>
          </View>
        </View>

        <View className='gap-6 p-4'>
          {/* Displaying each document */}
          {documents.map((document) => (
            <View key={document.id}>
              <Text className='text-sm font-bold'>
                {document.fileName.split('_').join(' ').replace('.pdf', '')}
              </Text>
              <TouchableOpacity onPress={() => handleImagePreview(document)}>
                <View className='flex flex-row bg-gray-100 rounded-xl py-2 items-center justify-between w-full pl-8 pr-4'>
                  <Text className='text-xs'>{document.fileName}</Text>
                  <TouchableOpacity onPress={() => handleDownload(document)}>
                    <Feather name="download" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Image Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/80'>
            <TouchableOpacity 
              onPress={() => setImageModalVisible(false)}
              className='absolute top-10 right-5 z-10'>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <View className='rounded-lg'>
              {selectedDocument?.file && (
                <Image
                  source={{ uri: selectedDocument.file }}
                  style={{ width: 600, height: 400 }} // Adjust size as needed
                  resizeMode="contain" // Adjust the image display mode
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
