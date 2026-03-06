import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { InviteFriendsModal } from './InviteFriendsModal';

interface VoiceChannelChatProps {
    visible: boolean;
    onClose: () => void;
    channelName: string;
}

export const VoiceChannelChat: React.FC<VoiceChannelChatProps> = ({
    visible,
    onClose,
    channelName,
}) => {
    const [message, setMessage] = useState('');
    const [isInviteVisible, setIsInviteVisible] = useState(false);

    const handleTextChange = (text: string) => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setMessage(text);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-black"
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1E1F22]">
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="chevron-down" size={24} color="white" />
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                            <Text className="text-white font-bold text-[17px]">z</Text>
                            <Ionicons name="chevron-forward" size={14} color="#949BA4" style={{ marginLeft: 4 }} />
                        </View>

                        <View className="flex-row items-center">
                            <TouchableOpacity className="mr-4">
                                <Ionicons name="volume-high" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsInviteVisible(true)}>
                                <Ionicons name="person-add" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-10">
                        {/* Welcome Section */}
                        <View className="mb-8">
                            <View className="w-20 h-20 bg-[#2B2D31] rounded-full items-center justify-center mb-4">
                                <MaterialCommunityIcons name="pound" size={40} color="white" />
                            </View>
                            <Text className="text-white font-black text-3xl mb-1">
                                Chào mừng bạn đến với {channelName}!
                            </Text>
                            <Text className="text-[#949BA4] text-lg mb-4">
                                Đây là sự khởi đầu của kênh {channelName}.
                            </Text>
                            <TouchableOpacity className="flex-row items-center">
                                <Ionicons name="pencil" size={16} color="#00A8FC" />
                                <Text className="text-[#00A8FC] font-bold ml-1">Sửa kênh</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dummy Message */}
                        <View className="flex-row mb-6">
                            <Image
                                source={{ uri: 'https://cdn.discordapp.com/embed/avatars/0.png' }}
                                className="w-11 h-11 rounded-full bg-[#5865F2] mr-4"
                            />
                            <View className="flex-1">
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-white font-bold text-base mr-2">Duy</Text>
                                    <Text className="text-[#949BA4] text-xs">21/02/2026 18:57</Text>
                                </View>
                                <Text className="text-[#DBDEE1] text-base">Hello</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Floating Close Button */}
                    <View className="absolute right-4 bottom-24">
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-12 h-12 bg-[#2B2D31] rounded-full items-center justify-center opacity-90 shadow-lg"
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Input Area */}
                    <View className="px-4 py-4 flex-row items-center bg-black border-t border-[#1E1F22]">
                        <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center mr-2">
                            <Ionicons name="add" size={28} color="#DBDEE1" />
                        </TouchableOpacity>

                        {message.length === 0 && (
                            <>
                                <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center mr-2">
                                    <MaterialCommunityIcons name="apps" size={22} color="#DBDEE1" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center mr-2">
                                    <Ionicons name="gift" size={22} color="#DBDEE1" />
                                </TouchableOpacity>
                            </>
                        )}

                        <View className="flex-1 h-11 bg-[#2B2D31] rounded-full px-4 flex-row items-center mr-2">
                            <TextInput
                                placeholder={`Nhắn ${channelName}`}
                                placeholderTextColor="#949BA4"
                                className="flex-1 text-white text-base h-full"
                                value={message}
                                onChangeText={handleTextChange}
                            />
                            <TouchableOpacity>
                                <Ionicons name="happy-outline" size={24} color="#DBDEE1" />
                            </TouchableOpacity>
                        </View>

                        {message.length > 0 ? (
                            <TouchableOpacity
                                className="w-11 h-11 bg-[#5865F2] rounded-full items-center justify-center"
                                onPress={() => setMessage('')} // Mock send
                            >
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="w-10 h-10 bg-[#2B2D31] rounded-full items-center justify-center">
                                <Ionicons name="mic" size={22} color="#DBDEE1" />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>

            <InviteFriendsModal
                visible={isInviteVisible}
                onClose={() => setIsInviteVisible(false)}
                serverName="Code lò"
            />
        </Modal>
    );
};
