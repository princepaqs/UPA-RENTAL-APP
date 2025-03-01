import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  Alert,
  TextInput,
  Pressable
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Feather, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import * as SecureStore from 'expo-secure-store';
import { getDownloadURL, ref } from 'firebase/storage'; 
import { db, storage } from '../../../_dbconfig/dbconfig'; 
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/authContext';
import ConfirmModal from './Modals/ConfirmModal';

interface Location {
  code: string;
  name: string;
  type?: string; // Optional if necessary
}

interface User {
  uid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNo: string;
  birthday: string;
  email: string;
  profession: string;
  //password: string;
  //password: string;
  state: string;
  city: string;
  barangay: string;
  salary: string;
}



const salaryRanges = [
  { label: '₱20,000 and below / month', value: '20000_below' },
  { label: '₱20,001 - ₱30,000 / month', value: '20001_30000' },
  { label: '₱30,001 - ₱40,000 / month', value: '30001_40000' },
  { label: '₱40,001 - ₱50,000 / month', value: '40001_50000' },
  { label: '₱50,001 and above / month', value: '50001_above' },
];

export default function AccountInformation({ user }: { user: User }) {
  const router = useRouter();
  const { editUser } = useAuth();  
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  // State to manage edit mode and user input
  const [isEditing, setIsEditing] = useState(false);
  const [firstname, setFirstName] = useState<string | null>(null);
  const [middleName, setMiddleName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [birthday, setBirthday] = useState<string | null>(null); // Birthday from user data
  const [profession, setProfession] = useState<string | null>(null); 
  const [email, setEmail] = useState<string | null>(null);
  //const [password, setPassword] = useState(user.password);
  //const [monthlySalary, setMonthlySalary] = useState(user.monthlySalary);
  
  const [show, setShow] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);
  const [salaryDropdownOpen, setSalaryDropdownOpen] = useState<boolean>(false);
  const [selectedSalary, setSelectedSalary] = useState<string>('');
  //const [salary, userSelectedSalary] = useState<string>('');
  const houseNoRef = useRef<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      const uid = await SecureStore.getItemAsync('uid');
  
      if (!uid) {
        return;
      }
  
      const userRef = await getDoc(doc(db, 'users', uid));
      //console.log(uid);
      if (userRef.exists()) {
        const data = userRef.data();
  
        //setLocations(data.region);
        //setCities(data.city);
        //setBarangays(data.barangay);
  
        // Find the corresponding label for the user's salary value
        const userSalaryLabel = salaryRanges.find((range) => range.value === data.salary)?.label || 'No value';
        //console.log(userSalaryLabel);
        //console.log(data.salary);
  
        if (data) {
          setUserData({
            uid: uid,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phoneNo: data.phoneNo,
            birthday: data.birthday,
            email: data.email,
            //password: '', // Ensure password is handled securely
            state: data.region,
            city: data.city,
            profession: data.profession,
            barangay: data.barangay,
            salary: userSalaryLabel, // Store the label instead of the value
          });
          setSelectedSalary(userSalaryLabel); // Set the selected salary to the label
          //setBirthday(data.birthday);
        }
      }
  
      if (uid) {
        try {
          const profilePictureFileName = `${uid}-profilepictures`;
          const profilePictureRef = ref(storage, `profilepictures/${profilePictureFileName}`);
          const downloadURL = await getDownloadURL(profilePictureRef);
          setProfilePicUrl(downloadURL);
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };
  
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      if (userData.firstName !== firstname) setFirstName(userData.firstName);
      if (userData.middleName !== middleName) setMiddleName(userData.middleName);
      if (userData.lastName !== lastName) setLastName(userData.lastName);
  
      // Ensure phoneNumber and profession are not reset if they are cleared (empty)
      if (phoneNumber === undefined || phoneNumber === null) {
        setPhoneNumber(userData.phoneNo);
      }
      if (profession === undefined || profession === null) {
        setProfession(userData.profession);
      }
  
      if (userData.birthday !== birthday) {
        const existingBirthday = parseDateString(userData.birthday);
        setDate(existingBirthday);
        setBirthday(userData.birthday);
      }
      setSelectedLocation(userData.state);
      setSelectedCity(userData.city);
      setSelectedBarangay(userData.barangay);
      setEmail(userData.email);
    }
  }, [userData]);
  
  
  

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

  const parseDateString = (dateString: string): Date => {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // Month is zero-based in JS Date
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentDate = selectedDate || date; // Default to the current date if no date is selected
      setShowDatePicker(Platform.OS === 'ios');
  
      // Format the date as MM/DD/YYYY
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
  
      setDate(currentDate); // Update the state with the selected date
      setBirthday(formattedDate); // Also update the birthday field with the formatted date
    }
  };
  
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const getSalaryLabel = (value: string) => {
    const selected = salaryRanges.find(range => range.label === value);
    return selected ? selected.value : 'Select a Salary Range';
  };

  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // const toggleEdit = () => {
  //   setIsEditing(!isEditing);
  // };

  // const handleSave = () => {
  //   if (isEditing) {
  //     setShowConfirmModal(true);
  //   } else {
  //     toggleEdit();
  //   }
  // };
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(''); 

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const toggleEditPhone = () => {
    setIsEditingPhone(!isEditingPhone);
  };


  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const toggleEditProfession = () => {
    setIsEditingProfession(!isEditingProfession);
  };


  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const toggleEditSalary = () => {
    setIsEditingSalary(!isEditingSalary);
  };


  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const toggleEditEmail = () => {
    setIsEditingEmail(!isEditingEmail);
  };

  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);
  const toggleEditProfilePicture = () => {
    setIsEditingProfilePicture(!isEditingProfilePicture);
  };


  const handleEditField = (field: string) => {
    switch (field) {
      case 'phone':
        if (isEditingPhone) {
          setEditingField('phone');
          setModalVisible(true); // Show modal when editing phone
        } else {
          toggleEditPhone();
        }
        break;
      case 'profession':
        if (isEditingProfession) {
          setEditingField('profession');
          setModalVisible(true); // Show modal when editing profession
        } else {
          toggleEditProfession();
        }
        break;
      case 'salary':
        if (isEditingSalary) {
          setEditingField('salary');
          setModalVisible(true); // Show modal when editing salary
        } else {
          toggleEditSalary();
        }
        break;
      case 'email':
        if (isEditingEmail) {
          setEditingField('email');
          setModalVisible(true); // Show modal when editing email
        } else {
          toggleEditEmail();
        }
        break;
      case 'picture':
        if (isEditingProfilePicture) {
          setEditingField('picture');
          setModalVisible(true); // Show modal when editing email
        } else {
          toggleEditProfilePicture();
        }
        break;
      default:
        break;
    }
  };

  const handleConfirm = () => {
    switch (editingField) {
      case 'phone':
        toggleEditPhone();
        if(userData) setPhoneNumber(userData.phoneNo);
        break;
      case 'profession':
        toggleEditProfession();
        if(userData) setProfession(userData.profession);
        break;
      case 'salary':
        toggleEditSalary();
        if(userData) setSelectedSalary(userData.salary);
        break;
      case 'email':
        toggleEditEmail();
        break;
      case 'picture':
        toggleEditProfilePicture();
        if(userData) setProfilePicUrl(profileImage);
        break;
      default:
        break;
    }

    setModalVisible(false); // Close the modal
  };

  const handleCancel = () => {
    setModalVisible(false);
  };


  const isAnyFieldEditing = isEditingEmail || isEditingPhone || isEditingProfession || isEditingSalary || isEditingProfilePicture;

  const handleUpdateInformation = () => {
        if(isAnyFieldEditing){
          if (phoneNumber?.length === 11 || profession) {
            setShowConfirmModal(true);
          } else if (!phoneNumber || !profession || !selectedSalary || !profileImage) {
            Alert.alert('Error', 'Please complete all necessary details.');
          }
        }
        else {
          console.log("Please Input fields")
        }
  };

  const confirmSave = () => {
    const image = profileImage || profilePicUrl;
    console.log('Profile Image: ', profileImage);
    console.log('Profile URL: ', profilePicUrl);
  
    // Check for empty required fields
    if (!userData || !phoneNumber || !profession || !selectedSalary || !email || !image) {
      Alert.alert('Error', 'Please fill out all required fields before saving.');
      return; // Prevent the function from proceeding if validation fails
    }
  
    // If all required fields are filled, proceed with saving
    console.log(userData.uid, phoneNumber, profession, selectedSalary, email, image);
    editUser(userData.uid, phoneNumber, profession, getSalaryLabel(selectedSalary), email, image);
  
    setShowConfirmModal(false);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location.name);
  
    if (userData) {
      // Update user data if it exists
      const updatedUserData = { ...userData, state: location.name };
      setUserData(updatedUserData);
    }
  
    setShowLocationModal(false);
  };
  

  const handleCitySelect = (city: Location) => {
    setSelectedCity(city.name);
  
    if (userData) {
      // Update user data if it exists
      const updatedUserData = { ...userData, city: city.name };
      setUserData(updatedUserData); // Update the user state with new data
    }
  
    setShowCityModal(false);
  };
  
  const handleBarangaySelect = (barangay: Location) => {
    setSelectedBarangay(barangay.name);
  
    if (userData) {
      // Update user data if it exists
      const updatedUserData = { ...userData, barangay: barangay.name };
      setUserData(updatedUserData); // Update the user state with new data
    }
  
    setShowBarangayModal(false);
  };
  

    // Function to handle image selection from the gallery
