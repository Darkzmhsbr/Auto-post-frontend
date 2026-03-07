import axios from 'axios';

// Lembre-se de colocar a URL real do seu backend do Railway aqui!
const API_URL = import.meta.env.VITE_API_URL || 'https://api-autopost.zenyxvips.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Envia o Token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zenyx_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Se o token for inválido, expulsa para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('zenyx_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  getMe: async () => (await api.get('/api/auth/me')).data,
};

export const dashboardService = {
  getStats: async () => (await api.get('/api/autopost/stats')).data,
};

// 👇 NOVO BLOCO: SERVIÇOS DO TELEGRAM 👇
export const telegramService = {
  getStatus: async () => (await api.get('/api/telegram/status')).data,
  requestCode: async (data) => (await api.post('/api/telegram/request-code', data)).data,
  verifyCode: async (data) => (await api.post('/api/telegram/verify-code', data)).data,
  logout: async () => (await api.post('/api/telegram/logout')).data,
};

export default api;