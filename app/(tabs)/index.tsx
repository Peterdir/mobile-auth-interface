import { DMChannel, homeApi, User } from '@/src/api/homeApi';
import { serverApi, ServerResponse } from '@/src/api/serverApi';
import { ChatArea } from '@/src/components/ChatArea';
import { InputModal } from '@/src/components/InputModal';
import { JoinServerModal } from '@/src/components/JoinServerModal';
import { ServerChannelList } from '@/src/components/ServerChannelList';
import { logout } from '@/src/store/slices/authSlice';
import { storage } from '@/src/utils/storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Keyboard, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// UI Model for Server List
interface ServerUI {
    id: string;
    name: string;
    iconUrl?: string;
    hasUnread: boolean;
    mentions: number;
}

export default function HomeScreen() {
    const user = useSelector((state: any) => state.auth.user);
    const dispatch = useDispatch();
    const router = useRouter();

    const [dms, setDms] = useState<DMChannel[]>([]);
    const [allFriends, setAllFriends] = useState<User[]>([]); // Store all friends
    const [activeFriends, setActiveFriends] = useState<User[]>([]); // Only online for display
    const [servers, setServers] = useState<ServerUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedServerId, setSelectedServerId] = useState<string>('dm');
    const [selectedChannel, setSelectedChannel] = useState<{ id: number; name: string } | null>(null);
    const [isChatFullscreen, setIsChatFullscreen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch DMs and Friends
                const [dmsData, friendsData] = await Promise.all([
                    homeApi.getDMs(),
                    homeApi.getFriends(),
                ]);
                setDms(dmsData);
                setAllFriends(friendsData);
                setActiveFriends(friendsData.filter(f => f.status.type !== 'offline'));

                // Fetch Servers
                try {
                    const myServers = await serverApi.getMyServers();
                    const mappedServers: ServerUI[] = myServers.map((s: ServerResponse) => ({
                        id: s.id.toString(),
                        name: s.name,
                        iconUrl: s.iconUrl,
                        hasUnread: false,
                        mentions: 0
                    }));
                    setServers(mappedServers);
                } catch (serverError) {
                    console.error("Failed to fetch servers:", serverError);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                Alert.alert("Kết nối thất bại", "Không thể tải dữ liệu.");
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

    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất", style: 'destructive', onPress: async () => {
                    await storage.removeToken();
                    await storage.removeUserInfo();
                    dispatch(logout());
                    router.replace('/(auth)/login');
                }
            }
        ]);
    };

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);

    const handleCreateServer = async (name: string) => {
        if (name) {
            try {
                const newServer = await serverApi.create(name);
                setServers(prev => [...prev, {
                    id: newServer.id.toString(),
                    name: newServer.name,
                    iconUrl: newServer.iconUrl,
                    hasUnread: false,
                    mentions: 0
                }]);
            } catch (e) {
                Alert.alert("Error", "Could not create server");
            }
        }
    };

    const handleJoinSuccess = (server: ServerResponse) => {
        setServers(prev => [...prev, {
            id: server.id.toString(),
            name: server.name,
            iconUrl: server.iconUrl,
            hasUnread: false,
            mentions: 0
        }]);
    };



    // --- Search Logic ---
    const getFilteredData = () => {
        if (!searchQuery.trim()) return dms;

        const query = searchQuery.toLowerCase();

        // Find friends matching query
        const matchingFriends = allFriends.filter(f =>
            f.username.toLowerCase().includes(query) ||
            f.discriminator.includes(query)
        );

        // Convert matching friends to DM-like objects for display
        // Note: In real app, clicking these should create/open DM
        const friendResults: DMChannel[] = matchingFriends.map(f => ({
            id: `friend_${f.id}`,
            type: 'dm',
            participants: [f],
            lastMessage: { content: 'Bắt đầu cuộc trò chuyện mới', timestamp: new Date().toISOString(), senderId: '' },
            unreadCount: 0
        }));

        // Filter existing DMs
        const matchingDms = dms.filter(dm => {
            const name = dm.type === 'group' ? dm.name : dm.participants[0]?.username;
            return name?.toLowerCase().includes(query);
        });

        // Merge: Friends first, then existing DMs (deduplicate logic needed in real app if friend overlaps with DM)
        // For simple UI, just showing unique combinations is enough.
        // Let's just return friends found as "New Matches" and DMs as "Existing"
        // But FlatList expects one array.
        return [...friendResults, ...matchingDms];
    };

    const renderServerItem = (server: ServerUI) => {
        const isSelected = selectedServerId === server.id;
        return (
            <View key={server.id} className="flex-row items-center mb-2 w-full justify-center relative">
                {isSelected && <View className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />}
                {!isSelected && server.hasUnread && <View className="absolute left-0 w-1 h-2 bg-white rounded-r-lg" />}

                <TouchableOpacity
                    className={`w-12 h-12 rounded-[24px] items-center justify-center overflow-hidden transition-all ${isSelected ? 'rounded-[16px] bg-discord-brand' : 'bg-discord-element group-active:rounded-[16px] group-active:bg-discord-brand'}`}
                    onPress={() => setSelectedServerId(server.id)}
                    activeOpacity={0.8}
                >
                    {server.iconUrl && !server.iconUrl.startsWith('http') ? (
                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>{server.name}</Text>
                    ) : server.iconUrl ? (
                        <Image source={{ uri: server.iconUrl }} className="w-full h-full" />
                    ) : (
                        <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>{server.name.substring(0, 2).toUpperCase()}</Text>
                    )}
                </TouchableOpacity>
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
        const name = isGroup ? item.name : item.participants[0]?.username;
        const participant = item.participants[0];
        const avatar = isGroup ? 'https://cdn.discordapp.com/embed/avatars/5.png' : participant?.avatarUrl;
        const status = isGroup ? null : participant?.status?.type;

        return (
            <TouchableOpacity
                className="flex-row items-center p-3 active:bg-discord-hover/40"
                onPress={() => {
                    // Handle click - if it's a "friend search result" (id starts with friend_), create new DM
                    console.log("Clicked DM/Friend:", item.id);
                }}
            >
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

            {/* Sidebar (Servers) - Hidden when chat is fullscreen */}
            {!isChatFullscreen && (
                <View className="w-[72px] bg-discord-element pt-3 items-center flex-col h-full flex">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
                        <View className="mb-2 relative w-full items-center justify-center">
                            {selectedServerId === 'dm' && <View className="absolute left-0 w-1 h-10 bg-white rounded-r-lg" />}
                            <TouchableOpacity
                                className={`w-12 h-12 rounded-[24px] items-center justify-center overflow-hidden transition-all ${selectedServerId === 'dm' ? 'rounded-[16px] bg-discord-brand' : 'bg-discord-element group-active:rounded-[16px] group-active:bg-discord-brand'}`}
                                onPress={() => setSelectedServerId('dm')}
                            >
                                <IconButton icon="message-text" size={24} iconColor={selectedServerId === 'dm' ? 'white' : '#DBDEE1'} style={{ margin: 0 }} />
                            </TouchableOpacity>
                        </View>
                        <View className="w-8 h-[2px] bg-discord-divider mb-2 rounded-full" />
                        {servers.map(renderServerItem)}
                        <TouchableOpacity
                            className="w-12 h-12 rounded-[24px] items-center justify-center bg-discord-background mt-2"
                            onPress={() => setCreateModalVisible(true)}
                        >
                            <IconButton icon="plus" size={24} iconColor="#23A559" style={{ margin: 0 }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-12 h-12 rounded-[24px] items-center justify-center bg-discord-background mt-2"
                            onPress={() => setJoinModalVisible(true)}
                        >
                            <IconButton icon="compass" size={24} iconColor="#23A559" style={{ margin: 0 }} />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* Main Content */}
            {selectedServerId === 'dm' ? (
                // DM VIEW
                <View className="flex-1 bg-discord-background rounded-tl-[16px] overflow-hidden">
                    <View className="px-4 pt-4 pb-2 bg-discord-background shadow-sm">
                        <Text className="text-white font-bold text-2xl mb-1">Các tin nhắn</Text>

                        {/* SEARCH BAR */}
                        <View className="h-9 mb-4 flex-row items-center bg-discord-element rounded-md px-2">
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Tìm cuộc trò chuyện hoặc bắt đầu..."
                                placeholderTextColor="#949BA4"
                                className="flex-1 text-discord-text-normal text-sm h-full ml-1"
                                onFocus={() => setIsSearching(true)}
                                onBlur={() => setIsSearching(searchQuery.length > 0)}
                            />
                            {searchQuery.length > 0 ? (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearching(false); Keyboard.dismiss(); }}>
                                    <IconButton icon="close" size={20} iconColor="#949BA4" style={{ margin: 0 }} />
                                </TouchableOpacity>
                            ) : (
                                <IconButton icon="magnify" size={20} iconColor="#949BA4" style={{ margin: 0 }} />
                            )}
                        </View>

                        {/* Active Friends List - Hide when searching */}
                        {!isSearching && searchQuery === '' && (
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
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View className="flex-1 bg-discord-background rounded-t-[20px] mt-2 overflow-hidden">
                        <FlatList
                            data={getFilteredData()}
                            renderItem={renderDMItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            ListEmptyComponent={
                                <View className="items-center justify-center mt-10">
                                    <Text className="text-discord-text-muted">Không tìm thấy kết quả nào.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            ) : (
                <View className="flex-1 flex-row">
                    {/* Channel Sidebar - Hidden when chat is fullscreen */}
                    {!isChatFullscreen && (
                        <ServerChannelList
                            serverId={selectedServerId}
                            serverName={servers.find(s => s.id === selectedServerId)?.name || 'Server'}
                            onChannelSelect={(id, name) => {
                                setSelectedChannel({ id, name });
                                setIsChatFullscreen(true);
                            }}
                        />
                    )}
                    <View className="flex-1 bg-discord-background">
                        {selectedChannel && isChatFullscreen ? (
                            <ChatArea
                                channelId={selectedChannel.id}
                                channelName={selectedChannel.name}
                                onBack={() => setIsChatFullscreen(false)}
                            />
                        ) : !isChatFullscreen && selectedChannel ? (
                            <ChatArea channelId={selectedChannel.id} channelName={selectedChannel.name} />
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Text className="text-discord-text-muted">Chọn một kênh để bắt đầu nhắn tin</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            <InputModal
                visible={createModalVisible}
                onDismiss={() => setCreateModalVisible(false)}
                title="Tạo Máy Chủ"
                label="Tên máy chủ"
                placeholder="Nhập tên..."
                onConfirm={handleCreateServer}
            />

            <JoinServerModal
                visible={joinModalVisible}
                onDismiss={() => setJoinModalVisible(false)}
                onJoinSuccess={handleJoinSuccess}
            />
        </SafeAreaView>
    );
}
