const AUTH_TOKEN_KEY = 'authToken';
const AUTH_ROLE_KEY = 'role';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getAuthRole = () => localStorage.getItem(AUTH_ROLE_KEY);

export const setAuthSession = ({ token, role }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_ROLE_KEY, role);
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem('currentTicket');
};

export const getAuthHeaders = (headers = {}) => {
  const token = getAuthToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`
  };
};

export const isAuthenticated = () => Boolean(getAuthToken() && getAuthRole());