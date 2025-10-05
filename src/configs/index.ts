const isDev = import.meta.env.MODE == 'development'
console.log('====================ENV==================', {isDev})
const configs = {
  apiBaseUrl: isDev ? import.meta.env.VITE_API_URL_DEV :import.meta.env.VITE_API_URL_PRO,
  getDefaultHeaders() {
     return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || "123456"}`,
        'x-api-key': import.meta.env.VITE_BACKEND_API_KEY,
        'x-client-id': `${localStorage.getItem('userId')}`,
        'x-device-id': `${localStorage.getItem('deviceId')}`,
    }
  }
}
// console.log({configs})

export default configs