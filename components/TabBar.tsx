//TabBar.tsx
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, Pressable, Text } from 'react-native';
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, storage } from '../_dbconfig/dbconfig';
import { getDownloadURL, ref } from "firebase/storage";
import * as SecureStore from 'expo-secure-store';

type IconNames = 'Explore' | 'Favorite' | 'Find_Property' | 'My_Least' | 'Profile';

const icon: Record<IconNames, (props: { color: string; style?: any }) => JSX.Element> = {
    Explore: (props) => <AntDesign name="find" size={20} color={props.color} style={props.style} />,
    Favorite: (props) => <AntDesign size={20} name='hearto' color={props.color} style={props.style} />,
    Find_Property: (props) => <MaterialIcons size={20} name='camera' color={props.color} style={props.style} />,
    My_Least: (props) => <Ionicons name="home-outline" size={20} color={props.color} style={props.style} />,
    Profile: (props) => <Ionicons name='person-circle-outline' size={20} color={props.color} style={props.style} />
};

export function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const translateX = useSharedValue(0);
    const { width } = Dimensions.get('window'); // Get the width of the device
    const tabWidth = (width - 55) / state.routes.length; // Calculate tab width based on screen size
    const [accountStatus, setAccountStatus] = useState<string | null>(null);

    React.useEffect(() => {
        translateX.value = withTiming(state.index * tabWidth + 10, { duration: 250 }); // Adjust position with padding
    }, [state.index, tabWidth]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

     // Modify as per the actual status

    useEffect(() => {
        const fetchAccountStatus = async () => {
            const uid = await SecureStore.getItemAsync('uid');
            if(uid){
                const userRef = await getDoc(doc(db, 'users', uid))
                if(userRef.exists()){
                    const data = userRef.data()
                    if(data){
                        const accountStatus = data?.accountStatus || '';
                        setAccountStatus(accountStatus);
                    }
                }
            }
        }

        fetchAccountStatus();
    }, [])

    return (
        <View>
            {/* Show the review message only when the Explore tab is active and account status is not Approved */}
            {state.routes[state.index].name === "Explore" && accountStatus === "Under-review" && (
                <View className='flex-row space-x-2 items-center justify-center abosulte bottom-24 mx-6 bg-[#EF5A6F] shadow-md px-6 py-2.5 rounded-2xl '>
                    <MaterialCommunityIcons name="timer-sand-empty" size={35} color="white" />
                   <View className=''>
                     <Text className='text-white text-xs'>Your account is currently <Text className='text-xs font-bold'>under review</Text>. You’ll receive a notification once it's approved.</Text>
                   </View>
                </View>
            )}

            <View className="absolute bottom-2 left-5 right-5 flex-row justify-between items-center bg-[#B33939] rounded-full px-2 py-4">
                <Animated.View style={[{ position: 'absolute', width: tabWidth - 5, height: 55, borderRadius: 100, backgroundColor: 'white' }, animatedStyle]} />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = typeof options.tabBarLabel === 'string'
                        ? options.tabBarLabel
                        : typeof options.title === 'string'
                        ? options.title
                        : route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!event.defaultPrevented) {
                            // If tab is focused, refresh the screen by navigating to the same route
                            if (isFocused) {
                                navigation.navigate(route.name, {
                                    key: Math.random().toString(), // Random key to force a re-render
                                });
                            } else {
                                navigation.navigate(route.name, route.params);
                            }
                        }
                    };

                    const Icon = icon[route.name as IconNames];

                    return (
                        <Pressable
                            key={route.name}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            onPress={onPress}
                            className="flex-1"
                        >
                            <View className="flex-col items-center justify-center gap-1">
                                {Icon ? 
                                    <Icon 
                                        color={isFocused ? '#B33939' : 'white'} 
                                        style={{ opacity: isFocused ? 1 : 0.7 }} 
                                    />
                                : null}
                                <Text
                                    className={`text-[10px] text-center font-bold ${isFocused ? 'text-[#B33939]' : 'text-gray-300'}`}
                                >
                                    {label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
