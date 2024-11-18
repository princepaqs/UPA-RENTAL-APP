import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Define a type for the Document
type Document = {
  id: number;
  fileName: string;
};

export default function LegalDocuments() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null); // Allow null type

  // Dummy data for legal documents
  const documents: Document[] = [
    { id: 1, fileName: 'barangay_clearance.pdf' },
    { id: 2, fileName: 'nbi_clearance.pdf' },
    { id: 3, fileName: 'government_id.pdf' },
    { id: 4, fileName: 'proof_of_income.pdf' },
  ];

  const handleDownload = (document: Document) => { // Specify Document type
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const confirmDownload = () => {
    if (selectedDocument) { // Ensure selectedDocument is not null
      Alert.alert("Download", `${selectedDocument.fileName} has been downloaded.`);
    }
    setModalVisible(false);
    setSelectedDocument(null);
  };

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
              <Text className='text-sm font-bold'>{document.fileName.split('_').join(' ').replace('.pdf', '')}</Text>
              <View className='flex flex-row bg-gray-100 rounded-xl py-2 items-center justify-between w-full pl-8 pr-4'>
                <Text className='text-xs'>{document.fileName}</Text>
                <TouchableOpacity onPress={() => handleDownload(document)}>
                  <Feather name="download" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Modal for Download Confirmation */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className='flex-1 justify-center items-center bg-black/50 px-3'>
            <View className='bg-white rounded-lg p-5'>
              <Text className='text-lg font-bold mb-4'>Download Confirmation</Text>
              <Text className='text-sm mb-4'>Do you want to download {selectedDocument?.fileName}?</Text>
              <View className='flex-row justify-center gap-5'>
                <TouchableOpacity 
                  onPress={confirmDownload}
                  className='bg-black rounded-md px-4 py-2'>
                  <Text className='text-white'>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  className='border rounded-md px-4 py-2'>
                  <Text>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
