const API_URL = 'https://apiv2.aris-cc.com/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    check: `${API_URL}/auth/check`
  },
  employe: {
    profile: `${API_URL}/employe/profile`,
    all: `${API_URL}/employe`
  },
  pointages: {
    list: `${API_URL}/pointages`,
    stats: `${API_URL}/pointages/stats`
  },
  conges: {
    list: `${API_URL}/conges`,
    stats: `${API_URL}/conges/stats`
  },
  projets: {
    list: `${API_URL}/projets`,
    all: `${API_URL}/projets/all`
  },
  salaires: {
    list: `${API_URL}/salaires`,
    actuel: `${API_URL}/salaires/actuel`
  },
  rapports: {
    list: `${API_URL}/rapports`
  }
};

export default API_URL;
