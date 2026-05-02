import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
import HomeScreen from '../screens/HomeScreen';
import DebateScreen from '../screens/tabs/DebateScreen';
import LadderScreen from '../screens/tabs/LadderScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import { HomeIcon } from '../components/tabs/HomeIcon';
import { DebateIcon } from '../components/tabs/DebateIcon';
import { LadderIcon } from '../components/tabs/LadderIcon';
import { ProfileIcon } from '../components/tabs/ProfileIcon';

export type TabParamList = {
  Home: undefined;
  Debate: undefined;
  Ladder: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const labelStyle = {
  fontFamily: fonts.jakarta.semiBold,
  fontSize: 11,
  marginTop: 4,
} as const;

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 10,
          paddingBottom: 14,
        },
        tabBarLabelStyle: labelStyle,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarActiveTintColor: colors.lime,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Debate"
        component={DebateScreen}
        options={{
          tabBarActiveTintColor: colors.purple2,
          tabBarIcon: ({ focused }) => <DebateIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Ladder"
        component={LadderScreen}
        options={{
          tabBarActiveTintColor: colors.red,
          tabBarIcon: ({ focused }) => <LadderIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarActiveTintColor: '#4ECDC4',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
