import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API]', err.response?.status, err.config?.url, err.response?.data);
    return Promise.reject(err);
  }
);

export default client;