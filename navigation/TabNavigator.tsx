import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { fonts } from '../constants/fonts'; // Make sure this path is correct for your project
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/tabs/SearchScreen';
import LadderScreen from '../screens/tabs/LadderScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import { HomeIcon } from '../components/tabs/HomeIcon';
import { SearchIcon } from '../components/tabs/SearchIcon';
import { LadderIcon } from '../components/tabs/LadderIcon';
import { ProfileIcon } from '../components/tabs/ProfileIcon';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Ladder: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const LABELS: Record<string, string> = {
  Home:    'HOME',
  Search:  'EXPLORE',
  Ladder:  'LADDER',
  Profile: 'PROFILE',
};

const ICONS: Record<string, (focused: boolean) => React.ReactNode> = {
  Home:    (f) => <HomeIcon    focused={f} />,
  Search:  (f) => <SearchIcon  focused={f} />,
  Ladder:  (f) => <LadderIcon  focused={f} />,
  Profile: (f) => <ProfileIcon focused={f} />,
};

function DuellaTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[t.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={t.tab}
            onPress={() => { if (!focused) navigation.navigate(route.name); }}
            activeOpacity={0.8}
          >
            {/* 3D Glow Wrap */}
            <View
              style={[
                t.iconWrap,
                focused && {
                  shadowColor: '#ffffff', // White glow mimics metallic reflection
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6, // For Android
                },
              ]}
            >
              {ICONS[route.name]?.(focused)}
            </View>

            {/* Label */}
            <Text
              style={[
                t.label,
                focused && { color: '#ffffff', fontFamily: fonts.jakarta?.bold ?? 'System', fontWeight: '700' },
              ]}
            >
              {LABELS[route.name] ?? route.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <DuellaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeScreen}   />
      <Tab.Screen name="Search"  component={SearchScreen} />
      <Tab.Screen name="Ladder"  component={LadderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const t = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#050505', // Deep black for better contrast with 3D icons
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    width: 36,
  },
  label: {
    fontFamily: fonts.jakarta?.semiBold ?? 'System',
    fontSize: 9,
    color: '#666666', // subtle grey when unfocused
    letterSpacing: 0.8,
  },
});
