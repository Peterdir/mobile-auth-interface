import { Stack } from 'expo-router';

export default function RootLayout() {
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