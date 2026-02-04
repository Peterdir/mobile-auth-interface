import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { forgetPassword } from '../api/authApi';

// Discord Colors
const DISCORD = {
    blurple: '#5865F2',
    red: '#ED4245',
    white: '#FFFFFF',
    darkerBg: '#111214',
    inputBg: '#1E1F22',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
};

export default function ForgetPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }

        setLoading(true);
        try {
            const response = await forgetPassword(email);

            if (response.message && response.email) {
                Alert.alert("Thành công", response.message);
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { email: email }
                });
            } else {
                Alert.alert("Lỗi", response.message);
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối đến server");
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
                        <Text style={styles.icon}>🔐</Text>
                    </View>

                    <Text style={styles.title}>Quên mật khẩu?</Text>
                    <Text style={styles.subtitle}>
                        Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>EMAIL <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder=""
                            placeholderTextColor={DISCORD.textDark}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSendOTP}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={DISCORD.white} size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Gửi hướng dẫn</Text>
                        )}
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.backContainer}>
                            <Text style={styles.backText}>← Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </Link>
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
    inputGroup: {
        marginBottom: 24,
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
    submitButton: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: DISCORD.white,
        fontSize: 16,
        fontWeight: '600',
    },
    backContainer: {
        alignItems: 'center',
    },
    backText: {
        fontSize: 14,
        color: DISCORD.blurple,
        fontWeight: '500',
    },
});