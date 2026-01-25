import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { resetPassword } from '../api/authApi';


export default function ResetPasswordScreen() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const {email} = useLocalSearchParams<{email: string}>(); // Lấy email từ params

    const handleResetPassword = async () => {
        // Validation
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            const result = await resetPassword(email as string, otp, newPassword);
            if (result.message === 'Đổi mật khẩu thành công') {
                Alert.alert('Thành công', result.message);
                router.replace('/(auth)/login');
            } else {
                Alert.alert('Lỗi', result.message);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <Text style={styles.description}>
                Enter OTP sent to {email}
            </Text>

            <TextInput
                placeholder="OTP Code"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
            />

            <TextInput
                placeholder="New Password"
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Đang xử lý...' : 'Reset Password'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: COLORS.background
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: "center",
        marginBottom: 16,
        color: COLORS.text
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 18,
        letterSpacing: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: COLORS.text,
    },
});
