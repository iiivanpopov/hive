import fetches from '@siberiacancode/fetches'

export const instance = fetches.create({
  baseURL: 'https://instance.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config) => {
    config.credentials = 'include'
    return config
  },
  error => Promise.reject(error),
)
