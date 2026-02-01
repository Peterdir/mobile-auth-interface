import { apiClient } from './apiClient';

export interface ServerResponse {
    id: number;
    name: string;
    description?: string;
    iconUrl?: string;
    inviteCode?: string;
    ownerId: number;
    ownerName: string;
    memberCount?: number;
    channelCount?: number;
    categories?: CategoryResponse[];
    channels?: ChannelResponse[];
    members?: any[];
}

export interface CategoryResponse {
    id: number;
    name: string;
    serverId: number;
    position?: number;
    channels?: ChannelResponse[];
}

export interface ChannelResponse {
    id: number;
    name: string;
    type: 'TEXT' | 'VOICE';
    serverId: number;
    categoryId?: number;
    position?: number;
}

export const serverApi = {
    // SERVERS
    create: (name: string, description?: string, iconUrl?: string) =>
        apiClient.post<ServerResponse>('/servers', { name, description, iconUrl }),

    getMyServers: () =>
        apiClient.get<ServerResponse[]>('/servers/my-servers'),

    getDetails: (serverId: number | string) =>
        apiClient.get<ServerResponse>(`/servers/${serverId}/details`),

    join: (inviteCode: string) =>
        apiClient.post<ServerResponse>('/servers/join', { inviteCode }),

    // CATEGORIES
    getCategories: (serverId: number | string) =>
        apiClient.get<CategoryResponse[]>(`/servers/${serverId}/categories`),

    createCategory: (serverId: number | string, name: string) =>
        apiClient.post<CategoryResponse>(`/servers/${serverId}/categories`, { name, serverId }),

    // CHANNELS
    getChannelsByServer: (serverId: number | string) =>
        apiClient.get<ChannelResponse[]>(`/servers/${serverId}/channels`),

    createChannel: (serverId: number | string, name: string, type: 'TEXT' | 'VOICE', categoryId?: number) =>
        apiClient.post<ChannelResponse>(`/servers/${serverId}/channels`, { name, type, categoryId, serverId }),
};
