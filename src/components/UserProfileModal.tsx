import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { friendApi } from '../api/friendApi';
import { UserProfile } from '../api/profileApi';

const DISCORD = {
    blurple: '#5865F2',
    green: '#23A559',
    white: '#FFFFFF',
    black: '#000000',
    darkBg: '#111214',
    cardBg: '#1E1F22',
    cardBgSecondary: '#2B2D31',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
    divider: '#3F4147',
    offline: '#80848E',
    danger: '#DA373C',
};

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: UserProfile | null;
    friendshipId?: number | null;
    onUnfriendSuccess?: () => void;
}

export const UserProfileModal = ({ visible, onClose, user, friendshipId, onUnfriendSuccess }: UserProfileModalProps) => {
    const panY = useRef(new Animated.Value(0)).current;
    const [unfriendConfirmVisible, setUnfriendConfirmVisible] = useState(false);
    const [isUnfriending, setIsUnfriending] = useState(false);

    useEffect(() => {
        if (visible) {
            panY.setValue(0);
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5; // Only capture swipe down
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 150 || gestureState.vy > 0.8) {
                    Animated.timing(panY, {
                        toValue: 1000,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(onClose);
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 40,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    const handleUnfriend = async () => {
        if (!friendshipId) return;
        try {
            setIsUnfriending(true);
            await friendApi.unfriend(friendshipId);
            setUnfriendConfirmVisible(false);
            onClose();
            if (onUnfriendSuccess) onUnfriendSuccess();
        } catch (error) {
            console.error("Error unfriending:", error);
        } finally {
            setIsUnfriending(false);
        }
    };

    if (!user) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa xác định';
        const date = new Date(dateString);
        return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
    };

    return (
        <View>
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={onClose}
            >
                <Pressable style={styles.modalOverlay} onPress={onClose}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: panY }] }
                        ]}
                    >
                        {/* Gesture Header Area - Now absolute to allow overlapping and drag anywhere at the top */}
                        <View {...panResponder.panHandlers} style={styles.gestureHeader}>
                            <View style={styles.sheetHandle} />
                        </View>

                        <ScrollView bounces={false}>
                            {/* Banner Area - Back in ScrollView for proper layout relation */}
                            <View style={styles.banner} />

                            {/* Avatar Header */}
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarBorder}>
                                    {user.avatarUrl ? (
                                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                            <Text style={styles.avatarPlaceholderText}>
                                                {user.displayName?.charAt(0) || user.username?.charAt(0)}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.statusBadge} />
                                </View>

                                <View style={styles.headerActions}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => friendshipId && setUnfriendConfirmVisible(true)}
                                    >
                                        <Ionicons
                                            name={friendshipId ? "person-remove" : "person-add"}
                                            size={20}
                                            color={DISCORD.text}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton}>
                                        <Ionicons name="ellipsis-horizontal" size={20} color={DISCORD.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* User Info */}
                            <View style={styles.mainInfo}>
                                <Text style={styles.displayName}>{user.displayName || user.username}</Text>
                                <Text style={styles.username}>{user.username}</Text>

                                <View style={styles.mutualServers}>
                                    <View style={styles.serverBadge}>
                                        <Ionicons name="people" size={14} color={DISCORD.blurple} />
                                        <Text style={styles.mutualText}>1 Máy Chủ Chung</Text>
                                    </View>
                                </View>

                                {/* Quick Actions */}
                                <View style={styles.quickActions}>
                                    <TouchableOpacity style={styles.actionColumn}>
                                        <View style={styles.actionIconCircle}>
                                            <Ionicons name="chatbubble" size={24} color={DISCORD.text} />
                                        </View>
                                        <Text style={styles.actionLabel}>Tin nhắn</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.actionColumn}>
                                        <View style={styles.actionIconCircle}>
                                            <Ionicons name="call" size={24} color={DISCORD.text} />
                                        </View>
                                        <Text style={styles.actionLabel}>Cuộc gọi thoại</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.actionColumn}>
                                        <View style={styles.actionIconCircle}>
                                            <Ionicons name="videocam" size={24} color={DISCORD.text} />
                                        </View>
                                        <Text style={styles.actionLabel}>Cuộc gọi video</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Info Sections */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Gia Nhập Từ</Text>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="logo-discord" size={20} color={DISCORD.textMuted} />
                                        <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Ghi chú (chỉ hiển thị cho bạn)</Text>
                                    <View style={styles.noteBox}>
                                        <Ionicons name="journal-outline" size={20} color={DISCORD.textMuted} />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </Pressable>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                visible={unfriendConfirmVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setUnfriendConfirmVisible(false)}
            >
                <Pressable
                    style={styles.confirmOverlay}
                    onPress={() => setUnfriendConfirmVisible(false)}
                >
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmTitle}>Xóa '{user.displayName || user.username}'</Text>
                        <Text style={styles.confirmMessage}>
                            Bạn có chắc chắn muốn xóa {user.displayName || user.username} khỏi nhóm bạn bè không?
                        </Text>

                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleUnfriend}
                            disabled={isUnfriending}
                        >
                            {isUnfriending ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Xóa Bạn</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setUnfriendConfirmVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#000000',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 40,
        overflow: 'hidden',
    },
    gestureHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80, // Covers handle and top part of banner
        zIndex: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#2B2D31',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
        position: 'absolute',
        top: 0,
        zIndex: 10,
    },
    banner: {
        height: 120,
        backgroundColor: '#1E42C1', // Blue banner color from image
    },
    avatarContainer: {
        paddingHorizontal: 16,
        marginTop: -40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    avatarBorder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#000000',
        padding: 6,
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    avatarPlaceholder: {
        backgroundColor: DISCORD.blurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#000000',
        borderWidth: 4,
        borderColor: '#000000',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainInfo: {
        padding: 16,
    },
    displayName: {
        color: DISCORD.text,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    username: {
        color: DISCORD.textMuted,
        fontSize: 16,
        marginBottom: 16,
    },
    mutualServers: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    serverBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(88, 101, 242, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    mutualText: {
        color: DISCORD.text,
        fontSize: 13,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    actionColumn: {
        alignItems: 'center',
        gap: 8,
    },
    actionIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2B2D31',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        color: DISCORD.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#111214',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: DISCORD.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoValue: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: '500',
    },
    noteBox: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 4,
    },
    // Confirmation Dialog Styles
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    confirmBox: {
        width: '100%',
        backgroundColor: '#1E1F22',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    confirmTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmMessage: {
        color: DISCORD.textMuted,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    confirmButton: {
        width: '100%',
        height: 48,
        backgroundColor: DISCORD.danger,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#4E5058',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
