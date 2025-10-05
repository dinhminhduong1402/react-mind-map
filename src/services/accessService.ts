import configs from '../configs'
import { apiFetch } from './apiService';

export class AccessService {
  static async getGoogleOAuthLoginUrl(): Promise<string> {
    const rsBody = await fetch(`${configs.apiBaseUrl}/api/auth/login/google-auth`, {
      method: 'GET'
    }).then(rs => rs.json())
    
    return rsBody.metadata.authorizationUrl
  }

  static async checkAuth(): Promise<boolean> {
    const accessToken = localStorage.getItem('accessToken')
    if(!accessToken) return false;

    
    return true
  }

  static async Logout(): Promise<void> {
    const rsBody = await apiFetch(`${configs.apiBaseUrl}/api/auth/logout`, {
      method: 'POST'
    }).then(rs => rs.json())
    return rsBody.metadata
  }
}