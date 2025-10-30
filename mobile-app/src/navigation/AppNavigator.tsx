import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MealSearchScreen from '../screens/MealSearchScreen';
import ChatScreen from '../screens/ChatScreen';
import RecommendScreen from '../screens/RecommendScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Meals') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Recommend') {
              iconName = focused ? 'star' : 'star-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.borderLight,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: Colors.white,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: Colors.borderLight,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700',
            color: Colors.textDark,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Track Nutrition' }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{ title: 'Food Search' }}
        />
        <Tab.Screen 
          name="Meals" 
          component={MealSearchScreen}
          options={{ title: 'Discover Meals' }}
        />
        <Tab.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Nutrition Assistant' }}
        />
        <Tab.Screen 
          name="Recommend" 
          component={RecommendScreen}
          options={{ title: 'Recommendations' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
