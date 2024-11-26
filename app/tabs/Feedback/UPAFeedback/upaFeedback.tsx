import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function upaFeedback() {
    const router = useRouter();

    const [ratings, setRatings] = useState<Array<number>>(Array(5).fill(0)); 
    const [comment, setComment] = useState<string>("");

    const handleRating = (questionIndex: number, rating: number) => {
        const updatedRatings = [...ratings];
        updatedRatings[questionIndex] = rating;
        setRatings(updatedRatings);
    };

    const questions = [
        "How easy was it to navigate and use the application?",
        "Are the features provided by the application sufficient to meet your needs?",
        "How would you rate the convenience and reliability of the in-app payment system?",
        "How satisfied are you with the responsiveness of the support team or help resources?",
        "Would you recommend this application to others for property rental purposes?"
    ];

    const onSubmit = () => {
        if (ratings.includes(0)) {
            Alert.alert("Incomplete Feedback", "Please rate all questions before submitting.");
            return;
        }

        const feedbackData = {
            ratings,
            comment,
        };

        console.log("Feedback Submitted:", feedbackData);
        Alert.alert("Feedback Submitted", "Thank you for your feedback!");
        router.back();
    };

    return (
        <View className="h-screen py-4 px-6">
            <View className="flex-row items-center justify-between mt-10 pb-5 px-4 border-b border-gray-300">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back-circle-outline" size={25} color="black" />
                </TouchableOpacity>
                <Text className="flex-1 text-xs font-bold text-center">End of Contract - Review</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                className="mb-20"
            >
                <View className="flex-col mt-5 space-y-2">
                    <Text className="text-lg font-bold">Feedback on Your Experience with UPA</Text>
                    <Text className="text-xs">Please answer the following questions to provide feedback on your experience using the property rental application and its features.</Text>
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

                <View className="mt-5">
                    <Text className="text-xs">
                        <Text className="font-bold">Overall Comment</Text> (Do you have any additional comments or suggestions about your experience with the application?)
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

            <View className="absolute bottom-0 w-screen py-4 px-12 border-t border-gray-300">
                <View className="flex-row space-x-4">
                    <TouchableOpacity
                        className="flex-1 items-center border border-gray-400 rounded-xl"
                        onPress={() => router.back()}
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
        </View>
    );
}
