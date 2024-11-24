import { View, Text, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../../_dbconfig/dbconfig';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import moment from 'moment';

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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleDownload = async (document: Document) => {
    let date = moment().format('YYYYMMDDhhmmss');
    let fileUri = FileSystem.documentDirectory + `${date}-${document.fileName}.jpg`;
    try {
      const res = await FileSystem.downloadAsync(document.file, fileUri);
      saveFile(res.uri, document.fileName); // Pass fileName here
    } catch (err) {
      console.log("FS Error: ", err);
    }
  };
  

  const saveFile = async (fileUri: string, fileName: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      try {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        // Show success alert with file name
        Alert.alert("Download Successful", `${fileName} has been downloaded successfully.`);
      } catch (err) {
        console.log("Save error: ", err);
      }
    } else {
      Alert.alert("Permissions Denied", "Please allow permissions to download files.");
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
        const barangayClearanceFileName = `${uid}-barangayclearances`;
        const nbiClearanceFileName = `${uid}-nbiclearances`;
        const governmentIdFileName = `${uid}-govtids`;
        const proofOfIncomeFileName = `${uid}-proofofincome`;

        const barangayClearanceUrl = await getDownloadURL(ref(storage, `barangayclearances/${barangayClearanceFileName}`));
        const nbiClearanceUrl = await getDownloadURL(ref(storage, `nbiclearances/${nbiClearanceFileName}`));
        const governmentIdUrl = await getDownloadURL(ref(storage, `govtids/${governmentIdFileName}`));
        const proofOfIncomeUrl = await getDownloadURL(ref(storage, `proofofincome/${proofOfIncomeFileName}`));

        setDocuments([
          { id: 1, fileName: 'Barangay Clearance', file: barangayClearanceUrl },
          { id: 2, fileName: 'NBI Clearance', file: nbiClearanceUrl },
          { id: 3, fileName: 'Government ID', file: governmentIdUrl },
          { id: 4, fileName: 'Proof of Income', file: proofOfIncomeUrl },
        ]);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    getData();
  }, []);

  return (
    <View className="bg-[#B33939]">
      <View className="h-screen bg-white px-6 mt-14 rounded-t-2xl">
        <View className="flex flex-row items-center justify-between px-6 pt-8 mb-10">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="gray" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Legal Documents</Text>
          </View>
        </View>

        <View className="gap-6 p-4">
          {documents.map((document) => (
            <View key={document.id}>
              <Text className="text-sm font-bold">
                {document.fileName.split('_').join(' ').replace('.pdf', '')}
              </Text>
              <TouchableOpacity className="flex flex-row bg-gray-100 rounded-xl py-2 items-center justify-between w-full pl-8 pr-4"
              onPress={() => handleImagePreview(document)}>
                <Text className="text-xs">{document.fileName}</Text>
                <TouchableOpacity onPress={() => handleDownload(document)}>
                  <Feather name="download" size={20} color="gray" />
                </TouchableOpacity>

              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/80">
            <TouchableOpacity
              onPress={() => setImageModalVisible(false)}
              className="absolute top-10 right-5 z-10"
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <View className="rounded-lg">
              {selectedDocument?.file && (
                <Image
                  source={{ uri: selectedDocument.file }}
                  style={{ width: 600, height: 400 }}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
