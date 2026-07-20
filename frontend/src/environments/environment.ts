export const environment = {
  get apiUrl() {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isLocal ? 'http://localhost:5001/api/v1' : 'https://attendassist.onrender.com/api/v1';
  },
  get backendUrl() {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isLocal ? 'http://localhost:5001' : 'https://attendassist.onrender.com';
  }
};