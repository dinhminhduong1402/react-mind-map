export default function LoginSuccess() {
  const params = new URLSearchParams(location.search)
  const accessToken = params.get('accesstoken') || ''
  const refreshToken = params.get('refreshtoken') || ''
  const userId = params.get('userid') || ''
  const deviceId = params.get('deviceid') || ''
  console.log({accessToken, refreshToken, userId, deviceId})

  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('userId', userId)
  localStorage.setItem('deviceId', deviceId)

  //  
  
  
  return (
    <div>
    </div>
  )
}