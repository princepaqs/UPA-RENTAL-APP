import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function ReportUser() {
  const router = useRouter();
  
  // State to track selected option
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [options, setOptions] = useState<{ label: string }[]>([]);

  // Define all options by category
  const violationsOptions = [
    { label: 'They violated the terms of service.' },
    { label: 'They posted unauthorized advertisements.' },
    { label: 'They repeatedly broke platform rules.' },
    { label: 'They submitted a false report.' },
  ];

  const fraudOptions = [
    { label: 'They engaged in fraudulent activity.', detail: 'e.g. Fake transaction, Identity theft' },
    { label: 'They are impersonating someone else.', detail: 'e.g. False Identity' },
    { label: 'They used a fraudulent payment method.' },
    { label: 'They created multiple accounts to abuse the system.' },
    { label: 'They attempted to scam users.' },
  ];

  const behaviorOptions = [
    { label: 'They are spamming the platform.', detail: 'e.g. unsolicited messages, posting irrelevant content' },
    { label: 'They are harassing other users.', detail: 'e.g. abusive, threatening, offensive' },
    { label: 'They used offensive language.', detail: 'e.g. offensive, vulgar words' },
    { label: 'They made threats or violent comments.', detail: 'e.g. physical or verbal threats or assaults' },
    { label: 'They are being discriminatory.', detail: 'e.g. racist, sexist, homophobic, discriminatory behavior' },
    { label: 'They are trolling with disruptive behavior.', detail: '' },
  ];

  const rentalIssuesOptions = [
    { label: 'They are not paying rent.' },
    { label: 'They broke the lease agreement.' },
    { label: 'They are subletting the property without permission.' },
    { label: 'They were evicted by the property owner.' },
    { label: 'They caused damage to the property.' },
    { label: 'They collect fees or deposits outside of UPA', detail: '' },
    { label: 'They asked me to pay outside of UPA', detail: 'e.g. cash, bank transfer' },
  ];

  const securityOptions = [
    { label: 'They attempted to compromise platform security.' },
    { label: 'They are engaging in illegal activities.' },
    { label: 'They accessed or used unauthorized data.' },
  ];

  const contentOptions = [
    { label: 'They posted inappropriate content.', detail: 'e.g. posting offensive, explicit, illegal content' },
  ];

  const otherOptions = [
    { label: 'They attempted to compromise platform security.' },
    { label: 'They are engaging in illegal activities.' },
    { label: 'They accessed or used unauthorized data.' },
  ];

  // Handle selection of an option
  const handleSelect = (option: typeof options[0]) => {
    setSelectedOption(option.label); // Set selected option without routing yet
    console.log(option.label);
  };

  // Handle navigation when "Next" is pressed
  const handleNext = async () => {
    await SecureStore.setItemAsync('reportProfileStep2', selectedOption ?? '');
    router.replace('./submittedReportProfile'); // Navigate to the next step
  };

  // Fetch stored category and set options based on category
  useEffect(() => {
    const fetchStoredOption = async () => {
      const storedOption = await SecureStore.getItemAsync('reportProfileStep1');
      setSelectedCategory(storedOption);
 
      // Set options based on selected category
      switch (storedOption) {
        case 'Platform Violations':
          setOptions(violationsOptions);
          break;
        case 'Fraud & Misrepresentation':
          setOptions(fraudOptions);
          break;
        case 'Inappropriate User Behavior':
          setOptions(behaviorOptions);
          break;
        case 'Rental & Property Issues':
          setOptions(rentalIssuesOptions);
          break;
        case 'Security & Legal Violations':
          setOptions(securityOptions);
          break;
        case 'Inappropriate Content':
          setOptions(contentOptions);
          break;
        case 'It is something else':
          setOptions(otherOptions);
          break;
        default:
          setOptions([]);
      }
    };

    fetchStoredOption();
  }, []);

  return (
    <View className='bg-[#B33939]'>
      <View className='h-screen w-full bg-gray-100 px-6 mt-14 rounded-t-2xl'>
        <View className='flex flex-row items-center justify-between px-6 pt-8 border-b-2 border-gray-300 pb-3'>
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
            </View>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center pr-5">
            <Text className='text-sm font-bold text-center'>Report Profile</Text>
          </View>
        </View>

        <View className='pt-10 px-2 flex flex-col gap-10'>
          <View>
            <Text className='text-3xl font-bold'>What's happening?</Text>
            <Text className='text-xs text-black/50'>This will only be shared with UPA.</Text>
          </View>

          {/* Checklist with Selection */}
          <View className='flex-col space-y-5'>
            {options.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => handleSelect(option)}
                className='flex-row items-center space-x-3'
              >
                <Ionicons
                  name={
                    selectedOption === option.label
                      ? 'radio-button-on-outline'
                      : 'radio-button-off-outline'
                  }
                  size={18}
                  color={selectedOption === option.label ? 'black' : 'gray'}
                />
                <Text
                  className={`text-sm ${
                    selectedOption === option.label ? 'font-semibold text-black' : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        <View className='my-10'>
          {/* Next Button */}
          {selectedOption && (
            <TouchableOpacity
              onPress={handleNext}
              className='mt-20 bg-[#D9534F] py-3 rounded-xl items-center'
            >
              <Text className='text-white font-bold'>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
