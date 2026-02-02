import { apiClient } from './apiClient';

export interface UserProfile {
    id: string | number;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string; // Backend sends avatarUrl
    bio?: string;      // Backend sends bio
    createdAt?: string;
    roles?: string[];
    // Fields missing in backend response but used in UI (mock or hide)
    phoneNumber?: string;
}

export const profileApi = {
    // Lấy thông tin profile
    getProfile: () => apiClient.get<UserProfile>('/users/me'),

    // Cập nhật thông tin cơ bản (tên hiển thị, bio, etc.)
    // Backend endpoint: @PutMapping("/profile") -> /users/profile
    updateProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
        apiClient.put<UserProfile>('/users/profile', data),

    // --- Features NOT implementation in Backend yet ---

    // Đổi mật khẩu (Mock)
    changePassword: async (data: { oldPassword: string; newPassword: string }) => {
        // console.warn('Backend chưa hỗ trợ đổi mật khẩu');
        throw new Error('Tính năng chưa được hỗ trợ bởi Server');
    },

    // Đổi số điện thoại (Mock)
    initChangePhone: async (phoneNumber: string) => {
        throw new Error('Tính năng chưa được hỗ trợ bởi Server');
    },

    verifyChangePhone: async (otp: string) => {
        throw new Error('Tính năng chưa được hỗ trợ bởi Server');
    },

    // Đổi Email (Mock)
    initChangeEmail: async (email: string) => {
        throw new Error('Tính năng chưa được hỗ trợ bởi Server');
    },

    verifyChangeEmail: async (otp: string) => {
        throw new Error('Tính năng chưa được hỗ trợ bởi Server');
    },

    // Upload Avatar (Mock or Client-side only for now if backend doesn't support upload)
    // Note: Backend UserResponse has avatarUrl but no upload endpoint in UserController.
    uploadAvatar: async (uri: string) => {
        throw new Error('Tính năng upload ảnh chưa được hỗ trợ bởi Server');
    }
};
