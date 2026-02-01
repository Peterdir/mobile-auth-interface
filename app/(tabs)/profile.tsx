import { profileApi, UserProfile } from '@/src/api/profileApi';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { storage } from '@/src/utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Divider, Modal, Provider as PaperProvider, Portal, TextInput } from 'react-native-paper';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // --- State cho các Modal ---
    const [visibleNameModal, setVisibleNameModal] = useState(false);
    const [visiblePassModal, setVisiblePassModal] = useState(false);
    const [visiblePhoneModal, setVisiblePhoneModal] = useState(false);
    const [visibleEmailModal, setVisibleEmailModal] = useState(false);
    const [visibleOtpModal, setVisibleOtpModal] = useState(false);

    // --- State dữ liệu form ---
    const [newName, setNewName] = useState('');

    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpContext, setOtpContext] = useState<'PHONE' | 'EMAIL' | null>(null);

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileApi.getProfile();
            setProfile(data);
            // Pre-fill
            setNewName(data.displayName || '');
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

    // --- Xử lý Avatar ---
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

    // --- Xử lý Đổi tên ---
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

    // --- Xử lý Đổi mật khẩu ---
    const updatePassword = async () => {
        if (newPass !== confirmPass) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }
        if (newPass.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới quá ngắn');
            return;
        }
        try {
            await profileApi.changePassword({ oldPassword: oldPass, newPassword: newPass });
            Alert.alert('Thành công', 'Đã thay đổi mật khẩu');
            setVisiblePassModal(false);
            setOldPass(''); setNewPass(''); setConfirmPass('');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại');
        }
    };

    // --- Xử lý OTP ---
    const initiateChangePhone = async () => {
        try {
            await profileApi.initChangePhone(newPhone);
            setVisiblePhoneModal(false);
            setOtpContext('PHONE');
            setOtp('');
            setVisibleOtpModal(true);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi OTP');
        }
    };

    const initiateChangeEmail = async () => {
        try {
            await profileApi.initChangeEmail(newEmail);
            setVisibleEmailModal(false);
            setOtpContext('EMAIL');
            setOtp('');
            setVisibleOtpModal(true);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi OTP');
        }
    };

    const verifyOtp = async () => {
        try {
            if (otpContext === 'PHONE') {
                await profileApi.verifyChangePhone(otp);
                Alert.alert('Thành công', 'Số điện thoại đã được cập nhật');
            } else {
                await profileApi.verifyChangeEmail(otp);
                Alert.alert('Thành công', 'Email đã được cập nhật');
            }
            setVisibleOtpModal(false);
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Xác thực OTP thất bại');
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#5865F2" /></View>;
    }

    return (
        <PaperProvider>
            <ScrollView style={styles.container}>
                {/* Header Profile */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={uploading}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatarUrl ? (
                                <Avatar.Image size={100} source={{ uri: profile.avatarUrl }} />
                            ) : (
                                <Avatar.Text size={100} label={profile?.displayName?.substring(0, 2).toUpperCase() || '??'} style={{ backgroundColor: '#5865F2' }} />
                            )}
                            <View style={styles.editIcon}>
                                <IconSymbol name="pencil" size={16} color="white" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.displayName}>{profile?.displayName || 'Người dùng'}</Text>
                    <Text style={styles.username}>@{profile?.username}</Text>
                </View>

                <Divider style={styles.divider} />

                {/* Thông tin cá nhân */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

                    <ProfileItem
                        label="Tên hiển thị"
                        value={profile?.displayName || 'Chưa đặt'}
                        onPress={() => { setNewName(profile?.displayName || ''); setVisibleNameModal(true); }}
                    />

                    <ProfileItem
                        label="Email"
                        value={profile?.email || 'Chưa liên kết'}
                        onPress={() => { setNewEmail(''); setVisibleEmailModal(true); }}
                        secure={false}
                    />
                    <ProfileItem
                        label="Số điện thoại"
                        value={profile?.phoneNumber || 'Chưa liên kết'}
                        onPress={() => { setNewPhone(''); setVisiblePhoneModal(true); }}
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Bảo mật */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bảo mật</Text>
                    <ProfileItem
                        label="Mật khẩu"
                        value="********"
                        onPress={() => { setOldPass(''); setNewPass(''); setConfirmPass(''); setVisiblePassModal(true); }}
                    />
                </View>

                <View style={styles.section}>
                    <Button mode="contained" onPress={handleLogout} buttonColor="#DA373C" style={{ marginTop: 20 }}>
                        Đăng xuất
                    </Button>
                </View>

                {/* Modals */}
                <Portal>
                    {/* Modal Đổi Tên */}
                    <Modal visible={visibleNameModal} onDismiss={() => setVisibleNameModal(false)} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đổi tên hiển thị</Text>
                        <TextInput mode="outlined" value={newName} onChangeText={setNewName} label="Tên mới" style={styles.input} />
                        <Button mode="contained" onPress={updateName}>Lưu</Button>
                    </Modal>

                    {/* Modal Đổi Pass */}
                    <Modal visible={visiblePassModal} onDismiss={() => setVisiblePassModal(false)} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                        <TextInput mode="outlined" value={oldPass} onChangeText={setOldPass} label="Mật khẩu cũ" secureTextEntry style={styles.input} />
                        <TextInput mode="outlined" value={newPass} onChangeText={setNewPass} label="Mật khẩu mới" secureTextEntry style={styles.input} />
                        <TextInput mode="outlined" value={confirmPass} onChangeText={setConfirmPass} label="Xác nhận mật khẩu mới" secureTextEntry style={styles.input} />
                        <Button mode="contained" onPress={updatePassword}>Đổi mật khẩu</Button>
                    </Modal>

                    {/* Modal SĐT */}
                    <Modal visible={visiblePhoneModal} onDismiss={() => setVisiblePhoneModal(false)} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đổi số điện thoại</Text>
                        <TextInput mode="outlined" value={newPhone} onChangeText={setNewPhone} label="Số điện thoại mới" keyboardType="phone-pad" style={styles.input} />
                        <Button mode="contained" onPress={initiateChangePhone}>Gửi mã xác thực</Button>
                    </Modal>

                    {/* Modal Email */}
                    <Modal visible={visibleEmailModal} onDismiss={() => setVisibleEmailModal(false)} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đổi Email</Text>
                        <TextInput mode="outlined" value={newEmail} onChangeText={setNewEmail} label="Email mới" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                        <Button mode="contained" onPress={initiateChangeEmail}>Gửi mã xác thực</Button>
                    </Modal>

                    {/* Modal OTP */}
                    <Modal visible={visibleOtpModal} onDismiss={() => setVisibleOtpModal(false)} contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nhập mã xác thực</Text>
                        <Text style={{ marginBottom: 10, textAlign: 'center' }}>Đã gửi mã đến {otpContext === 'PHONE' ? newPhone : newEmail}</Text>
                        <TextInput mode="outlined" value={otp} onChangeText={setOtp} label="OTP" keyboardType="number-pad" style={styles.input} />
                        <Button mode="contained" onPress={verifyOtp}>Xác nhận</Button>
                    </Modal>
                </Portal>

            </ScrollView>
        </PaperProvider>
    );
}

const ProfileItem = ({ label, value, onPress, secure }: any) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemValue}>{value}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#B5BAC1" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#313338',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#313338',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1E1F22',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    editIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#5865F2',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#1E1F22',
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F2F3F5',
    },
    username: {
        fontSize: 16,
        color: '#B5BAC1',
    },
    divider: {
        height: 1,
        backgroundColor: '#26272D',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B5BAC1',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemLabel: {
        color: '#F2F3F5',
        fontSize: 16,
        fontWeight: '500',
    },
    itemValue: {
        color: '#B5BAC1',
        fontSize: 14,
        marginTop: 4,
    },
    // Modal styles
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333'
    },
    input: {
        marginBottom: 15,
    }
});
