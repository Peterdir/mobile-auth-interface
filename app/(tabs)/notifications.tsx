import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

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
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={DISCORD.darkBg} />

            {/* Custom Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Các Thông Báo</Text>
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                    <IconButton icon="dots-horizontal" size={20} iconColor={DISCORD.textMuted} style={{ margin: 0 }} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={false}>

                {/* Regular Notifications */}
                <View style={styles.notificationGroup}>
                    {/* Item 1 */}
                    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
                        <View style={styles.notificationContent}>
                            <View style={styles.avatarPlaceholder} />
                            <View style={styles.notificationTextContainer}>
                                <Text style={styles.notificationText}>
                                    <Text style={styles.notificationHighlight}>Liên hệ Won của bạn đã tham gia Discord.</Text> Hãy gửi cho họ yêu cầu kết bạn!
                                </Text>
                                <TouchableOpacity style={styles.pillButtonPrimary} activeOpacity={0.8}>
                                    <Text style={styles.pillButtonPrimaryText}>Thêm Bạn</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.timeText}>24ngày</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Item 2 */}
                    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
                        <View style={styles.notificationContent}>
                            <View style={[styles.avatarPlaceholder, { backgroundColor: '#8B44F2', overflow: 'hidden' }]}>
                                {/* Using a shape icon for placeholder styling */}
                                <IconButton icon="alien" size={30} iconColor={DISCORD.green} style={{ margin: 0 }} />
                            </View>
                            <View style={styles.notificationTextContainer}>
                                <Text style={styles.notificationText}>
                                    <Text style={styles.notificationHighlight}>mfun</Text> đã chấp nhận yêu cầu kết bạn.
                                </Text>
                            </View>
                            <Text style={styles.timeText}>1 tháng</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Friend Suggestions Section */}
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
                            {/* Overlapping Avatars */}
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
        </View>
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
    }
});
