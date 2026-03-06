import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { InviteFriendsModal } from './InviteFriendsModal';
import { VoiceChannelChat } from './VoiceChannelChat';

interface VoiceChannelAreaProps {
    channelId: number;
    channelName: string;
    serverId: number;
    isMicMuted: boolean;
    setIsMicMuted: (value: boolean) => void;
    isCameraOff: boolean;
    setIsCameraOff: (value: boolean) => void;
    onBack: () => void;
    onMinimize?: () => void;
    username?: string;
    avatarUrl?: string;
    voiceCallSeconds?: number;
}

export const VoiceChannelArea: React.FC<VoiceChannelAreaProps> = ({
    channelName,
    isMicMuted,
    setIsMicMuted,
    isCameraOff,
    setIsCameraOff,
    onBack,
    onMinimize,
    username = 'Duy',
}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isInviteVisible, setIsInviteVisible] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-[#1E1F22]">
            {/* --- Top Navbar Refined (Matching Image) --- */}
            <View className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={onMinimize || onBack} className="w-9 h-9 items-center justify-center bg-[#2B2D31]/40 rounded-full">
                        <Ionicons name="chevron-down" size={20} color="#DBDEE1" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center bg-[#2B2D31]/40 px-3 py-1.5 rounded-full ml-3">
                        <Text className="text-white font-bold text-sm mr-1">z</Text>
                        <Ionicons name="chevron-forward" size={12} color="#949BA4" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity className="w-10 h-10 bg-[#2B2D31]/40 items-center justify-center rounded-full mr-2">
                        <Ionicons name="volume-high" size={22} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsInviteVisible(true)}
                        className="w-10 h-10 bg-[#2B2D31]/40 items-center justify-center rounded-full"
                    >
                        <Ionicons name="person-add" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- Main Card Area (Matches Reference Image) --- */}
            <View className="flex-1 px-4 py-4 justify-center">
                <View className="bg-[#111214] aspect-square rounded-[32px] overflow-hidden justify-center items-center relative border border-white/5">
                    {/* Centered Avatar with Ornate Frame (Snake Frame) */}
                    <View className="relative w-32 h-32 items-center justify-center">
                        <Image
                            source={{ uri: 'https://images-ext-1.discordapp.net/external/E5_G-e5oM6v_x0d_o8d_o7d_o4d_o2d/https/raw.githubusercontent.com/Luffy-sama/Discord-Snake-Frame/main/snake_frame.png' }}
                            style={{ position: 'absolute', width: '160%', height: '160%', zIndex: 10 }}
                            resizeMode="contain"
                        />
                        <Image
                            source={{ uri: 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                            style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#5865F2' }}
                        />
                    </View>

                    {/* Bottom-Left Name Badge */}
                    <View className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full flex-row items-center border border-white/10">
                        {isMicMuted && <Ionicons name="mic-off" size={12} color="#F23F42" style={{ marginRight: 6 }} />}
                        <Text className="text-[#DBDEE1] font-bold text-sm">{username}</Text>
                    </View>

                    {/* Bottom-Right Activity Badge */}
                    <View className="absolute bottom-4 right-4 bg-black/60 w-8 h-8 rounded-full items-center justify-center border border-white/10">
                        <MaterialCommunityIcons name="gamepad-variant" size={18} color="#E51584" />
                    </View>
                </View>
            </View>

            {/* --- Invite CTA (Refined) --- */}
            <View className="px-4 mb-4">
                <TouchableOpacity
                    onPress={() => setIsInviteVisible(true)}
                    className="bg-[#111214] rounded-2xl p-4 flex-row items-center border border-white/5"
                >
                    <View className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center mr-3">
                        <Ionicons name="person-add" size={18} color="#DBDEE1" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#DBDEE1] font-bold text-sm">Thêm người vào Trò Chuyện Thoại</Text>
                        <Text className="text-[#949BA4] text-xs mt-0.5">Cho nhóm biết bạn đang ở đây!</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#949BA4" />
                </TouchableOpacity>
            </View>

            {/* --- Bottom Controls Panel (Refined Style) --- */}
            <View className="px-6 py-6 pb-10 flex-row justify-between items-center bg-[#1E1F22] border-t border-black/10">
                {/* Camera Toggle */}
                <TouchableOpacity
                    onPress={() => setIsCameraOff(!isCameraOff)}
                    className={`w-[56px] h-[56px] rounded-full items-center justify-center ${isCameraOff ? 'bg-[#2B2D31]' : 'bg-white'}`}
                >
                    <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={26} color={isCameraOff ? "white" : "#1E1F22"} />
                </TouchableOpacity>

                {/* Mic Toggle (Red when muted) */}
                <TouchableOpacity
                    onPress={() => setIsMicMuted(!isMicMuted)}
                    className={`w-[56px] h-[56px] rounded-full items-center justify-center ${isMicMuted ? 'bg-white' : 'bg-[#2B2D31]'}`}
                >
                    <Ionicons name={isMicMuted ? "mic-off" : "mic"} size={26} color={isMicMuted ? "#F23F42" : "white"} />
                </TouchableOpacity>

                {/* Chat Button */}
                <TouchableOpacity
                    onPress={() => setIsChatOpen(true)}
                    className="w-[56px] h-[56px] bg-[#2B2D31] rounded-full items-center justify-center"
                >
                    <Ionicons name="chatbubble" size={24} color="#DBDEE1" />
                </TouchableOpacity>

                {/* Activity */}
                <TouchableOpacity className="w-[56px] h-[56px] bg-[#2B2D31] rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="rocket-launch" size={24} color="#DBDEE1" />
                </TouchableOpacity>

                {/* Hang Up */}
                <TouchableOpacity onPress={onBack} className="w-[56px] h-[56px] bg-[#F23F42] rounded-full items-center justify-center">
                    <Ionicons name="call" size={26} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <VoiceChannelChat
                visible={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                channelName={channelName}
            />

            <InviteFriendsModal
                visible={isInviteVisible}
                onClose={() => setIsInviteVisible(false)}
                serverName="Code lò"
            />
        </SafeAreaView>
    );
};
