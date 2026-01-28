export interface UserStatus {
    type: 'online' | 'idle' | 'dnd' | 'offline' | 'mobile';
    text?: string;
}

export interface DMChannel {
    id: string;
    type: 'dm' | 'group';
    name?: string; // For group DMs
    participants: User[];
    lastMessage?: {
        content: string;
        timestamp: string;
        senderId: string;
    };
    unreadCount: number;
}

export interface User {
    id: string;
    username: string;
    discriminator: string;
    avatarUrl: string;
    status: UserStatus;
}

export interface Server {
    id: string;
    name: string;
    iconUrl?: string; // If undefined, show text placeholder
    hasUnread: boolean;
    mentions: number;
}

const MOCK_USERS: User[] = [
    { id: '1', username: 'Phan Vien', discriminator: '0001', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png', status: { type: 'online', text: 'MATH' } },
    { id: '2', username: 'mfun', discriminator: '1234', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png', status: { type: 'online' } },
    { id: '3', username: 'HoangGJinn', discriminator: '9999', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/2.png', status: { type: 'offline' } },
    { id: '4', username: 'Minh thích bóng', discriminator: '5555', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/3.png', status: { type: 'idle' } },
    { id: '5', username: 'Persyy', discriminator: '0000', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/4.png', status: { type: 'dnd' } },
    { id: '6', username: 'MeowT', discriminator: '0006', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/5.png', status: { type: 'online', text: 'PNV' } },
    { id: '7', username: 'cuong125', discriminator: '0007', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png', status: { type: 'offline' } },
    { id: '8', username: 'Hiếu Lê', discriminator: '0008', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png', status: { type: 'idle' } },
];

const MOCK_DMS: DMChannel[] = [
    {
        id: '1',
        type: 'dm',
        participants: [MOCK_USERS[0]],
        lastMessage: { content: 'Bạn: bữa giờ bận hả', timestamp: '2023-10-25T10:00:00Z', senderId: '0' }, // senderId 0 means me
        unreadCount: 0
    },
    {
        id: '2',
        type: 'dm',
        participants: [MOCK_USERS[1]],
        lastMessage: { content: 'Bạn: https://discord.gg/2mwTj4tzc', timestamp: '2023-10-21T09:30:00Z', senderId: '0' },
        unreadCount: 0
    },
    {
        id: '3',
        type: 'dm',
        participants: [MOCK_USERS[2]],
        lastMessage: { content: 'Bạn: https://discord.gg/Nh97AFVm', timestamp: '2023-10-05T18:00:00Z', senderId: '0' },
        unreadCount: 0
    },
    {
        id: '4',
        type: 'dm',
        participants: [MOCK_USERS[3]],
        lastMessage: { content: 'Bạn: https://discord.gg/2qVREbnd', timestamp: '2023-09-30T11:15:00Z', senderId: '0' },
        unreadCount: 0
    },
    {
        id: '5',
        type: 'dm',
        participants: [MOCK_USERS[4]],
        lastMessage: undefined,
        unreadCount: 0
    },
    {
        id: '6',
        type: 'dm',
        participants: [MOCK_USERS[5]],
        lastMessage: { content: 'MeowT: oki oong oi', timestamp: '2022-10-29T11:15:00Z', senderId: '6' },
        unreadCount: 0
    },
];

const MOCK_SERVERS: Server[] = [
    { id: 'dm', name: 'Direct Messages', iconUrl: 'dm', hasUnread: false, mentions: 0 }, // Special case for DM home
    { id: 's1', name: 'Clỏ', hasUnread: true, mentions: 0 },
    { id: 's2', name: 'W', hasUnread: false, mentions: 0 },
    { id: 's3', name: 'VNI', iconUrl: 'https://cdn.discordapp.com/icons/fake/1.png', hasUnread: true, mentions: 0 }, // Placeholder logic for text icons
    { id: 's4', name: 'C', hasUnread: false, mentions: 0 },
    { id: 's5', name: 'u', hasUnread: false, mentions: 0 },
    { id: 's6', name: 'n', hasUnread: false, mentions: 0 },
    { id: 's7', name: 'Java', iconUrl: 'https://cdn.discordapp.com/icons/fake/2.png', hasUnread: true, mentions: 5 },
];

export const homeApi = {
    getDMs: async (): Promise<DMChannel[]> => {
        return MOCK_DMS;
    },
    getFriends: async (): Promise<User[]> => {
        return MOCK_USERS;
    },
    getServers: async (): Promise<Server[]> => {
        return MOCK_SERVERS;
    }
};
