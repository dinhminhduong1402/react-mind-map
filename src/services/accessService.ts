import configs from '../configs'

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
}