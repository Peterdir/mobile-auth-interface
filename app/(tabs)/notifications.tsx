import { friendApi, FriendshipResponse } from '@/src/api/friendApi';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

// Discord Colors matching the requested dark theme
const DISCORD = {
    blurple: '#5865F2',
    green: '#23A559',
    white: '#FFFFFF',
    darkBg: '#111214',     // Main background
    cardBg: '#1E1F22',     // Pill buttons / elements
    cardBgSecondary: '#2B2D31', // Button hover / secondary elements
    text: '#F2F3F5',
    textMuted: '#B5BAC1',
    textDark: '#949BA4',
    divider: '#3F4147',
    blueLink: '#00A8FC', // For the "Show All" text
};

export default function NotificationsScreen() {
    const [requests, setRequests] = useState<FriendshipResponse[]>([]);
    const [acceptedAlerts, setAcceptedAlerts] = useState<FriendshipResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const currentUser = useSelector((state: any) => state.auth.user);

    const fetchNotifications = useCallback(async () => {
        try {
            const [pendingData, friendsData] = await Promise.all([
                friendApi.getReceivedRequests(),
                friendApi.getFriends()
            ]);

            setRequests(pendingData);

            // Show "Accepted" notifications for friends where current user was the sender
            // Limit to recent ones (e.g., from last 7 days) if needed, but for now show all accepted where I was sender
            const myAccepted = friendsData.filter(f => f.senderId === currentUser?.id);
            setAcceptedAlerts(myAccepted);

        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (currentUser?.id) {
            fetchNotifications();
        }
    }, [fetchNotifications, currentUser?.id]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    const handleAccept = async (id: number) => {
        try {
            await friendApi.acceptRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to accept request:", error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await friendApi.rejectRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to reject request:", error);
        }
    };

    const renderRequest = (request: FriendshipResponse) => {
        return (
            <View key={request.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                    {request.senderAvatarUrl ? (
                        <Image source={{ uri: request.senderAvatarUrl }} style={styles.avatarPlaceholder} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: DISCORD.blurple, alignItems: 'center', justifyContent: 'center' }]}>
                            <IconButton icon="discord" size={24} iconColor="white" style={{ margin: 0 }} />
                        </View>
                    )}
                    <View style={styles.notificationTextContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.notificationHighlight}>{request.senderDisplayName || request.senderUsername}</Text> đã gửi cho bạn một yêu cầu kết bạn!
                        </Text>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.pillButtonPrimary, { backgroundColor: DISCORD.blurple }]}
                                activeOpacity={0.8}
                                onPress={() => handleAccept(request.id)}
                            >
                                <Text style={[styles.pillButtonPrimaryText, { color: 'white' }]}>Chấp nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.pillButtonPrimary, { marginLeft: 8 }]}
                                activeOpacity={0.8}
                                onPress={() => handleReject(request.id)}
                            >
                                <Text style={styles.pillButtonPrimaryText}>Từ chối</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.timeText}>Vừa xong</Text>
                </View>
            </View>
        );
    };

    const renderAcceptedAlert = (friend: FriendshipResponse) => {
        return (
            <View key={`acc-${friend.id}`} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                    {friend.receiverAvatarUrl ? (
                        <Image source={{ uri: friend.receiverAvatarUrl }} style={styles.avatarPlaceholder} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: '#8B44F2', alignItems: 'center', justifyContent: 'center' }]}>
                            <IconButton icon="account-check" size={24} iconColor={DISCORD.green} style={{ margin: 0 }} />
                        </View>
                    )}
                    <View style={styles.notificationTextContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.notificationHighlight}>{friend.receiverDisplayName || friend.receiverUsername}</Text> đã chấp nhận lời mời kết bạn của bạn.
                        </Text>
                    </View>
                    <Text style={styles.timeText}>Gần đây</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkBg} />

            {/* Custom Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Các Thông Báo</Text>
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                    <IconButton icon="dots-horizontal" size={20} iconColor={DISCORD.textMuted} style={{ margin: 0 }} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={DISCORD.blurple} />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DISCORD.blurple} />
                    }
                >
                    {/* Received Requests & Accepted Alerts */}
                    {(requests.length > 0 || acceptedAlerts.length > 0) ? (
                        <View style={styles.notificationGroup}>
                            {requests.map(renderRequest)}
                            {acceptedAlerts.map(renderAcceptedAlert)}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <IconButton icon="bell-off-outline" size={40} iconColor={DISCORD.textDark} />
                            </View>
                            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
                            <Text style={styles.emptySubtitle}>Khi có lời mời kết bạn mới, chúng sẽ xuất hiện ở đây.</Text>
                        </View>
                    )}

                    {/* Friend Suggestions Section (Static for now as per original UI) */}
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionLabel}>Gợi Ý Kết Bạn</Text>
                    </View>

                    <View style={styles.suggestionGroup}>
                        {/* Suggestion 1 */}
                        <TouchableOpacity style={styles.suggestionItem} activeOpacity={0.7}>
                            <View style={styles.suggestionLeft}>
                                <View style={[styles.avatarPlaceholder, { backgroundColor: '#B2B2B2' }]} />
                                <View style={styles.suggestionTextContainer}>
                                    <Text style={styles.suggestionTitle}>Aster</Text>
                                    <Text style={styles.suggestionSub}>Aster</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.pillButtonSecondary} activeOpacity={0.8}>
                                <Text style={styles.pillButtonSecondaryText}>Thêm</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Suggestion 2 */}
                        <TouchableOpacity style={styles.suggestionItem} activeOpacity={0.7}>
                            <View style={styles.suggestionLeft}>
                                <View style={[styles.avatarPlaceholder, { backgroundColor: '#ED4245', justifyContent: 'center', alignItems: 'center' }]}>
                                    <IconButton icon="discord" size={26} iconColor={DISCORD.white} style={{ margin: 0 }} />
                                </View>
                                <View style={styles.suggestionTextContainer}>
                                    <Text style={styles.suggestionTitle}>Huỳnh Như</Text>
                                    <Text style={styles.suggestionSub}>Huỳnh như</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.pillButtonSecondary} activeOpacity={0.8}>
                                <Text style={styles.pillButtonSecondaryText}>Thêm</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Show All Row */}
                        <TouchableOpacity style={styles.showAllRow} activeOpacity={0.7}>
                            <View style={styles.showAllLeft}>
                                <View style={styles.avatarStack}>
                                    <View style={[styles.stackAvatar, { backgroundColor: DISCORD.green, zIndex: 3 }]} />
                                    <View style={[styles.stackAvatar, { backgroundColor: DISCORD.blurple, zIndex: 2, marginLeft: -12 }]} />
                                    <View style={[styles.stackAvatar, { backgroundColor: '#FFB800', zIndex: 1, marginLeft: -12 }]} />
                                </View>
                                <Text style={styles.showAllText}>Show All (5)</Text>
                            </View>
                            <IconButton icon="chevron-right" size={24} iconColor={DISCORD.white} style={{ margin: 0, marginRight: -8 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DISCORD.darkBg,
    },
    header: {
        height: 56,
        backgroundColor: DISCORD.darkBg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerTitle: {
        color: DISCORD.text,
        fontSize: 22,
        fontWeight: '800',
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: DISCORD.cardBgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    notificationGroup: {
        marginTop: 16,
    },
    notificationItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    notificationContent: {
        flexDirection: 'row',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: DISCORD.cardBgSecondary,
        marginRight: 12,
    },
    notificationTextContainer: {
        flex: 1,
        paddingRight: 12,
    },
    notificationText: {
        color: DISCORD.textMuted,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
    },
    notificationHighlight: {
        color: DISCORD.text,
        fontWeight: '700',
    },
    timeText: {
        color: DISCORD.textDark,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    pillButtonPrimary: {
        backgroundColor: DISCORD.cardBgSecondary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginTop: 12,
    },
    pillButtonPrimaryText: {
        color: DISCORD.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeaderContainer: {
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: DISCORD.textDark,
        textTransform: 'uppercase',
    },
    suggestionGroup: {
        paddingHorizontal: 16,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    suggestionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionTextContainer: {
        justifyContent: 'center',
    },
    suggestionTitle: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: '700',
    },
    suggestionSub: {
        color: DISCORD.textMuted,
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    pillButtonSecondary: {
        backgroundColor: DISCORD.cardBgSecondary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    pillButtonSecondaryText: {
        color: DISCORD.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    showAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginTop: 8,
    },
    showAllLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    stackAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: DISCORD.darkBg,
    },
    showAllText: {
        color: '#5865F2', // Discord Blurple
        fontSize: 15,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: DISCORD.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: DISCORD.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: DISCORD.textDark,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    }
});
