import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

// Define a type for the dropdown options
type DropdownOption = {
  label: string;
  value: string;
};

// Define the props for the CustomDropdown component
type CustomDropdownProps = {
  options: DropdownOption[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  label: string;
};

// Custom Dropdown Component
const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selectedValue, onValueChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className='pt-4'>
      <Text className='px-2 pb-1 text-sm font-semibold'>{label}</Text>
      <TouchableOpacity
        className='flex flex-row px-8 py-3 items-center bg-gray-100 rounded-2xl'
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text className='flex-1 font-semibold text-xs'>
          {selectedValue ? selectedValue : 'Select an option'}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color='gray' />
      </TouchableOpacity>

      <View className='bg-gray-100 mt-1 rounded-xl'>
        {isOpen && (
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <View className='border-b border-gray-200'>
                <TouchableOpacity
                  className='px-8 py-3'
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text className='text-xs'>{item.label}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default function AddNewProperty() {
  const router = useRouter();
  const [images, setImages] = useState<{ uri: string; fileName: string }[]>([]);
  const [typeProperty, setTypeProperty] = useState<string | null>(null);
  const [numberBedroom, setNumberBedroom] = useState<string | null>(null);
  const [numberBathroom, setNumberBathroom] = useState<string | null>(null);
  const [numberTenant, setNumberTenant] = useState<string | null>(null);
  const [furnishing, setFurnishing] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const [exceededLimit, setExceededLimit] = useState(false);
  const [exceededBathroomLimit, setExceededBathroomLimit] = useState(false);
  const [exceededTenantLimit, setExceededTenantLimit] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 5,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const currentImageUris = images.map(img => img.uri);
      const newImages = result.assets
        .map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName || "Unknown filename",
        }))
        .filter(asset => !currentImageUris.includes(asset.uri));
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const handleContinue = async () => {
    if (!propertyName || !typeProperty || !numberBedroom || !numberBathroom || !numberTenant || !furnishing || images.length === 0) {
      Alert.alert('Error', 'Please fill all the fields!');
      return;
    } else {
      await SecureStore.setItemAsync('propertyName', propertyName);
      await SecureStore.setItemAsync('propertyType', typeProperty);
      await SecureStore.setItemAsync('noOfBedrooms', numberBedroom);
      await SecureStore.setItemAsync('noOfBathrooms', numberBathroom);
      await SecureStore.setItemAsync('noOfTenants', numberTenant);
      await SecureStore.setItemAsync('furnishing', furnishing);
      await SecureStore.setItemAsync('images', JSON.stringify(images));
      router.push('./editPropertyLocation');
    }
  };

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen bg-white mt-14 py-4 px-6 rounded-t-2xl'>
            <View className='border-b border-gray-400 flex-row items-center justify-between px-4 py-3'>
                <TouchableOpacity onPress={() => router.back()}>
                <View className="flex flex-row items-center">
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </View>
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center">
                <Text className='text-sm font-bold text-center'>Edit Property</Text>
                </View>
            </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className='mb-20 mt-5'>

            <View className='mb-5'>
              <Text className='text-lg font-bold'>Property Details</Text>
              <Text className='text-xs'>Provide the property's name, type, rooms, and photos.</Text>
            </View>

            {/* Property Name */}
            <View>
              <Text className='px-2 pb-1 text-sm font-semibold'>Property Name</Text>
              <View className='flex flex-row px-4 py-1.5 items-center bg-gray-100 rounded-2xl'>
                <TextInput
                  onChangeText={setPropertyName}
                  className='flex-1 font-semibold text-xs'
                  placeholder='Property Name'
                  placeholderTextColor={'gray'}
                />
              </View>
            </View>

            {/* Type of Property */}
            <CustomDropdown
              label="Type of Property"
              options={[
                { label: "Apartment", value: "Apartment" },
                { label: "Condo", value: "Condo" },
                { label: "Studio Unit", value: "Studio Unit" },
                { label: "House", value: "House" },
              ]}
              selectedValue={typeProperty}
              onValueChange={(value: string) => {
                setTypeProperty(value);
                if (value === "Studio Unit") {
                  setNumberBedroom("1");
                } else {
                  setNumberBedroom(null); // Reset bedroom number if not Studio Unit
                }
              }}
            />

            {/* No. of Bedroom/s */}
            <View className='pt-4'>
              <Text className='px-2 pb-1 text-sm font-semibold'>No. of Bedroom/s</Text>
              <View className='flex flex-row px-4 py-1.5 items-center bg-gray-100 rounded-2xl'>
                {typeProperty === "Studio Unit" ? (
                  <Text className='flex-1 font-semibold text-xs py-2 ml-4'>Studio Unit</Text>
                ) : (
                  <TextInput
                    onChangeText={(value: string) => {
                      const numericValue = parseInt(value);
                      if (value === '' || (numericValue >= 1 && numericValue <= 10)) {
                        setNumberBedroom(value);
                        setExceededLimit(false);
                      } else {
                        setExceededLimit(true);
                      }
                    }}
                    className='flex-1 font-semibold text-xs ml-4'
                    placeholder='No. of Bedroom/s'
                    placeholderTextColor={'gray'}
                    keyboardType='numeric'
                    value={numberBedroom || ''}
                  />
                )}
              </View>
              {exceededLimit && (
                <Text className='text-red-500 text-xs mt-1 px-4'>
                  Exceeding the number of expected input (1-10)
                </Text>
              )}
            </View>

            {/* No. of Bathroom/s */}
<View className='pt-4'>
  <Text className='px-2 pb-1 text-sm font-semibold'>No. of Bathroom/s</Text>
  <View className='flex flex-row px-4 py-1.5 items-center bg-gray-100 rounded-2xl'>
    <>
      <TextInput
        onChangeText={(value: string) => {
          const numericValue = parseInt(value);
          // Validate and set the value only if it's between 1 and 10
          if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 10) {
            setNumberBathroom(value);
            setExceededBathroomLimit(false); // Reset the exceeded limit if valid
          } else if (value === '') {
            setNumberBathroom(null); // Allow empty input
            setExceededBathroomLimit(false); // Reset if empty
          } else {
            setExceededBathroomLimit(true); // Set exceeded limit if invalid
          }
        }}
        className='flex-1 font-semibold text-xs ml-4'
        placeholder='Enter No. of Bathroom/s'
        placeholderTextColor={'gray'}
        keyboardType='numeric'
        value={numberBathroom || ''}
      />
      
    </>
  </View>
  {exceededBathroomLimit && (
        <Text className='text-red-500 text-xs mt-1 px-4'>
          Exceeded the number of expected input (1-10)
        </Text>
      )}
