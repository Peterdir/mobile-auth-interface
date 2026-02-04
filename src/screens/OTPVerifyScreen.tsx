import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Discord Colors
const DISCORD = {
    blurple: '#5865F2',
    green: '#57F287',
    red: '#ED4245',
    white: '#FFFFFF',
    darkerBg: '#111214',
    inputBg: '#1E1F22',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
};

import { resendOtp, verifyAccount } from "../api/authApi";

export default function OTPVerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email: string; type: 'VERIFY_ACCOUNT' | 'RESET_PASSWORD' }>();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
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
                const result = await verifyAccount(params.email, otpString);

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
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { email: params.email, otp: otpString }
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
                setCountdown(60);
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
            <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkerBg} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>📧</Text>
                    </View>

                    <Text style={styles.title}>{getTitle()}</Text>

                    <Text style={styles.description}>
                        Chúng tôi đã gửi mã xác thực đến email
                    </Text>
                    <Text style={styles.email}>{params.email}</Text>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        <TextInput
                            style={styles.otpInput}
                            value={otp.join('')}
                            onChangeText={(text) => {
                                const chars = text.slice(0, 6).split('');
                                const newOtp = [...chars, '', '', '', '', '', ''].slice(0, 6);
                                setOtp(newOtp);
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="000000"
                            placeholderTextColor={DISCORD.textDark}
                        />
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={DISCORD.white} size="small" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Xác thực</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend */}
                    <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={resending || countdown > 0}
                        style={styles.resendContainer}
                    >
                        <Text style={[styles.resendText, (resending || countdown > 0) && styles.resendDisabled]}>
                            {countdown > 0
                                ? `Gửi lại mã sau ${countdown}s`
                                : resending
                                    ? 'Đang gửi...'
                                    : "Không nhận được mã? Gửi lại"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DISCORD.darkerBg,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        color: DISCORD.text,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        color: DISCORD.textMuted,
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        fontWeight: '600',
        color: DISCORD.blurple,
        textAlign: 'center',
        marginBottom: 32,
    },
    otpContainer: {
        marginBottom: 24,
    },
    otpInput: {
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
        paddingVertical: 16,
        fontSize: 32,
        fontWeight: '700',
        color: DISCORD.text,
        textAlign: 'center',
        letterSpacing: 12,
    },
    verifyButton: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: DISCORD.white,
        fontSize: 16,
        fontWeight: '600',
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    resendText: {
        fontSize: 14,
        color: DISCORD.blurple,
        fontWeight: '500',
    },
    resendDisabled: {
        color: DISCORD.textDark,
    },
});