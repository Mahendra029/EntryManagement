/**
 * API Service for Guest Log System v2.1
 */

const API_URL = import.meta.env.VITE_GAS_URL || '';

const apiRequest = async (params = {}, method = 'GET', body = null) => {
  if (!API_URL) return null;
  
  // For GET requests, append parameters to URL
  const url = new URL(API_URL);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  try {
    const options = {
      method: method,
      mode: 'cors',
    };
    
    // For POST requests, send body as JSON
    if (body) {
      options.body = JSON.stringify(body);
      options.headers = {
        'Content-Type': 'text/plain;charset=utf-8' // GAS prefers text/plain for POST data
      };
    }
    
    const response = await fetch(url.toString(), options);
    return await response.json();
  } catch (err) {
    console.error('API Request failed:', err);
    throw err;
  }
};

export const guestApi = {
  // Register Guest (Photo + Name)
  register: (name, selfie) => {
    return apiRequest({}, 'POST', { action: 'register', name, selfie });
  },

  // Scan ID (Login/Logout)
  handleScan: (id) => {
    return apiRequest({}, 'POST', { action: 'handleScan', id });
  },

  // Compatibility method
  checkOut: (id) => {
    return apiRequest({}, 'POST', { action: 'checkout', id });
  },

  getInGuests: () => apiRequest({ action: 'getinguests' }),
  getStats: () => apiRequest({ action: 'getstats' }),
  getFullLogs: () => apiRequest({ action: 'getfulllogs' })
};
