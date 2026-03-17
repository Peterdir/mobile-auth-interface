import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Polyfill for StompJS
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux'; // Add useSelector
import '../src/global.css';
import { login } from '../src/store/slices/authSlice';
import { store } from '../src/store/store';
import { storage } from '../src/utils/storage';

SplashScreen.preventAutoHideAsync();


// Define a custom theme if needed, or use default
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5865F2',
    secondary: '#23A559',
    background: '#313338',
    surface: '#2B2D31',
  },
};

function AppContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments(); // Get current segments
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      // ... (keep existing prepare logic)
      try {
        const userInfo = await storage.getUserInfo();
        const token = await storage.getToken();

        if (userInfo && token) {
          // ... (existing fetch user logic)
          dispatch(login(userInfo)); // Temporary login until fetch completes
          // ...
        }
      } catch (e) {
        // ...
      } finally {
        setAppIsReady(true);
      }
    };
    prepare();
  }, []);

  // Protect routes
  useEffect(() => {
    if (!appIsReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments[0];

    if (!user) {
      // If not logged in and not in auth group, redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // If logged in and in auth group or at root, redirect to home
      if (inAuthGroup || isRoot) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, appIsReady]);

  // ... (keep existing render logic)
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#313338' }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#313338' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <ThemeProvider value={DarkTheme}>
          <AppContent />
        </ThemeProvider>
      </PaperProvider>
    </Provider>
  );
}