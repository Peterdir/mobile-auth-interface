import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ServerContextMenuProps {
    visible: boolean;
    onClose: () => void;
    serverName: string;
    onMarkAsRead?: () => void;
    onNotifications?: () => void;
    onMoreOptions?: () => void;
}

const DISCORD_COLORS = {
    background: "#1E1F22",
    element: "#2B2D31",
    text: "#F2F3F5",
    textMuted: "#B5BAC1",
    divider: "#35363C",
    overlay: "rgba(0, 0, 0, 0.8)",
};

export const ServerContextMenu = ({
    visible,
    onClose,
    serverName,
    onMarkAsRead,
    onNotifications,
    onMoreOptions,
}: ServerContextMenuProps) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.menuContainer}>
                    <Text style={styles.title}>{serverName}</Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                onMarkAsRead?.();
                                onClose();
                            }}
                        >
                            <Text style={styles.optionText}>Đánh Dấu Đã Đọc</Text>
                            <Ionicons name="mail" size={20} color={DISCORD_COLORS.text} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                onNotifications?.();
                                onClose();
                            }}
                        >
                            <Text style={styles.optionText}>Các Thông Báo</Text>
                            <Ionicons name="notifications" size={20} color={DISCORD_COLORS.text} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                onMoreOptions?.();
                                onClose();
                            }}
                        >
                            <Text style={styles.optionText}>Mở Thêm Tùy Chọn</Text>
                            <Ionicons name="settings" size={20} color={DISCORD_COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: DISCORD_COLORS.overlay,
        justifyContent: "center",
        alignItems: "center",
    },
    menuContainer: {
        width: "80%",
        backgroundColor: DISCORD_COLORS.background,
        borderRadius: 16,
        paddingVertical: 16,
        overflow: "hidden",
    },
    title: {
        color: DISCORD_COLORS.text,
        fontSize: 18,
        fontWeight: "bold",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    optionsContainer: {
        backgroundColor: DISCORD_COLORS.element,
        marginHorizontal: 12,
        borderRadius: 12,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    optionText: {
        color: DISCORD_COLORS.text,
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: DISCORD_COLORS.divider,
        marginHorizontal: 16,
    },
});
