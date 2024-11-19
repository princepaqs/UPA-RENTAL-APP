import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';

interface Maintenance {
  id: string;
  tenantId: string;
  ownerId: string;
  propertyId: string;
  name: string;
  date: string;
  status: string;
  image: { uri: string } | number;
}

const getImageUrl = async (uid: string, fileName: string) => {
  try {
    const storageRef = ref(storage, `maintenances/${uid}/images/${fileName}`);
    const url = await getDownloadURL(storageRef);
    return { uri: url };
  } catch (error) {
    console.error("Error fetching image URL:", error);
    return null;
  }
};

export default function TrackMaintenance() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  const formatDate = (timestamp: Timestamp | null | undefined) =>
    timestamp ? timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  useEffect(() => {
    const fetchMaintenances = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      console.log(uid);
      if (uid) {
        // Create a real-time listener for the 'maintenances' collection
        const maintenanceQuery = query(collection(db, 'maintenances', uid, 'maintenanceId'), where('tenantId', '==', uid));
        
        const unsubscribe = onSnapshot(maintenanceQuery, async (maintenanceSnapshot) => {
          if (!maintenanceSnapshot.empty) {
            const maintenanceArray: Maintenance[] = await Promise.all(
              maintenanceSnapshot.docs.map(async (doc) => {
                const maintenanceData = doc.data();
                const image = maintenanceData.images?.[0] ? await getImageUrl(uid, maintenanceData.images[0]) : require('../../../../assets/images/property1.png');
                return {
                  id: doc.id,
                  tenantId: maintenanceData.tenantId,
                  propertyId: maintenanceData.propertyId,
                  ownerId: maintenanceData.ownerId,
                  name: maintenanceData.fullName,
                  date: formatDate(maintenanceData.submittedAt), // Format date as needed 'Month dd, YYYY'
                  status: maintenanceData.status,
                  image,
                };
              })
            );
            setMaintenances(maintenanceArray);
          } else {
            setMaintenances([]); // If no documents, set an empty array
          }
          setLoading(false);
        });

        // Clean up the listener on unmount
        return () => unsubscribe();
      }
    };

    fetchMaintenances();
  }, []);

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 mb-10'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Track Maintenance Request</Text>
          </View>
        </View>

        {/* Maintenance Listing */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex flex-col items-center gap-3 mb-10 ">
            {loading ? (
              <View className="flex-1 w-full h-full justify-center items-center">
                <ActivityIndicator size="large" color="gray" />
              </View>
            ) : (
              maintenances.length > 0 ? (
                maintenances.map((maintenance) => (
                  <TouchableOpacity
                    className='py-2 px-2.5 flex-wrap bg-white rounded-xl shadow-xl border border-gray-200'
                    key={maintenance.id}
                    onPress={async () => {
                      router.push('./MaintenanceDetails')
                      await SecureStore.setItemAsync('maintenanceId', maintenance.id);
                      await SecureStore.setItemAsync('maintenancePropertyId', maintenance.propertyId);
                      await SecureStore.setItemAsync('maintenanceOwnerId', maintenance.ownerId);
                    }}
                  >
                    <View className="w-full p-1 flex flex-row">
                      <Image
                        className="w-[80px] h-[80px] object-cover rounded-2xl"
                        source={maintenance.image}
                      />
                      <View className="flex flex-col flex-1 gap-1 px-2 pt-2">
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          {maintenance.name}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">
                          Date of Request: {maintenance.date}
                        </Text>
                        <View className='flex-row items-center space-x-2'>
                          <Text className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                maintenance.status === 'Approved' ? '#0FA958' :
                                maintenance.status === 'Pending' ? '#333333' :
                                maintenance.status === 'In Progress' ? '#FF6500' : 'green',
                            }}
                          />
                          <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold"
                            style={{
                              color:
                                maintenance.status === 'Approved' ? '#0FA958' :
                                maintenance.status === 'Pending' ? '#333333' :
                                maintenance.status === 'In Progress' ? '#FF6500' : 'green',
                            }}>
                            Status: {maintenance.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className='text-center text-sm text-gray-500 mt-4'>
                  It looks like you don’t have any maintenance requests yet.
                </Text>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
