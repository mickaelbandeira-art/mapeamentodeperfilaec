const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('aec_auth_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('aec_auth_token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  
  setToken: (token: string) => {
    localStorage.setItem('aec_auth_token', token);
  },
  
  clearToken: () => {
    localStorage.removeItem('aec_auth_token');
  }
};
