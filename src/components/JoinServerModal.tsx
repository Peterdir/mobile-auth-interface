import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconButton, Portal } from 'react-native-paper';
import { serverApi, ServerResponse } from '../api/serverApi';

interface JoinServerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onJoinSuccess: (server: ServerResponse) => void;
}

export const JoinServerModal = ({ visible, onDismiss, onJoinSuccess }: JoinServerModalProps) => {
    const [inviteLink, setInviteLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Extract invite code from various link formats
    const extractInviteCode = (input: string): string => {
        const trimmed = input.trim();
        // Handle formats: discord.gg/CODE, https://discord.gg/CODE, or just CODE
        const patterns = [
            /discord\.gg\/([A-Za-z0-9]+)/,
            /discord\.com\/invite\/([A-Za-z0-9]+)/,
            /^([A-Za-z0-9]+)$/
        ];

        for (const pattern of patterns) {
            const match = trimmed.match(pattern);
            if (match) return match[1];
        }
        return trimmed;
    };

    const handleJoin = async () => {
        if (!inviteLink.trim()) {
            setError('Vui lòng nhập link mời hoặc mã mời');
            return;
        }

        const inviteCode = extractInviteCode(inviteLink);

        setLoading(true);
        setError('');

        try {
            const server = await serverApi.join(inviteCode);
            Alert.alert(
                'Thành công!',
                `Bạn đã tham gia server "${server.name}"`,
                [{
                    text: 'OK', onPress: () => {
                        setInviteLink('');
                        onJoinSuccess(server);
                        onDismiss();
                    }
                }]
            );
        } catch (err: any) {
            setError(err.message || 'Không thể tham gia server. Vui lòng kiểm tra lại link mời.');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setInviteLink('');
        setError('');
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
                <TouchableOpacity
                    className="flex-1 bg-black/70 justify-center items-center px-4"
                    activeOpacity={1}
                    onPress={handleDismiss}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="bg-[#313338] w-full max-w-sm rounded-lg overflow-hidden"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View className="px-4 pt-4 pb-2">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="w-8" />
                                <Text className="text-white font-bold text-xl text-center flex-1">Tham gia máy chủ</Text>
                                <TouchableOpacity onPress={handleDismiss}>
                                    <IconButton icon="close" size={20} iconColor="#B5BAC1" style={{ margin: 0 }} />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-[#B5BAC1] text-center text-sm">
                                Nhập link mời bên dưới để tham gia một máy chủ hiện có
                            </Text>
                        </View>

                        {/* Content */}
                        <View className="p-4">
                            {/* Invite Link Input */}
                            <View className="mb-4">
                                <Text className="text-[#B5BAC1] text-xs font-bold uppercase mb-2">
                                    LINK MỜI <Text className="text-[#ED4245]">*</Text>
                                </Text>
                                <TextInput
                                    value={inviteLink}
                                    onChangeText={(text) => {
                                        setInviteLink(text);
                                        if (error) setError('');
                                    }}
                                    placeholder="discord.gg/abc123"
                                    placeholderTextColor="#949BA4"
                                    className="bg-[#1E1F22] text-white px-4 py-3 rounded-[4px] text-base"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {error ? (
                                    <Text className="text-[#ED4245] text-xs mt-2">{error}</Text>
                                ) : null}
                            </View>

                            {/* Examples Section */}
                            <View className="mb-6">
                                <Text className="text-[#B5BAC1] text-xs font-bold uppercase mb-2">
                                    CÁC LINK MỜI TRÔNG NHƯ NÀY
                                </Text>
                                <View className="space-y-1">
                                    <Text className="text-[#949BA4] text-sm">discord.gg/abc123</Text>
                                    <Text className="text-[#949BA4] text-sm">discord.com/invite/abc123</Text>
                                    <Text className="text-[#949BA4] text-sm">abc123</Text>
                                </View>
                            </View>

                            {/* Icon decoration */}
                            <View className="items-center mb-4">
                                <View className="bg-[#5865F2] w-16 h-16 rounded-2xl items-center justify-center">
                                    <IconButton icon="account-group" size={32} iconColor="white" style={{ margin: 0 }} />
                                </View>
                            </View>
                        </View>

                        {/* Footer Buttons */}
                        <View className="flex-row bg-[#2B2D31] p-4">
                            <TouchableOpacity
                                onPress={handleDismiss}
                                className="flex-1 py-3 mr-2"
                            >
                                <Text className="text-white text-center font-medium">Quay lại</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleJoin}
                                disabled={loading || !inviteLink.trim()}
                                className={`flex-1 py-3 rounded-[4px] ${loading || !inviteLink.trim() ? 'bg-[#4752C4]/50' : 'bg-[#5865F2]'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white text-center font-bold">Tham gia máy chủ</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Portal>
    );
};