const pickImage = async (source: string) => {
  let result;

  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    result = await ImagePicker.launchCameraAsync({
      aspect: [1, 1],
      quality: 1,
    });
  }else{
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    result = await ImagePicker.launchImageLibraryAsync({
      aspect: [1, 1],
      quality: 1,
    });
  }
  

  // Check if result is defined and not canceled
  if (result && !result.canceled) {
    setProfileImage(result.assets[0].uri); // Set the selected image URI
  }
  handleEditField('picture');
  setShowImagePickerModal(false); // Close the modal after selection
};

  return (
    <View className='bg-[#B33939] flex-1'>
      <View className='flex-1 bg-white px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className='flex flex-row items-center'>
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>
          <View className='flex-1 items-center justify-center pr-5'>
            <Text className='text-lg font-semibold text-center'>Account Information</Text>
          </View>
        </View>

        <ScrollView className='mt-5 px-4' contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className='pb-5'>
            {/* Profile Picture */}
            <View className='items-center mt-6'>
              <View className='border border-gray-200 rounded-full'>
              <Image
                className='w-[100px] h-[100px] rounded-full'
                source={profilePicUrl || profileImage ? { uri: profileImage || profilePicUrl } : require('../../../assets/images/profile.png')}
              />
                <TouchableOpacity 
                  className='absolute bottom-[-12] right-9 border border-gray-200 bg-white rounded-full p-1' 
                  onPress={() => setShowImagePickerModal(true)}>
                  <FontAwesome5 name="camera" size={15} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <View className='mt-6'>
              <View className='flex flex-row items-center justify-between'>
                <Text className='text-lg font-bold'>Personal Information</Text>
                {/* <TouchableOpacity
                  className='bg-[#D9534F] px-2 py-1.5 rounded-xl flex flex-row items-center space-x-1'
                  onPress={handleSave}
                >
                  <MaterialIcons name="edit" size={15} color="white" />
                  <Text className='text-white text-xs font-semibold'>{isEditing ? 'Save' : 'Edit'}</Text>
                </TouchableOpacity> */}
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>First Name</Text>
                <TextInput
                  className={`bg-gray-100 px-2 py-1.5 rounded-lg mt-1 ${!isEditing ? 'text-gray-500' : 'text-black'}`}
                  value={userData ? userData.firstName : ''}
                  onChangeText={(text) => { user.firstName = text; }}
                  editable={isEditing} // Enable editing based on isEditing state
                />
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Middle Name</Text>
                <TextInput
                  className={`bg-gray-100 px-2 py-1.5 rounded-lg mt-1 ${!isEditing ? 'text-gray-500' : 'text-black'}`}
                  value={middleName || userData?.middleName}
                  onChangeText={setMiddleName || userData?.middleName}
                  editable={isEditing}
                />
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Last Name</Text>
                <TextInput
                  className={`bg-gray-100 px-2 py-1.5 rounded-lg mt-1 ${!isEditing ? 'text-gray-500' : 'text-black'}`}
                  value={lastName || userData?.lastName}
                  onChangeText={setLastName || userData?.lastName}
                  editable={isEditing}
                />
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Phone Number</Text>
                
                {/* Display error message if phone number is invalid */}
                {phoneNumber && !phoneNumber.startsWith('09') || !phoneNumber && (
                    <Text className='text-red-500 text-xs pl-2'>Invalid number</Text>
                )}
                
                <View className='flex-row w-full bg-gray-100 px-2 pr-8 space-x-1 py-1.5 rounded-lg mt-1 items-center justify-between'>
                    <TextInput
                        className={`w-full ${!isEditingPhone ? 'text-gray-500' : 'text-black'}`}
                        value={phoneNumber ?? ''}
                        onChangeText={(text) => {
                            // Limit the input to 11 characters and set phone number
                            const validatedText = text.replace(/[^0-9]/g, '');
                            if (/^09\d{0,9}$/.test(validatedText) && validatedText.length <= 11) {
                              setPhoneNumber(validatedText);
                            }
                        }}
                        editable={isEditingPhone}
                        keyboardType='numeric'
                        maxLength={11} // Limits the length to 11 characters
                    />
                    <TouchableOpacity onPress={() => handleEditField('phone')}>
                        <FontAwesome6 name="edit" size={18} color="#EF5A6F" />
                    </TouchableOpacity>
                </View>
            </View>



              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Birthday</Text>
                <TouchableOpacity
                  className={`bg-gray-100 px-2 py-1.5 rounded-lg mt-1 ${!isEditing ? 'text-gray-500' : 'text-black'}`}
                  onPress={isEditing ? showDatepicker : undefined}
                >
                  <Text className={isEditing ? 'text-black' : 'text-gray-500'}>
                    {formattedDate}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                  />
                )}
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>State/Region</Text>
                <Pressable 
                  className='bg-gray-100 px-2 py-2.5 rounded-lg mt-1'
                  onPress={isEditing ? () => setShowLocationModal(true) : undefined} // Disable interaction if not editing
                >
                  <Text className={isEditing ? 'text-black' : 'text-gray-500'}>{userData ? userData.state : ''}</Text>
                </Pressable>
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>City</Text>
                <Pressable 
                  className='bg-gray-100 px-2 py-2.5 rounded-lg mt-1'
                  onPress={isEditing ? () => setShowCityModal(true) : undefined} // Disable interaction if not editing
                >
                  <Text className={isEditing ? 'text-black' : 'text-gray-500'}>{userData ? userData.city : ''}</Text>
                </Pressable>
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Barangay</Text>
                <Pressable 
                  className='bg-gray-100 px-2 py-2.5 rounded-lg mt-1'
                  onPress={isEditing ? () => setShowBarangayModal(true) : undefined} // Disable interaction if not editing
                >
                  <Text className={isEditing ? 'text-black' : 'text-gray-500'}>{userData ? userData.barangay : ''}</Text>
                </Pressable>
              </View>

              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Profession</Text>
                <View className='flex-row w-full bg-gray-100 px-2 pr-8 space-x-1 py-1.5 rounded-lg mt-1 items-center justify-between'>
                  <TextInput
                    className={`w-full ${!isEditingProfession ? 'text-gray-500' : 'text-black'}`}
                    value={profession ?? ''}
                    onChangeText={setProfession}
                    editable={isEditingProfession}
                  />
                  <TouchableOpacity onPress={() => handleEditField('profession')}>
                    <FontAwesome6 name="edit" size={18} color="#EF5A6F" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className='mt-4'>
                <Text className='text-sm pl-2 font-semibold'>Salary Range</Text>
                <TouchableOpacity
                  className='bg-gray-100 flex-row items-center justify-between px-2 py-2.5 rounded-lg mt-1'
                  onPress={isEditingSalary ? () => setSalaryDropdownOpen(!salaryDropdownOpen) : undefined}
                >
                  <Text className={isEditingSalary ? 'text-black' : 'text-gray-500'}>{selectedSalary}</Text>
                  <TouchableOpacity  onPress={() => handleEditField('salary')}>
                    <FontAwesome6 name="edit" size={18} color="#EF5A6F" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {salaryDropdownOpen && isEditingSalary && (
                <FlatList
                  data={salaryRanges}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => { setSelectedSalary(item.label); setSalaryDropdownOpen(false); }}
                      className='px-2 py-1'
                    >
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}


              <View className='mt-2'>
                <Text className='text-sm pl-2 font-semibold'>Email Address</Text>
                <View className='flex-row w-full bg-gray-100 px-2 pr-8 space-x-1 py-1.5 rounded-lg mt-1 items-center justify-between'>
                  <TextInput
                    className={`w-full ${!isEditing ? 'text-gray-500' : 'text-black'}`}
                    value={email || userData?.email}
                    onChangeText={setEmail || userData?.email}
                    editable={isEditingEmail}
                  />
                  {/*<TouchableOpacity  onPress={() => handleEditField('email')}>
                      <FontAwesome6 name="edit" size={18} color="#EF5A6F" />
                    </TouchableOpacity>*/}
                </View>
              </View>

              {isAnyFieldEditing && (
                <TouchableOpacity className='w-full bg-[#B33939] p-4 mt-10 rounded-3xl items-center' onPress={handleUpdateInformation}>
                  <Text className='text-white text-xs font-bold'>Update Information</Text>
                </TouchableOpacity>
              )}

            </View>
          </View>
        </ScrollView>
      </View>


      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        animationType="slide"
        transparent={true}
      >
        <View className='flex-1 justify-center items-center bg-black/50'>
          <View className='bg-white rounded-lg w-2/3 p-5'>
            <Text className='text-lg font-bold mb-4'>Select Profile Picture</Text>
            <View className='flex flex-col  items-center space-y-2'>
            <TouchableOpacity className='w-2/5 bg-black rounded-2xl  text-whiet px-3 py-2' onPress={() => pickImage('camera')}>
              <Text className='text-xs text-white font-semibold text-center'>Camera</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity className='w-2/5 bg-black rounded-2xl  text-whiet px-3 py-2' onPress={() => pickImage('gallery')}>
              <Text className='text-xs text-white font-semibold text-center'>Gallery</Text>
            </TouchableOpacity> */}
            <TouchableOpacity className='w-2/5 border rounded-2xl  text-whiet px-3 py-2' onPress={() => setShowImagePickerModal(false)}>
              <Text className='text-xs font-semibold text-center'>Cancel</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
      >
        <View className='flex-1 justify-center items-center  bg-black/50'>
          <View className='bg-white rounded-lg p-6 w-80'>
            <Text className='text-lg font-semibold'>Confirm Changes</Text>
            <Text className='mt-2 text-gray-700'>Are you sure you want to save your changes?</Text>
            <View className='flex-row items-center justify-center mt-2 space-x-5'>
              <TouchableOpacity onPress={() => {

                if (isEditingPhone){
                  toggleEditPhone();
                }
                if (isEditingProfession){
                  toggleEditProfession();
                }
                if (isEditingSalary){
                  toggleEditSalary();
                }
                if (isEditingEmail){
                  toggleEditEmail();
                }
                
                confirmSave();
                //router.replace('./EditAccountVerify')
                router.replace('./EditAccountSuccess');
              }}>
                <Text className='text-white bg-black p-2 rounded-md font-semibold'>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Text className='border p-2 rounded-md font-semibold'>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
      >
        <View className='flex-1 justify-center items-center py-28 bg-black/50'>
          <View className='bg-white rounded-lg p-6 w-80'>
            <Text className='mb-2 text-lg font-semibold'>Select State/Region</Text>
            <FlatList
              data={locations}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleLocationSelect(item)}
                  className='px-2 py-1.5 border-b border-gray-100'
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowLocationModal(false)} className='mt-4 items-center'>
              <Text className='bg-black text-white rounded-xl px-4 py-2'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
      >
        <View className='flex-1 justify-center items-center py-28 bg-black/50'>
          <View className='bg-white rounded-lg p-6 w-80'>
            <Text className='mb-2 text-lg font-semibold'>Select City</Text>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCitySelect(item)}
                  className='px-2 py-1.5 border-b border-gray-100'
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowCityModal(false)} className='mt-4 items-center'>
              <Text className='bg-black text-white rounded-xl px-4 py-2'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barangay Modal */}
      <Modal
        visible={showBarangayModal}
        transparent={true}
        animationType="slide"
      >
        <View className='flex-1 justify-center items-center py-28 bg-black/50'>
          <View className='bg-white rounded-lg p-6 w-80'>
            <Text className='mb-2 text-lg font-semibold'>Select Barangay</Text>
            <FlatList
              data={barangays}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleBarangaySelect(item)}
                  className='px-2 py-1.5 border-b border-gray-100'
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowBarangayModal(false)} className='mt-4 items-center'>
              <Text className='bg-black text-white rounded-xl px-4 py-2'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={isModalVisible}
        title="Edit"
        message="Do you want to cancel editing?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </View>
  );
}
 