import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';

export default function Index() {
    const user = useSelector((state: any) => state.auth.user);

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    // Let _layout.tsx handle the redirect to /(auth)/login
    return (
        <View style={{ flex: 1, backgroundColor: '#313338', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#5865F2" />
        </View>
    );
}
