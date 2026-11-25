import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/users', { params }).then((res) => res.data);
  },
  getTechniciens() {
    return api.get('/users/techniciens').then((res) => res.data);
  },
  getById(id) {
    return api.get(`/users/${id}`).then((res) => res.data);
  },
  create(payload) {
    return api.post('/users', payload).then((res) => res.data);
  },
  update(id, payload) {
    return api.put(`/users/${id}`, payload).then((res) => res.data);
  },
  updateStatus(id, actif) {
    return api.put(`/users/${id}/status`, { actif }).then((res) => res.data);
  },
};
