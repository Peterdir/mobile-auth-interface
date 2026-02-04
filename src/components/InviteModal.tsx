import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Modal, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconButton, Portal } from 'react-native-paper';

interface InviteModalProps {
    visible: boolean;
    onDismiss: () => void;
    serverName: string;
    inviteCode: string;
}

export const InviteModal = ({ visible, onDismiss, serverName, inviteCode }: InviteModalProps) => {
    const [copied, setCopied] = useState(false);
    const inviteLink = `discord.gg/${inviteCode}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Tham gia server "${serverName}" trên Discord!\n${inviteLink}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
                <TouchableOpacity
                    className="flex-1 bg-black/70 justify-center items-center px-4"
                    activeOpacity={1}
                    onPress={onDismiss}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="bg-[#313338] w-full max-w-sm rounded-lg overflow-hidden"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="bg-[#2B2D31] px-4 py-3 flex-row items-center justify-between">
                            <Text className="text-white font-bold text-lg">Mời bạn bè</Text>
                            <TouchableOpacity onPress={onDismiss}>
                                <IconButton icon="close" size={20} iconColor="#B5BAC1" style={{ margin: 0 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View className="p-4">
                            {/* Server Info */}
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 rounded-full bg-[#5865F2] items-center justify-center mr-3">
                                    <Text className="text-white font-bold">
                                        {serverName.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-white font-semibold">{serverName}</Text>
                                    <Text className="text-[#949BA4] text-xs">Gửi link mời cho bạn bè</Text>
                                </View>
                            </View>

                            {/* Description */}
                            <Text className="text-[#B5BAC1] text-sm mb-4">
                                Chia sẻ liên kết này cho bạn bè để mời họ tham gia server của bạn
                            </Text>

                            {/* Invite Link Input */}
                            <View className="mb-4">
                                <Text className="text-[#B5BAC1] text-xs font-bold uppercase mb-2">
                                    ĐƯỜNG LIÊN KẾT MỜI CỦA BẠN
                                </Text>
                                <View className="flex-row items-center bg-[#1E1F22] rounded-md overflow-hidden">
                                    <TextInput
                                        value={inviteLink}
                                        editable={false}
                                        className="flex-1 text-white px-3 py-3 text-base"
                                        selectTextOnFocus
                                    />
                                    <TouchableOpacity
                                        onPress={handleCopy}
                                        className={`px-4 py-3 ${copied ? 'bg-[#248046]' : 'bg-[#5865F2]'}`}
                                    >
                                        <Text className="text-white font-semibold">
                                            {copied ? 'Đã sao chép!' : 'Sao chép'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Share Options */}
                            <View className="flex-row justify-center space-x-6 mb-4">
                                <ShareOption
                                    icon="share-variant"
                                    label="Chia sẻ"
                                    color="#5865F2"
                                    onPress={handleShare}
                                />
                                <ShareOption
                                    icon="message-text"
                                    label="Tin nhắn"
                                    color="#57F287"
                                    onPress={handleShare}
                                />
                            </View>

                            {/* Expiry Note */}
                            <View className="flex-row items-center justify-center">
                                <IconButton icon="clock-outline" size={14} iconColor="#949BA4" style={{ margin: 0 }} />
                                <Text className="text-[#949BA4] text-xs ml-1">
                                    Link này sẽ không hết hạn
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Portal>
    );
};

// Share option button component
const ShareOption = ({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} className="items-center mx-4">
        <View
            className="w-14 h-14 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: color }}
        >
            <IconButton icon={icon} size={24} iconColor="white" style={{ margin: 0 }} />
        </View>
        <Text className="text-[#B5BAC1] text-xs">{label}</Text>
    </TouchableOpacity>
);
