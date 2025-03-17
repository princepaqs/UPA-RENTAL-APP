import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';

export default function ownerFeedback() {
    const router = useRouter();

    const [ratings, setRatings] = useState<Array<number>>(Array(6).fill(0)); 
    const [comment, setComment] = useState<string>("");

    const handleRating = (questionIndex: number, rating: number) => {
        const updatedRatings = [...ratings];
        updatedRatings[questionIndex] = rating;
        setRatings(updatedRatings);
    };

    const questions = [
        "How would you rate your overall communication with the property owner?",
        "How responsive was the property owner to your inquiries and concerns?",
        "Did you feel that the property owner was fair and transparent in their dealings with you?",
        "How would you describe the professionalism of the property owner?",
        "Did you feel supported by the property owner during your tenancy?",
        "How would you describe your overall experience with the property owner?"
    ];

    const generateTransactionID = () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
        const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
    };

    const onSubmit = async () => {
        if (ratings.includes(0)) {
            Alert.alert("Incomplete Feedback", "Please rate all questions before submitting.");
            return;
        }

        const uid = await SecureStore.getItemAsync('reviewOwnerId') || 'test ';
        const senderId = await SecureStore.getItemAsync('uid') || 'test';
        const reviewId = generateTransactionID()

        const feedbackData = {
            feedbackType: 'Owner',
            senderId,
            uid,
            ratings,
            comment,
            createdAt: new Date()
        };

        if(uid && feedbackData){
            await setDoc(doc(db, 'reviews', uid, 'reviewId', reviewId), feedbackData);
            console.log("Feedback Submitted:", feedbackData);
            router.replace('../UPAFeedback/upaFeedback');
        }
    };

    return (
        <>
        <View className="h-screen pt-4 pb-8 px-6">
            <View className="flex-row items-center justify-between mt-10 pb-5 px-4 border-b border-gray-300">
                {/* <TouchableOpacity onPress={() => router.replace('../Notification')}>
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </TouchableOpacity> */}
                <Text className="flex-1 text-sm font-bold text-center">End of Contract - Review</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-col mt-5 space-y-2">
                    <Text className="text-lg font-bold">Owner Property</Text>
                    <Text className="text-xs">Please provide your feedback on your experience with the property owner during your tenancy.</Text>
                </View>

                {questions.map((question, questionIndex) => (
                    <View key={questionIndex} className="mt-5">
                        <Text className="text-xs font-bold">{question}</Text>
                        <View className="flex-row items-center justify-between mx-10 my-4">
                            {["Very Poor", "Poor", "Good", "Excellent"].map((rating, ratingIndex) => (
                                <TouchableOpacity
                                    key={ratingIndex}
                                    className="flex-col items-center space-y-1"
                                    onPress={() => handleRating(questionIndex, ratingIndex + 1)} // Rating starts from 1
                                >
                                    <AntDesign
                                        name={ratings[questionIndex] === ratingIndex + 1 ? "star" : "staro"}
                                        size={24}
                                        color="black"
                                    />
                                    <Text className="text-xs">{rating}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View className="mt-5 mb-10">
                    <Text className="text-xs">
                        <Text className="font-bold">Overall Comment</Text> (Please share any additional thoughts or feedback regarding your experience with the property owner)
                    </Text>
                    <TextInput
                        className="mt-2 p-2 border border-gray-300 rounded-lg text-xs"
                        placeholder="Type your comment here..."
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                </View>
            </ScrollView>

            
        </View>
        <View className="absolute bg-[#F6F6F6] bottom-0 w-screen py-3 px-8 border-t border-gray-300">
        <View className="flex-row space-x-4">
            <TouchableOpacity
                className="flex-1 items-center border border-gray-400 rounded-xl"
                onPress={() => router.replace('../PropertyFeedback/propertyFeedback')}
            >
                <Text className="py-3 text-xs font-bold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 items-center bg-[#D9534F] rounded-xl"
                onPress={onSubmit}
            >
                <Text className="py-3 text-white text-xs font-bold">Submit</Text>
            </TouchableOpacity>
        </View>
    </View>
        </>
    );
}
