import { View, Text, TouchableOpacity, ActivityIndicator, Image, ImageBackground, Pressable } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import transferData from './transferData.json';
import { captureScreen } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

export default function transferReciept() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true); // Set loading to true when starting the process
        setTimeout(() => {
            setLoading(false); // Reset loading state after saving data
            router.replace('../wallet'); // Navigate to the receipt transaction screen
        }, 1000);
    };

    const hanndleDownload = async () => {
        try {
            setLoading(true);
  
            // Capture the screen as an image
            const screenshotUri = await captureScreen({
                format: 'jpg',
                quality: 0.8,
            });
  
            // Request permission to access media library
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                // Save the screenshot to the photo album
                const asset = await MediaLibrary.createAssetAsync(screenshotUri);
                await MediaLibrary.createAlbumAsync('ScreenShots', asset, false); // Creates a 'ScreenShots' album if it doesn't exist
  
                // Optionally, show a success message
                alert('Receipt downloaded successfully!');
            } else {
                alert('Permission to access media library is required to save the screenshot.');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt.');
        } finally {
            setLoading(false);
        }
    };



  return (
    <View className="bg-[#B33939] flex-1">
        <View className="bg-gray-100 h-screen mt-10 rounded-t-2xl flex-1">
                <ImageBackground
                source={require('../../../../../assets/images/receipt_bg.png')}
                className='flex-1 w-full h-full'
                resizeMode="stretch"
                >
                    <View className='px-6 items-center justify-center'>
                        {/* Header */}
                        <View className="flex flex-row items-center justify-between px-6 pt-8 mb-6">

                        </View>

                        <View className='items-center space-y-2 pt-20'>
                            <Text className="text-lg font-bold text-center text-[#6C6C6C]">Transaction Receipt</Text>
                        </View>

                          {/* Details Transaction Receipt */}
                          <View className='w-full flex-col space-y-4 rounded-xl my-4'>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Reference No</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Transaction ID</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Date Time</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.refNo}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.transactionId}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.dateTime}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Name</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.senderName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.senderEmail}</Text>

                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Payment Purpose</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Received by</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Email</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Billing Period</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Amount</Text>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>Fee</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.transferPurpose}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptName}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.receiptEmail}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>{transferData.billingPeriod}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.transferAmount).toLocaleString()}</Text>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {transferData.fee}</Text>
                                </View>
                            </View>
                            <View className='w-full flex-row items-center justify-start space-x-2 border-t pt-4 border-gray-300 px-4'>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C] font-bold'>TOTAL</Text>
                                </View>
                                <View className='flex-col w-1/2 space-y-1'>
                                    <Text className='text-xs text-[#6C6C6C]'>₱ {parseInt(transferData.fee).toLocaleString()}</Text>
                                </View>
                            </View> 
                        </View>

                    <View className='w-full items-center mt-5'>
                            <View className='px-5 mb-5'>
                                <Text className='text-xs text-center text-[#6C6C6C]'>Your transfer has been successfully processed. Thank you for choosing us!</Text>
                            </View>
                            <Pressable className='mb-4'
                            onPress={hanndleDownload}>
                                <Text className='text-xs text-[#EF5A6F]'>Download Receipt</Text>
                            </Pressable>
                            {loading ? ( // Show loading indicator when loading is true
                                <ActivityIndicator size="large" color="#D9534F" />
                            ) : (
                                <View className='px-6 w-full'>
                                    <TouchableOpacity
                                        onPress={handleConfirm}
                                        className="w-full py-3 bg-[#333333] rounded-xl items-center space-x-2"
                                    >
                                        <Text className="font-bold text-white">Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

        </View>
        </ImageBackground>
        </View>
    </View>
  )
}