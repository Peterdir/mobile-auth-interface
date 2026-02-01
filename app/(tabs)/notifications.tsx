import { COLORS } from '@/src/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Notifications Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
    }
});
