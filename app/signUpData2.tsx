import { View, Text, TextInput, Pressable, Alert, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { getDocs, collection, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../_dbconfig/dbconfig'; // Import Firestore instance

interface Location {
  code: string;
  name: string;
  type?: string; // Optional if necessary
}
const salaryRanges = [
  { label: '₱20,000 and below / month', value: '20000_below' },
  { label: '₱20,001 - ₱30,000 / month', value: '20001_30000' },
  { label: '₱30,001 - ₱40,000 / month', value: '30001_40000' },
  { label: '₱40,001 - ₱50,000 / month', value: '40001_50000' },
  { label: '₱50,001 and above / month', value: '50001_above' },
];

export default function SignUp2() {
  const router = useRouter();

  const [locations, setLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showBarangayModal, setShowBarangayModal] = useState<boolean>(false);
  const [salaryDropdownOpen, setSalaryDropdownOpen] = useState<boolean>(false); // State for salary dropdown
  const [selectedSalary, setSelectedSalary] = useState<string>('');
  const houseNoRef = useRef<string>('');
  const [region, userSelectedRegion] = useState<string>('');
  const [city, userSelectedCity] = useState<string>('');
  const [brgy, userSelectedBrgy] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>(''); // Added state for barangay
  const phoneRef = useRef<string>('');
  const professionRef = useRef<string>('');
  const salaryRef = useRef<string>('');
  const emailRef = useRef<string>('');
  const passwordRef = useRef<string>('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordVisible, setPasswordVisible] = useState(false);
const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

// Function to validate password requirements
const isPasswordValid = (password: string) => {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  useEffect(() => {
    // Fetch regions and provinces
    Promise.all([
      fetch('https://psgc.gitlab.io/api/regions/').then(response => response.json()),
      fetch('https://psgc.gitlab.io/api/provinces/').then(response => response.json()),
    ])
      .then(([regionsData, provincesData]) => {
        const combinedLocations = [
          ...regionsData.map((region: any) => ({ code: region.code, name: region.name, type: 'region' })),
          ...provincesData.map((province: any) => ({ code: province.code, name: province.name, type: 'province' })),
        ].sort((a, b) => a.name.localeCompare(b.name));
        setLocations(combinedLocations);
      })
      .catch(error => {
        console.error('Error fetching locations:', error);
        Alert.alert('Error', 'Failed to load locations.');
      });
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const locationType = locations.find(loc => loc.code === selectedLocation)?.type;
      if (locationType) {
        fetch(`https://psgc.gitlab.io/api/${locationType}s/${selectedLocation}/cities-municipalities/`)
          .then(response => response.json())
          .then(data => {
            const sortedCities = data.map((city: any) => ({ code: city.code, name: city.name }))
              .sort((a: Location, b: Location) => a.name.localeCompare(b.name));
            setCities(sortedCities);
          })
          .catch(error => console.error(error));
      }
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedCity) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays/`)
        .then(response => response.json())
        .then(data => {
          const sortedBarangays = data.map((barangay: any) => ({ code: barangay.code, name: barangay.name }))
            .sort((a: Location, b: Location) => a.name.localeCompare(b.name));
          setBarangays(sortedBarangays);
        })
        .catch(error => console.error(error));
    }
  }, [selectedCity]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password: string) => {
    // Regular expression: At least 8 characters, 1 special character, and 1 number
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordRegex.test(password)) {
      setPasswordError('Password must have at least 8 characters, 1 special character, and 1 number.');
    } else {
      setPasswordError(''); // Clear error if password is valid
    }
  };


  const handleContinue = async () => {
    setLoading(true);

    const email = emailRef.current;
    const password = passwordRef.current;

    if (!houseNoRef.current || !phoneRef.current || !professionRef.current ||
        !selectedLocation || !selectedCity || !selectedBarangay || 
        !email || !password) {
      Alert.alert('Sign Up', "Please fill all the fields!");
      setLoading(false);
      return;
    }

    // Email validation
    if (!email.endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password length validation
    if (password.length < 8 || password.length > 16) {
      Alert.alert('Invalid Password', 'Password must be between 8 and 16 characters and contains 1 or more special characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword){
      Alert.alert('Invalid Password', 'Password is not correct.');
      setLoading(false);
      return;
    }

    // Save the data using SecureStore
    await SecureStore.setItemAsync('homeAddress', houseNoRef.current);
    await SecureStore.setItemAsync('location', region);
    await SecureStore.setItemAsync('city', city);
    await SecureStore.setItemAsync('barangay', brgy);
    await SecureStore.setItemAsync('phoneNo', phoneRef.current);
    await SecureStore.setItemAsync('profession', professionRef.current);
    await SecureStore.setItemAsync('salary', salaryRef.current);
    await SecureStore.setItemAsync('email', email);
    await SecureStore.setItemAsync('password', password);
    await SecureStore.setItemAsync('salary', selectedSalary);

    // Check if the email is already registered
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(query(usersCollection, where("email", "==", email)));

    if (!querySnapshot.empty) {
      Alert.alert('Email already exists');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push('/signUpDocuments');
  };

  const [searchLocation, setSearchLocation] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchBarangay, setSearchBarangay] = useState('');
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchLocation.toLowerCase())
  );
  
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );
  
  const filteredBarangays = barangays.filter(barangay =>
    barangay.name.toLowerCase().includes(searchBarangay.toLowerCase())
  );
  const [phoneNumber, setPhoneNumber] = useState('09');
  return (
    <View className='flex-1 bg-[#B33939]'>
      <View className="flex items-start px-12 pb-10 pt-20 justify-center bg-[#B33939]">
        {/* Other content */}
      </View>

      <View className='flex w-full px-12 py-5 rounded-t-2xl bg-[#FFFFFF] mb-28'>

        <View className='pb-4'>
            <Text className='text-lg font-semibold'>Personal Information</Text>
            <Text className='text-xs'>Provide your contact details for verification.</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className='mb-20'>
            
            {/* Home Address */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Home Address</Text>
              <TextInput
                onChangeText={value => houseNoRef.current = value}
                className='px-8 py-1 bg-gray-100 rounded-xl text-xs'
                placeholder='House No., Street Address'
              />
            </View>

            {/* Location Button */}
            <Text className='px-2 pb-1 text-xs pt-2 font-semibold'>Region / Province</Text>
            <TouchableOpacity className='px-6 py-2 bg-gray-100 rounded-xl' onPress={() => setShowLocationModal(true)}>
              <Text className='px-2 pb-1 text-xs'>{selectedLocation ? locations.find(loc => loc.code === selectedLocation)?.name : 'Select Location'}</Text>
            </TouchableOpacity>

            {/* City Button */}
            <Text className='px-2 pb-1 text-xs pt-2 font-semibold'>City / Municipality</Text>
            <TouchableOpacity className='px-6 py-2 bg-gray-100 rounded-xl' onPress={() => setShowCityModal(true)}>
              <Text className='px-2 pb-1 text-xs'>{selectedCity ? cities.find(city => city.code === selectedCity)?.name : 'Select City'}</Text>
            </TouchableOpacity>

            {/* Barangay Button */}
            <Text className='px-2 pb-1 text-xs pt-2 font-semibold'>Barangay</Text>
            <TouchableOpacity className='px-6 py-2 bg-gray-100 rounded-xl' onPress={() => setShowBarangayModal(true)}>
              <Text className='px-2 pb-1 text-xs'>{selectedBarangay ? barangays.find(barangay => barangay.code === selectedBarangay)?.name : 'Select Barangay'}</Text>
            </TouchableOpacity>

           {/* Phone Number */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={value => {
                  // Enforce that the phone number starts with "09"
                  let filteredValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                  if (!filteredValue.startsWith('09')) {
                    filteredValue = '09' + filteredValue.slice(2); // Ensure it starts with "09"
                  }
                  if (filteredValue.length < 11) {
                    setError('Phone number must be exactly 11 digits.');
                  } else {
                    setError(''); // Clear error if valid
                  }
                  setPhoneNumber(filteredValue); // Update state
                  phoneRef.current = filteredValue; // Update reference
                }}
                className='px-8 py-1 bg-gray-100 rounded-xl text-xs'
                placeholder='Phone Number'
                placeholderTextColor={'gray'}
                keyboardType='phone-pad'
                maxLength={11}
              />
              {error !== '' && (
                <Text className="text-red-500 text-xs mt-1 px-2">{error}</Text>
              )}
            </View>


            {/* Profession */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Profession</Text>
              <TextInput
                onChangeText={value => professionRef.current = value}
                className='px-8 py-1 bg-gray-100 rounded-xl text-xs'
                placeholder='Profession'
              />
            </View>

            {/* Monthly Salary Dropdown */}
            <View className='pt-5'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Monthly Salary</Text>
              <Pressable onPress={() => setSalaryDropdownOpen(!salaryDropdownOpen)} className='flex flex-row px-4 py-2.5 items-center bg-gray-100 rounded-xl'>
                <Text className='flex-1 text-xs font-semibold'>{selectedSalary ? salaryRanges.find(range => range.value === selectedSalary)?.label : 'Select Salary Range'}</Text>
                <Ionicons name={salaryDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color="gray" />
              </Pressable>
              {salaryDropdownOpen && (
                <View className='px-4 bg-gray-100 rounded-xl'>
                  {salaryRanges.map((option, index) => (
                    <Pressable key={index} onPress={() => { setSelectedSalary(option.value); setSalaryDropdownOpen(false); }} className='py-2'>
                      <Text className='text-xs'>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Email */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Email Address</Text>
              <TextInput
                onChangeText={value => emailRef.current = value}
                className='px-8 py-1 bg-gray-100 rounded-xl text-xs'
                placeholder='Email Address'
                keyboardType='email-address'
              />
            </View>

           {/* Password */}
            {/* <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Password</Text>
              <Text className='px-2 pb-1 text-xs text-gray-500'>
                At least 8 characters, 1 special character, and 1 number
              </Text>
              <View className='flex flex-row px-8 py-1 items-center bg-gray-100 rounded-xl'>
                <TextInput
                  onChangeText={value => {
                    passwordRef.current = value;
                  }}
                  style={{ flex: 1, fontSize: 12, color: 'black' }}
                  placeholder='Password'
                  secureTextEntry={!passwordVisible}
                  maxLength={16}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={15} color="gray" />
                </TouchableOpacity>
              </View>
            </View> */}
            {/* Password */}
            <View className="pt-2">
              <Text className="px-2 pb-1 text-xs font-semibold">Password</Text>
              <Text className="px-2 pb-1 text-xs text-gray-500">
                At least 8 characters, 1 special character, and 1 number
              </Text>
              <View className="flex flex-row px-8 py-1 items-center bg-gray-100 rounded-xl">
                <TextInput
                  onChangeText={(value) => {
                    passwordRef.current = value;
                    setPassword(value); // Update state
                    validatePassword(value); // Check password validity
                  }}
                  style={{ flex: 1, fontSize: 12, color: 'black' }}
                  placeholder="Password"
                  secureTextEntry={!passwordVisible}
                  maxLength={16}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Feather name={passwordVisible ? 'eye' : 'eye-off'} size={15} color="gray" />
                </TouchableOpacity>
              </View>
              {/* Error Message */}
              {passwordError !== '' && (
                <Text className="text-red-500 text-xs mt-1 px-2">{passwordError}</Text>
              )}
            </View>


            {/* Confirm Password */}
            <View className='pt-2'>
              <Text className='px-2 pb-1 text-xs font-semibold'>Confirm Password</Text>
              <View className='flex flex-row px-8 py-1 items-center bg-gray-100 rounded-xl'>
                <TextInput
                  onChangeText={value => setConfirmPassword(value)}
                  style={{ flex: 1, fontSize: 12, color: 'black' }}
                  placeholder='Confirm Password'
                  secureTextEntry={!confirmPasswordVisible}
                  maxLength={16}
                />
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                  <Feather name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={15} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <View className='pt-10 flex flex-row items-center justify-center gap-1 px-1'>
              <Pressable className='w-1/2 bg-[#333333] py-3 rounded-xl' onPress={() => router.back()}>
                <Text className='text-white font-semibold text-xs text-center'>Back</Text>
              </Pressable>
              {
                loading ? (
                  <View className='px-8 py-0'>
                    <View className=' items-center rounded-xl'>
                      <Loading />
                    </View>
                  </View>
                ) : (
                    <Pressable className='w-1/2 bg-[#D9534F] py-3 rounded-xl' onPress={handleContinue}>
                      <Text className='text-white font-semibold text-xs text-center'>Continue</Text>
                    </Pressable>
                )
              }
              
            </View>
            <TouchableOpacity className='flex-row space-x-1 items-center justify-center my-5'
                      onPress={() => router.replace('./signIn')}
                      >
                      <Entypo name="chevron-left" size={15} color="black" />
                      <Text className='text-xs font-semibold'>Back to  log in</Text>
                    </TouchableOpacity>
           {/* Location Modal */}
            <Modal
              visible={showLocationModal}
              transparent={true}
              animationType='slide'
              onRequestClose={() => setShowLocationModal(false)}
            >
              <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
                <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
                  <Text className='text-lg font-bold mb-2'>Select Region/Province</Text>
                  <TextInput
                    className='bg-gray-100 rounded-md p-2 mb-2'
                    placeholder='Search Region/Province'
                    value={searchLocation}
                    onChangeText={setSearchLocation}
                  />
                  <FlatList
                    data={filteredLocations}
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedLocation(item.code);
                          setSelectedCity(''); // Clear the selected city
                          setSelectedBarangay(''); // Clear the selected barangay
                          setShowLocationModal(false);
                          userSelectedRegion(item.name);
                        }}
                        className='py-2'
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  {/* Close Button */}
                  <TouchableOpacity 
                    onPress={() => setShowLocationModal(false)} 
                    className='bg-[#333333] rounded-md py-2 mt-4'
                  >
                    <Text className='text-white text-center'>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* City Modal */}
            <Modal
              visible={showCityModal}
              transparent={true}
              animationType='slide'
              onRequestClose={() => setShowCityModal(false)}
            >
              <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
                <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
                  <Text className='text-lg font-bold mb-2'>Select City/Municipality</Text>
                  <TextInput
                    className='bg-gray-100 rounded-md p-2 mb-2'
                    placeholder='Search City/Municipality'
                    value={searchCity}
                    onChangeText={setSearchCity}
                  />
                  <FlatList
                    data={filteredCities}
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedCity(item.code);
                          setSelectedBarangay(''); // Clear the selected barangay
                          setShowCityModal(false);
                          userSelectedCity(item.name);
                        }}
                        className='py-2'
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  {/* Close Button */}
                  <TouchableOpacity 
                    onPress={() => setShowCityModal(false)} 
                    className='bg-[#333333] rounded-md py-2 mt-4'
                  >
                    <Text className='text-white text-center'>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Barangay Modal */}
            <Modal
              visible={showBarangayModal}
              transparent={true}
              animationType='slide'
              onRequestClose={() => setShowBarangayModal(false)}
            >
              <View className='flex-1 justify-center bg-black/50 px-5 py-20'>
                <View className='bg-white mx-5 p-5 rounded-lg h-5/6'>
                  <Text className='text-lg font-bold mb-2'>Select Barangay</Text>
                  <TextInput
                    className='bg-gray-100 rounded-md p-2 mb-2'
                    placeholder='Search Barangay'
                    value={searchBarangay}
                    onChangeText={setSearchBarangay}
                  />
                  <FlatList
                    data={filteredBarangays}
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedBarangay(item.code);
                          setShowBarangayModal(false);
                          userSelectedBrgy(item.name);
                        }}
                        className='py-2'
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  {/* Close Button */}
                  <TouchableOpacity 
                    onPress={() => setShowBarangayModal(false)} 
                    className='bg-[#333333] rounded-md py-2 mt-4'
                  >
                    <Text className='text-white text-center'>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>


          </View>
        </ScrollView>
      </View>
    </View>
  );
}
