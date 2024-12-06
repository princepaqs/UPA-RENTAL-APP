import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Explore, Favorite, Find_Property, My_Least, Profile } from './navigation/_index';
import { MyTabBar } from '@/components/TabBar';
import NavigatorHeader from '@/components/NavigatorHeader';
import { FilterProvider } from './FilterContext';

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  return (
    <FilterProvider>
      <Tab.Navigator
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: route.name === 'Find_Property' ? false : true, // Disable header only for Find_Property
          header: route.name === 'Find_Property' ? undefined : () => <NavigatorHeader />, // Show NavigatorHeader for all except Find_Property
        })}
        initialRouteName="Explore"
      >
        <Tab.Screen name="Explore" component={Explore} options={{ tabBarLabel: 'Explore' }} />
        <Tab.Screen name="Favorite" component={Favorite} options={{ tabBarLabel: 'Favorites' }} />
        <Tab.Screen name="Find_Property" component={Find_Property} options={{ tabBarLabel: 'Find' }} />
        <Tab.Screen name="My_Least" component={My_Least} options={{ tabBarLabel: 'My Lease' }} />
        <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'Profile' }} />
      </Tab.Navigator>
    </FilterProvider>
  );
}
