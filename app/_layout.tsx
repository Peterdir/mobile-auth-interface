import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { Provider, useDispatch } from 'react-redux';
import '../src/global.css';
import { login } from '../src/store/slices/authSlice';
import { store } from '../src/store/store';
import { storage } from '../src/utils/storage';

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

  useEffect(() => {
    const checkLogin = async () => {
      const userInfo = await storage.getUserInfo();
      const token = await storage.getToken();

      if (userInfo && token) {
        dispatch(login({ ...userInfo, token }));
        // setTimeout to ensure navigation is ready or just proceed
        router.replace('/(tabs)');
      }
    };
    checkLogin();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/otp-verify" />
      <Stack.Screen name="(auth)/forget-password" />
      <Stack.Screen name="(auth)/reset-password" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <AppContent />
      </PaperProvider>
    </Provider>
  );
}