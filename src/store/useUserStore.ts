import { AccessService } from '@/services/accessService'
import UserService from '@/services/userService'
import {create} from 'zustand'

type UserInfo = {
  user_id: string,
  user_name: string,
  user_email: string,
  user_avatar: string,
}

interface UserState {
  currentUser: UserInfo | null,

  setCurrentUser: () => Promise<UserInfo | null>,
  logout: () => Promise<void>
}

const useUserStore = create<UserState>(
  (set, get) => ({
    currentUser: null,

    async setCurrentUser() {
      try {
        const userProfile = await UserService.getUserProfile()
        // console.log({userProfile})
        set(() => ({
          currentUser: {
            user_id: userProfile.user_id,
            user_name: userProfile.user_name,
            user_email: userProfile.user_email,
            user_avatar: userProfile.user_avatar,
          }
        }))
        
      } catch (error) {
        console.log(error);
        set(() => ({
          currentUser: null
        }))
        
      }
      return get().currentUser
    },
    
    async logout() {
      await AccessService.Logout()
      await get().setCurrentUser()
      localStorage.removeItem('userId')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('deviceId')
      window.location.reload()
    }
  })
)

export default useUserStore

