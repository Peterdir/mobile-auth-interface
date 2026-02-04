import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { resetPassword } from '../api/authApi';

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

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const result = await resetPassword(email as string, otp, newPassword);
            if (result.message === 'Đổi mật khẩu thành công') {
                Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công!', [
                    { text: 'Đăng nhập', onPress: () => router.replace('/(auth)/login') }
                ]);
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
                        <Text style={styles.icon}>🔑</Text>
                    </View>

                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>
                        Nhập mã OTP đã gửi đến{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    {/* OTP Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>MÃ XÁC THỰC <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="000000"
                            placeholderTextColor={DISCORD.textDark}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>MẬT KHẨU MỚI <Text style={styles.required}>*</Text></Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholderTextColor={DISCORD.textDark}
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={DISCORD.textDark}
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={DISCORD.white} size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Đặt lại mật khẩu</Text>
                        )}
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
        color: DISCORD.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        color: DISCORD.textMuted,
        marginBottom: 32,
        lineHeight: 22,
    },
    emailText: {
        color: DISCORD.blurple,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: DISCORD.textMuted,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    required: {
        color: DISCORD.red,
    },
    input: {
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: DISCORD.text,
    },
    otpInput: {
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: '700',
        color: DISCORD.text,
        textAlign: 'center',
        letterSpacing: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: DISCORD.text,
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    eyeIcon: {
        fontSize: 18,
    },
    submitButton: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: DISCORD.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
