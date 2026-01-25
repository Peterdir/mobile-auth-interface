import { API_BASE_URL } from "./config";

// REGISTER
export const registerUser = async (username: string, email: string, password: string, displayname: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayname }),
    });
    return response.json();
}

// LOGIN
export const loginUser = async (userName: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
    });
    return response.json();
}

// FORGET PASSWORD
export const forgetPassword = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return response.json();
};

// VERIFY ACCOUNT (xác thực OTP sau khi đăng ký)
export const verifyAccount = async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    return response.json();
};

// RESEND OTP
export const resendOtp = async (email: string, type: 'VERIFY_ACCOUNT' | 'RESET_PASSWORD') => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
    });
    return response.json();
};

// RESET PASSWORD (xác nhận OTP + đổi mật khẩu)
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
    });
    return response.json();
};