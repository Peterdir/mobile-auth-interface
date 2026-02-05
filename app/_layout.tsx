import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { Provider, useDispatch } from 'react-redux';
import { TextDecoder, TextEncoder } from 'text-encoding';
import '../src/global.css';
import { login } from '../src/store/slices/authSlice';
import { store } from '../src/store/store';
import { storage } from '../src/utils/storage';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Polyfill for StompJS
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const userInfo = await storage.getUserInfo();
        const token = await storage.getToken();

        if (userInfo && token) {
          let finalUserInfo = { ...userInfo, token };

          // Fetch đầy đủ thông tin user từ API
          if (token) {
            try {
              const response = await fetch('http://10.0.2.2:8085/api/users/me', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (response.ok) {
                const userData = await response.json();
                // Lưu toàn bộ thông tin user
                finalUserInfo = {
                  ...userInfo,
                  id: userData.id,
                  username: userData.username,
                  displayName: userData.displayName,
                  avatarUrl: userData.avatarUrl,
                  email: userData.email,
                  token
                };
                // Cập nhật storage với thông tin đầy đủ
                await storage.saveUserInfo(finalUserInfo);
              }
            } catch (error) {
              console.error('Failed to fetch user info:', error);
            }
          }

          dispatch(login(finalUserInfo));
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we do this faster than the initial render, user may see a flash.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#313338' }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#313338' } }}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/otp-verify" />
        <Stack.Screen name="(auth)/forget-password" />
        <Stack.Screen name="(auth)/reset-password" />
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