import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Explore, Favorite, Find_Property, My_Least, Profile } from './navigation/_index';
import { StyleSheet, Text, View } from 'react-native';
import HomeHeader from '@/components/HomeHeader';
import { Feather, Octicons } from '@expo/vector-icons'; // Example icon library
import { MyTabBar } from '@/components/TabBar';


const Tab = createBottomTabNavigator();

export default function Dashboard() {

  return (
    <Tab.Navigator tabBar={props => <MyTabBar {...props}/>}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarLabel: 'Explore', 
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{
          tabBarLabel: 'Favorites', 
        }}
      />
      <Tab.Screen
        name="Find_Property"
        component={Find_Property}
        options={{
          tabBarLabel: 'Find', 
        }}
      />
      <Tab.Screen
        name="My_Least"
        component={My_Least}
        options={{
          tabBarLabel: 'My Lease', 
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile', 
        }}
      />
    </Tab.Navigator>
  );
}