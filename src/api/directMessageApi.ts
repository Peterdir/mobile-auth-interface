import { apiClient } from "./apiClient";

export interface DirectMessageResponse {
    id: string;
    conversationId: string;
    senderId: number;
    receiverId: number;
    content: string;
    createdAt: string;
    senderName?: string;
    senderAvatar?: string;
}

export interface ConversationResponse {
    id: string;
    user1Id: number;
    user2Id: number;
    createdAt: string;
    otherUser?: {
        id: number;
        userName: string;
        avatar?: string;
    };
}

export const directMessageApi = {
    getConversations: async () => {
        try {
            const response = await apiClient.get<any[]>('/direct-messages/conversations');
            return response;
        } catch (error) {
            console.error("Error fetching conversations:", error);
            throw error;
        }
    },

    getMessages: async (conversationId: string, page = 0, size = 50) => {
        try {
            const response = await apiClient.get<any>(`/direct-messages/conversation/${conversationId}?page=${page}&size=${size}`);
            return response; // Note: server returns Page<DirectMessageResponse>
        } catch (error) {
            console.error("Error fetching DM messages:", error);
            throw error;
        }
    },

    sendMessage: async (receiverId: number, content: string) => {
        try {
            const response = await apiClient.post<DirectMessageResponse>('/direct-messages', {
                receiverId,
                content
            });
            return response;
        } catch (error) {
            console.error("Error sending DM:", error);
            throw error;
        }
    },

    getOrCreateConversation: async (friendId: number) => {
        try {
            const response = await apiClient.get<ConversationResponse>(`/direct-messages/conversation/by-user/${friendId}`);
            return response;
        } catch (error) {
            console.error("Error getting conversation:", error);
            throw error;
        }
    }
};
