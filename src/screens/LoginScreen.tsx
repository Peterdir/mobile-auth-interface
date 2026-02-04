import { Link, useRouter } from 'expo-router';
import { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser } from "../api/authApi";
import { login } from '../store/slices/authSlice';
import { storage } from '../utils/storage';

// Discord Colors
const DISCORD = {
    blurple: '#5865F2',
    green: '#57F287',
    yellow: '#FEE75C',
    fuchsia: '#EB459E',
    red: '#ED4245',
    white: '#FFFFFF',
    black: '#23272A',
    darkBg: '#1E1F22',
    darkerBg: '#111214',
    inputBg: '#1E1F22',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
};

export default function LoginScreen() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!userName || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        setLoading(true);
        try {
            const result = await loginUser(userName, password);

            if (result.token) {
                await storage.saveToken(result.token);

                try {
                    const userResponse = await fetch('http://10.0.2.2:8085/api/users/me', {
                        headers: {
                            'Authorization': `Bearer ${result.token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        const userInfo = {
                            id: userData.id,
                            user: userName,
                            username: userData.username,
                            displayName: userData.displayName,
                            avatarUrl: userData.avatarUrl,
                            email: userData.email,
                            token: result.token
                        };
                        await storage.saveUserInfo(userInfo);
                        dispatch(login(userInfo));
                    } else {
                        const userInfo = { id: result.userId, user: userName, token: result.token };
                        await storage.saveUserInfo(userInfo);
                        dispatch(login(userInfo));
                    }
                } catch (e) {
                    const userInfo = { id: result.userId, user: userName, token: result.token };
                    await storage.saveUserInfo(userInfo);
                    dispatch(login(userInfo));
                }

                router.replace('/(tabs)');
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
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <Image
                            source={require('../../assets/images/splash-icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
                        <Text style={styles.subtitleText}>Chúng tôi rất vui khi gặp lại bạn!</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Username Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>TÀI KHOẢN HOẶC EMAIL <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder=""
                                placeholderTextColor={DISCORD.textDark}
                                value={userName}
                                onChangeText={setUserName}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MẬT KHẨU <Text style={styles.required}>*</Text></Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder=""
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

                        {/* Forgot Password Link */}
                        <Link href="/(auth)/forget-password" asChild>
                            <TouchableOpacity>
                                <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </Link>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={DISCORD.white} size="small" />
                            ) : (
                                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Cần một tài khoản? </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.registerLink}>Đăng ký</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
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
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '700',
        color: DISCORD.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 16,
        color: DISCORD.textMuted,
        textAlign: 'center',
    },
    formSection: {
        width: '100%',
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
        borderWidth: 1,
        borderColor: '#1E1F22',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1E1F22',
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
    forgotPassword: {
        fontSize: 14,
        color: DISCORD.blurple,
        fontWeight: '500',
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: DISCORD.white,
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    registerText: {
        fontSize: 14,
        color: DISCORD.textMuted,
    },
    registerLink: {
        fontSize: 14,
        color: DISCORD.blurple,
        fontWeight: '500',
    },
});