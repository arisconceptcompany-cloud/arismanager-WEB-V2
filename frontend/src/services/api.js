import axios from 'axios';

export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&size=128';

const api = axios.create({
  baseURL: 'https://apiv2.aris-cc.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const responseCache = new Map();
const CACHE_TTL = 120000;
const NO_CACHE_PATTERNS = ['/chat/', '/notifications/', '/unread'];

function getCacheKey(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (config.method !== 'get') {
    responseCache.clear();
    return config;
  }

  if (NO_CACHE_PATTERNS.some(p => config.url.includes(p))) {
    return config;
  }

  const key = getCacheKey(config);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      ...config,
      adapter: () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: cached.headers || {},
        config,
        request: {},
        _cached: true
      })
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && !response._cached && response.status === 200) {
      if (!NO_CACHE_PATTERNS.some(p => response.config.url.includes(p))) {
        const key = getCacheKey(response.config);
        responseCache.set(key, {
          data: response.data,
          headers: response.headers,
          timestamp: Date.now()
        });
      }
    }
    return response;
  },
  error => {
    if (error.config && !error.config._retry && error.response?.status === 401) {
      error.config._retry = true;
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (matricule, mot_de_passe) => api.post('/auth/login', { matricule, mot_de_passe }),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { 
    current_password: currentPassword, 
    new_password: newPassword 
  })
};

export const employeAPI = {
  getProfile: () => api.get('/employe/profile'),
  updateProfile: (data) => api.put('/employe/profile', data),
  uploadPhoto: (photoBase64) => api.post('/employe/photo', { photo: photoBase64 }),
  deletePhoto: () => api.delete('/employe/photo')
};

export const pointageAPI = {
  getPointages: (params) => api.get('/pointages', { params }),
  addPointage: (data) => api.post('/pointages', data),
  getStats: (year, month) => api.get('/pointages/stats', { params: { year, month } }),
  deletePointage: (id) => api.delete(`/pointages/${id}`)
};

export const congeAPI = {
  getConges: () => api.get('/conges'),
  addConge: (data) => api.post('/conges', data),
  getStats: () => api.get('/conges/stats')
};

export const projetAPI = {
  getProjets: () => api.get('/projets'),
  getAllProjets: () => api.get('/projets/all'),
  getAdminProjets: () => api.get('/projets/admin'),
  getProjetById: (id) => api.get(`/projets/${id}`),
  createProjet: (data) => api.post('/projets', data),
  updateProjet: (id, data) => api.put(`/projets/${id}`, data),
  deleteProjet: (id) => api.delete(`/projets/${id}`),
  getEmployes: () => api.get('/projets/employes'),
  assignEmployes: (data) => api.post('/projets/assign', data),
  respondToProjet: (id, data) => api.post(`/projets/${id}/reponse`, data),
  getApprovations: (id) => api.get(`/projets/${id}/approbations`)
};

export const fichierAPI = {
  getFichiers: () => api.get('/fichiers'),
  uploadFichier: (formData) => api.post('/fichiers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadFichier: (id) => api.get(`/fichiers/${id}/download`, { responseType: 'blob' }),
  deleteFichier: (id) => api.delete(`/fichiers/${id}`)
};

export const salaireAPI = {
  getSalaires: () => api.get('/salaires'),
  getActuel: () => api.get('/salaires/actuel')
};

export const rapportAPI = {
  getRapports: () => api.get('/rapports'),
  createRapport: (data) => api.post('/rapports', data),
  updateRapport: (id, data) => api.put(`/rapports/${id}`, data),
  submitRapport: (id) => api.put(`/rapports/${id}/submit`)
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getOrCreateConversation: (destinaireId) => api.post('/chat/conversations', { destinaire_id: destinaireId }),
  getOrCreateGroup: (groupName) => api.post('/chat/conversations', { group_name: groupName }),
  getGroupConversation: () => api.get('/chat/conversations/group'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (data) => api.post('/chat/messages', data),
  deleteMessage: (messageId, forEveryone) => api.delete(`/chat/messages/${messageId}`, { data: { forEveryone } }),
  addReaction: (messageId, emoji) => api.post(`/chat/messages/${messageId}/reaction`, { emoji }),
  removeReaction: (messageId) => api.post(`/chat/messages/${messageId}/reaction`, { remove: true }),
  getEmployes: () => api.get('/chat/employes'),
  getUnreadCount: () => api.get('/chat/unread'),
  markAsRead: (conversationId) => api.post(`/chat/conversations/${conversationId}/read`)
};

export const photoAPI = {
  uploadPhoto: async (file, type = 'profil', employeId = null) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('type', type);
    if (employeId) formData.append('employe_id', employeId);
    
    return api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPhotoUrl: (employeId) => `https://apiv2.aris-cc.com/api/photos/employe/${employeId}`,
  getPhotoById: (id) => `https://apiv2.aris-cc.com/api/photos/${id}`,
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  getAllEmployePhotos: () => api.get('/photos/all/profil')
};

export const badgeAPI = {
  getBadgeQR: (badgeId) => api.get(`/badges/qr/${badgeId}`),
  getEmployes: () => api.get('/badges/employes')
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export default api;
