import { apiClient } from "./apiClient";

export interface ChatMessage {
    id: number;
    content: string;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    channelId: number;
    createdAt: string;
}

export const chatApi = {
    getMessages: async (channelId: number | string) => {
        try {
            const response = await apiClient.get<ChatMessage[]>(`/channels/${channelId}/messages`);
            return response;
        } catch (error) {
            console.error("Error fetching messages:", error);
            throw error;
        }
    }
};
