import { apiClient } from './apiClient';

export interface UserProfile {
    id: string; // hoặc number tùy backend
    username: string;
    email: string;
    phoneNumber?: string;
    displayName: string;
    avatarUrl?: string;
}

export const profileApi = {
    // Lấy thông tin profile
    getProfile: () => apiClient.get<UserProfile>('/users/me'),

    // Cập nhật thông tin cơ bản (tên hiển thị)
    updateProfile: (data: { displayName: string }) => apiClient.put<UserProfile>('/users/me', data),

    // Đổi mật khẩu
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        apiClient.post('/users/change-password', data),

    // Đổi số điện thoại - Bước 1: Yêu cầu OTP
    initChangePhone: (phoneNumber: string) =>
        apiClient.post('/users/change-phone/init', { phoneNumber }),

    // Đổi số điện thoại - Bước 2: Xác thực OTP
    verifyChangePhone: (otp: string) =>
        apiClient.post('/users/change-phone/verify', { otp }),

    // Đổi Email - Bước 1: Yêu cầu OTP
    initChangeEmail: (email: string) =>
        apiClient.post('/users/change-email/init', { email }),

    // Đổi Email - Bước 2: Xác thực OTP
    verifyChangeEmail: (otp: string) =>
        apiClient.post('/users/change-email/verify', { otp }),

    // Upload Avatar
    uploadAvatar: async (uri: string) => {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
        });

        // Sử dụng fetch trực tiếp vì apiClient mặc định set Content-Type là json
        // Hoặc cần sửa apiClient để handle FormData
        // Tạm thời dùng custom request thông qua apiClient nếu có hỗ trợ, nhưng apiClient hiện tại set cứng json.
        // Nên ta sẽ dùng apiClient.request với cấu hình riêng
        return apiClient.request('/users/avatar', {
            method: 'POST',
            body: formData,
            // Để browser/engine tự set boundary cho multipart
            headers: {}
        });
    }
};
