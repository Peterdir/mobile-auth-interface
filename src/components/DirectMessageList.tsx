import { directMessageApi } from '@/src/api/directMessageApi';
import { friendApi, FriendshipResponse } from '@/src/api/friendApi';
import { profileApi, UserProfile } from '@/src/api/profileApi';
import { AddFriendModal } from '@/src/components/AddFriendModal';
import { UserProfileModal } from '@/src/components/UserProfileModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

const DISCORD = {
    blurple: '#5865F2',
    green: '#23A559',
    white: '#FFFFFF',
    darkBg: '#111214',
    cardBg: '#1E1F22',
    cardBgSecondary: '#2B2D31',
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
    divider: '#3F4147',
    offline: '#80848E',
};

interface DirectMessageListProps {
    onSelectConversation: (conversationId: string, friendId: number, friendName: string) => void;
}

export const DirectMessageList = ({ onSelectConversation }: DirectMessageListProps) => {
    const currentUser = useSelector((state: any) => state.auth.user);
    const presenceMap = useSelector((state: any) => state.presence?.statusMap || {});

    const [friends, setFriends] = useState<FriendshipResponse[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [hiddenConversations, setHiddenConversations] = useState<string[]>([]);
    const [favoriteConversations, setFavoriteConversations] = useState<string[]>([]);
    const [mutedConversations, setMutedConversations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [detailedProfile, setDetailedProfile] = useState<UserProfile | null>(null);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [selectedFriendshipId, setSelectedFriendshipId] = useState<number | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return DISCORD.green;
            case 'IDLE': return '#FAA61A';
            case 'DND': return '#F04747';
            default: return DISCORD.offline;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [friendsData, convData, hiddenStr, favoriteStr, mutedStr] = await Promise.all([
                friendApi.getFriends().catch(() => []),
                directMessageApi.getConversations().catch(() => []),
                AsyncStorage.getItem(`hidden_dms_${currentUser?.id}`).catch(() => null),
                AsyncStorage.getItem(`favorite_dms_${currentUser?.id}`).catch(() => null),
                AsyncStorage.getItem(`muted_dms_${currentUser?.id}`).catch(() => null)
            ]);
            setFriends(friendsData);
            setConversations(convData);

            if (hiddenStr) {
                try {
                    setHiddenConversations(JSON.parse(hiddenStr));
                } catch (e) { /* ignore */ }
            }
            if (favoriteStr) {
                try {
                    setFavoriteConversations(JSON.parse(favoriteStr));
                } catch (e) { /* ignore */ }
            }
            if (mutedStr) {
                try {
                    setMutedConversations(JSON.parse(mutedStr));
                } catch (e) { /* ignore */ }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleOpenProfile = async () => {
        if (!selectedUser?.id) return;

        console.log("Fetching profile for user ID:", selectedUser.id);

        try {
            setUserInfoModalVisible(false);
            setFetchingProfile(true);
            const data = await profileApi.getUserById(selectedUser.id);
            console.log("Profile data received:", data);
            setDetailedProfile(data);
            setProfileModalVisible(true);
        } catch (error) {
            console.error("Error fetching detailed profile:", error);
            // Alert user?
        } finally {
            setFetchingProfile(false);
        }
    };

    const renderActiveFriend = (friend: any) => {
        const friendStatus = presenceMap[friend.id] || (friend.senderId === currentUser?.id ? friend.receiverStatus : friend.senderStatus);
        const isOnline = friendStatus === 'ONLINE';

        return (
            <TouchableOpacity
                key={friend.id}
                style={styles.activeFriendItem}
                onPress={() => {
                    // To open a conversation, we might need to getOrCreateConversation first if it's not in the list.
                    // For now, if we don't have connection directly from friend bubble to conversation, we do this:
                    directMessageApi.getOrCreateConversation(friend.id).then(res => {
                        if (res && res.id) {
                            onSelectConversation(res.id, friend.id, friend.displayName || friend.username);
                        }
                    }).catch(err => console.error("Error starting chat from active friend", err));
                }}
            >
                <View style={styles.activeAvatarContainer}>
                    {friend.avatarUrl ? (
                        <Image source={{ uri: friend.avatarUrl }} style={styles.activeAvatar} />
                    ) : (
                        <View style={styles.activeAvatarPlaceholder}>
                            <Text style={styles.activeAvatarText}>
                                {friend.displayName?.charAt(0) || friend.username.charAt(0)}
                            </Text>
                        </View>
                    )}
                    <View style={[
                        styles.activeStatusIndicator,
                        {
                            backgroundColor: isOnline ? DISCORD.green : DISCORD.darkBg,
                            borderColor: isOnline ? DISCORD.darkBg : DISCORD.offline,
                            borderWidth: isOnline ? 3 : 3.5,
                        }
                    ]} />
                </View>
            </TouchableOpacity>
        );
    };

    const findFriendshipId = (friendId: number) => {
        const friendship = friends.find(f => f.senderId === friendId || f.receiverId === friendId);
        return friendship?.id || null;
    };

    const renderMessageItem = ({ item }: { item: any }) => {
        const friendName = item.otherUserName || 'Một người bạn';
        const lastMessage = item.lastMessage || 'Bắt đầu trò chuyện';

        let timeDisplay = '';
        if (item.lastMessageAt) {
            const date = new Date(item.lastMessageAt);
            timeDisplay = `${date.getDate()}/${date.getMonth() + 1}`;
        }

        const isRead = true; // Assume true unless we track unread
        const friendId = item.otherUserId;
        const conversationId = item.conversationId;

        const avatarUrl = item.otherUserAvatar || null;

        return (
            <TouchableOpacity
                style={styles.messageItem}
                onPress={() => onSelectConversation(conversationId, friendId, friendName)}
                onLongPress={() => {
                    setSelectedUser({
                        id: friendId,
                        username: friendName,
                        avatarUrl: avatarUrl,
                        conversationId: conversationId
                    });
                    setSelectedFriendshipId(findFriendshipId(friendId));
                    setUserInfoModalVisible(true);
                }}
            >
                <View style={styles.avatarContainer}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {friendName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: getStatusColor(presenceMap[friendId] || item.otherUserStatus) }
                    ]} />
                </View>

                <View style={[styles.messageInfo, { marginRight: 8 }]}>
                    <View style={styles.messageHeaderRow}>
                        <Text style={[styles.displayName, !isRead && styles.displayNameUnread]} numberOfLines={1}>
                            {friendName}
                        </Text>
                        {timeDisplay ? (
                            <Text style={styles.timestamp}>{timeDisplay}</Text>
                        ) : null}
                    </View>
                    <Text style={[styles.messagePreview, !isRead && styles.messagePreviewUnread]} numberOfLines={1}>
                        Bạn: {lastMessage}
                    </Text>
                </View>

                {mutedConversations.includes(conversationId) && (
                    <Ionicons name="notifications-off" size={16} color={DISCORD.textMuted} style={{ marginLeft: 4 }} />
                )}
                {favoriteConversations.includes(conversationId) && (
                    <Ionicons name="star" size={16} color="#FAA61A" style={{ marginLeft: 4 }} />
                )}
            </TouchableOpacity>
        );
    };

    const activeFriends = friends.reduce((acc, item) => {
        const isMeSender = item.senderId === currentUser?.id;
        const friendId = isMeSender ? item.receiverId : item.senderId;

        // Tránh trùng lặp ID trong danh sách ngang
        if (acc.find((f: any) => f.id === friendId)) return acc;

        acc.push({
            id: friendId,
            username: isMeSender ? item.receiverUsername : item.senderUsername,
            displayName: isMeSender ? item.receiverDisplayName : item.senderDisplayName,
            avatarUrl: isMeSender ? item.receiverAvatarUrl : item.senderAvatarUrl,
            senderId: item.senderId,
            receiverStatus: item.receiverStatus,
            senderStatus: item.senderStatus
        });
        return acc;
    }, [] as any[]);

    const ListHeaderComponent = () => (
        <View style={styles.listHeader}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFriendsList}>
                {activeFriends.map(renderActiveFriend)}
            </ScrollView>
        </View>
    );

    // Filter hidden conversations
    let visibleConversations = conversations.filter(c => !hiddenConversations.includes(c.conversationId));

    // Sort favorites to the top
    visibleConversations = [...visibleConversations].sort((a, b) => {
        const isAFav = favoriteConversations.includes(a.conversationId);
        const isBFav = favoriteConversations.includes(b.conversationId);
        if (isAFav && !isBFav) return -1;
        if (!isAFav && isBFav) return 1;
        // if both are favored or both not favored, keep their original date-based order from backend
        const dateA = new Date(a.lastMessageAt || a.updatedAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.updatedAt).getTime();
        return dateB - dateA;
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Các tin nhắn</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={20} color={DISCORD.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addFriendButton} onPress={() => setAddModalVisible(true)}>
                    <MaterialCommunityIcons name="account-plus" size={20} color={DISCORD.textMuted} />
                    <Text style={styles.addFriendText}>Thêm Bạn Bè</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator color={DISCORD.blurple} />
                </View>
            ) : (
                <FlatList
                    data={visibleConversations}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.conversationId.toString()}
                    ListHeaderComponent={activeFriends.length > 0 ? ListHeaderComponent : null}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DISCORD.blurple} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
                        </View>
                    }
                />
            )}

            <AddFriendModal
                visible={addModalVisible}
                onDismiss={() => setAddModalVisible(false)}
            />

            <Modal
                visible={userInfoModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setUserInfoModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setUserInfoModalVisible(false)}
                >
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />

                        <View style={styles.sheetHeader}>
                            {selectedUser?.avatarUrl ? (
                                <Image source={{ uri: selectedUser.avatarUrl }} style={styles.sheetBannerAvatar} />
                            ) : (
                                <View style={[styles.sheetBannerAvatar, { backgroundColor: DISCORD.blurple, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                                        {selectedUser?.username?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.sheetUsername}>@{selectedUser?.username}</Text>
                        </View>

                        <View style={styles.sheetActionSection}>
                            <TouchableOpacity style={styles.sheetActionItem} onPress={handleOpenProfile}>
                                <Ionicons name="person-circle-outline" size={24} color={DISCORD.text} />
                                <Text style={styles.sheetActionText}>Hồ sơ</Text>
                            </TouchableOpacity>
                            <View style={styles.sheetDivider} />
                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={async () => {
                                    if (selectedUser?.conversationId) {
                                        const newHidden = [...hiddenConversations, selectedUser.conversationId];
                                        setHiddenConversations(newHidden);
                                        setUserInfoModalVisible(false);
                                        await AsyncStorage.setItem(`hidden_dms_${currentUser?.id}`, JSON.stringify(newHidden));
                                    }
                                }}
                            >
                                <Ionicons name="person-remove-outline" size={24} color={DISCORD.text} />
                                <Text style={styles.sheetActionText}>Đóng trò chuyện</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sheetActionSection}>
                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={async () => {
                                    if (selectedUser?.conversationId) {
                                        const isFavored = favoriteConversations.includes(selectedUser.conversationId);
                                        let newFavorites;
                                        if (isFavored) {
                                            newFavorites = favoriteConversations.filter(id => id !== selectedUser.conversationId);
                                        } else {
                                            newFavorites = [...favoriteConversations, selectedUser.conversationId];
                                        }
                                        setFavoriteConversations(newFavorites);
                                        setUserInfoModalVisible(false);
                                        await AsyncStorage.setItem(`favorite_dms_${currentUser?.id}`, JSON.stringify(newFavorites));
                                    }
                                }}
                            >
                                <Ionicons
                                    name={favoriteConversations.includes(selectedUser?.conversationId) ? "star" : "star-outline"}
                                    size={24}
                                    color={favoriteConversations.includes(selectedUser?.conversationId) ? "#FAA61A" : DISCORD.text}
                                />
                                <Text style={styles.sheetActionText}>
                                    {favoriteConversations.includes(selectedUser?.conversationId) ? "Bỏ ưa thích" : "Ưa thích"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sheetActionSection}>
                            <TouchableOpacity style={styles.sheetActionItem}>
                                <Ionicons name="eye-outline" size={24} color={DISCORD.text} />
                                <Text style={styles.sheetActionText}>Đánh Dấu Đã Đọc</Text>
                            </TouchableOpacity>
                            <View style={styles.sheetDivider} />
                            <TouchableOpacity
                                style={styles.sheetActionItem}
                                onPress={async () => {
                                    if (selectedUser?.conversationId) {
                                        const isMuted = mutedConversations.includes(selectedUser.conversationId);
                                        let newMuted;
                                        if (isMuted) {
                                            newMuted = mutedConversations.filter(id => id !== selectedUser.conversationId);
                                        } else {
                                            newMuted = [...mutedConversations, selectedUser.conversationId];
                                        }
                                        setMutedConversations(newMuted);
                                        setUserInfoModalVisible(false);
                                        await AsyncStorage.setItem(`muted_dms_${currentUser?.id}`, JSON.stringify(newMuted));
                                    }
                                }}
                            >
                                <Ionicons
                                    name={mutedConversations.includes(selectedUser?.conversationId) ? "notifications" : "notifications-off-outline"}
                                    size={24}
                                    color={mutedConversations.includes(selectedUser?.conversationId) ? DISCORD.white : DISCORD.text}
                                />
                                <Text style={styles.sheetActionText}>
                                    {mutedConversations.includes(selectedUser?.conversationId) ? "Bật Âm Cuộc Trò Chuyện" : "Tắt Âm Cuộc Trò Chuyện"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <UserProfileModal
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                user={detailedProfile}
                friendshipId={selectedFriendshipId}
                onUnfriendSuccess={fetchData}
            />

            {fetchingProfile && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }]}>
                    <ActivityIndicator color={DISCORD.blurple} size="large" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DISCORD.darkBg,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },
    headerTitle: {
        color: DISCORD.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 12,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: DISCORD.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addFriendButton: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        backgroundColor: DISCORD.cardBg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addFriendText: {
        color: DISCORD.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
    listHeader: {
        paddingBottom: 24,
    },
    activeFriendsList: {
        paddingHorizontal: 12,
        paddingBottom: 4,
        gap: 12,
    },
    activeFriendItem: {
        width: 82,
        height: 82,
        backgroundColor: DISCORD.cardBg,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeAvatarContainer: {
        position: 'relative',
    },
    activeAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    activeAvatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: DISCORD.blurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeAvatarText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    activeFriendName: {
        color: DISCORD.textMuted,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeStatusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    messageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 19,
        paddingVertical: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: DISCORD.blurple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: DISCORD.darkBg,
    },
    messageInfo: {
        flex: 1,
        marginLeft: 14,
    },
    messageHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    displayName: {
        color: DISCORD.text,
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    displayNameUnread: {
        color: DISCORD.white,
        fontWeight: 'bold',
    },
    messagePreview: {
        color: DISCORD.textMuted,
        fontSize: 14,
        fontWeight: '500',
    },
    messagePreviewUnread: {
        color: DISCORD.text,
        fontWeight: '700',
    },
    timestamp: {
        color: DISCORD.textDark,
        fontSize: 13,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        color: DISCORD.textDark,
        fontSize: 16,
    },
    // Modal & Bottom Sheet
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#000000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingBottom: 40,
        minHeight: 300,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#2B2D31',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    sheetBannerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    sheetUsername: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sheetActionSection: {
        backgroundColor: '#111214',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    sheetActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 16,
    },
    sheetActionText: {
        color: '#F2F3F5',
        fontSize: 16,
        fontWeight: '600',
    },
    sheetDivider: {
        height: 1,
        backgroundColor: '#1E1F22',
        marginHorizontal: 16,
    },
});
