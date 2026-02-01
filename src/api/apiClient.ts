import { storage } from '../utils/storage';
import { API_BASE_URL } from './config';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const apiClient = {
    request: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
        const token = await storage.getToken();

        const headers: Record<string, string> = {
            ...options.headers,
        };

        // Chỉ set application/json nếu chưa có Content-Type và body không phải là FormData
        if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const config: RequestOptions = {
            ...options,
            headers,
            signal: controller.signal,
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            clearTimeout(timeoutId);

            if (response.status === 401) {
                // Handle unauthorized (logout or refresh token)
                // For now just throw error
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            // Some endpoints might return empty body (e.g. 204 or just 200 OK with no content)
            const text = await response.text();
            return text ? JSON.parse(text) : {} as T;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    get: <T>(endpoint: string) => apiClient.request<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, body: any) => apiClient.request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),

    put: <T>(endpoint: string, body: any) => apiClient.request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),

    delete: <T>(endpoint: string) => apiClient.request<T>(endpoint, { method: 'DELETE' }),
};
