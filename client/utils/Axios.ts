// api/config.ts
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Function to set the authorization token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// const { state } = useAuth();

// api.interceptors.request.use(
//   (config) => {
//     if (state?.user?.accessToken) {
//       config.headers.Authorization = `Bearer ${state.user.accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );



export default api;
