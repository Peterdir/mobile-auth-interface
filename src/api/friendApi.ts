import { apiClient } from "./apiClient";
import { API_BASE_URL } from "./config";

export enum FriendshipStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    BLOCKED = 'BLOCKED'
}

export interface FriendshipResponse {
    id: number;
    status: FriendshipStatus;
    senderId: number;
    senderUsername: string;
    senderDisplayName: string;
    senderAvatarUrl?: string;
    receiverId: number;
    receiverUsername: string;
    receiverDisplayName: string;
    receiverAvatarUrl?: string;
    senderStatus?: string;
    receiverStatus?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSearchResponse {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    friendshipStatus: FriendshipStatus | null;
    friendshipId?: number;
    isSender?: boolean;
}

// Helper to normalize avatar URLs
const normalizeAvatarUrl = (url?: string) => {
    if (!url) return url;
    // Don't modify absolute web URLs, base64 data URIs, or local file URIs
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('file://')) {
        return url;
    }

    // API_BASE_URL is like http://10.0.2.2:8085/api
    // We want the root http://10.0.2.2:8085 for uploads
    const baseUrl = API_BASE_URL.replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const normalizeUserSearch = (user: UserSearchResponse): UserSearchResponse => ({
    ...user,
    avatarUrl: normalizeAvatarUrl(user.avatarUrl)
});

const normalizeFriendship = (friendship: FriendshipResponse): FriendshipResponse => ({
    ...friendship,
    senderAvatarUrl: normalizeAvatarUrl(friendship.senderAvatarUrl),
    receiverAvatarUrl: normalizeAvatarUrl(friendship.receiverAvatarUrl)
});

export const friendApi = {
    searchUsers: async (keyword: string) => {
        try {
            const data = await apiClient.get<UserSearchResponse[]>(`/users/search?keyword=${keyword}`);
            return data.map(normalizeUserSearch);
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    },
    sendFriendRequest: async (receiverId: number) => {
        try {
            const data = await apiClient.post<FriendshipResponse>(`/friends/request/${receiverId}`, {});
            return normalizeFriendship(data);
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    },
    getReceivedRequests: async () => {
        try {
            const data = await apiClient.get<FriendshipResponse[]>('/friends/requests/received');
            return data.map(normalizeFriendship);
        } catch (error) {
            console.error("Error fetching received friend requests:", error);
            throw error;
        }
    },
    getSentRequests: async () => {
        try {
            const data = await apiClient.get<FriendshipResponse[]>('/friends/requests/sent');
            return data.map(normalizeFriendship);
        } catch (error) {
            console.error("Error fetching sent friend requests:", error);
            throw error;
        }
    },
    acceptRequest: async (friendshipId: number) => {
        try {
            const data = await apiClient.put<FriendshipResponse>(`/friends/${friendshipId}/accept`, {});
            return normalizeFriendship(data);
        } catch (error) {
            console.error("Error accepting friend request:", error);
            throw error;
        }
    },
    rejectRequest: async (friendshipId: number) => {
        try {
            return await apiClient.put<FriendshipResponse>(`/friends/${friendshipId}/reject`, {});
        } catch (error) {
            console.error("Error rejecting friend request:", error);
            throw error;
        }
    },
    cancelFriendRequest: async (friendshipId: number) => {
        try {
            return await apiClient.delete<any>(`/friends/request/${friendshipId}`);
        } catch (error) {
            console.error("Error canceling friend request:", error);
            throw error;
        }
    },
    getFriends: async () => {
        try {
            const data = await apiClient.get<FriendshipResponse[]>('/friends');
            return data.map(normalizeFriendship);
        } catch (error) {
            console.error("Error fetching friends:", error);
            throw error;
        }
    },
    unfriend: async (friendshipId: number) => {
        try {
            return await apiClient.delete<any>(`/friends/${friendshipId}`);
        } catch (error) {
            console.error("Error unfriending:", error);
            throw error;
        }
    }
};
