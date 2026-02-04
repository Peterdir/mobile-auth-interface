import { Link, useRouter } from 'expo-router';
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerUser } from "../api/authApi";

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

export default function RegisterScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const result = await registerUser(username, email, password, displayName);

            if (result.email) {
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
                    {/* Header */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Tạo tài khoản</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formSection}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>EMAIL <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={DISCORD.textDark}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        {/* Display Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>TÊN HIỂN THỊ <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={DISCORD.textDark}
                                value={displayName}
                                onChangeText={setDisplayName}
                            />
                        </View>

                        {/* Username */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>TÊN NGƯỜI DÙNG <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={DISCORD.textDark}
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MẬT KHẨU <Text style={styles.required}>*</Text></Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholderTextColor={DISCORD.textDark}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            Khi đăng ký, bạn đồng ý với{' '}
                            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                            <Text style={styles.termsLink}>Chính sách quyền riêng tư</Text> của Discord.
                        </Text>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={DISCORD.white} size="small" />
                            ) : (
                                <Text style={styles.registerButtonText}>Tiếp tục</Text>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity style={styles.loginLinkContainer}>
                                <Text style={styles.loginLink}>Đã có tài khoản?</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
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
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: DISCORD.text,
        textAlign: 'center',
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
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
        paddingVertical: 12,
        fontSize: 16,
        color: DISCORD.text,
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
        paddingVertical: 12,
        fontSize: 16,
        color: DISCORD.text,
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    eyeIcon: {
        fontSize: 18,
    },
    termsText: {
        fontSize: 12,
        color: DISCORD.textDark,
        lineHeight: 18,
        marginBottom: 20,
    },
    termsLink: {
        color: DISCORD.blurple,
    },
    registerButton: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 4,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: DISCORD.white,
        fontSize: 16,
        fontWeight: '600',
    },
    loginLinkContainer: {
        alignItems: 'flex-start',
    },
    loginLink: {
        fontSize: 14,
        color: DISCORD.blurple,
        fontWeight: '500',
    },
});