import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { resendOtp, verifyAccount } from "../api/authApi";
import { COLORS } from '../constants/colors';

export default function OTPVerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email: string; type: 'VERIFY_ACCOUNT' | 'RESET_PASSWORD' }>();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP 6 số');
            return;
        }

        if (!params.email) {
            Alert.alert('Lỗi', 'Không tìm thấy email. Vui lòng thử lại.');
            return;
        }

        setLoading(true);
        try {
            if (params.type === 'VERIFY_ACCOUNT') {
                // Xác thực tài khoản (đăng ký mới)
                const result = await verifyAccount(params.email, otp);

                if (result.message?.includes('thành công')) {
                    Alert.alert('Thành công', result.message, [
                        {
                            text: 'Đăng nhập ngay',
                            onPress: () => router.replace('/(auth)/login')
                        }
                    ]);
                } else {
                    Alert.alert('Lỗi', result.message || 'Xác thực thất bại');
                }
            } else if (params.type === 'RESET_PASSWORD') {
                // Chuyển sang màn reset password với OTP đã xác thực
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { email: params.email, otp: otp }
                });
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!params.email || !params.type) {
            Alert.alert('Lỗi', 'Thiếu thông tin. Vui lòng thử lại.');
            return;
        }

        setResending(true);
        try {
            const result = await resendOtp(params.email, params.type);

            if (result.email) {
                Alert.alert('Thành công', result.message);
                setCountdown(60); // Chờ 60 giây trước khi gửi lại
            } else {
                Alert.alert('Lỗi', result.message || 'Gửi lại OTP thất bại');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kết nối đến server');
        } finally {
            setResending(false);
        }
    };

    const getTitle = () => {
        return params.type === 'VERIFY_ACCOUNT' ? 'Xác thực tài khoản' : 'Xác thực OTP';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{getTitle()}</Text>

            <Text style={styles.description}>
                Chúng tôi đã gửi mã xác thực đến email:{'\n'}
                <Text style={styles.email}>{params.email}</Text>
            </Text>

            <TextInput
                placeholder="Nhập mã OTP 6 số"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Đang xác thực...' : 'Xác thực'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resending || countdown > 0}
            >
                <Text style={[styles.link, (resending || countdown > 0) && styles.linkDisabled]}>
                    {countdown > 0
                        ? `Gửi lại mã sau ${countdown}s`
                        : resending
                            ? 'Đang gửi...'
                            : "Không nhận được mã? Gửi lại"}
                </Text>
            </TouchableOpacity>
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
        marginBottom: 16,
        color: COLORS.text,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: COLORS.text,
        lineHeight: 24,
    },
    email: {
        fontWeight: '600',
        color: COLORS.primary,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 8,
        fontWeight: '600',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
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
    linkDisabled: {
        color: COLORS.gray,
    },
});