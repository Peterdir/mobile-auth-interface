import { InputModal } from '@/src/components/InputModal';
import { InviteModal } from '@/src/components/InviteModal';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Portal } from 'react-native-paper';
import { ChannelResponse, serverApi, ServerResponse } from '../api/serverApi';
import { COLORS } from '../constants/colors';

interface ServerChannelListProps {
    serverId: string | number;
    serverName: string;
    onChannelSelect?: (channelId: number, channelName: string) => void;
}

interface SectionData {
    title: string;
    data: ChannelResponse[];
    categoryId?: number;
}

// Custom Menu Modal Component
const ServerMenuModal = ({ visible, onDismiss, serverName, onOptionSelect }: any) => {
    return (
        <Portal>
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={onDismiss}
                >
                    <View className="bg-[#313338] rounded-t-[20px] p-6 pb-10">
                        <Text className="text-[#F2F3F5] text-xl font-black mb-6 uppercase tracking-wider pl-2 border-l-4 border-discord-brand">
                            {serverName}
                        </Text>

                        <MenuOption
                            icon="folder-plus"
                            label="Tạo Danh Mục"
                            onPress={() => onOptionSelect('create_category')}
                        />
                        <MenuOption
                            icon="pound"
                            label="Tạo Kênh"
                            onPress={() => onOptionSelect('create_channel')}
                        />
                        <View className="h-[1px] bg-[#3F4147] my-2" />
                        <MenuOption
                            icon="account-plus"
                            label="Mời bạn bè"
                            onPress={() => onOptionSelect('invite')}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </Portal>
    );
};

const MenuOption = ({ icon, label, onPress }: any) => (
    <TouchableOpacity
        className="flex-row items-center p-3 rounded-[4px] active:bg-[#3F4147] mb-1"
        onPress={onPress}
    >
        <IconButton icon={icon} size={24} iconColor="#B5BAC1" style={{ margin: 0, marginRight: 12 }} />
        <Text className="text-[#B5BAC1] font-bold text-base">{label}</Text>
    </TouchableOpacity>
);

