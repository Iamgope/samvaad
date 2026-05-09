import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';
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
  Home:    'Home',
  Search:  'Search',
  Ladder:  'Ladder',
  Profile: 'Profile',
};

const ICONS: Record<string, (focused: boolean) => React.ReactNode> = {
  Home:    f => <HomeIcon    focused={f} />,
  Search:  f => <SearchIcon  focused={f} />,
  Ladder:  f => <LadderIcon  focused={f} />,
  Profile: f => <ProfileIcon focused={f} />,
};

function GameTabBar({ state, navigation }: BottomTabBarProps) {
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
            activeOpacity={0.7}
          >
            <View style={[t.indicator, focused && t.indicatorActive]} />
            <View style={t.iconWrap}>
              {ICONS[route.name]?.(focused)}
            </View>
            <Text style={[t.label, focused && t.labelActive]}>
              {LABELS[route.name] ?? route.name}
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
      tabBar={props => <GameTabBar {...props} />}
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
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: '#1A1730',
    paddingTop: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  indicatorActive: { backgroundColor: colors.lime },
  iconWrap:        { marginTop: 2 },
  label:           { fontFamily: fonts.jakarta.semiBold, fontSize: 11, color: '#444444' },
  labelActive:     { color: colors.lime },
});
