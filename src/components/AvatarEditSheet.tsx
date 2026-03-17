import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const DISCORD = {
    darkerBg: "#111214",
    darkBg: "#1E1F22",
    profileCard: "#2B2D31",
    blurple: "#5865F2",
    green: "#23A559",
    white: "#FFFFFF",
    text: "#F2F3F5",
    textMuted: "#B5BAC1",
    divider: "#3F4147",
    nitroGreen: "#23A559",
};

interface AvatarEditSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelectImage: (uri: string) => void;
}

export default function AvatarEditSheet({ visible, onClose, onSelectImage }: AvatarEditSheetProps) {

    const handlePickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Cần có quyền truy cập thư viện ảnh để thêm ảnh đại diện!');
            return;
        }

        // Launch picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            onSelectImage(result.assets[0].uri);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Touchable to close when tapping outside */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                {/* Bottom Sheet Content */}
                <View style={styles.sheetContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.handleBar} />
                        <Text style={styles.headerTitle}>Ảnh Đại Diện</Text>
                    </View>

                    {/* Options List */}
                    <View style={styles.optionsList}>

                        {/* Upload Option */}
                        <TouchableOpacity style={styles.optionItem} activeOpacity={0.7} onPress={handlePickImage}>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Tải Lên Hình Ảnh</Text>
                                <Text style={styles.optionSubtitle}>
                                    Tải lên một hình ảnh PNG hoặc JPG dưới 8MB. Hình ảnh nên có độ phân giải tối thiểu 128x128.
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Animated Avatar Option (Nitro) */}
                        <View style={styles.nitroOptionItem}>
                            <View style={styles.nitroOptionHeaderRow}>
                                <Text style={styles.optionTitle}>Nhận hình đại diện hoạt hình</Text>
                                <IconButton icon="asterisk" size={16} iconColor={DISCORD.text} style={{ margin: 0, marginLeft: 4 }} />
                            </View>
                            <Text style={styles.optionSubtitle}>
                                Tải lên ảnh GIF để tạo ảnh động cho ảnh đại diện của bạn! Chỉ với Nitro.
                            </Text>

                            <TouchableOpacity style={styles.nitroButton} activeOpacity={0.8} onPress={() => { /* Navigate to Nitro Store */ }}>
                                <IconButton icon="asterisk" size={18} iconColor={DISCORD.white} style={{ margin: 0, marginRight: 8 }} />
                                <Text style={styles.nitroButtonText}>Mở khóa với Nitro</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Change Decoration Option */}
                        <TouchableOpacity style={styles.optionItem} activeOpacity={0.7} onPress={() => { /* Navigate to Shop */ }}>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Thay Đổi Trang Trí</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheetContainer: {
        backgroundColor: '#000000', // Pitch black as per screenshot
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 24, // SafeArea equivalent padding
        minHeight: 300,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    handleBar: {
        width: 32,
        height: 4,
        backgroundColor: DISCORD.divider,
        borderRadius: 2,
        marginBottom: 16,
        marginTop: 4,
    },
    headerTitle: {
        color: DISCORD.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    optionsList: {
        paddingHorizontal: 16,
    },
    optionItem: {
        paddingVertical: 16,
    },
    optionContent: {
        flexDirection: 'column',
    },
    optionTitle: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionSubtitle: {
        color: DISCORD.textMuted,
        fontSize: 13,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#26272A', // Very faint dark divider
    },
    nitroOptionItem: {
        paddingVertical: 16,
    },
    nitroOptionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nitroButton: {
        flexDirection: 'row',
        backgroundColor: DISCORD.nitroGreen,
        borderRadius: 24,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    nitroButtonText: {
        color: DISCORD.white,
        fontSize: 15,
        fontWeight: 'bold',
    }
});
