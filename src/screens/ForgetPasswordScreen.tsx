import { Link, useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { useState } from 'react';
import {forgetPassword} from '../api/authApi';

export default function ForgetPasswordScreen() {

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if(!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }

        setLoading(true);

        try {
            const response = await forgetPassword(email);

            if(response.message && response.email) {
                Alert.alert("Thành công", response.message);
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { email: email}
                });
            }
            else {
                Alert.alert("Lỗi", response.message);
            }
        }
        catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forget Password</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Loading..." : "Reset Password"}</Text>
            </TouchableOpacity>

            <Link href="/(auth)/login" style={styles.link}>
                Back to Login
            </Link>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: COLORS.background
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