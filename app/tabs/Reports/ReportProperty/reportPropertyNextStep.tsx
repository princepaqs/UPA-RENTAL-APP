import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function ReportProperty() {
    const router = useRouter();

    // State to track selected option and category
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedDesc, setSelectedDesc] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [options, setOptions] = useState<{ label: string, desc: string }[]>([]);

    // Options for each category
    const listingAccuracy = [
        { label: 'I found a false listing.', desc: ' false listing' },
        { label: 'The price was misleading.', desc: ' misleading price' },
        { label: 'The rental terms are not clear.', desc: 'n unclear rental term' },
        { label: 'There’s a duplicate listing for the same property.', desc: ' duplicate listing' },
        { label: 'They made false ownership claims.', desc: ' false ownership claims' },
        { label: 'There are hidden fees not disclosed.', desc: ' fees hidden and not disclosed' },
        { label: 'The property is being unauthorizedly sublet.', desc: 'n unauthorized property sublet' },
    ];

    const propertyAvailability = [
        { label: 'The property is not available.', desc: 'n unavailable property' },
        { label: 'The condition of the property is poor.', desc: ' poor conditioned property' },
        { label: 'The environment is unsafe or hazardous.', desc: 'n unsafe or hazardous environment' },
        { label: 'The listing is expired.', desc: 'n expired listing' },
    ];

    const legal = [
        { label: 'They are violating local laws.', desc: ' local laws violated' },
        { label: 'Unauthorized images are being used.', desc: 'n images used are unauthorized' },
        { label: 'There’s suspicious activity around the listing.', desc: ' listing surrounded with suspicious activities' },
        { label: 'It seems like a scam or fraud.', desc: ' scam or fraud' },
    ];

    const communicationIssues = [
        { label: 'I encountered inappropriate content.', desc: 'n inappropriate encounter of content' },
        { label: 'The contact information is incorrect.', desc: 'n incorrect contact information' },
        { label: 'The owner is behaving offensively.', desc: 'n offensive owner' },
    ];

    const discrimination = [
        { label: 'There is discrimination happening.', desc: ' listing with a discrimination' },
    ];

    const other = [
        { label: 'Something on this page is broken.', desc: ' page broken' },
        { label: 'The owner is asking for more money.', desc: 'n owner asking for additional payment' },
        { label: 'It doesn’t look clean or safe.', desc: ' unclean or unsafe property' },
        { label: 'It’s a duplicate listing.', desc: ' duplicate listing' },
    ];

    // Handle selection of an option
    const handleSelect = (option: typeof options[0]) => {
        setSelectedOption(option.label); // Set selected option without routing yet
        setSelectedDesc(option.desc);
        console.log(option.label);
    };

    // Handle navigation when "Next" is pressed
    const handleNext = async () => {
        await SecureStore.setItemAsync('reportPropertyStep2', selectedOption ?? '');
        await SecureStore.setItemAsync('reportDesc', selectedDesc ?? '');
        router.push('./describe'); // Navigate to the next step
    };

    // Fetch stored category and set options based on category
    useEffect(() => {
        const fetchStoredOption = async () => {
            const storedOption = await SecureStore.getItemAsync('reportPropertyStep1');
            setSelectedCategory(storedOption);

            // Set options based on selected category
            switch (storedOption) {
                case 'Listing Accuracy and Misrepresentation':
                    setOptions(listingAccuracy);
                    break;
                case 'Property Availability and Condition':
                    setOptions(propertyAvailability);
                    break;
                case 'Legal and Regulatory Violations':
                    setOptions(legal);
                    break;
                case 'Content and Communication Issues':
                    setOptions(communicationIssues);
                    break;
                case 'Discrimination and Unethical Practices':
                    setOptions(discrimination);
                    break;
                case 'It is something else':
                    setOptions(other);
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
                        <Text className='text-sm font-bold text-center'>Report Property</Text>
                    </View>
                </View>

                <View className='pt-10 px-2 flex flex-col gap-10'>
                    <View>
                        <Text className='text-3xl font-bold'>Why are you reporting this listing?</Text>
                        <Text className='text-xs text-black/50'>This won’t be shared with the owner.</Text>
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