</View>



            {/* No. of Tenant/s */}
<View className='pt-4'>
  <Text className='px-2 pb-1 text-sm font-semibold'>No. of Tenant/s</Text>
  <View className='flex flex-row px-4 py-2 items-center bg-gray-100 rounded-2xl'>
    <>
      <TextInput
        onChangeText={(value: string) => {
          const numericValue = parseInt(value);
          // Validate and set the value only if it's between 1 and 50
          if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 50) {
            setNumberTenant(value);
            setExceededTenantLimit(false); // Reset the exceeded limit if valid
          } else if (value === '') {
            setNumberTenant(null); // Allow empty input
            setExceededTenantLimit(false); // Reset if empty
          } else {
            setExceededTenantLimit(true); // Set exceeded limit if invalid
          }
        }}
        className='flex-1 font-semibold text-xs ml-4'
        placeholder='Enter No. of Tenant/s'
        placeholderTextColor={'gray'}
        keyboardType='numeric'
        value={numberTenant || ''}
      />
      
    </>
  </View>
  {exceededTenantLimit && (
        <Text className='text-red-500 text-xs mt-1 px-4'>
          Exceeded the number of expected input (1-50)
        </Text>
      )}
</View>




            {/* Furnishing */}
            <CustomDropdown
              label="Furnishing"
              options={[
                { label: "Fully Furnished", value: "Fully Furnished" },
                { label: "Semi-Furnished", value: "Semi-Furnished" },
                { label: "Unfurnished", value: "Unfurnished" }
              ]}
              selectedValue={furnishing}
              onValueChange={(value: string) => setFurnishing(value)}
            />

            {/* Image Upload */}
<View className='pt-4'>
  <Text className='px-2 pb-1 text-sm font-semibold'>Upload Image</Text>
  <TouchableOpacity
    className='flex flex-row px-4 py-3 items-center bg-gray-100 rounded-2xl'
    onPress={pickImage}
  >
    <Ionicons name="images-outline" size={20} color="gray" />
    <Text className='pl-3 text-xs font-semibold'>Upload Image</Text>
  </TouchableOpacity>
</View>

{/* Selected Images */}
<FlatList
  data={images}
  horizontal
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item) => item.uri}
  renderItem={({ item }) => (
    <View className='relative mr-4'>
      {/* Image Display */}
      <Image
        source={{ uri: item.uri }}
        className='w-20 h-20 rounded-lg'
        resizeMode='cover'
      />

      {/* X Button to Remove Image */}
      <TouchableOpacity
        className='absolute top-1 right-2 p-0.5 bg-black/70 rounded-full'
        onPress={() => setImages(images.filter((img) => img.uri !== item.uri))}
      >
        <Entypo name="cross" size={15} color="white" />
      </TouchableOpacity>

      {/* File Name Display */}
      <Text className='text-xs text-center mt-1' numberOfLines={1}>
        {item.fileName}
      </Text>
    </View>
  )}
/>



            <View className='pt-5 '>
              <TouchableOpacity
                className='bg-[#B33939] py-3 rounded-full flex items-center justify-center'
                onPress={handleContinue}
              >
                <Text className='text-white font-semibold text-xs'>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
