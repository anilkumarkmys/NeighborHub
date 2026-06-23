import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { store } from './src/store';
import AdminRootNavigator from './src/navigation';
import { loadStoredAuth } from './src/store/slices/authSlice';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  useEffect(() => {
    store.dispatch(loadStoredAuth()).finally(() => SplashScreen.hideAsync());
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AdminRootNavigator />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
}
