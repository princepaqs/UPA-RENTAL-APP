import React, { useState, useRef, useEffect } from 'react'; 
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Animated, RefreshControl } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'; // Added 'doc' import
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';

// Define interface for tenant data
interface TenantData {
  firstName: string;
  lastName: string;
  email: string;
  leaseStart: string;
  endDate: string;
  moveIn: string;
}

interface Tenants {
  transactionId?: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  name: string;
  leaseStart: string;
  endDate: string;
  status: string;
  moveIn: string;
  profilePicUrl?: { uri: string } | undefined;
}

export default function Tenants() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filteredTenants, setFilteredTenants] = useState<Tenants[]>([]);
  const [tenants, setTenants] = useState<Tenants[]>([]);
  const inputWidth = useRef(new Animated.Value(40)).current;
  const [activeButton, setActiveButton] = useState<'total' | 'pending'>('total'); // Simplify state to track active button

  const handleTextChange = (text: string) => {
    setSearchText(text);
    Animated.timing(inputWidth, {
      toValue: text.length > 0 ? 100 : 40,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setFilteredTenants(
      tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(text.toLowerCase()) ||
        tenant.leaseStart.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handlePendingClick = () => setActiveButton('pending');
  const handleTotalClick = () => setActiveButton('total');

  const displayedTenants = activeButton === 'pending'
  ? filteredTenants
      .filter(tenant => tenant.status === 'In-review')
      .filter(pendingTenant => 
        !tenants.some(
          approvedTenant => approvedTenant.status === 'Approved' && approvedTenant.propertyId === pendingTenant.propertyId
        )
      )
  : filteredTenants.filter(tenant => tenant.status === 'Approved');


    const fetchTenants = async () => {
      const ownerId = await SecureStore.getItemAsync('uid') || '';
      try {
        const transactionsRef = collection(db, 'propertyTransactions');
        const getOwnerTransactions = query(transactionsRef, where('ownerId', '==', ownerId));
        const transactionsSnapshot = await getDocs(getOwnerTransactions);

        const transactions = transactionsSnapshot.docs.map(doc => ({
          transactionId: doc.data().transactionId,
          tenantId: doc.data().tenantId,
          propertyId: doc.data().propertyId,
          status: doc.data().status,
          rentalStartDate: doc.data().rentalStartDate,
          rentalEndDate: doc.data().rentalEndDate,
          moveInDate: doc.data().moveInDate
        }));

        const tenantsList = await Promise.all(
          transactions.map(async ({ transactionId, tenantId, propertyId, status, rentalStartDate, rentalEndDate, moveInDate }) => {
            const tenantDoc = await getDoc(doc(db, 'users', tenantId));
            if (tenantDoc.exists()) {
              const tenantData = tenantDoc.data() as TenantData; // Explicitly type tenantData
              const fullName = `${tenantData.firstName} ${tenantData.lastName}`;
              const leaseStart = rentalStartDate;
              const endDate = rentalEndDate;
              const moveInDateStr = moveInDate; // Expected format: "MM/DD/YYYY"

              // Split the date string into month, day, and year
              const [month, day, year] = moveInDateStr.split("/").map(Number);

              // Create a Date object with the parsed values
              const moveIn = new Date(year, month - 1, day); // Month is zero-indexed in JavaScript

              // Add one day
              moveIn.setDate(moveIn.getDate() + 1);

              // Get the updated month, day, and year
              const updatedMonth = String(moveIn.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
              const updatedDay = String(moveIn.getDate()).padStart(2, '0');
              const updatedYear = moveIn.getFullYear();

              // Format the updated move-in date to "MM/DD/YYYY"
              const formattedMoveInDate = `${updatedMonth}/${updatedDay}/${updatedYear}`;
              console.log(status)
              let profilePictureUrl = null;
              if (tenantId) {
                try {
                  const profilePictureFileName = `${tenantId}-profilepictures`;
                  const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
                  profilePictureUrl = await getDownloadURL(profilePictureRef);
                } catch (error) {
                  console.error('Error fetching profile picture:', error);
                }
              }
        
              return {
                transactionId: transactionId?.toString() || 'N/A', // Provide a default value if transactionId is missing
                propertyId: propertyId?.toString() || '',
                ownerId: ownerId.toString(),
                tenantId: tenantId?.toString() || '',
                name: fullName || 'Unknown',
                leaseStart: leaseStart || '',
                endDate: endDate || '',
                status: status || 'unknown',
                moveIn: formattedMoveInDate,
                profilePicUrl: profilePictureUrl ? { uri: profilePictureUrl } : undefined
              };
            } else {
              return {
                transactionId: 'N/A', // Provide a default value for tenants without a transactionId
                propertyId: propertyId || '',
                ownerId: ownerId || '',
                tenantId: tenantId || '',
                name: 'Unknown',
                leaseStart: '',
                endDate: '',
                status: 'unknown',
                moveIn: '',
                profilePicUrl: undefined
              };
            }
          })
        );
        

        setTenants(tenantsList);
        setFilteredTenants(tenantsList);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };



  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTenants(); // This will shuffle the properties again
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          <TouchableOpacity onPress={() => router.replace('/tabs/LeaseProperty/PropertyDashboard')}>
            <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-semibold text-center'>
              {activeButton === 'pending' ? 'Pending Applications' : 'Tenants'}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-bold py-2 mt-5 border-t">Overview</Text>

        <View className="flex flex-row items-center gap-1">
          {/* Total Tenants Button */}
          <TouchableOpacity onPress={handleTotalClick} className="flex flex-col w-1/2 py-2 px-3 bg-[#333333] rounded-xl shadow-xl border border-black">
            <View className="flex-1 flex-row gap-1 items-center">
              <Text className="text-xs text-white">Total Tenants</Text>
            </View>
            <View className="flex flex-row items-center justify-between pt-2">
              {activeButton === 'total' 
                ? <AntDesign name="shrink" size={8} color="white" /> 
                : <View className='flex flex-row items-center gap-1'>
                  <AntDesign name="arrowsalt" size={8} color="white" />
                  <Text className='text-[8px] text-gray-300'>View Tenants</Text>
                </View>}
              <Text className="text-3xl font-semibold text-white">
                {tenants.filter(tenant => tenant.status === 'Approved').length}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Pending Tenant Applications Button */}
          <TouchableOpacity onPress={handlePendingClick} className="flex-1 flex-col w-1/2 py-2 px-3 bg-[#16423C] rounded-xl shadow-xl border border-black">
            <View className="flex flex-row gap-1 items-center">
              <Text className="text-xs font-semibold text-white">Pending Tenant Applications</Text>
            </View>
            <View className="flex flex-row items-center justify-between pt-2">
              {activeButton === 'pending' 
                ? <AntDesign name="shrink" size={8} color="white" /> 
                : <View className='flex flex-row items-center gap-1'>
                  <AntDesign name="arrowsalt" size={8} color="white" />
                  <Text className='text-[8px] text-gray-300'>View Application</Text>
                </View>}
              <Text className="text-3xl font-semibold text-white">
                {tenants.filter(tenant => tenant.status === 'In-review').length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row justify-between pt-5 pb-1 border-b border-gray-400 mb-2">
          <Text className="text-lg font-bold py-2">
            {activeButton === 'pending' ? 'Pending Applications' : 'List of Tenants'}
          </Text>
          <View className='py-2'>
            <View className='flex flex-row items-center bg-white px-4 rounded-full'>
              <Ionicons name="search" size={12} color="gray" />
              <Animated.View style={{ width: inputWidth }}>
                <TextInput
                  className='text-xs text-gray-400'
                  placeholder='Search'
                  value={searchText}
                  onChangeText={handleTextChange}
                />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Tenants Listing */}
        <ScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Check if there are no Approved tenants */}
  {displayedTenants.filter(tenant => tenant.status === 'Approved').length === 0 && activeButton !== 'pending' ? (
    <View className="flex items-center justify-center mt-10">
      <Text className="text-sm text-gray-500">You have no tenants at the moment.</Text>
    </View>
  ) : null}

  {/* Check if there are no In-review tenants */}
  {displayedTenants.filter(tenant => tenant.status === 'In-review').length === 0 && activeButton === 'pending' ? (
    <View className="flex items-center justify-center mt-10">
      <Text className="text-sm text-gray-500">You have no pending tenants at the moment.</Text>
    </View>
  ) : null}

  {/* Render the list of tenants if there are any */}
  <View className="flex flex-col space-y-3 mt-2 mb-10 flex-wrap">
    {displayedTenants.map((tenant: Tenants) => (
      <TouchableOpacity
        key={`${tenant.ownerId}-${tenant.propertyId}-${tenant.tenantId}`}
        className="w-full p-1 flex flex-row px-2 py-3 rounded-xl border border-gray-200 shadow-xl bg-white"
        onPress={async () => {
          const transactionId = tenant.transactionId;

          if (tenant.status === 'Approved' && transactionId) {
            await SecureStore.setItemAsync('transactionId', transactionId);
            router.push('./tenantDetails'); // Route to tenantDetails if status is Approved
          } else if (transactionId) {
            try {
              await SecureStore.setItemAsync('transactionId', transactionId); // Save transactionId to SecureStore
              router.push('./PendingApplication'); // Route to PendingApplication if status is not Approved
            } catch (error) {
              console.error('Error setting transactionId in SecureStore:', error);
            }
          } else {
            console.error('Transaction ID is missing');
          }
        }}
      >
        <View className="w-12 h-12 rounded-full overflow-hidden mr-4">
          {tenant.profilePicUrl ? (
            <Image source={tenant.profilePicUrl} style={{ width: 48, height: 48 }} />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="gray" />
          )}
        </View>
        <View className="flex flex-col justify-center">
          <Text className="text-lg font-bold">{tenant.name}</Text>
          {tenant?.status !== 'Approved' ? (
            <View>
              <Text className="text-gray-500">{tenant.moveIn}</Text>
              <View className="flex-row items-center space-x-1">
                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">Status:</Text>
                <Text
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      tenant?.status === 'Approved'
                        ? '#0FA958'
                        : tenant?.status === 'Waiting Signature & Payment'
                        ? '#FF6500'
                        : tenant?.status === 'In-review'
                        ? '#333333'
                        : '#007BFF',
                  }}
                ></Text>
                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                  color:
                    tenant?.status === 'Approved'
                      ? '#0FA958'
                      : tenant?.status === 'Waiting Signature & Payment'
                      ? '#FF6500'
                      : tenant?.status === 'Under Review'
                      ? '#333333'
                      : '#007BFF',
                }}>
                  {tenant.status}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-gray-500">{tenant.leaseStart} - {tenant.endDate}</Text>
              <View className="flex-row items-center space-x-1">
                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs text-[#6C6C6C]">Status:</Text>
                <Text
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      tenant?.status === 'Approved'
                        ? '#0FA958'
                        : tenant?.status === 'Move out'
                        ? '#333333'
                        : '#007BFF',
                  }}
                ></Text>
                <Text numberOfLines={1} ellipsizeMode="tail" className="text-xs font-bold" style={{
                  color:
                    tenant?.status === 'Approved'
                      ? '#0FA958'
                      : tenant?.status === 'Move out'
                      ? '#333333'
                      : '#007BFF',
                }}>
                  {tenant.status}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ))}
  </View>
</ScrollView>



      </View>
    </View>
  );
}
