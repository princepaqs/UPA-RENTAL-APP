import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { useRouter } from 'expo-router';

const UserRoutes: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    console.log('Test userRoutes')
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        router.replace('../tabs/Dashboard'); // Navigate to dashboard when user is authenticated
      } else {
        setError('No user is logged in');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-black/60'>
      <ActivityIndicator size="large" color="#EF5A6F" />
    </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return null; // Render nothing as routing will handle navigation
};

export default UserRoutes;
