const isDev = import.meta.env.MODE == 'development'
console.log('====================ENV==================', {isDev})
const configs = {
  apiBaseUrl: isDev ? 'http://localhost:4000' :'https://fmm-3brf5aa2rq-as.a.run.app',
  getDefaultHeaders() {
     return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || "123456"}`,
        'x-api-key': "d21a389178cc896361f22a6d66eceb8eede50bcf0fadbfaad248d5ddb0626ebf",
        'x-client-id': `${localStorage.getItem('userId')}`,
        'x-device-id': `${localStorage.getItem('deviceId')}`,
    }
  }
}

export default configs