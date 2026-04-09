// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

const API = {
  // Orders endpoints
  orders: `${API_BASE_URL}/orders`,
  ordersBulk: `${API_BASE_URL}/orders/bulk`,
  
  // Customers endpoints
  customers: `${API_BASE_URL}/customers`,
  customersBulk: `${API_BASE_URL}/customers/bulk`,
  
  // Tasks endpoints
  tasks: `${API_BASE_URL}/tasks`,
  
  // Events endpoints
  events: `${API_BASE_URL}/events`,
  
  // Preferences endpoints
  preferences: `${API_BASE_URL}/preferences`,
};

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    console.warn('Backend authentication is unavailable. Continuing in local dashboard mode.');
  }
  
  return response;
};
