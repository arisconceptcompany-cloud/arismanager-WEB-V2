import axios from 'axios';

export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&size=128';

const api = axios.create({
  baseURL: 'https://apiv2.aris-cc.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
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
  checkAuth: () => api.get('/auth/check')
};

export const employeAPI = {
  getProfile: () => api.get('/employe/profile'),
  updateProfile: (data) => api.put('/employe/profile', data),
  uploadPhoto: (photoBase64) => api.post('/employe/photo', { photo: photoBase64 })
};

export const pointageAPI = {
  getPointages: (params) => api.get('/pointages', { params }),
  addPointage: (data) => api.post('/pointages', data),
  getStats: (year) => api.get('/pointages/stats', { params: { year } })
};

export const congeAPI = {
  getConges: () => api.get('/conges'),
  addConge: (data) => api.post('/conges', data),
  getStats: () => api.get('/conges/stats')
};

export const projetAPI = {
  getProjets: () => api.get('/projets'),
  getAllProjets: () => api.get('/projets/all'),
  getProjetById: (id) => api.get(`/projets/${id}`)
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
