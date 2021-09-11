import React from 'react';
import { Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Screens from './src/screens';
import { navigationRef } from './RootNavigation';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="BotNav"
        screenOptions={navigatorOptions}
      >
        <Stack.Screen name="BotNav" component={Screens.BotNavigation}/>
        <Stack.Screen name="Painting" component={Screens.Painting}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const navigatorOptions = {
  header: () => null,
  cardStyle: { backgroundColor: 'transparent' },
  cardStyleInterpolator: ({ current, next, inverted, layouts: { screen } }) => {
    const progress = Animated.add(
      current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      next
        ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
        : 0
    );

    return {
      cardStyle: {
        transform: [
          {
            translateX: Animated.multiply(
              progress.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [screen.width, 0, screen.width * -0.3],
                extrapolate: 'clamp',
              }),
              inverted
            ),
          },
        ],
      },
    };
  },
};
