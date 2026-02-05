import { directMessageApi, DirectMessageResponse } from '@/src/api/directMessageApi';
import { Client } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { WS_URL } from '../api/config';

interface DirectMessageChatAreaProps {
    conversationId: string;
    friendId: number;
    friendName: string;
    onBack: () => void;
}

const avatarColors = [
    ['#5865F2', '#EB459E'],
    ['#3BA55D', '#43B581'],
    ['#FAA61A', '#F04747'],
    ['#9B59B6', '#3498DB'],
    ['#ED4245', '#FEE75C'],
];

const getAvatarGradient = (id: number) => avatarColors[id % avatarColors.length];

export const DirectMessageChatArea = ({ conversationId, friendId, friendName, onBack }: DirectMessageChatAreaProps) => {
    const user = useSelector((state: any) => state.auth.user);
    const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const stompClient = useRef<Client | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
        connectWebSocket();

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [conversationId]);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await directMessageApi.getMessages(conversationId);
            // data.content contains the list if it's a Page object
            const msgList = data.content ? data.content : data;
            // API returns sorting desc (newest first) for paging, but we might want to reverse for display if needed
            // But usually FlatList with inverted={true} is better for chat. 
            // Only if the API returns desc, we should check order.
            // Let's assume standard order for now (oldest top) or handle it.
            // If the API returns newest first (desc), we should reverse it for standard view OR use inverted Flatlist.
            // The plan said "sorted by createdAt desc" in controller.
            // Let's reverse it to show oldest at top for standard chat view.
            setMessages([...msgList].reverse());
        } catch (error: any) {
            console.error("Error loading DM history:", error);
            setError("Không thể tải tin nhắn.");
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: {
                login: user.userName, // Should likely use proper auth headers if supported
                passcode: 'guest',
            },
            debug: (str) => {
                // console.log("STOMP Debug (DM):", str);
            },
            reconnectDelay: 5000,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            onConnect: () => {
                console.log("✅ DMs: Connected to WebSocket!");
                // Subscribe to user specific queue
                client.subscribe(`/user/queue/dm`, (message) => {
                    console.log("📨 Received DM:", message.body);
                    const receivedMsg: DirectMessageResponse = JSON.parse(message.body);
                    if (receivedMsg.conversationId === conversationId) {
                        setMessages(prev => [...prev, receivedMsg]);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ STOMP Error (DM):', frame.headers['message']);
            }
        });

        client.activate();
        stompClient.current = client;
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        // We use API to send message, backend handles WebSocket broadcast
        try {
            await directMessageApi.sendMessage(friendId, inputText.trim());
            setInputText('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderMessage = ({ item, index }: { item: DirectMessageResponse; index: number }) => {
        const isMe = item.senderId === user.id;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator = !prevMessage ||
            new Date(item.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
        const gradientColors = getAvatarGradient(item.senderId);

        return (
            <View>
                {/* Date Separator */}
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <View style={styles.dateLine} />
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                        <View style={styles.dateLine} />
                    </View>
                )}

                {/* Message */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.messageContainer}
                >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {item.senderAvatar ? (
                            <Image
                                source={{ uri: item.senderAvatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: gradientColors[0] }]}>
                                <Text style={styles.avatarText}>
                                    {item.senderName ? item.senderName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                            <Text style={[styles.senderName, isMe && styles.senderNameMe]}>
                                {item.senderName || (isMe ? user.displayName : friendName)}
                            </Text>
                            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
                        </View>
                        <Text style={styles.messageText}>{item.content}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5865F2" />
                <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <IconButton icon="arrow-left" size={24} iconColor="#FFFFFF" style={{ margin: 0 }} />
                    </TouchableOpacity>
                    <View style={styles.channelIcon}>
                        <IconButton icon="at" size={20} iconColor="#949BA4" style={{ margin: 0 }} />
                    </View>
                    <View>
                        <Text style={styles.channelName}>{friendName}</Text>
                        <Text style={styles.channelDescription}>Tin nhắn riêng</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <IconButton icon="phone" size={22} iconColor="#B5BAC1" style={{ margin: 0 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <IconButton icon="video" size={22} iconColor="#B5BAC1" style={{ margin: 0 }} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <IconButton icon="account" size={48} iconColor="#5865F2" />
                        </View>
                        <Text style={styles.emptyTitle}>{friendName}</Text>
                        <Text style={styles.emptyDescription}>
                            Đây là khởi đầu cuộc trò chuyện với {friendName}.
                        </Text>
                    </View>
                }
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity style={styles.attachButton}>
                            <IconButton icon="plus-circle" size={24} iconColor="#B5BAC1" style={{ margin: 0 }} />
                        </TouchableOpacity>

                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={`Nhắn tin cho @${friendName}`}
                            placeholderTextColor="#72767D"
                            style={styles.textInput}
                            multiline
                            maxLength={2000}
                            onSubmitEditing={sendMessage}
                        />

                        {inputText.trim() && (
                            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                <IconButton icon="send" size={22} iconColor="#FFFFFF" style={{ margin: 0 }} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#313338',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#313338',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#B5BAC1',
        fontSize: 14,
    },
    // Header
    header: {
        height: 52,
        backgroundColor: '#313338',
        borderBottomWidth: 1,
        borderBottomColor: '#1E1F22',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 4,
    },
    channelIcon: {
        marginRight: 4,
    },
    channelName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    channelDescription: {
        color: '#B5BAC1',
        fontSize: 11,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 4,
    },
    // Messages List
    messagesList: {
        paddingTop: 16,
        paddingBottom: 8,
    },
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#3F4147',
    },
    dateText: {
        color: '#949BA4',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
    },
    // Message
    messageContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 2,
    },
    avatarContainer: {
        width: 40,
        marginRight: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    senderName: {
        color: '#F2F3F5',
        fontSize: 15,
        fontWeight: '600',
        marginRight: 8,
    },
    senderNameMe: {
        color: '#5865F2',
    },
    timestamp: {
        color: '#949BA4',
        fontSize: 11,
    },
    messageText: {
        color: '#DCDDDE',
        fontSize: 15,
        lineHeight: 22,
    },
    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#5865F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyDescription: {
        color: '#949BA4',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Input
    inputContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    inputWrapper: {
        backgroundColor: '#383A40',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    attachButton: {
        padding: 4,
    },
    textInput: {
        flex: 1,
        color: '#DCDDDE',
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 4,
        maxHeight: 120,
    },
    sendButton: {
        backgroundColor: '#5865F2',
        borderRadius: 4,
        marginLeft: 8,
        padding: 4,
    },
});