export const ServerChannelList = ({ serverId, serverName, onChannelSelect }: ServerChannelListProps) => {
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<SectionData[]>([]);
    const [serverDetails, setServerDetails] = useState<ServerResponse | null>(null);

    // Modal State
    const [channelModalVisible, setChannelModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);

    // Context for creation
    const [currentCategoryId, setCurrentCategoryId] = useState<number | undefined>(undefined);
    const [currentCategoryName, setCurrentCategoryName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!serverId) return;
        fetchData();
    }, [serverId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await serverApi.getDetails(serverId);
            setServerDetails(data);
            const newSections: SectionData[] = [];
            if (data.channels && data.channels.length > 0) {
                newSections.push({ title: '', data: data.channels, categoryId: undefined });
            }
            if (data.categories) {
                data.categories.forEach(cat => {
                    newSections.push({ title: cat.name, data: cat.channels || [], categoryId: cat.id });
                });
            }
            setSections(newSections);
        } catch (error) {
            console.error("Error loading server details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChannel = async (name: string) => {
        if (!name) return;
        try {
            // Check if backend allows null categoryId. Use undefined if not set.
            await serverApi.createChannel(serverId, name, 'TEXT', currentCategoryId);
            fetchData();
        } catch (e) {
            Alert.alert("Lỗi", "Không thể tạo kênh");
        }
    };

    const handleCreateCategory = async (name: string) => {
        if (!name) return;
        try {
            await serverApi.createCategory(serverId, name);
            fetchData();
        } catch (e) {
            Alert.alert("Lỗi", "Không thể tạo danh mục");
        }
    };

    const openCreateChannelModal = (categoryId?: number, categoryName?: string) => {
        setCurrentCategoryId(categoryId);
        setCurrentCategoryName(categoryName);
        setChannelModalVisible(true);
    };

    const handleMenuSelection = (option: string) => {
        setMenuVisible(false); // Close menu first
        setTimeout(() => { // Delay slightly to allow modal animation to finish
            switch (option) {
                case 'create_category':
                    setCategoryModalVisible(true);
                    break;
                case 'create_channel':
                    openCreateChannelModal();
                    break;
                case 'invite':
                    setInviteModalVisible(true);
                    break;
            }
        }, 300);
    }

    const renderChannel = ({ item }: { item: ChannelResponse }) => (
        <TouchableOpacity
            className="flex-row items-center px-2 py-1.5 mx-2 rounded-md active:bg-discord-hover/20 mb-0.5 group"
            onPress={() => onChannelSelect?.(item.id, item.name)}
        >
            <IconButton
                icon={item.type === 'VOICE' ? 'volume-high' : 'pound'}
                size={20}
                iconColor="#949BA4"
                style={{ margin: 0, marginRight: 4 }}
            />
            <Text className={`font-medium flex-1 text-[#949BA4] group-active:text-white`}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderHeader = ({ section }: { section: SectionData }) => (
        section.title ? (
            <View className="flex-row items-center px-4 pt-4 pb-1 justify-between group">
                <TouchableOpacity className="flex-row items-center flex-1">
                    <IconButton icon="chevron-down" size={12} iconColor="#949BA4" style={{ margin: 0, marginRight: 2 }} />
                    <Text className="text-discord-text-muted text-xs font-bold uppercase">{section.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openCreateChannelModal(section.categoryId, section.title)}>
                    <IconButton icon="plus" size={16} iconColor="#949BA4" style={{ margin: 0 }} />
                </TouchableOpacity>
            </View>
        ) : null
    );

    if (loading) return (
        <View className="flex-1 bg-discord-sidebar justify-center items-center w-60">
            <ActivityIndicator color={COLORS.primary} />
        </View>
    );

    return (
        <View className="flex-1 bg-discord-sidebar w-60">
            {/* Server Header */}
            <TouchableOpacity
                className="h-12 flex-row items-center px-4 border-b border-[#1E1F22] active:bg-white/5"
                onPress={() => setMenuVisible(true)}
            >
                <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>{serverDetails?.name || serverName}</Text>
                <IconButton icon={menuVisible ? "close" : "dots-horizontal"} size={24} iconColor="white" style={{ margin: 0 }} />
            </TouchableOpacity>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderChannel}
                renderSectionHeader={renderHeader}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="p-4 items-center">
                        <Text className="text-discord-text-muted text-center text-sm">Chưa có kênh nào.</Text>
                        <TouchableOpacity onPress={() => openCreateChannelModal()} className="mt-2">
                            <Text className="text-discord-brand font-bold">Tạo kênh đầu tiên</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ServerMenuModal
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                serverName={serverDetails?.name || serverName}
                onOptionSelect={handleMenuSelection}
            />

            {/* Modals */}
            <InputModal
                visible={channelModalVisible}
                onDismiss={() => setChannelModalVisible(false)}
                title={currentCategoryName ? `Tạo kênh trong ${currentCategoryName}` : "Tạo kênh mới"}
                label="TÊN KÊNH"
                placeholder="nhập-tên-kênh"
                onConfirm={handleCreateChannel}
                confirmText="Tạo Kênh"
            />

            <InputModal
                visible={categoryModalVisible}
                onDismiss={() => setCategoryModalVisible(false)}
                title="Tạo Danh Mục"
                label="TÊN DANH MỤC"
                placeholder="TÊN DANH MỤC"
                onConfirm={handleCreateCategory}
                confirmText="Tạo Danh Mục"
            />

            <InviteModal
                visible={inviteModalVisible}
                onDismiss={() => setInviteModalVisible(false)}
                serverName={serverDetails?.name || serverName}
                inviteCode={serverDetails?.inviteCode || ''}
            />
        </View>
    );
};
