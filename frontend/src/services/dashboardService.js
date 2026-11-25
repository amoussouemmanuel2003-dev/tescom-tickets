import api from './api';

export default {
  getStats() {
    return api.get('/dashboard/stats').then((res) => res.data);
  },
};
