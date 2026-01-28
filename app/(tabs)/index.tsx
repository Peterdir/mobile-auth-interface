import { DMChannel, homeApi, Server, User } from '@/src/api/homeApi';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function HomeScreen() {
    const user = useSelector((state: any) => state.auth.user);
    const [dms, setDms] = useState<DMChannel[]>([]);
    const [activeFriends, setActiveFriends] = useState<User[]>([]);
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedServerId, setSelectedServerId] = useState<string>('dm');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dmsData, friendsData, serversData] = await Promise.all([
                    homeApi.getDMs(),
                    homeApi.getFriends(),
                    homeApi.getServers()
                ]);
                setDms(dmsData);
                // Filter friends who are online/idle/dnd for the top list
                setActiveFriends(friendsData.filter(f => f.status.type !== 'offline'));
                setServers(serversData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-discord-online';
            case 'idle': return 'bg-discord-idle';
            case 'dnd': return 'bg-discord-dnd';
            default: return 'bg-discord-offline';
        }
    };

    const renderServerItem = (server: Server) => {
        const isSelected = selectedServerId === server.id;
        const isDM = server.id === 'dm';

        return (
            <View key={server.id} className="flex-row items-center mb-2 w-full justify-center relative">
                {/* Selection Indicator */}
                {isSelected && (
                    <View className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />
                )}
                {!isSelected && server.hasUnread && (
                    <View className="absolute left-0 w-1 h-2 bg-white rounded-r-lg" />
                )}

                <TouchableOpacity
                    className={`w-12 h-12 rounded-[24px] items-center justify-center overflow-hidden transition-all ${isSelected ? 'rounded-[16px] bg-discord-brand' : 'bg-discord-element group-active:rounded-[16px] group-active:bg-discord-brand'}`}
                    onPress={() => setSelectedServerId(server.id)}
                    activeOpacity={0.8}
                >
                    {isDM ? (
                        <IconButton icon="message-text" size={24} iconColor={isSelected ? 'white' : '#DBDEE1'} style={{ margin: 0 }} />
                    ) : server.iconUrl && !server.iconUrl.startsWith('http') ? (
                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>{server.name}</Text>
                    ) : server.iconUrl ? (
                        <Image source={{ uri: server.iconUrl }} className="w-full h-full" />
                    ) : (
                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>{server.name.substring(0, 2).toUpperCase()}</Text>
                    )}
                </TouchableOpacity>

                {/* Mentions Badge */}
                {server.mentions > 0 && (
                    <View className="absolute bottom-0 right-1 border-[3px] border-discord-element rounded-full bg-discord-dnd min-w-[20px] h-5 items-center justify-center px-1">
                        <Text className="text-white text-[10px] font-bold">{server.mentions}</Text>
                    </View>
                )}
            </View>
        );
    }

    const renderDMItem = ({ item }: { item: DMChannel }) => {
        const isGroup = item.type === 'group';
        const name = isGroup ? item.name : item.participants[0].username;
        const participant = item.participants[0];
        const avatar = isGroup ? 'https://cdn.discordapp.com/embed/avatars/5.png' : participant.avatarUrl;
        const status = isGroup ? null : participant.status.type;

        return (
            <TouchableOpacity className="flex-row items-center p-3 active:bg-discord-hover/40">
                <View className="relative mr-3">
                    <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full bg-discord-element" />
                    {status && (
                        <View className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[3px] border-discord-background ${getStatusColor(status)}`} />
                    )}
                </View>
                <View className="flex-1 mt-1">
                    <View className="flex-row justify-between items-center">
                        <Text className={`text-base flex-1 ${item.unreadCount > 0 ? 'text-white font-bold' : 'text-discord-text-muted font-medium'}`} numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="text-discord-text-muted text-xs">
                            {item.lastMessage ? new Date(item.lastMessage.timestamp).getDate() + ' thg ' + (new Date(item.lastMessage.timestamp).getMonth() + 1) : ''}
                        </Text>
                    </View>
                    <Text className={`text-sm mt-0.5 ${item.unreadCount > 0 ? 'text-discord-text-normal' : 'text-discord-text-muted'}`} numberOfLines={1}>
                        {item.lastMessage?.content || ''}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-discord-background">
                <ActivityIndicator size="large" color="#5865F2" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-discord-background flex-row" edges={['top']}>
            <StatusBar style="light" backgroundColor="#1E1F22" />

            {/* Sidebar (Servers) */}
            <View className="w-[72px] bg-discord-element pt-3 items-center flex-col h-full hidden sm:flex">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
                    {servers.map(renderServerItem)}

                    {/* Add Server Button */}
                    <TouchableOpacity className="w-12 h-12 rounded-[24px] items-center justify-center bg-discord-background mt-2">
                        <IconButton icon="plus" size={24} iconColor="#23A559" style={{ margin: 0 }} />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Content (DMs) */}
            <View className="flex-1 bg-discord-background rounded-tl-[16px] overflow-hidden">
                {/* Header */}
                <View className="px-4 pt-4 pb-2 bg-discord-background shadow-sm">
                    <Text className="text-white font-bold text-2xl mb-1">Các tin nhắn</Text>
                    <Text className="text-discord-text-muted text-xs mb-3 font-semibold">
                        Xin chào, {user?.user || 'Bạn'}!
                    </Text>

                    {/* Search & Add Friend */}
                    <View className="h-9 mb-4 flex-row items-center bg-discord-element rounded-md px-2">
                        <IconButton icon="magnify" size={20} iconColor="#949BA4" style={{ margin: 0, marginRight: 4 }} />
                        <Text className="text-discord-text-muted flex-1 text-sm">Tìm cuộc trò chuyện hoặc bắt đầu...</Text>
                    </View>

                    {/* Horizontal Active Friends */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2" contentContainerStyle={{ paddingRight: 10 }}>
                        <View className="items-center mr-4 w-16">
                            <View className="w-14 h-14 rounded-full bg-discord-element items-center justify-center border-2 border-dashed border-gray-600 mb-1">
                                <IconButton icon="plus" size={24} iconColor="#949BA4" style={{ margin: 0 }} />
                            </View>
                            <Text className="text-discord-text-muted text-xs text-center" numberOfLines={1}>Thêm Bạn Bè</Text>
                        </View>
                        {activeFriends.map(friend => (
                            <View key={friend.id} className="items-center mr-4 w-16 relative">
                                <View className="relative mb-1">
                                    <Image source={{ uri: friend.avatarUrl }} className="w-14 h-14 rounded-full bg-discord-element" />
                                    <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-discord-background ${getStatusColor(friend.status.type)}`} />
                                </View>
                                <Text className="text-discord-text-header text-xs text-center font-bold" numberOfLines={1}>{friend.username}</Text>
                                {friend.status.text && (
                                    <Text className="text-discord-text-muted text-[10px] text-center" numberOfLines={1}>{friend.status.text}</Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* DM List */}
                <View className="flex-1 bg-discord-background rounded-t-[20px] mt-2 overflow-hidden">
                    <FlatList
                        data={dms}
                        renderItem={renderDMItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                </View>

                {/* FAB */}
                <TouchableOpacity className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-discord-brand items-center justify-center shadow-lg">
                    <IconButton icon="message-text" size={28} iconColor="white" style={{ margin: 0 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
