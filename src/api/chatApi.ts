import { apiClient } from "./apiClient";

export interface ChatMessage {
    id: string;
    content: string;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    attachments?: string[];
    createdAt: string | number[]; // LocalDateTime string or array from backend
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
    },
    deleteMessage: async (messageId: string) => {
        return await apiClient.delete(`/messages/${messageId}`);
    },
    editMessage: async (messageId: string, content: string) => {
        return await apiClient.put<ChatMessage>(`/messages/${messageId}`, { content });
    },
    uploadFile: async (formData: FormData) => {
        try {
            const response = await apiClient.post<{ url: string }>("/upload", formData);
            return response.url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }
};
