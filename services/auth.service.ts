import axios from 'axios';

// The AuthService calls the Next.js API Routes (BFF), NOT the Spring Boot backend directly.
let refreshPromise: Promise<any> | null = null;

export class AuthService {
  static async login(credentials: any) {
    const { data } = await axios.post('/api/internal/auth/login', credentials, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      withCredentials: true
    });
    return data;
  }

  static async logout() {
    await axios.post('/api/internal/auth/logout', {}, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      withCredentials: true
    });
  }

  static async refresh() {
    if (!refreshPromise) {
      refreshPromise = axios.post('/api/internal/auth/refresh', {}, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        withCredentials: true
      }).then(res => {
        refreshPromise = null;
        return res.data;
      }).catch(err => {
        refreshPromise = null;
        throw err;
      });
    }
    return refreshPromise;
  }

  static async register(userData: any) {
    // Register can bypass BFF if it doesn't set HttpOnly cookies,
    // but to avoid exposing NEXT_PUBLIC_API_URL we could proxy it too.
    // Assuming backend returns 201 without cookies:
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const { data } = await axios.post(`${backendUrl}/auth/register`, userData);
    return data;
  }

  static async forgotPassword(email: string) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const { data } = await axios.post(`${backendUrl}/auth/forgot-password`, { email });
    return data;
  }

  static async resetPassword(token: string, newPassword: string) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const { data } = await axios.post(`${backendUrl}/auth/reset-password`, { token, newPassword });
    return data;
  }

  static async verifyEmail(token: string) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const { data } = await axios.post(`${backendUrl}/auth/verify-email?token=${token}`);
    return data;
  }
}
