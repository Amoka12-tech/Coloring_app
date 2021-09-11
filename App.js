import React from 'react';
import App from './app/App';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { Image } from 'react-native';
import {
  useFonts,
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import theme from './app/Theme';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './app/src/redux/store';
import { widthPercentageToDP } from 'react-native-responsive-screen';

export default function Wrapper() {
  let [fontsLoaded] = useFonts({
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  return !fontsLoaded ? (
    <>
      <StatusBar style="light" />
      <Image
        source={require('./app/res/splash.png')}
        style={{ width: widthPercentageToDP(100) }}
      />
    </>
  ) : (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NativeBaseProvider theme={theme}>
          <App />
          <StatusBar style="auto" />
        </NativeBaseProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
