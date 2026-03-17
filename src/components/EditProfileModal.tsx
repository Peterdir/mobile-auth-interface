import { profileApi } from '@/src/api/profileApi';
import { login } from '@/src/store/slices/authSlice';
import { storage } from '@/src/utils/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AvatarEditSheet from './AvatarEditSheet';

// Discord color palette
const DISCORD = {
    background: '#000000',
    secondaryBg: '#111214',
    cardBg: '#1E1F22',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
    blurple: '#5865F2',
    green: '#23A559',
    red: '#F04747',
    divider: '#313338',
    white: '#FFFFFF',
    nitroPink: '#F47FFF',
    inputBg: '#2B2D31',
};

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    avatarUrl?: string;
    onSaveSuccess?: () => void;
}

export const EditProfileModal = ({ visible, onClose, currentName, avatarUrl: initialAvatarUrl, onSaveSuccess }: EditProfileModalProps) => {
    const user = useSelector((state: any) => state.auth.user);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState<'main' | 'server'>('main');
    const [displayName, setDisplayName] = useState(currentName || user?.displayName || '');
    const [pronouns, setPronouns] = useState(user?.pronouns || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarSheet, setShowAvatarSheet] = useState(false);
    const displayNameRef = useRef<TextInput>(null);
    const pronounsRef = useRef<TextInput>(null);
    const bioRef = useRef<TextInput>(null);

    // Animations for Nitro promo
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Shimmer sweep
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Button pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.04,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Star spin
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Border glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePayload = {
                displayName: displayName.trim(),
                bio: bio.trim(),
                pronouns: pronouns.trim(),
                avatarUrl: avatarUrl,
            };
            const updatedProfile = await profileApi.updateProfile(updatePayload);

            // Use server response to update Redux — guaranteed accurate
            const updatedUser = {
                ...user,
                displayName: updatedProfile.displayName,
                bio: updatedProfile.bio,
                pronouns: updatedProfile.pronouns,
                avatarUrl: updatedProfile.avatarUrl,
            };
            dispatch(login(updatedUser));

            // Also update AsyncStorage so app restart preserves changes
            await storage.saveUserInfo(updatedUser);

            onClose();
            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={DISCORD.background} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Hồ sơ</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
                            <Text style={[styles.saveText, !displayName.trim() && { opacity: 0.5 }]}>
                                {isSaving ? 'Đang lưu...' : 'Lưu'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'main' && styles.activeTab]}
                            onPress={() => setActiveTab('main')}
                        >
                            <Text style={[styles.tabText, activeTab === 'main' && styles.activeTabText]}>Hồ Sơ Chính</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'server' && styles.activeTab]}
                            onPress={() => setActiveTab('server')}
                        >
                            <Text style={[styles.tabText, activeTab === 'server' && styles.activeTabText]}>Hồ Sơ Theo Máy Chủ</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Banner Area */}
                        <View style={styles.bannerContainer}>
                            <View style={styles.bannerDefault} />
                            <TouchableOpacity style={styles.editBannerBtn}>
                                <IconButton icon="pencil" size={16} iconColor={DISCORD.white} style={{ margin: 0 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar Area */}
                        <View style={styles.avatarSection}>
                            <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={() => setShowAvatarSheet(true)}>
                                {avatarUrl || user?.avatarUrl ? (
                                    <Image source={{ uri: avatarUrl || user?.avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <IconButton icon="discord" size={40} iconColor={DISCORD.white} />
                                    </View>
                                )}
                                {/* Online Status Indicator */}
                                <View style={styles.statusIndicatorWrapper}>
                                    <View style={styles.statusIndicatorPrimary} />
                                </View>
                                {/* Edit Avatar Overlay */}
                                <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setShowAvatarSheet(true)}>
                                    <IconButton icon="pencil" size={14} iconColor={DISCORD.white} style={{ margin: 0 }} />
                                </TouchableOpacity>
                            </TouchableOpacity>

                            <AvatarEditSheet
                                visible={showAvatarSheet}
                                onClose={() => setShowAvatarSheet(false)}
                                onSelectImage={(uri) => setAvatarUrl(uri)}
                            />

                            <TouchableOpacity style={styles.addStatusBtn}>
                                <IconButton icon="plus-circle" size={16} iconColor={DISCORD.textMuted} style={{ margin: 0, marginRight: 4 }} />
                                <Text style={styles.addStatusText}>Thêm trạng thái</Text>
                            </TouchableOpacity>
                        </View>

                        {/* User Info Header */}
                        <View style={styles.userInfoHeader}>
                            <Text style={styles.userNameText}>{displayName || currentName}</Text>
                            <View style={styles.userTagRow}>
                                <Text style={styles.userTagText}>{user?.username || 'user'}</Text>
                                <IconButton icon="decagram" size={16} iconColor="#5865F2" style={{ margin: 0, marginLeft: 4 }} />
                            </View>
                        </View>

                        {/* Input Forms Card */}
                        <View style={styles.card}>
                            {/* Display Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên hiển thị</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        ref={displayNameRef}
                                        style={styles.textInput}
                                        defaultValue={displayName}
                                        onChangeText={setDisplayName}
                                        placeholder="Tên hiển thị"
                                        placeholderTextColor={DISCORD.textDark}
                                    />
                                    {!!displayName && (
                                        <TouchableOpacity onPress={() => {
                                            setDisplayName('');
                                            displayNameRef.current?.clear();
                                        }}>
                                            <IconButton icon="close-circle" size={16} iconColor={DISCORD.textMuted} style={{ margin: 0 }} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Pronouns */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Đại từ nhân xưng</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        ref={pronounsRef}
                                        style={styles.textInput}
                                        defaultValue={pronouns}
                                        onChangeText={setPronouns}
                                        placeholder="Thêm đại từ"
                                        placeholderTextColor={DISCORD.textDark}
                                    />
                                </View>
                            </View>

                            {/* Bio */}
                            <View style={[styles.inputGroup, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                <Text style={styles.label}>Tiểu sử</Text>
                                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                    <TextInput
                                        ref={bioRef}
                                        style={styles.textArea}
                                        defaultValue={bio}
                                        onChangeText={setBio}
                                        multiline
                                        placeholder="Về bạn"
                                        placeholderTextColor={DISCORD.textDark}
                                        textAlignVertical="top"
                                    />
                                    <Text style={[styles.charCount, bio.length > 190 && { color: '#F04747' }]}>{190 - bio.length}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Customization Nav Links */}
                        <View style={styles.navLinksContainer}>
                            <TouchableOpacity style={styles.navLinkButton}>
                                <View>
                                    <Text style={styles.navLinkLabel}>Trang Trí Ảnh Đại Diện</Text>
                                    <View style={styles.navLinkPreviewRow}>
                                        <Image source={{ uri: 'https://cdn.discordapp.com/avatar-decoration-presets/a_b7a3cc80cb5ea09be5669ba4af2d1ab6.png' }} style={styles.previewIcon} />
                                        <Text style={styles.navLinkValue}>Song Tử</Text>
                                    </View>
                                </View>
                                <IconButton icon="chevron-right" size={24} iconColor={DISCORD.white} style={{ margin: 0 }} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.navLinkButton}>
                                <View>
                                    <Text style={styles.navLinkLabel}>Hiệu Ứng Hồ Sơ</Text>
                                    <View style={styles.navLinkPreviewRow}>
                                        <View style={[styles.previewIcon, { backgroundColor: '#1E1F22' }]} />
                                        <Text style={styles.navLinkValue}>Song Tử</Text>
                                    </View>
                                </View>
                                <IconButton icon="chevron-right" size={24} iconColor={DISCORD.white} style={{ margin: 0 }} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.navLinkButton, { borderBottomWidth: 0 }]}>
                                <View>
                                    <Text style={styles.navLinkLabel}>Bảng Tên</Text>
                                    <View style={styles.navLinkPreviewRow}>
                                        <View style={[styles.previewIcon, { backgroundColor: '#7E00FF', borderRadius: 6 }]} />
                                        <Text style={styles.navLinkValue}>Song Tử</Text>
                                    </View>
                                </View>
                                <IconButton icon="chevron-right" size={24} iconColor={DISCORD.white} style={{ margin: 0 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Spacing for bottom floating banner */}
                        <View style={{ height: 160 }} />
                    </ScrollView>

                    {/* Floating Nitro Promo Banner */}
                    <View style={styles.floatingPromoContainer}>
                        <Animated.View style={[
                            styles.promoCard,
                            {
                                borderColor: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['#9B59F0', '#FF6BF0'],
                                }),
                            }
                        ]}>
                            {/* Background gradient layers */}
                            <View style={styles.promoGradientLayer1} />
                            <View style={styles.promoGradientLayer2} />

                            {/* Shimmer sweep */}
                            <Animated.View
                                style={[
                                    styles.promoShimmer,
                                    {
                                        transform: [{
                                            translateX: shimmerAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-100, 400],
                                            }),
                                        }, { skewX: '-20deg' }],
                                    },
                                ]}
                            />

                            <View style={styles.promoContent}>
                                <Text style={styles.promoText}>
                                    Hãy xem hồ sơ của bạn sẽ trông thế nào với{' '}
                                    <Text style={styles.promoTextHighlight}>Nitro</Text>!
                                </Text>

                                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                    <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
                                        {/* Button shimmer */}
                                        <Animated.View
                                            style={[
                                                styles.promoButtonShimmer,
                                                {
                                                    transform: [{
                                                        translateX: shimmerAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [-60, 300],
                                                        }),
                                                    }, { skewX: '-20deg' }],
                                                },
                                            ]}
                                        />
                                        <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                                            <IconButton icon="asterisk" size={16} iconColor={DISCORD.white} style={{ margin: 0, marginRight: 2 }} />
                                        </Animated.View>
                                        <Text style={styles.promoButtonText}>Xem trước Nitro</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </Animated.View>
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DISCORD.background,
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: DISCORD.background,
    },
    headerTitle: {
        color: DISCORD.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        minWidth: 50,
        justifyContent: 'center',
    },
    cancelText: {
        color: DISCORD.text,
        fontSize: 16,
    },
    saveText: {
        color: DISCORD.blurple, // Distinct color for save, typical Discord
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: DISCORD.divider,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: DISCORD.blurple,
    },
    tabText: {
        color: DISCORD.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
    activeTabText: {
        color: DISCORD.text,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    bannerContainer: {
        height: 120,
        backgroundColor: DISCORD.secondaryBg,
        position: 'relative',
    },
    bannerDefault: {
        flex: 1,
        backgroundColor: '#3BA55D', // Default banner color
    },
    editBannerBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: -40, // Overlap banner
        marginBottom: 16,
        position: 'relative',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 12,
        borderRadius: 50, // More rounded, Discord standard is slightly rounded or circle
        borderWidth: 6,
        borderColor: DISCORD.background,
        backgroundColor: DISCORD.background,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: DISCORD.blurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIndicatorWrapper: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: DISCORD.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIndicatorPrimary: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: DISCORD.green, // Online Indicator
    },
    editAvatarBtn: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addStatusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DISCORD.cardBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 40, // push down alongside avatar
    },
    addStatusText: {
        color: DISCORD.textMuted,
        fontSize: 14,
        fontWeight: '500',
    },
    userInfoHeader: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    userNameText: {
        color: DISCORD.text,
        fontSize: 28,
        fontWeight: 'bold',
    },
    userTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    userTagText: {
        color: DISCORD.textMuted,
        fontSize: 16,
    },
    card: {
        backgroundColor: DISCORD.cardBg,
        marginHorizontal: 16,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: DISCORD.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DISCORD.inputBg,
        borderRadius: 8,
        minHeight: 48,
        paddingRight: 8,
    },
    textInput: {
        flex: 1,
        color: DISCORD.text,
        fontSize: 16,
        paddingHorizontal: 12,
    },
    textAreaWrapper: {
        position: 'relative',
        height: 120,
        alignItems: 'flex-start',
        paddingRight: 0,
    },
    textArea: {
        flex: 1,
        width: '100%',
        color: DISCORD.text,
        fontSize: 16,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    charCount: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        color: DISCORD.textDark,
        fontSize: 12,
    },
    navLinksContainer: {
        marginHorizontal: 16,
        backgroundColor: DISCORD.cardBg,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    navLinkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: DISCORD.divider,
    },
    navLinkLabel: {
        color: DISCORD.textMuted,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    navLinkPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        backgroundColor: '#313338'
    },
    navLinkValue: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: '500',
    },
    floatingPromoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        backgroundColor: DISCORD.background,
        borderTopWidth: 1,
        borderTopColor: '#1E1F22',
        paddingTop: 16,
    },
    promoCard: {
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#B06BF5',
        padding: 18,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0D0D12',
    },
    promoGradientLayer1: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1A0A2E',
        opacity: 0.9,
    },
    promoGradientLayer2: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#7B2FBF',
        opacity: 0.15,
    },
    promoShimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    promoContent: {
        position: 'relative',
        zIndex: 2,
    },
    promoText: {
        color: '#D4D4E8',
        fontSize: 14.5,
        marginBottom: 14,
        lineHeight: 20,
    },
    promoTextHighlight: {
        color: '#E580FF',
        fontWeight: 'bold',
    },
    promoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7B2FBF',
        borderRadius: 24,
        paddingVertical: 11,
        overflow: 'hidden',
        position: 'relative',
    },
    promoButtonShimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    promoButtonText: {
        color: DISCORD.white,
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
});
