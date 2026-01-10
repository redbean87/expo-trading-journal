import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import TradesScreen from '../screens/TradesScreen';
import AddTradeScreen from '../screens/AddTradeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#757575',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Trades"
          component={TradesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AddTrade"
          component={AddTradeScreen}
          options={{
            title: 'Add Trade',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
