import api from './api';

export default {
  login(credentials) {
    return api.post('/auth/login', credentials).then((res) => res.data);
  },
  register(payload) {
    return api.post('/auth/register', payload).then((res) => res.data);
  },
  getMe() {
    return api.get('/auth/me').then((res) => res.data);
  },
  updateMe(payload) {
    return api.put('/auth/me', payload).then((res) => res.data);
  },
};
