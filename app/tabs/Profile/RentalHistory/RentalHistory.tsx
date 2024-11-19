import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

const rentalData = [
    {
      id: 1,
      title: 'Apartment',
      location: 'Makati City, Metro Manila',
      date: 'January 1, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 2,
      title: 'Condo',
      location: 'Quezon City, Metro Manila',
      date: 'February 15, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 3,
      title: 'House',
      location: 'Cebu City, Cebu',
      date: 'March 10, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 4,
      title: 'Studio Apartment',
      location: 'Davao City, Davao del Sur',
      date: 'April 5, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 5,
      title: 'Duplex',
      location: 'Baguio City, Benguet',
      date: 'May 20, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 6,
      title: 'Townhouse',
      location: 'Iloilo City, Iloilo',
      date: 'June 25, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 7,
      title: 'Loft',
      location: 'Tagaytay, Cavite',
      date: 'July 30, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 8,
      title: 'Flat',
      location: 'Batangas City, Batangas',
      date: 'August 15, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 9,
      title: 'Shared Apartment',
      location: 'Pasig City, Metro Manila',
      date: 'September 10, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
    {
      id: 10,
      title: 'Villa',
      location: 'Cavite City, Cavite',
      date: 'October 1, 2024',
      image: require('../../../../assets/images/property1.png'),
    },
  ];

  
  export default function RentalHistory() {
    const router = useRouter();
  
    return (
      <View className='bg-[#B33939]'>
        <View className='h-screen bg-gray-100 px-6 mt-14 rounded-t-2xl'>
          <View className='flex flex-row items-center justify-between px-6 pt-8 mb-5
          '>
            <TouchableOpacity onPress={() => router.back()}>
              <View className="flex flex-row items-center">
                <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
              </View>
            </TouchableOpacity>
            <View className="flex-1 items-center justify-center pr-5">
              <Text className='text-sm font-bold text-center'>Rental History</Text>
            </View>
          </View>
  
          <ScrollView className='' showsVerticalScrollIndicator={false}>
            <View className='mx-2 my-5 ' >
                {rentalData.map((rental) => (
              <TouchableOpacity key={rental.id} className='flex flex-row mb-4 bg-white px-3 py-2 space-x-1 rounded-xl shadow-xl border border-gray-200'
              onPress={() => router.push('./RentalDetails')}>
                <Image className="w-[80px] h-[80px] object-cover rounded-2xl" source={rental.image} />
                <View className='flex-1 flex-col items-start justify-center gap-1'>
                  <Text className='text-sm font-bold'>{rental.title}</Text>
                  <Text className='text-xs'>{rental.location}</Text>
                  <Text className='text-xs'>{rental.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }