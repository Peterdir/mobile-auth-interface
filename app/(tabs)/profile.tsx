import { profileApi, UserProfile } from '@/src/api/profileApi';
import { storage } from '@/src/utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Modal, Provider as PaperProvider, Portal } from 'react-native-paper';

// Discord Colors
const DISCORD = {
    blurple: '#5865F2',
    green: '#57F287',
    yellow: '#FEE75C',
    red: '#ED4245',
    white: '#FFFFFF',
    black: '#23272A',
    darkBg: '#313338',
    darkerBg: '#1E1F22',
    cardBg: '#2B2D31',
    inputBg: '#1E1F22',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
    divider: '#3F4147',
    banner: '#5865F2',
};

export default function ProfileScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [visibleNameModal, setVisibleNameModal] = useState(false);
    const [visibleBioModal, setVisibleBioModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileApi.getProfile();
            setProfile(data);
            setNewName(data.displayName || '');
            setNewBio(data.bio || '');
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không tải được thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    await storage.removeToken();
                    router.replace('/(auth)/login');
                }
            }
        ]);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setUploading(true);
            await profileApi.uploadAvatar(uri);
            Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const updateName = async () => {
        if (!newName.trim()) {
            Alert.alert('Lỗi', 'Tên không được để trống');
            return;
        }
        try {
            await profileApi.updateProfile({ displayName: newName });
            Alert.alert('Thành công', 'Đã cập nhật tên');
            setVisibleNameModal(false);
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Cập nhật thất bại');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkerBg} />
                <ActivityIndicator size="large" color={DISCORD.blurple} />
            </View>
        );
    }

    return (
        <PaperProvider>
            <StatusBar barStyle="light-content" backgroundColor={DISCORD.banner} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Banner Header */}
                <View style={styles.bannerContainer}>
                    <View style={styles.banner} />

                    {/* Avatar */}
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={pickImage}
                        disabled={uploading}
                        activeOpacity={0.8}
                    >
                        <View style={styles.avatarBorder}>
                            {profile?.avatarUrl ? (
                                <Image
                                    source={{ uri: profile.avatarUrl }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {profile?.displayName?.substring(0, 2).toUpperCase() || '??'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <IconButton
                                icon="pencil"
                                size={14}
                                iconColor={DISCORD.white}
                                style={{ margin: 0 }}
                            />
                        </View>
                        {/* Online Status */}
                        <View style={styles.statusBadge} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Name & Username */}
                    <View style={styles.nameSection}>
                        <Text style={styles.displayName}>{profile?.displayName || 'Người dùng'}</Text>
                        <Text style={styles.username}>@{profile?.username}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* About Me */}
                    <View style={styles.aboutSection}>
                        <Text style={styles.sectionLabel}>GIỚI THIỆU</Text>
                        <Text style={styles.aboutText}>
                            {profile?.bio || 'Chưa có giới thiệu'}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Member Since */}
                    <View style={styles.aboutSection}>
                        <Text style={styles.sectionLabel}>THÀNH VIÊN TỪ</Text>
                        <Text style={styles.aboutText}>
                            {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>CÀI ĐẶT TÀI KHOẢN</Text>

                    <SettingsItem
                        icon="account-edit"
                        label="Tên hiển thị"
                        value={profile?.displayName || 'Chưa đặt'}
                        onPress={() => setVisibleNameModal(true)}
                    />
                    <SettingsItem
                        icon="email"
                        label="Email"
                        value={profile?.email || 'Chưa liên kết'}
                        onPress={() => Alert.alert('Thông báo', 'Tính năng chưa được hỗ trợ')}
                    />
                    <SettingsItem
                        icon="phone"
                        label="Số điện thoại"
                        value={profile?.phoneNumber || 'Chưa liên kết'}
                        onPress={() => Alert.alert('Thông báo', 'Tính năng chưa được hỗ trợ')}
                    />
                </View>

                <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>BẢO MẬT</Text>

                    <SettingsItem
                        icon="lock"
                        label="Mật khẩu"
                        value="••••••••"
                        onPress={() => Alert.alert('Thông báo', 'Tính năng chưa được hỗ trợ')}
                    />
                    <SettingsItem
                        icon="shield-check"
                        label="Xác thực hai yếu tố"
                        value="Chưa bật"
                        onPress={() => Alert.alert('Thông báo', 'Tính năng chưa được hỗ trợ')}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <IconButton icon="logout" size={20} iconColor={DISCORD.red} style={{ margin: 0 }} />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />

                {/* Modals */}
                <Portal>
                    <Modal
                        visible={visibleNameModal}
                        onDismiss={() => setVisibleNameModal(false)}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <Text style={styles.modalTitle}>Đổi tên hiển thị</Text>
                        <Text style={styles.modalLabel}>TÊN HIỂN THỊ</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Nhập tên của bạn"
                            placeholderTextColor={DISCORD.textDark}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setVisibleNameModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={updateName}
                            >
                                <Text style={styles.modalSaveText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>
            </ScrollView>
        </PaperProvider>
    );
}

// Settings Item Component
const SettingsItem = ({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.settingsItemLeft}>
            <IconButton icon={icon} size={22} iconColor={DISCORD.textMuted} style={{ margin: 0, marginRight: 12 }} />
            <View>
                <Text style={styles.settingsItemLabel}>{label}</Text>
                <Text style={styles.settingsItemValue}>{value}</Text>
            </View>
        </View>
        <IconButton icon="chevron-right" size={20} iconColor={DISCORD.textDark} style={{ margin: 0 }} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DISCORD.darkerBg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: DISCORD.darkBg,
    },
    // Banner
    bannerContainer: {
        height: 160,
        position: 'relative',
    },
    banner: {
        height: 120,
        backgroundColor: DISCORD.banner,
    },
    avatarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 20,
    },
    avatarBorder: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: DISCORD.darkerBg,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
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
    avatarText: {
        color: DISCORD.white,
        fontSize: 28,
        fontWeight: '700',
    },
    editBadge: {
        position: 'absolute',
        right: 0,
        bottom: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: DISCORD.blurple,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: DISCORD.darkerBg,
    },
    statusBadge: {
        position: 'absolute',
        right: 6,
        bottom: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: DISCORD.green,
        borderWidth: 4,
        borderColor: DISCORD.darkerBg,
    },
    // Profile Card
    profileCard: {
        backgroundColor: DISCORD.cardBg,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        padding: 16,
    },
    nameSection: {
        marginBottom: 12,
    },
    displayName: {
        fontSize: 22,
        fontWeight: '700',
        color: DISCORD.text,
    },
    username: {
        fontSize: 14,
        color: DISCORD.textMuted,
        marginTop: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: DISCORD.divider,
        marginVertical: 12,
    },
    aboutSection: {
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: DISCORD.textMuted,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    aboutText: {
        fontSize: 14,
        color: DISCORD.text,
        lineHeight: 20,
    },
    // Settings
    settingsSection: {
        marginHorizontal: 16,
        marginTop: 24,
    },
    settingsSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: DISCORD.textMuted,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: DISCORD.cardBg,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginBottom: 2,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsItemLabel: {
        fontSize: 16,
        color: DISCORD.text,
        fontWeight: '500',
    },
    settingsItemValue: {
        fontSize: 13,
        color: DISCORD.textMuted,
        marginTop: 2,
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 12,
        backgroundColor: DISCORD.cardBg,
        borderRadius: 4,
    },
    logoutText: {
        fontSize: 16,
        color: DISCORD.red,
        fontWeight: '600',
    },
    // Modal
    modalContainer: {
        backgroundColor: DISCORD.cardBg,
        marginHorizontal: 20,
        borderRadius: 8,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: DISCORD.text,
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: DISCORD.textMuted,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    modalInput: {
        backgroundColor: DISCORD.inputBg,
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: DISCORD.text,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalCancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
    },
    modalCancelText: {
        fontSize: 14,
        color: DISCORD.textMuted,
        fontWeight: '500',
    },
    modalSaveButton: {
        backgroundColor: DISCORD.blurple,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
    },
    modalSaveText: {
        fontSize: 14,
        color: DISCORD.white,
        fontWeight: '600',
    },
});
