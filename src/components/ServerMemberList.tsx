import { serverApi, ServerMember } from '@/src/api/serverApi';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';

interface ServerMemberListProps {
    visible: boolean;
    onClose: () => void;
    serverId: number;
}

const avatarColors = [
    ['#5865F2', '#EB459E'],
    ['#3BA55D', '#43B581'],
    ['#FAA61A', '#F04747'],
    ['#9B59B6', '#3498DB'],
    ['#ED4245', '#FEE75C'],
];

const getAvatarGradient = (id: number | string | undefined) => {
    if (!id) return avatarColors[0];
    const numId = typeof id === 'number' ? id : parseInt(id.toString().replace(/\D/g, '') || '0', 10);
    return avatarColors[numId % avatarColors.length];
};

export const ServerMemberList = ({ visible, onClose, serverId }: ServerMemberListProps) => {
    const [members, setMembers] = useState<ServerMember[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && serverId) {
            fetchMembers();
        }
    }, [visible, serverId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await serverApi.getServerMembers(serverId);
            if (Array.isArray(response)) {
                setMembers(response);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderMember = ({ item }: { item: ServerMember }) => {
        const gradientColors = getAvatarGradient(item.userId);
        return (
            <View style={styles.memberItem}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: gradientColors[0] }]}>
                    <Text style={styles.avatarText}>
                        {item.displayName ? item.displayName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: item.role === 'OWNER' ? '#F04747' : item.role === 'ADMIN' ? '#FAA61A' : '#FFFFFF' }]}>
                        {item.displayName || item.userName}
                    </Text>
                    <Text style={styles.memberStatus}>{item.role}</Text>
                </View>
            </View>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thành viên</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconButton icon="close" size={24} iconColor="#B5BAC1" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#5865F2" />
                        </View>
                    ) : (
                        <FlatList
                            data={members}
                            renderItem={renderMember}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#313338',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2B2D31',
        paddingBottom: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
    },
    memberStatus: {
        color: '#B5BAC1',
        fontSize: 12,
    },
});
