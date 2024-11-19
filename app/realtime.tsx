import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '../_dbconfig/dbconfig'; // Import your Firestore configuration
import { collection, onSnapshot } from 'firebase/firestore'; // Import Firestore functions

export default function Index() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users'); // Reference to the 'users' collection

        // Listen for real-time updates
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const usersArray: any[] = []; // Specify the type for usersArray

            snapshot.forEach((doc) => {
                usersArray.push({ id: doc.id, ...doc.data() }); // Add id to the user object
            });

            setUsers(usersArray); // Update state with the users array
            setLoading(false); // Stop loading
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Show loading indicator
    }

    return (
        <View className='p-10'>
            <Text>Users:</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id} // Use id as the key
                renderItem={({ item }) => (
                    <View className='flex-col gap-5 px-5'>
                        <Text>Email: {item.email}</Text>
                        <Text>Name: {item.firstName}</Text>
                        <Text>Account ID: {item.accountId}</Text>
                    </View>
                )}
            />
        </View>
    );
}
