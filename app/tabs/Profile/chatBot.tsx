import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { GoogleGenAI } from '@google/genai';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_KEY = 'AIzaSyB4CPU6UhK56Sxlw2L7nrBiMlcV1r2LecQ'; // Replace with your actual API key
const ai = new GoogleGenAI({ apiKey: API_KEY });

// FAQs data including details about UPA (Urban Property Rental Application)
const FAQs = `
UPA (Urban Property Rental Application) is a comprehensive mobile solution that helps users search for rental properties, connect with landlords and tenants, and manage property listings, maintenance requests, payments, and lease agreements.

How can I report a scam or fraudulent activity?
To report fraud, use the "Report Fraud" option in the app's help section, or contact customer support directly. We'll investigate the issue promptly.

What should I do if I encounter a technical issue with the app?
If you experience any technical issues, try restarting the app. If the problem persists, report it to customer support through the app's "Help" section.

How do I update my email address?
To update your email, go to the "Account Settings" section and click on "Edit Profile." You can then change your email address and save the changes.

How do I add a new property listing?
To add a property listing in UPA, go to the "My Listings" section in your profile and click "Add New Property." Enter the details of the property, upload photos, and publish the listing.

Is there a late payment fee?
Late payment fees are determined by the property owner or agent. You should check the rental agreement for specific late payment policies.

How do I leave feedback for the app?
To leave feedback, go to the "Settings" section of UPA and click on "Feedback." You can provide comments or rate the app.

How can I contact customer support?
You can contact customer support by clicking on the "Help" icon in the app and selecting "Contact Support." You can either send an email or use live chat.

What do I do if I have issues with the lease agreement?
If you have any issues or concerns with the lease, contact the property owner or agent directly through UPA to resolve the matter.

What should I do if I’m not satisfied with the property I rented?
If you’re unhappy with your rental experience, contact the property owner/agent directly through UPA. You can also contact support for additional assistance.

Who is responsible for paying for maintenance?
Maintenance costs are typically outlined in the lease agreement. If the issue is caused by wear and tear, the landlord or property owner is usually responsible.

Can I edit a property listing after it’s been posted?
Yes, you can edit your property listings at any time by going to "My Listings," selecting the property you want to edit, and making the necessary changes.

How do I view my payment history?
You can view your payment history within UPA under the "Payment History" section in your account.

Can I pay the deposit through the app?
Yes, you can pay the security deposit for your rental directly through UPA.

What is the purpose of this app?
UPA helps you search for rental properties, connect with landlords and tenants, and apply for leases—all from the convenience of your mobile device.

Can I search for properties in multiple cities?
Yes, you can search for properties in multiple cities by adjusting the location filter in UPA to expand your search radius.

How do I report a suspicious property listing?
If you notice a suspicious listing, click on the "Report Listing" button on the property’s page in UPA. Provide a reason for the report, and we will investigate further.

How do I track the status of my maintenance request?
You can track the status of your maintenance request by going to the "My Requests" section in UPA, where updates will be provided as the issue is addressed.

How do I delete a property listing?
To delete a listing, go to "My Listings," select the property you want to remove, and click on the "Delete" option in UPA.

How can I filter property search results?
You can use filters such as location, price range, number of bedrooms, and property type in UPA to narrow down your search results.

How can I delete my account?
If you wish to delete your account, you can request it through the "Account Settings" section in UPA. Please note that all data associated with your account will be erased.

How do I sign a lease agreement through the app?
Once you’ve been approved for a property, the lease agreement will be available in your account under the "My Applications" section in UPA. You can sign it electronically.

How do I submit a maintenance request?
To submit a maintenance request, go to the property details page in UPA and click on "Request Maintenance." Provide a description of the issue and submit the request.

Can I change my username?
Usernames in UPA cannot be changed once created. If you need to update it, you would have to create a new account.
`;

export default function FAQS() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user's message to the chat
    const userMessage = { role: 'user' as 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Combine FAQs, UPA details, and user query with instructions
    const fullPrompt = `${FAQs}\n\nUser Question: ${input}\n\nInstruction: Answer only if the question is directly related to UPA (Urban Property Rental Application) and its functionalities. If the question is not related, respond with "I'm sorry, I can only answer questions related to UPA (Urban Property Rental Application)."`;
    
    setInput('');
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
      });

      const botMessage = { role: 'bot' as 'bot', text: response.text || 'Sorry, I couldn’t understand that.' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 bg-[#B33939]">
      <View className="flex-row items-center justify-between px-6 pt-12 pb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="flex-row items-center">
            <Ionicons name="chevron-back-circle-outline" size={25} color="white" />
          </View>
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center pr-5">
          <Text className="text-lg font-bold text-white text-center">ChatBot</Text>
        </View>
      </View>
      <View className="flex-1 bg-white px-4">
        <ScrollView contentContainerStyle={{ paddingVertical: 20 }} className="mb-4 mt-5">
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`p-3 my-1 rounded-lg ${msg.role === 'user' ? 'bg-[#B33939] self-end' : 'bg-gray-300 self-start'}`}
            >
              <Text className={msg.role === 'user' ? 'text-white' : 'text-black'}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {loading && <ActivityIndicator size="small" color="#0000ff" />}

        <View className="flex-row items-center border-t border-gray-300 p-2">
          <TextInput
            className="flex-1 border border-gray-300 p-2 rounded-lg text-black"
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity className="ml-2 bg-[#B33939] p-3 rounded-lg" onPress={sendMessage}>
            <Text className="text-white font-bold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
