import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../../_dbconfig/dbconfig'; // Import Firestore
import { collection, getDocs, query, where } from 'firebase/firestore'; // Correct Firestore imports
// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';

interface FAQs {
  category: string;
  faqQuestion: string[];
  faqAnswer: string[];
  status: string;
}

interface GroupedFAQ {
  category: string;
  faqs: FAQs[];
}

export default function FAQS() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<GroupedFAQ[]>([]); // Updated state type to GroupedFAQ

  const getData = async () => {
    try {
      // Fetch the faqs collection from Firestore
      const faqCollectionRef = collection(db, 'faqs'); // Correctly refer to the collection
      const faqQuery = query(faqCollectionRef, where('status', '==', 'Active')); // Filter active FAQs
      const faqQuerySnapshot = await getDocs(faqQuery); // Fetch the data based on query
      console.log(faqQuerySnapshot.docs);
      // Filter and group FAQs by category
      let groupedFAQs: Record<string, FAQs[]> = {};

      faqQuerySnapshot.forEach((doc) => {
        const faq = doc.data() as FAQs;
        if (!groupedFAQs[faq.category]) {
          groupedFAQs[faq.category] = [];
        }
        groupedFAQs[faq.category].push(faq);
      });

      // Convert groupedFAQs to an array to display
      const activeFAQs = Object.entries(groupedFAQs).map(([category, faqs]) => ({
        category,
        faqs,
      }));
      console.log(activeFAQs)
      setFaqs(activeFAQs); // Set the state with grouped FAQs
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      Alert.alert('Error', 'There was an issue fetching the FAQs.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        await getData();
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setRefreshing(false); // Stop the refreshing animation
      }
    }, []);

  return (
    <View className="bg-[#B33939]">
      <View className="h-screen bg-white px-6 mt-14 rounded-t-2xl">
        <View className="flex flex-row items-center justify-between px-6 pt-8 mb-10">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="flex flex-row items-center">
              <Ionicons name="chevron-back-circle-outline" size={25} color="gray" />
            </View>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center pr-5">
            <Text className="text-sm font-bold text-center">Frequently Asked Questions</Text>
          </View>
        </View>
        <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                  >
        <View className="px-5 min-h-screen">
          {faqs.length === 0 ? (
            <Text className="text-center text-sm text-gray-500 mt-4">
              No active FAQs at the moment. Please check back later.
            </Text>
          ) : (
            faqs.map((group, index) => (
              <View key={index} className="p-3 bg-white flex flex-col space-y-1 rounded-xl mt-4">
                <Text className="text-lg font-bold">{group.category}</Text>
                {group.faqs.map((faq, faqIndex) => (
                  <View key={faqIndex} className="mt-2">
                    <Text className="text-sm font-semibold">{faq.faqQuestion}</Text>
                    <Text className="text-sm text-gray-500">- {faq.faqAnswer}</Text>
                  </View>
                ))}
              </View>
            ))
          )}

          {/* Dummy view at the bottom to ensure visibility */}
          <View className="h-60" />
        </View>
        </ScrollView>
      </View>
    </View>
  );
}
