import { friendApi, UserSearchResponse } from "@/src/api/friendApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

interface AddFriendModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const DISCORD = {
    blurple: "#5865F2",
    green: "#23A559",
    darkBg: "#111214", // Main background
    cardBg: "#1E1F22",
    cardBgSecondary: "#2B2D31",
    inputBg: "#1E1F22",
    text: "#F2F3F5",
    textMuted: "#B5BAC1",
    textDark: "#949BA4",
    divider: "#3F4147",
    offline: "#80848E",
};

export const AddFriendModal = ({ visible, onDismiss }: AddFriendModalProps) => {
    // Current behavior: It shows a generic list. In the real app we will search or use real suggestions.
    // To match the UI exactly, let's use a "Gợi Ý Kết Bản" section.
    // If you type in the search bar, it'll show search results.
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const [isAddByUsername, setIsAddByUsername] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const user = useSelector((state: any) => state.auth.user);
    const myUsername = user?.username || user?.userName || user?.displayName || "user_name";

    const handleDismiss = () => {
        setIsAddByUsername(false);
        setUsernameInput("");
        onDismiss();
    };

    // Mock suggestions to show the layout like the image
    const [suggestions, setSuggestions] = useState([
        { id: 1, username: "aster_2209.", displayName: "Aster", avatarUrl: "https://i.pravatar.cc/150?u=1", hasPending: false },
        { id: 2, username: "huynhnhu4940", displayName: "Huỳnh Như", avatarUrl: null, isDiscordIcon: true, hasPending: false },
        { id: 3, username: "hyhoag.", displayName: "hyhoag", avatarUrl: "https://i.pravatar.cc/150?u=3", hasPending: false },
        { id: 4, username: "lixus_gt", displayName: "Trần Gia Thịnh", avatarUrl: "https://i.pravatar.cc/150?u=4", hasPending: false },
        { id: 5, username: "won0959", displayName: "Won", avatarUrl: "https://i.pravatar.cc/150?u=5", badge: "PLAY", hasPending: false }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Xử lý gửi lời mời bằng username
    const handleSendRequestByUsername = async (username: string) => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) return;

        setIsSubmitting(true);
        try {
            // 1. Tìm kiếm user
            const users = await friendApi.searchUsers(trimmedUsername);

            // Tìm chính xác user
            const targetUser = users.find((u: UserSearchResponse) => u.username.toLowerCase() === trimmedUsername.toLowerCase());

            if (!targetUser) {
                Alert.alert("Lỗi", "Không tìm thấy người dùng này. Vui lòng kiểm tra lại tên người dùng.");
                return;
            }

            if (targetUser.friendshipStatus === "PENDING") {
                Alert.alert("Thông báo", "Đã gửi lời mời trước đó hoặc bạn đang có lời mời chờ xác nhận từ người này.");
                return;
            }

            if (targetUser.friendshipStatus === "ACCEPTED") {
                Alert.alert("Thông báo", "Người này đã là bạn bè của bạn.");
                return;
            }

            // 2. Gửi request
            await friendApi.sendFriendRequest(targetUser.id);
            Alert.alert("Thành công", `Đã gửi yêu cầu kết bạn đến ${targetUser.username}!`);

            setUsernameInput("");
            setIsAddByUsername(false);
            onDismiss(); // Optional: close the modal entirely on success

        } catch (error: any) {
            console.error("Gửi lời mời thất bại:", error);
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendRequestMock = async (userId: number) => {
        // Normally call API here for the suggestions list
        setSuggestions(prev => prev.map(s => s.id === userId ? { ...s, hasPending: true } : s));
    };

    const renderActionIcon = (icon: any, label: string, IconFamily: any = Ionicons) => (
        <View style={styles.actionIconWrapper}>
            <TouchableOpacity style={styles.actionIconButton}>
                <IconFamily name={icon} size={24} color={DISCORD.text} />
            </TouchableOpacity>
            <Text style={[styles.actionIconLabel, { textAlign: 'center' }]} numberOfLines={2}>
                {label}
            </Text>
        </View>
    );

    const renderSuggestionItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.userItem}>
                <View style={styles.avatarContainer}>
                    {item.isDiscordIcon ? (
                        <View style={[styles.avatar, { backgroundColor: '#F00C88', justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons name="robot" size={28} color="white" />
                        </View>
                    ) : item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{item.displayName?.charAt(0) || item.username.charAt(0)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.displayName}>{item.displayName || item.username}</Text>
                        {item.badge ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>⭐ {item.badge}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={styles.username}>{item.username}</Text>
                </View>

                {item.hasPending ? (
                    <View style={styles.addedBadge}>
                        <Text style={styles.addedText}>Đã gửi</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleSendRequestMock(item.id)}
                    >
                        <Text style={styles.addButtonText}>Thêm</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={handleDismiss}
            presentationStyle="pageSheet"
        >
            <View style={[styles.container, Platform.OS === 'android' ? { paddingTop: insets.top || 24 } : {}]}>
                <View style={[styles.header, { zIndex: 99, elevation: 10 }]}>
                    <TouchableOpacity
                        onPress={isAddByUsername ? () => setIsAddByUsername(false) : handleDismiss}
                        style={[styles.backButton, { backgroundColor: 'transparent' }]}
                        activeOpacity={0.7}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Ionicons name="arrow-back" size={28} color={DISCORD.textMuted} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{isAddByUsername ? "Thêm bằng tên người dùng" : "Thêm Bạn Bè"}</Text>
                    <View style={{ width: 28 }} />
                </View>

                {isAddByUsername ? (
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={styles.addByUsernameContainer}>
                            <Text style={styles.addByUsernamePrompt}>Bạn muốn thêm ai làm bạn bè?</Text>
                            <TextInput
                                style={styles.usernameInput}
                                placeholder="Nhập tên người dùng"
                                placeholderTextColor={DISCORD.textDark}
                                value={usernameInput}
                                onChangeText={setUsernameInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                                selectionColor={DISCORD.blurple}
                            />
                            <Text style={styles.myUsernameHint}>
                                À nhân tiện, tên người dùng của bạn là <Text style={{ fontWeight: 'bold', color: DISCORD.text }}>{myUsername}</Text>.
                            </Text>

                            <View style={{ flex: 1 }} />

                            <TouchableOpacity
                                style={[styles.sendRequestBtn, (!usernameInput.trim() || isSubmitting) && styles.sendRequestBtnDisabled]}
                                disabled={!usernameInput.trim() || isSubmitting}
                                onPress={() => handleSendRequestByUsername(usernameInput)}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={[styles.sendRequestBtnText, !usernameInput.trim() && styles.sendRequestBtnTextDisabled]}>
                                        Gửi Yêu Cầu Kết Bạn
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                ) : (
                    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.actionsScroll}
                            style={styles.actionsContainer}
                        >
                            {renderActionIcon("share-outline", "Chia Sẻ Lời\nMời")}
                            {renderActionIcon("link-outline", "Sao Chép Link")}
                            {renderActionIcon("qr-code-outline", "Mã QR")}
                            {renderActionIcon("chatbubble-outline", "Tin nhắn")}
                            {renderActionIcon("mail-outline", "Email")}
                            <View style={styles.actionIconWrapper}>
                                <TouchableOpacity style={styles.actionIconButton}>
                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/512px-Facebook_Messenger_logo_2020.svg.png' }} style={{ width: 32, height: 32 }} />
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.actionIconLabel}>Messenger</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.searchBarContainer}
                            activeOpacity={0.8}
                            onPress={() => setIsAddByUsername(true)}
                        >
                            <View style={styles.searchBarLeft}>
                                <MaterialCommunityIcons name="at" size={20} color={DISCORD.textMuted} />
                                <Text style={styles.searchBarPlaceholder}>Thêm bằng tên người dùng</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={DISCORD.textMuted} />
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Gợi Ý Kết Bạn</Text>

                        <View style={styles.listContainer}>
                            {loading ? (
                                <View style={styles.center}>
                                    <ActivityIndicator color={DISCORD.blurple} />
                                </View>
                            ) : (
                                <FlatList
                                    data={suggestions}
                                    renderItem={renderSuggestionItem}
                                    keyExtractor={(item) => item.id.toString()}
                                    scrollEnabled={false}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            )}
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 24 : 12,
        paddingBottom: 16,
        width: '100%',
    },
    backButton: {
        padding: 4,
        zIndex: 10,
    },
    title: {
        color: DISCORD.text,
        fontSize: 18,
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
    },
    actionsContainer: {
        marginBottom: 20,
    },
    actionsScroll: {
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 20,
    },
    actionIconWrapper: {
        alignItems: "center",
        width: 76,
    },
    actionIconButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: DISCORD.cardBgSecondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    actionIconLabel: {
        color: DISCORD.textDark,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: '#1E1F22',
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    searchBarLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    searchBarPlaceholder: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: '500',
    },
    sectionTitle: {
        color: DISCORD.textDark,
        fontSize: 13,
        fontWeight: "bold",
        textTransform: "uppercase",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listContainer: {
        marginHorizontal: 16,
        backgroundColor: '#1E1F22',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 30,
    },
    userItem: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    separator: {
        height: 1,
        backgroundColor: '#2B2D31',
        marginLeft: 80, // Offset for avatar
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: DISCORD.blurple,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    displayName: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: "bold",
    },
    badge: {
        backgroundColor: '#2B2D31',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: DISCORD.textDark,
        fontSize: 10,
        fontWeight: 'bold',
    },
    username: {
        color: DISCORD.textDark,
        fontSize: 13,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#2B2D31',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    addButtonText: {
        color: DISCORD.text,
        fontSize: 14,
        fontWeight: '600',
    },
    addedBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addedText: {
        color: DISCORD.textDark,
        fontSize: 14,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    // Add By Username Styles
    addByUsernameContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    addByUsernamePrompt: {
        color: DISCORD.textDark,
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 16,
    },
    usernameInput: {
        backgroundColor: '#1E1F22',
        color: DISCORD.text,
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 16,
    },
    myUsernameHint: {
        color: DISCORD.textDark,
        fontSize: 12,
        lineHeight: 18,
    },
    sendRequestBtn: {
        backgroundColor: DISCORD.blurple,
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    sendRequestBtnDisabled: {
        backgroundColor: '#3F4147', // disabled color similar to mockup
        opacity: 0.8,
    },
    sendRequestBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sendRequestBtnTextDisabled: {
        color: '#80848E',
    }
});
