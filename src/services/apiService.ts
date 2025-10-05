import configs from '@/configs'

let isRefreshing = false;
let refreshQueue:Array<(token: string) => void> = [];

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | FormData | Blob | null;
};
async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  
  options.headers = {
    ...configs.getDefaultHeaders(),
    ...options.headers
  }

  const response = await fetch(url, options);
  const refreshToken = localStorage.getItem('refreshToken')
  if(response.status !== 401 || !refreshToken) return response
  
 
  return new Promise((resolve, reject) => {
    refreshQueue.push(async (newAccessToken) => {
      try {
        if(options.headers) options.headers.Authorization = `Bearer ${newAccessToken}`;
        const retryRes = await fetch(url, options);
        resolve(retryRes);
      } catch (err) {
        reject(err);
      }
    });

    // Tránh gọi refresh nhiều lần cùng lúc
    if (!isRefreshing) {
      isRefreshing = true;
      refreshAccessToken(refreshToken)
        .then((newTokens) => {
          console.log({ newTokens });
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          } = newTokens;
          // Cập nhật lại user trong localStorage
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry các request trong queue
          refreshQueue.forEach((cb) => cb(newAccessToken));
          console.log("1");
          refreshQueue = [];
        })
        .catch((e) => {
          console.error("Refresh token failed", e);
          logout();
          reject(e);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
      
  });
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${configs.apiBaseUrl}/api/auth/refreshtoken`, {
    method: "GET",
    headers: {
      ...configs.getDefaultHeaders(),
      'x-refresh-token': refreshToken
    }
  });
  if (!res.ok) throw new Error("Unable to refresh token");
  const resJson = await res.json()
  // console.log({resJson})
  /* 
    {
      "status": 200,
      "message": "Request succeeded.",
      "metadata": {
          "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ0MjJlNzdkNjM0ZGUxM2JiZGZiMTciLCJkZXZpY2VJZCI6IjFlNjM3YTJjLTA2NjAtNGZkZC1hNmViLTUyYzNkNDk3ZTM5NSIsImlhdCI6MTc1ODg4ODU4NSwiZXhwIjoxNzU4ODg4NjQ1fQ.dwyw_RyIplCCV_0_KPMS1krXJ8pZAwLP8YsddMVb7szMM3JxEEkoa6hRZIlCnuc-6yiOBWcVVBbZQPH71zEmsPWqtGMPbPIcwXsocZZXjMr9EvLSkK2UG6PHRIdsz-LgnseT8rTB48z8OHQvIYO8_PS-raEabTPEba1zuQ-9VQ_qUkrRGxOCrVT4cGCarTMNzQa2ogYbsjnOM9jAXpgf8pjBRZ7tEtrzpY-1dTM81IS5JK-h1q_s0SfU_0gKNJ_iww3y5wOsnNo3PCHFqZqMyMo3jkwKoj-BqAIe8A5McAtPvos09ueNwiDg2HbVoS-yyONNjWaB2m8Muw5yLFGnhw",
          "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ0MjJlNzdkNjM0ZGUxM2JiZGZiMTciLCJkZXZpY2VJZCI6IjFlNjM3YTJjLTA2NjAtNGZkZC1hNmViLTUyYzNkNDk3ZTM5NSIsImlhdCI6MTc1ODg4ODU4NSwiZXhwIjoxNzU5NDkzMzg1fQ.Yush-k4G2xp1n8_ujM_CuN_B6WdtnKQRsaFCMKNSW9lx2ejDPgutl7440XOEsgAW6yvepIYIwlmQzI4qwKV6yYLaHd2jD1JGvuqBl7da2J6dIp7KZOB6X-1nu2Z6Qk77PF7XFKDw2n-vrEPTAs1dnCqf5RTWhIV44zY6nUABtiSZ_g8BS-fcok0CP3Kxr6YjNVatnZRS3v0X_wxffUyfA1ozTaS8UPDBSM5EnZfWU4yf7SNC4KfZWog9rGKgSfuktowX2M2Gm6qr3mHp5_EtPZKo45nKE6omYwpN3lXoChJIkkH82kiORnr-FVxrfcr2Dqjj92Dv8HWUNnbqXG-Crg",
          "userId": "68d422e77d634de13bbdfb17",
          "deviceId": "1e637a2c-0660-4fdd-a6eb-52c3d497e395"
      }
    }
   */
  return resJson.metadata;
}

function logout() {
  localStorage.removeItem("user");
  // location.reload();
}

export {
  apiFetch
}