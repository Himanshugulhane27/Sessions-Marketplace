const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('jwt_token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('jwt_token', token);
      } else {
        localStorage.removeItem('jwt_token');
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('jwt_token');
    }
    return this.token;
  }

  async request(path, options = {}) {
    const url = `${API_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  get(path) {
    return this.request(path);
  }

  post(path, data) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(path, data) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  put(path, data) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(path) {
    return this.request(path, {
      method: 'DELETE',
    });
  }
}

const api = new ApiClient();
export default api;
