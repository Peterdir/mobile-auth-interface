import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    Image,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ServerOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    server: {
        id: string;
        name: string;
        iconUrl?: string;
    };
}

const DISCORD = {
    background: "#000000",
    card: "#111214",
    secondary: "#1E1F22",
    text: "#F2F3F5",
    textMuted: "#B5BAC1",
    textDark: "#949BA4",
    blurple: "#5865F2",
    green: "#23A559",
    red: "#F23F42",
    divider: "#2B2D31",
};

export const ServerOptionsModal = ({
    visible,
    onClose,
    server,
}: ServerOptionsModalProps) => {
    const [hideMutedChannels, setHideMutedChannels] = useState(false);
    const [allowDirectMessages, setAllowDirectMessages] = useState(true);
    const [allowMessageRequests, setAllowMessageRequests] = useState(true);

    const translateY = useRef(new Animated.Value(1000)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
            }).start();
        }
    }, [visible]);

    const closeHandler = () => {
        Animated.timing(translateY, {
            toValue: 1000,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only trigger if moving down
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 150 || gestureState.vy > 0.5) {
                    closeHandler();
                } else {
                    // Reset position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 5,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={closeHandler}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={closeHandler} />
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY }] }
                    ]}
                >
                    <SafeAreaView edges={["top", "bottom"]}>
                        <View style={styles.handleContainer} {...panResponder.panHandlers}>
                            <View style={styles.handle} />
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.serverIconContainer}>
                                    {server.iconUrl ? (
                                        <Image source={{ uri: server.iconUrl }} style={styles.serverIcon} />
                                    ) : (
                                        <View style={[styles.serverIcon, styles.serverIconPlaceholder]}>
                                            <Text style={styles.serverIconText}>
                                                {server.name.substring(0, 2).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.serverName}>{server.name}</Text>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <View style={[styles.statusDot, { backgroundColor: DISCORD.green }]} />
                                        <Text style={styles.statText}>1 Trực tuyến</Text>
                                    </View>
                                    <View style={[styles.statItem, { marginLeft: 12 }]}>
                                        <View style={[styles.statusDot, { backgroundColor: DISCORD.textDark }]} />
                                        <Text style={styles.statText}>2 Thành viên</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Quick Action Bar */}
                            <View style={styles.actionBar}>
                                <TouchableOpacity style={styles.actionItem}>
                                    <View style={styles.actionIconContainer}>
                                        <MaterialCommunityIcons name="diamond" size={24} color="#EB459E" />
                                    </View>
                                    <Text style={styles.actionLabel}>Nâng Cấp</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem}>
                                    <View style={styles.actionIconContainer}>
                                        <MaterialCommunityIcons name="account-plus" size={24} color={DISCORD.text} />
                                    </View>
                                    <Text style={styles.actionLabel}>Lời mời</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem}>
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="notifications" size={24} color={DISCORD.text} />
                                    </View>
                                    <Text style={styles.actionLabel}>Các Thông Báo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem}>
                                    <View style={styles.actionIconContainer}>
                                        <Ionicons name="settings" size={24} color={DISCORD.text} />
                                    </View>
                                    <Text style={styles.actionLabel}>Cài đặt</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Mark as Read */}
                            <TouchableOpacity style={styles.fullWidthButton}>
                                <Text style={styles.fullWidthButtonText}>Đánh Dấu Đã Đọc</Text>
                            </TouchableOpacity>

                            {/* Section 1: Creation */}
                            <View style={styles.section}>
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Tạo kênh</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Tạo Danh Mục</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Tạo Sự kiện</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Section 2: Settings */}
                            <View style={styles.section}>
                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Chỉnh Sửa Hồ Sơ Theo Máy Chủ</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />

                                <View style={styles.menuItemWithSwitch}>
                                    <Text style={styles.menuItemText}>Ẩn Các Kênh Bị Tắt Âm</Text>
                                    <Switch
                                        value={hideMutedChannels}
                                        onValueChange={setHideMutedChannels}
                                        trackColor={{ false: "#767577", true: DISCORD.blurple }}
                                        thumbColor={DISCORD.text}
                                    />
                                </View>
                                <View style={styles.divider} />

                                <View style={styles.menuItemWithSwitch}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.menuItemText}>Cho Phép Gửi Tin Nhắn Trực Tiếp</Text>
                                        <Text style={styles.subtext}>
                                            Bất kỳ ai trong máy chủ cũng có thể gửi tin nhắn cho bạn
                                        </Text>
                                    </View>
                                    <Switch
                                        value={allowDirectMessages}
                                        onValueChange={setAllowDirectMessages}
                                        trackColor={{ false: "#767577", true: DISCORD.blurple }}
                                        thumbColor={DISCORD.text}
                                    />
                                </View>
                                <View style={styles.divider} />

                                <View style={styles.menuItemWithSwitch}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.menuItemText}>Cho phép yêu cầu tin nhắn</Text>
                                        <Text style={styles.subtext}>
                                            Lọc tin nhắn từ các thành viên mà bạn có thể không biết
                                        </Text>
                                    </View>
                                    <Switch
                                        value={allowMessageRequests}
                                        onValueChange={setAllowMessageRequests}
                                        trackColor={{ false: "#767577", true: DISCORD.blurple }}
                                        thumbColor={DISCORD.text}
                                    />
                                </View>
                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Báo cáo Hệ thống đĩa dự phòng Raid</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={styles.menuItemText}>Báo cáo Máy Chủ</Text>
                                </TouchableOpacity>
                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.menuItem}>
                                    <Text style={[styles.menuItemText, { color: DISCORD.red }]}>
                                        Hành Động Bảo Mật
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Close Spacer */}
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: DISCORD.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
        width: "100%",
    },
    handleContainer: {
        paddingVertical: 12,
        width: "100%",
        alignItems: "center",
    },
    handle: {
        width: 36,
        height: 5,
        backgroundColor: DISCORD.divider,
        borderRadius: 2.5,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    header: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 20,
    },
    serverIconContainer: {
        width: 64,
        height: 64,
        marginBottom: 16,
    },
    serverIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: DISCORD.blurple,
    },
    serverIconPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    serverIconText: {
        color: DISCORD.text,
        fontSize: 24,
        fontWeight: "bold",
    },
    serverName: {
        color: DISCORD.text,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statText: {
        color: DISCORD.textMuted,
        fontSize: 14,
        fontWeight: "500",
    },
    actionBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    actionItem: {
        alignItems: "center",
        width: 80,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: DISCORD.card,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
    },
    actionLabel: {
        color: DISCORD.textMuted,
        fontSize: 12,
        textAlign: "center",
    },
    fullWidthButton: {
        backgroundColor: DISCORD.card,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    fullWidthButtonText: {
        color: DISCORD.textMuted,
        fontSize: 16,
        fontWeight: "600",
    },
    section: {
        backgroundColor: DISCORD.card,
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
    },
    menuItem: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemWithSwitch: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        justifyContent: "space-between",
    },
    menuItemText: {
        color: DISCORD.text,
        fontSize: 16,
        fontWeight: "600",
    },
    subtext: {
        color: DISCORD.textDark,
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: DISCORD.divider,
        marginHorizontal: 16,
    },
});
