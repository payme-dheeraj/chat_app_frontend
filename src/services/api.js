import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Auth API
export const authAPI = {
  generateAnonymous: () => api.post('/users/generate/'),
  login: (username, password) => api.post('/users/login/', { username, password }),
  signup: (username, password, mobile_number, captcha_token) => 
    api.post('/users/signup/', { username, password, mobile_number, captcha_token }),
  getRecaptchaKey: () => api.get('/users/recaptcha-key/'),
  logout: () => api.post('/users/logout/'),
  checkAuth: () => api.get('/users/check-auth/'),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/update/', data),
  changePassword: (old_password, new_password) => 
    api.post('/users/change-password/', { old_password, new_password }),
  searchUsers: (query) => api.get(`/users/search/?q=${query}`),
};

// Posts API
export const postsAPI = {
  list: () => api.get('/posts/'),
  create: (formData) => api.post('/posts/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get: (postId) => api.get(`/posts/${postId}/`),
  delete: (postId) => api.delete(`/posts/${postId}/delete/`),
  like: (postId) => api.post(`/posts/${postId}/like/`),
  getComments: (postId) => api.get(`/posts/${postId}/comments/`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments/`, { content }),
  vote: (postId, option_id) => api.post(`/posts/${postId}/vote/`, { option_id }),
  myPosts: () => api.get('/posts/my-posts/'),
};

// Chat API
export const chatAPI = {
  listConversations: () => api.get('/chat/conversations/'),
  startConversation: (user_id) => api.post('/chat/conversations/start/', { user_id }),
  getConversation: (conversationId) => api.get(`/chat/conversations/${conversationId}/`),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/send/`, data),
};

export default api;
