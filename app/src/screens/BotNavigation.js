import React from 'react';
import { colors } from '../../Theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import Dashboard from '../tabs/Dashboard/Dashboard';
import Profile from '../tabs/Profile';
import Settings from '../tabs/Settings';

const Tab = createBottomTabNavigator();

export default function BotNavigation() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return (
                <MaterialCommunityIcons
                  name="view-dashboard"
                  size={size}
                  color={color}
                />
              );
            case 'Profile':
              return (
                <FontAwesome5 name="user-alt" size={size - 5} color={color}/>
              );

            case 'Settings':
              return (
                <Ionicons name="settings-sharp" size={size} color={color}/>
              );
          }
        },
      })}
      tabBarOptions={{
        activeTintColor: colors.main,
        inactiveTintColor: colors.grey,
        style: {
          height: 60 + insets.bottom,
        },
        tabStyle: {
          height: 50,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard}/>
      <Tab.Screen name="Profile" component={Profile}/>
      {/* <Tab.Screen name="Settings" component={Settings} /> */}
    </Tab.Navigator>
  );
}
