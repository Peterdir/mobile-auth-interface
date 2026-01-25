import { Link, useRouter } from 'expo-router';
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerUser } from "../api/authApi";
import { COLORS } from '../constants/colors';

export default function RegisterScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validate inputs
        if (!username || !displayName || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const result = await registerUser(username, email, password, displayName);

            if (result.email) {
                // Đăng ký thành công -> chuyển sang màn OTP
                Alert.alert('Thành công', result.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.push({
                                pathname: '/(auth)/otp-verify',
                                params: { email: result.email, type: 'VERIFY_ACCOUNT' }
                            });
                        }
                    }
                ]);
            } else {
                // Đăng ký thất bại
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
            <Text style={styles.title}>Register</Text>

            <TextInput
                placeholder="Username"
                style={styles.input}
                keyboardType="default"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                placeholder="Display Name"
                style={styles.input}
                keyboardType="default"
                value={displayName}
                onChangeText={setDisplayName}
            />

            <TextInput
                placeholder="Email"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Đang đăng ký...' : 'Register'}
                </Text>
            </TouchableOpacity>

            <Link href="/(auth)/login" style={styles.link}>
                Already have an account? Login
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 32,
        color: COLORS.text,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    link: {
        marginTop: 16,
        textAlign: 'center',
        color: COLORS.primary,
    },
});