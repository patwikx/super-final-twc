// lib/axios.ts
import axios from 'axios';

/**
 * A pre-configured instance of Axios for making API requests.
 * The baseURL is set to '/api', so all requests will be prefixed with this path.
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
