import { AuthContextProvider, useAuth } from '../context/authContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';


const MainLayout = () => {  
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  //tabs
  useEffect(() => {
    if (typeof isAuthenticated === 'undefined') return;

    const inApp = segments[0] === 'tabs';
    if (isAuthenticated && !inApp) {
      // Redirect to home - use valid route typing
      //router.replace('/signIn'); 
    } else if (isAuthenticated === false) {
      // Redirect to signIn - use valid route typing
      router.replace('/signUp');
    }
  }, [isAuthenticated]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
