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

// 👇 NOVO BLOCO: SERVIÇOS DOS BOTS (PONTE) 👇
export const botService = {
  list: async () => (await api.get('/api/bots')).data,
  create: async (data) => (await api.post('/api/bots', data)).data,
  remove: async (id) => (await api.delete(`/api/bots/${id}`)).data,
  validate: async (token) => {
    // Valida o token diretamente na API do Telegram (client-side preview)
    const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    return resp.json();
  },
};

// 👇 NOVO BLOCO: SERVIÇOS DE CANAIS (AUTOPOST) 👇
export const channelService = {
  list: async () => (await api.get('/api/autopost/channels')).data,
  create: async (data) => (await api.post('/api/autopost/channels', data)).data,
  update: async (id, data) => (await api.put(`/api/autopost/channels/${id}`, data)).data,
  remove: async (id) => (await api.delete(`/api/autopost/channels/${id}`)).data,
  toggle: async (id) => (await api.post(`/api/autopost/channels/${id}/toggle`)).data,
  addDestination: async (channelId, data) => (await api.post(`/api/autopost/channels/${channelId}/destinations`, data)).data,
  removeDestination: async (channelId, destId) => (await api.delete(`/api/autopost/channels/${channelId}/destinations/${destId}`)).data,
  updateCaption: async (channelId, data) => (await api.put(`/api/autopost/channels/${channelId}/caption`, data)).data,
  // Tópicos
  listTopics: async (channelId) => (await api.get(`/api/autopost/channels/${channelId}/topics`)).data,
  addTopic: async (channelId, data) => (await api.post(`/api/autopost/channels/${channelId}/topics`, data)).data,
  removeTopic: async (channelId, topicId) => (await api.delete(`/api/autopost/channels/${channelId}/topics/${topicId}`)).data,
};

// 👇 NOVO BLOCO: SERVIÇOS DO SUPER ADMIN 👇
export const adminService = {
  check: async () => (await api.get('/api/admin/check')).data,
  getStats: async () => (await api.get('/api/admin/stats')).data,
  listUsers: async () => (await api.get('/api/admin/users')).data,
  getUserChannels: async (userId) => (await api.get(`/api/admin/users/${userId}/channels`)).data,
  toggleUser: async (userId) => (await api.post(`/api/admin/users/${userId}/toggle`)).data,
  deleteUser: async (userId) => (await api.delete(`/api/admin/users/${userId}`)).data,
  promote: async (userId) => (await api.post(`/api/admin/promote/${userId}`)).data,
  demote: async (userId) => (await api.delete(`/api/admin/demote/${userId}`)).data,
};

// 👇 SERVIÇO DO CLONEX (Módulos de clonagem) 👇
export const clonexService = {
  getStatus: async () => (await api.get('/api/clonex/status')).data,
};

// 👇 SERVIÇO DE EMOJIS PREMIUM (usa API do Zenyx VIPs principal) 👇
export const premiumEmojiService = {
  getCatalog: async () => {
    try {
      const mainApiUrl = 'https://api.zenyxvips.com';
      const token = localStorage.getItem('zenyx_token');
      const resp = await fetch(`${mainApiUrl}/api/premium-emojis/catalog`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return resp.json();
    } catch { return { packs: [], total_emojis: 0 }; }
  },
  search: async (query) => {
    try {
      const mainApiUrl = 'https://api.zenyxvips.com';
      const token = localStorage.getItem('zenyx_token');
      const resp = await fetch(`${mainApiUrl}/api/premium-emojis/search?q=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return resp.json();
    } catch { return { emojis: [] }; }
  },
};

// 👇 SERVIÇO DAS FERRAMENTAS DE CRIATIVOS 👇
export const ferramentasService = {
  // Verificação de acesso (consulta a Zenyx via backend)
  verificarAcesso: async () => (await api.get('/api/ferramentas/jobs?limit=1')).data,

  // Envia arquivo + tipo + parâmetros para processamento
  processar: async (formData) => {
    const response = await api.post('/api/ferramentas/processar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Polling de status do job
  statusJob: async (jobId) => (await api.get(`/api/ferramentas/status/${jobId}`)).data,

  // Histórico de jobs do usuário
  listarJobs: async (limit = 20) => (await api.get(`/api/ferramentas/jobs?limit=${limit}`)).data,

  // Remove job e arquivos do disco
  deletarJob: async (jobId) => (await api.delete(`/api/ferramentas/jobs/${jobId}`)).data,
};

export default api;