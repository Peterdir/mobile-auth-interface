import { directMessageApi } from '@/src/api/directMessageApi';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

interface DirectMessageListProps {
    onSelectConversation: (conversationId: string, friendId: number, friendName: string) => void;
}

export const DirectMessageList = ({ onSelectConversation }: DirectMessageListProps) => {
    const user = useSelector((state: any) => state.auth.user);
    const [conversations, setConversations] = useState<any[]>([]); // Using any for Map<String, Object> from backend
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await directMessageApi.getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const friendName = item.friendName || 'Unknown User';
        const lastMessage = item.lastMessageContent || 'Start a conversation';
        const time = item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleDateString() : '';
        const friendId = item.friendId;
        const conversationId = item.conversationId;

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onSelectConversation(conversationId, friendId, friendName)}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{friendName.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.friendName}>{friendName}</Text>
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#5865F2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tin nhắn trực tiếp</Text>
                <TouchableOpacity style={styles.addButton}>
                    <IconButton icon="plus" size={20} iconColor="#B5BAC1" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.conversationId}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2B2D31',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2023',
    },
    title: {
        color: '#949BA4',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    addButton: {
        margin: -8
    },
    listContent: {
        padding: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 8,
        borderRadius: 4,
        marginBottom: 4,
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#5865F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    friendName: {
        color: '#F2F3F5',
        fontWeight: '600',
        fontSize: 15,
    },
    timeText: {
        color: '#949BA4',
        fontSize: 11,
    },
    lastMessage: {
        color: '#949BA4',
        fontSize: 13,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#949BA4',
        fontStyle: 'italic',
    }
});
