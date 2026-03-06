import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

interface VoiceChannelAreaProps {
    channelId: number;
    channelName: string;
    serverId: number;
    onBack: () => void;
}

export const VoiceChannelArea: React.FC<VoiceChannelAreaProps> = ({
    channelName,
    onBack,
}) => {
    const [isMicMuted, setIsMicMuted] = useState(true);
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [isDeafened, setIsDeafened] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-[#1E1F22]">
            {/* --- Top Navbar --- */}
            <View className="flex-row items-center justify-between px-4 py-2 mt-2">
                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity onPress={onBack} className="p-2 bg-[#2B2D31] rounded-full">
                        <Ionicons name="chevron-down" size={20} color="#DBDEE1" />
                    </TouchableOpacity>
                    <View className="flex-row items-center bg-[#2B2D31] px-3 py-1.5 rounded-full space-x-1 ml-2">
                        <Ionicons name="volume-high" size={16} color="#DBDEE1" />
                        <Text className="text-white font-bold ml-1">{channelName}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#949BA4" style={{ marginLeft: 2 }} />
                    </View>
                </View>

                <View className="flex-row space-x-3">
                    <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] items-center justify-center rounded-full mr-2">
                        <Ionicons name="volume-high" size={22} color="#DBDEE1" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] items-center justify-center rounded-full">
                        <Ionicons name="person-add" size={20} color="#DBDEE1" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- Main Avatar Area --- */}
            <View className="flex-1 px-4 py-2 mt-2">
                <View className="flex-1 bg-[#111214] rounded-[24px] justify-center items-center relative overflow-hidden border border-[#1E1F22]">
                    {/* Avatar frame & image */}
                    <View className="relative justify-center items-center">
                        {/* Frame mock around Discord avatar */}
                        <Image
                            source={{ uri: 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                            className="w-24 h-24 rounded-full z-10 bg-[#5865F2]"
                        />
                    </View>

                    {/* User Name & Mic Status Badge */}
                    <View className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center border border-white/10">
                        {isMicMuted && <Ionicons name="mic-off" size={14} color="#F23F42" style={{ marginRight: 6 }} />}
                        <Text className="text-white font-bold text-sm shadow-md">Duy</Text>
                    </View>

                    {/* Activity Badge (Mock) */}
                    <View className="absolute bottom-4 right-4 bg-black/60 w-8 h-8 rounded-full items-center justify-center border border-white/10">
                        <MaterialCommunityIcons name="gamepad-variant" size={16} color="#E51584" />
                    </View>
                </View>
            </View>

            {/* --- Add People Button --- */}
            <View className="px-4 mt-2 mb-2">
                <TouchableOpacity className="bg-[#111214] rounded-[16px] px-4 py-4 flex-row items-center border border-[#1E1F22]">
                    <View className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center mr-3">
                        <Ionicons name="person-add" size={20} color="#DBDEE1" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-[15px]">Thêm người vào Trò Chuyện Thoại</Text>
                        <Text className="text-[#949BA4] text-xs mt-0.5">Cho nhóm biết bạn đang ở đây!</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#949BA4" />
                </TouchableOpacity>
            </View>

            {/* --- Bottom Controls --- */}
            <View className="px-4 py-4 mb-2 flex-row justify-between items-center bg-[#1E1F22]">
                {/* Camera */}
                <TouchableOpacity
                    onPress={() => setIsCameraOff(!isCameraOff)}
                    className={`w-[60px] h-[60px] rounded-full items-center justify-center ${isCameraOff ? 'bg-[#2B2D31]' : 'bg-white'}`}
                >
                    <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={28} color={isCameraOff ? "white" : "#1E1F22"} />
                </TouchableOpacity>

                {/* Mic */}
                <TouchableOpacity
                    onPress={() => setIsMicMuted(!isMicMuted)}
                    className={`w-[60px] h-[60px] rounded-full items-center justify-center ${isMicMuted ? 'bg-white' : 'bg-[#2B2D31]'}`}
                >
                    <Ionicons name={isMicMuted ? "mic-off" : "mic"} size={28} color={isMicMuted ? "#F23F42" : "white"} />
                </TouchableOpacity>

                {/* Chat */}
                <TouchableOpacity className="w-[60px] h-[60px] bg-[#2B2D31] rounded-full items-center justify-center">
                    <Ionicons name="chatbubble" size={24} color="#DBDEE1" />
                </TouchableOpacity>

                {/* Activity/Soundboard / More options */}
                <TouchableOpacity className="w-[60px] h-[60px] bg-[#2B2D31] rounded-full items-center justify-center">
                    {/* Using megaphon/flash icon as seen in Discord bottom panel */}
                    <MaterialCommunityIcons name="rocket-launch" size={24} color="#DBDEE1" />
                </TouchableOpacity>

                {/* Hang Up */}
                <TouchableOpacity onPress={onBack} className="w-[60px] h-[60px] bg-[#F23F42] rounded-full items-center justify-center">
                    <Ionicons name="call" size={28} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
