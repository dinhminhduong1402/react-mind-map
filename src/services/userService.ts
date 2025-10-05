import configs from '../configs'
import {apiFetch} from '@/services/apiService'

type UserProfile = {
  user_id: 'string',
  user_name: 'string',
  user_email: 'string',
  user_avatar: 'string'
}

const baseUrl = configs.apiBaseUrl
export default class UserService {
  static async getUserProfile(): Promise<UserProfile>{
    const rsBody = await apiFetch(`${baseUrl}/api/user/get-profile`, {
      method: 'GET',
      headers: {
        ...configs.getDefaultHeaders()
      }
    })
    .then(rs => rs.json())
    .catch(err => { 
      throw err 
    })
    
    return {
      user_id: rsBody.metadata._id,
      user_name: rsBody.metadata.name,
      user_email: rsBody.metadata.email,
      user_avatar: rsBody.metadata.avatar
    }
  }
}