import { View, Text, TextInput, Pressable, Alert, TouchableOpacity, Platform, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const GENDER_OPTIONS = ['Male', 'Female'];
const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Separated', 'Widowed'];
const EDUCATION_OPTIONS = ['Elementary School', 'High School', 'College', "Bachelor's", "Master's", 'PhD'];

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [age, setAge] = useState<number | string>(''); // Disable input, controlled by date selection
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [civilStatusDropdownOpen, setCivilStatusDropdownOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);

  const firstNameRef = useRef("");
  const middleNameRef = useRef("");
  const lastNameRef = useRef("");
  const birthdayRef = useRef<string | null>(null);
  const genderRef = useRef("");
  const educationRef = useRef("");
  const civilStatusRef = useRef("");

  // Local state to control the display value of each TextInput
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCivilStatus, setSelectedCivilStatus] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');

  const handleContinue = async () => {
    if (!firstNameRef.current || !lastNameRef.current ||
        !birthdayRef.current || !age || !genderRef.current ||
        !educationRef.current || !civilStatusRef.current) {
      Alert.alert('Sign Up', "Please fill all the fields!");
      return;
    }

    // Prevent registration if the user is below 18
    if (typeof age === 'number' && age < 18) {
      Alert.alert('Sign Up', 'You must be at least 18 years old to register.');
      return;
    }

    try {
      await SecureStore.setItemAsync('firstName', firstNameRef.current);
      await SecureStore.setItemAsync('middleName', middleNameRef.current);
      await SecureStore.setItemAsync('lastName', lastNameRef.current);
      await SecureStore.setItemAsync('birthday', birthdayRef.current);
      await SecureStore.setItemAsync('age', age.toString());
      await SecureStore.setItemAsync('gender', genderRef.current);
      await SecureStore.setItemAsync('education', educationRef.current);
      await SecureStore.setItemAsync('civilStatus', civilStatusRef.current);
      router.push('/signUpData2');
    } catch (error) {
      console.error('Error saving data', error);
      Alert.alert('Sign Up', 'An error occurred while saving your data.');
    }
    console.log('All fields are filled');
  };

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    calculateAge(currentDate); // Calculate age when date is changed
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);

    // Reset birthday and age if under 18
    if (calculatedAge < 18) {
      Alert.alert('Sign Up', 'You must be at least 18 years old to register.');
      birthdayRef.current = 'Calendar'; // Reset birthday display
      setAge(''); // Clear age display
    } else {
      birthdayRef.current = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  return (
    <View className='bg-[#B33939]'>
      <View className="flex items-start px-12 pb-5 justify-center bg-[#B33939]">
        <View className='pt-20'></View>
        <Text className='text-white text-3xl font-semibold'>Get started now</Text>
        <Text className='text-white text-xs'>Join us and find your perfect home.</Text>
      </View>


      <View className='w-full h-screen px-12 py-5 rounded-t-2xl bg-[#FFFFFF]'>
      <View className='px-2 mb-2'>
          <Text className='text-lg font-semibold'>Personal Information</Text>
        </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className=' mb-20 pb-20'>
        

{/* First Name */}
<View className='pt-5'>
        <Text className='px-2 pb-1 text-xs font-semibold'>First Name</Text>
        <View className='flex flex-row px-4 py-1 items-center bg-gray-100 rounded-xl'>
          <TextInput
            value={firstName}
            onChangeText={value => {
              const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
              setFirstName(filteredValue); // Update state
              firstNameRef.current = filteredValue; // Update reference
            }}
            className='flex-1 pl-4 font-semibold text-xs'
            placeholder='First Name'
            placeholderTextColor={'gray'}
          />
        </View>
      </View>

      {/* Middle Name */}
      <View className='pt-5'>
        <Text className='px-2 pb-1 text-xs font-semibold'>Middle Name</Text>
        <View className='flex flex-row px-4 py-1 items-center bg-gray-100 rounded-xl'>
          <TextInput
            value={middleName}
            onChangeText={value => {
              const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
              setMiddleName(filteredValue); // Update state
              middleNameRef.current = filteredValue; // Update reference
            }}
            className='flex-1 pl-4 font-semibold text-xs'
            placeholder='Middle Name (optional)'
            placeholderTextColor={'gray'}
          />
        </View>
      </View>

      {/* Last Name */}
      <View className='pt-5'>
        <Text className='px-2 pb-1 text-xs font-semibold'>Last Name</Text>
        <View className='flex flex-row px-4 py-1 items-center bg-gray-100 rounded-xl'>
          <TextInput
            value={lastName}
            onChangeText={value => {
              const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
              setLastName(filteredValue); // Update state
              lastNameRef.current = filteredValue; // Update reference
            }}
            className='flex-1 pl-4 font-semibold text-xs'
            placeholder='Last Name'
            placeholderTextColor={'gray'}
          />
        </View>
      </View> 


        {/* Birthday */}
        <View className='flex flex-row gap-1 pr-1 pt-5'>
          <View className='pt-2 w-1/2'>
            <Text className='px-2 pb-1 text-xs font-semibold'>Birthday</Text>
            <View className='flex flex-row px-4 py-1 items-center bg-gray-100 rounded-xl'>
              <Pressable onPress={showDatepicker} className='flex-1'>
                <Text className='font-semibold py-1.5 text-xs'>
                  {birthdayRef.current || 'Calendar'}
                </Text>
              </Pressable>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode='date'
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
            </View>
          </View>

          {/* Age (Auto-calculated) */}
          <View className='pt-2 w-1/2'>
            <Text className='px-2 pb-1 text-xs font-semibold'>Age</Text>
            <View className='flex flex-row px-4 py-1 items-center bg-gray-100 rounded-xl'>
              <TextInput
                value={age.toString()} // Display calculated age
                editable={false} // Disable input for age field
                className='flex-1 font-semibold text-xs'
                placeholder='Age'
                keyboardType='phone-pad'
                placeholderTextColor={'gray'}
              />
            </View>
          </View>
        </View>

        {/* Other Form Fields */}
        {/* Gender Dropdown */}
        <View className='pt-5'>
          <Text className='px-2 pb-1 text-xs font-semibold'>Sex</Text>
          <Pressable onPress={() => setGenderDropdownOpen(!genderDropdownOpen)} className='flex flex-row px-4 py-2.5 items-center bg-gray-100 rounded-xl'>
            <Text className='flex-1 text-xs font-semibold'>{selectedGender || 'Select Gender'}</Text>
            <Ionicons name={genderDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color="gray" />
          </Pressable>
          {genderDropdownOpen && (
            <View className='px-4 bg-gray-100 rounded-xl'>
              {GENDER_OPTIONS.map((option, index) => (
                <Pressable key={index} onPress={() => { setSelectedGender(option); genderRef.current = option; setGenderDropdownOpen(false); }} className='py-2'>
                  <Text className='text-xs'>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Civil Status Dropdown */}
        <View className='pt-5'>
          <Text className='px-2 pb-1 text-xs font-semibold'>Civil Status</Text>
          <Pressable onPress={() => setCivilStatusDropdownOpen(!civilStatusDropdownOpen)} className='flex flex-row px-4 py-2.5 items-center bg-gray-100 rounded-xl'>
            <Text className='flex-1 text-xs font-semibold'>{selectedCivilStatus || 'Select Civil Status'}</Text>
            <Ionicons name={civilStatusDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color="gray" />
          </Pressable>
          {civilStatusDropdownOpen && (
            <View className='px-4 bg-gray-100 rounded-xl'>
              {CIVIL_STATUS_OPTIONS.map((option, index) => (
                <Pressable key={index} onPress={() => { setSelectedCivilStatus(option); civilStatusRef.current = option; setCivilStatusDropdownOpen(false); }} className='py-2'>
                  <Text className='text-xs'>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Education Dropdown */}
        <View className='pt-5'>
          <Text className='px-2 pb-1 text-xs font-semibold'>Educational Attainment</Text>
          <Pressable onPress={() => setEducationDropdownOpen(!educationDropdownOpen)} className='flex flex-row px-4 py-2.5 items-center bg-gray-100 rounded-xl'>
            <Text className='flex-1 text-xs font-semibold'>{selectedEducation || 'Select Education'}</Text>
            <Ionicons name={educationDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color="gray" />
          </Pressable>
          {educationDropdownOpen && (
            <View className='px-4 bg-gray-100 rounded-xl'>
              {EDUCATION_OPTIONS.map((option, index) => (
                <Pressable key={index} onPress={() => { setSelectedEducation(option); educationRef.current = option; setEducationDropdownOpen(false); }} className='py-2'>
                  <Text className='text-xs'>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          className='my-6 px-4 py-3 rounded-xl bg-[#D9534F]'>
          <Text className='text-center text-white text-xs font-bold'>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity className='flex-row space-x-1 items-center justify-center mb-5'
          onPress={() => router.back()}
          >
          <Entypo name="chevron-left" size={15} color="black" />
          <Text className='text-xs font-semibold'>Back to  log in</Text>
        </TouchableOpacity>
        </View>
        </ScrollView>
      </View>

    </View>
  );
}
