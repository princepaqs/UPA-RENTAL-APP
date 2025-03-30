import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { AntDesign, Feather, FontAwesome5, FontAwesome6, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
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

// Fetch image from Firebase Storage
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

export default function MaintenanceScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Maintenance[]>([]);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputWidth = useRef(new Animated.Value(40)).current;

  const filteredMaintenances = filterStatus
    ? maintenances.filter(maintenance => maintenance.status === filterStatus)
    : maintenances;

    console.log(filteredMaintenances.map((m) => m.id));

    const uniqueMaintenances = Array.from(new Map(filteredMaintenances.map(m => [m.id, m])).values());



  const formatDate = (timestamp: Timestamp | null | undefined) =>
    timestamp ? timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  // Fetch maintenances on component mount

  useEffect(() => {
    const fetchMaintenancesRealtime = async () => {
      const uid = await SecureStore.getItemAsync('uid');
      if (!uid) return;
  
      const unsubscribeMaintenancesArray: (() => void)[] = [];
  
      try {
        // Step 1: Listen for changes in the "contracts" collection
        const maintenancesRef = query(collection(db, 'contracts'), where('ownerId', '==', uid));
  
        const unsubscribeContracts = onSnapshot(maintenancesRef, async (tenantSnapshot) => {
          if (tenantSnapshot.empty) {
            console.log('No tenants found in maintenances collection.');
            setError('No maintenance records found');
            setMaintenances([]);
            setFilteredProperties([]);
            return;
          }
  
          // Clear previous maintenance data and listeners
          setMaintenances([]);
          setFilteredProperties([]);
          unsubscribeMaintenancesArray.forEach((unsubscribe) => unsubscribe());
          unsubscribeMaintenancesArray.length = 0;
  
          // Step 2: For each tenant, listen for changes in their maintenance subcollections
          const tenantPromises = tenantSnapshot.docs.map(async (tenantDoc) => {
            const data = tenantDoc.data();
            if (!data) {
              console.log('No data found.');
              return;
            }
  
            const maintenanceSubCollectionRef = collection(db, 'maintenances', data.tenantId, 'maintenanceId');
            const maintenanceQuery = query(maintenanceSubCollectionRef, where('ownerId', '==', uid));
  
            // Listen for changes in this tenant's maintenance records
            const unsubscribeMaintenances = onSnapshot(maintenanceQuery, async (maintenanceSnapshot) => {
              if (!maintenanceSnapshot.empty) {
                const tenantMaintenances = await Promise.all(
                  maintenanceSnapshot.docs.map(async (doc) => {
                    const maintenanceData = doc.data();
                    const image = maintenanceData.images?.[0]
                      ? await getImageUrl(data.tenantId, maintenanceData.images[0])
                      : require('../../../../assets/images/property1.png');
  
                    return {
                      id: doc.id,
                      tenantId: data.tenantId,
                      propertyId: maintenanceData.propertyId,
                      ownerId: maintenanceData.ownerId,
                      name: maintenanceData.fullName,
                      date: formatDate(maintenanceData.submittedAt),
                      status: maintenanceData.status,
                      image,
                    };
                  })
                );
                setMaintenances((prev) => [...prev, ...tenantMaintenances]);
                setFilteredProperties((prev) => [...prev, ...tenantMaintenances]);
              }
            });
  
            // Track the unsubscribe function for cleanup
            unsubscribeMaintenancesArray.push(unsubscribeMaintenances);
          });
  
          // Wait for all tenant processing to finish
          await Promise.all(tenantPromises);
        });
  
        // Clean up subscriptions on unmount
        return () => {
          unsubscribeContracts();
          unsubscribeMaintenancesArray.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error('Failed to fetch maintenance data:', error);
        setError('Failed to fetch maintenance data.');
      }
    };
  
    fetchMaintenancesRealtime();
  }, []);
  

  
  
  

  // Handle search input change
  const handleTextChange = (text: string) => {
    setSearchText(text);

    Animated.timing(inputWidth, {
      toValue: text.length > 0 ? 100 : 40, 
      duration: 200,
      useNativeDriver: false,
    }).start();

    const filtered = maintenances.filter(maintenance =>
      maintenance.name.toLowerCase().includes(text.toLowerCase()) || 
      maintenance.status.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  return (
    <View className="bg-[#B33939]">
      <View className="h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-6 pt-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-lg font-semibold text-center">Maintenance</Text>
          </View>
        </View>

        <Text className="text-lg font-bold py-2 border-t mt-5">Overview</Text>

        {/* Status Overview */}
        <View className="flex flex-row items-center gap-1 pr-2">
          {['Pending', 'In Progress', 'Completed'].map((status, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setFilterStatus(status === filterStatus ? null : status)} // Toggle filter
              className={`flex flex-col w-1/3 py-2 px-3 rounded-lg shadow-lg ${
                status === 'Pending'
                  ? 'bg-[#333333]'
                  : status === 'In Progress'
                  ? 'bg-[#B33939]'
                  : 'bg-[#16423C]'
              }`}
            >
              <Text className="text-xs text-white">{status}</Text>
              <View className="flex items-end pt-2">
                <Text className="text-3xl font-semibold text-white">
                  {uniqueMaintenances.filter(tenant => tenant.status === status).length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex flex-row justify-between pt-5 pb-1 border-b border-gray-400 mb-2">
          <Text className="text-lg font-bold py-2">Request</Text>
          <View className="flex flex-row items-center justify-center py-2">
            <View className="flex flex-row items-center bg-gray-100 px-4 rounded-full">
              <Ionicons name="search" size={15} color="gray" />
              <TextInput 
                className="text-xs text-gray-400" 
                placeholder="Search"
                // Handle search functionality if needed
              />
            </View>
          </View>
        </View>

        {/* Maintenance List */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-3 px-4 mb-20">
            {uniqueMaintenances.length > 0 ? (
              uniqueMaintenances.map((maintenance) => (
                <TouchableOpacity 
                  key={maintenance.id} 
                  className="w-full p-2.5 rounded-xl shadow-xl border border-gray-100 bg-white flex flex-row"
                  onPress={async () => {
                    await SecureStore.setItemAsync('maintenanceId', maintenance.id);
                    await SecureStore.setItemAsync('maintenanceTenantId', maintenance.tenantId);
                    await SecureStore.setItemAsync('maintenancePropertyId', maintenance.propertyId);
                    await SecureStore.setItemAsync('maintenanceOwnerId', maintenance.ownerId);
                    router.push('./ViewMaintenance');
                  }}
                >
                  <Image source={maintenance.image} className="w-16 h-16 rounded-lg mr-3" />
                  <View className="flex-1">
                    <Text className="text-xs text-[#6C6C6C]" numberOfLines={1}>{maintenance.name}</Text>
                    <Text className="text-xs text-[#6C6C6C]" numberOfLines={1}>{maintenance.date}</Text>
                    <View className="flex-row items-center space-x-1">
                      <Text className="text-xs text-[#6C6C6C]">Status:</Text>
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            maintenance.status === 'Approved'
                              ? '#0FA958'
                              : maintenance.status === 'Pending'
                              ? '#333333'
                              : maintenance.status === 'In Progress'
                              ? '#FF6500'
                              : 'green',
                        }}
                      />
                      <Text className="text-xs text-[#6C6C6C]">{maintenance.status}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="gray" />
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-5">No {filterStatus || 'maintenance'} requests available.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
