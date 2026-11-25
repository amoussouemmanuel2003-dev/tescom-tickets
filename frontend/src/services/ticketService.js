import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/tickets', { params }).then((res) => res.data);
  },
  getById(id) {
    return api.get(`/tickets/${id}`).then((res) => res.data);
  },
  create(payload) {
    return api.post('/tickets', payload).then((res) => res.data);
  },
  update(id, payload) {
    return api.put(`/tickets/${id}`, payload).then((res) => res.data);
  },
  assign(id, payload) {
    return api.put(`/tickets/${id}/assign`, payload).then((res) => res.data);
  },
  changeStatus(id, payload) {
    return api.put(`/tickets/${id}/status`, payload).then((res) => res.data);
  },
  close(id, payload = {}) {
    return api.put(`/tickets/${id}/close`, payload).then((res) => res.data);
  },
  getMessages(ticketId) {
    return api.get(`/tickets/${ticketId}/messages`).then((res) => res.data);
  },
  createMessage(ticketId, payload) {
    return api.post(`/tickets/${ticketId}/messages`, payload).then((res) => res.data);
  },
  getHistory(ticketId) {
    return api.get(`/tickets/${ticketId}/historique`).then((res) => res.data);
  },
};
