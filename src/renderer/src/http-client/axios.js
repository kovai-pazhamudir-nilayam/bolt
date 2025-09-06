import axios from 'axios'

const AXIOS_TIMEOUT = 80 * 1000 //80 seconds
export const X_CHANNEL_ID = 'COMMAND-CENTER'
const ACCESS_TOKEN = localStorage.getItem('sid')

const API_ENDPOINTS = {
  PROD: `https://api.ebono.com/s/command-center/api`,
  STAGE: `https://api-staging.ebono.com/s/command-center/api`,
  UAT: `https://api-uat.ebono.com/s/command-center/api`,
  LOCAL: `http://localhost:3000/api`
}

//BASE URL MAP
const BASE_URI_MAP = {
  'command-center-staging.ebono.com': API_ENDPOINTS.STAGE,
  'command-center-uat.ebono.com': API_ENDPOINTS.UAT,
  'command-center.ebono.com': API_ENDPOINTS.PROD,
  localhost: API_ENDPOINTS.STAGE
}

export const hostName = window.location.hostname

export const API_BASE_URL = BASE_URI_MAP[hostName]

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: AXIOS_TIMEOUT
})

api.defaults.headers.common['x-channel-id'] = 'WEB'
api.defaults.headers.common['x-app-id'] = 'COMMAND-CENTER'

// api.interceptors.request.use(
//   (config) => {
//     const { url } = config;

//     if (ACCESS_TOKEN && !url.includes("login") && !url.includes("logout")) {
//       api.defaults.headers.common["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => {
    //NO RESPONSE MANIPULATION
    return Promise.resolve(response)
  },
  async (error) => {
    const { response } = error
    const url = response.config.url

    if (response.status === 401 && !url.includes('login') && !url.includes('logout')) {
      localStorage.clear()
      window.location.href = '/login'
      // window.location.href = "/special-login";
    } else {
      //IF AUTH API RETURN THE ERROR
      return Promise.reject(error)
    }
  }
)

if (ACCESS_TOKEN) {
  api.defaults.headers.common['Authorization'] = `Bearer ${ACCESS_TOKEN}`
}

export default api
