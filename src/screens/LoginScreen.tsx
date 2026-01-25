import { Link } from 'expo-router';
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginUser } from "../api/authApi";
import { COLORS } from '../constants/colors';

export default function LoginScreen() {


    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!userName || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        setLoading(true);
        try {
            const result = await loginUser(userName, password);

            if (result.token) {
                // Login thành công
                Alert.alert('Thành công', result.message);
                // TODO: Lưu token và chuyển sang màn hình chính
            } else {
                // Login thất bại
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
            <Text style={styles.title}>Login</Text>


            <TextInput
                placeholder="UserName"
                style={styles.input}
                keyboardType="default"
                value={userName}
                onChangeText={setUserName}
            />


            <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />


            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Login'}</Text>
            </TouchableOpacity>


            <Link href="/(auth)/forget-password" style={styles.link}>
                Forgot password?
            </Link>
            <Link href="/(auth)/register" style={styles.link}>
                Don't have an account? Register
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