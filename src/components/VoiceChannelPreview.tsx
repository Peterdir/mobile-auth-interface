import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface VoiceChannelPreviewProps {
    visible: boolean;
    onClose: () => void;
    onJoin: () => void;
    onChat?: () => void;
    onInvite?: () => void;
    channelName: string;
}

export const VoiceChannelPreview: React.FC<VoiceChannelPreviewProps> = ({
    visible,
    onClose,
    onJoin,
    onChat,
    onInvite,
    channelName,
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
                    // Close the modal
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => onClose());
                } else {
                    // Bounce back
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    {...panResponder.panHandlers}
                    style={{ transform: [{ translateY }] }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="bg-[#111214] rounded-t-[24px] p-6 pb-12"
                        style={{ width: '100%' }}
                    >
                        {/* Handle bar for visual clue */}
                        <View className="w-10 h-1 bg-[#2B2D31] rounded-full self-center mb-6" />

                        {/* Header Row */}
                        <View className="flex-row items-center justify-between mb-8">
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="chevron-down" size={24} color="white" />
                            </TouchableOpacity>

                            <View className="flex-row items-center">
                                <Text className="text-white font-bold text-lg">{channelName}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#949BA4" style={{ marginLeft: 4 }} />
                            </View>

                            <TouchableOpacity onPress={onInvite}>
                                <Ionicons name="person-add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Center Content */}
                        <View className="items-center justify-center mb-10 py-4">
                            <Text className="text-white font-bold text-lg text-center mb-2">
                                Hiện chưa có ai ở đây!
                            </Text>
                            <Text className="text-[#949BA4] text-base text-center">
                                Khi nào bạn sẵn sàng trò chuyện, hãy tham gia.
                            </Text>
                        </View>

                        {/* Controls Row */}
                        <View className="flex-row items-center justify-between">
                            {/* Mic Toggle (Muted by default in preview usually) */}
                            <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center">
                                <Ionicons name="mic-off" size={28} color="#F23F42" />
                            </TouchableOpacity>

                            {/* "Tham Gia Thoại" Button */}
                            <TouchableOpacity
                                onPress={onJoin}
                                className="flex-1 bg-[#23A559] h-14 rounded-[28px] items-center justify-center mx-4"
                            >
                                <Text className="text-white font-bold text-lg">Tham Gia Thoại</Text>
                            </TouchableOpacity>

                            {/* Chat Icon */}
                            <TouchableOpacity
                                onPress={onChat}
                                className="w-14 h-14 bg-[#2B2D31] rounded-full items-center justify-center"
                            >
                                <Ionicons name="chatbubble" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};
