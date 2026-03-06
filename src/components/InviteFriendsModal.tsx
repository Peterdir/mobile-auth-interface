import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    PanResponder,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Friend {
    id: string;
    name: string;
    avatar: string;
}

const DUMMY_FRIENDS: Friend[] = [
    { id: '1', name: 'Phan Vien', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png' },
    { id: '2', name: 'Minh thích bóng', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' },
    { id: '3', name: 'Persyy', avatar: 'https://cdn.discordapp.com/embed/avatars/3.png' },
    { id: '4', name: 'HoangGJinn', avatar: 'https://cdn.discordapp.com/embed/avatars/4.png' },
    { id: '5', name: 'hoangqd', avatar: 'https://cdn.discordapp.com/embed/avatars/5.png' },
    { id: '6', name: 'MeowT', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
    { id: '7', name: 'cuong125', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png' },
    { id: '8', name: 'Hiếu Lê', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' },
];

interface InviteFriendsModalProps {
    visible: boolean;
    onClose: () => void;
    serverName: string;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
    visible,
    onClose,
    serverName,
}) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) {
            translateY.setValue(0);
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Respond if moving down and not too much horizontal movement
                return gestureState.dy > 5 && Math.abs(gestureState.dx) < 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120 || gestureState.vy > 0.5) {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => onClose());
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 60,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

    const renderFriend = ({ item }: { item: Friend }) => (
        <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
                <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full bg-[#313338]" />
                <Text className="text-white font-bold text-base ml-3">{item.name}</Text>
            </View>
            <TouchableOpacity className="bg-[#4E5058] px-4 py-1.5 rounded-full">
                <Text className="text-white font-bold text-sm">Mời</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60">
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    {...panResponder.panHandlers}
                    style={{
                        transform: [{ translateY }],
                        marginTop: 'auto',
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="bg-[#111214] rounded-t-[20px] pt-2"
                        style={{ height: SCREEN_HEIGHT * 0.85 }}
                    >
                        <View className="w-10 h-1 bg-[#2B2D31] rounded-full self-center mb-4" />

                        <Text className="text-white font-black text-center text-[17px] mb-6">Mời bạn bè</Text>

                        {/* Top Action Icons */}
                        <View className="flex-row justify-around px-2 mb-8">
                            <ActionIcon icon={<Ionicons name="share-outline" size={24} color="white" />} label="Chia Sẻ Lời Mời" />
                            <ActionIcon icon={<Ionicons name="link-outline" size={24} color="white" />} label="Sao Chép Link" />
                            <ActionIcon icon={<MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />} label="Mã QR" />
                            <ActionIcon icon={<Ionicons name="chatbubble-outline" size={24} color="white" />} label="Tin nhắn" />
                            <ActionIcon icon={<Ionicons name="mail-outline" size={24} color="white" />} label="Email" />
                            <ActionIcon icon={<MaterialCommunityIcons name="facebook-messenger" size={24} color="white" />} label="Messen" />
                        </View>

                        <View className="px-4 flex-1">
                            {/* Search Bar */}
                            <View className="bg-[#1E1F22] rounded-full flex-row items-center px-4 h-12 mb-4">
                                <Ionicons name="search" size={20} color="#949BA4" />
                                <TextInput
                                    placeholder={`Mời bạn bè vào ${serverName}`}
                                    placeholderTextColor="#949BA4"
                                    className="flex-1 text-white ml-2 text-base"
                                />
                            </View>

                            {/* Expiration text */}
                            <Text className="text-[#949BA4] text-xs mb-6 px-1">
                                Link mời của bạn sẽ hết hạn sau 30 ngày. <Text className="text-[#00A8FC]">Chỉnh sửa link mời.</Text>
                            </Text>

                            {/* Friend List */}
                            <FlatList
                                data={DUMMY_FRIENDS}
                                keyExtractor={(item) => item.id}
                                renderItem={renderFriend}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const ActionIcon = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <View className="items-center w-16">
        <View className="w-12 h-12 bg-[#2B2D31] rounded-full items-center justify-center mb-1">
            {icon}
        </View>
        <Text className="text-[#949BA4] text-[10px] text-center" numberOfLines={2}>{label}</Text>
    </View>
);
