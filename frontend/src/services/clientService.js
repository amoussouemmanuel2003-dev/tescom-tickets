import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/clients', { params }).then((res) => res.data);
  },
  getById(id) {
    return api.get(`/clients/${id}`).then((res) => res.data);
  },
  create(payload) {
    return api.post('/clients', payload).then((res) => res.data);
  },
  update(id, payload) {
    return api.put(`/clients/${id}`, payload).then((res) => res.data);
  },
  updateStatus(id, actif) {
    return api.put(`/clients/${id}/status`, { actif }).then((res) => res.data);
  },
};
