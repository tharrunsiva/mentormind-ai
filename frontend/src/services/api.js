import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mentormind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized status
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('mentormind_token');
        localStorage.removeItem('mentormind_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadResume: (formData) => api.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  confirmResume: (data) => api.post('/profile/resume/confirm', data),
};

// Skills API
export const skillsAPI = {
  getAllSkills: (params) => api.get('/skills', { params }),
  updateMySkill: (data) => api.post('/skills/my-skills', data),
  createSkill: (data) => api.post('/skills', data),
};

// Careers API
export const careersAPI = {
  getAllCareers: (params) => api.get('/careers', { params }),
  getCareerBySlug: (slug) => api.get(`/careers/${slug}`),
  compareCareers: (slug1, slug2) => api.post('/careers/compare', { careerSlug1: slug1, careerSlug2: slug2 }),
  setTargetCareer: (careerSlug) => api.post('/careers/set-target', { careerSlug }),
};

// Assessment API
export const assessmentAPI = {
  getAssessments: () => api.get('/assessments'),
  getAssessmentForSkill: (skillName) => api.get(`/assessments/skill/${encodeURIComponent(skillName)}`),
  submitAssessment: (data) => api.post('/assessments/submit', data),
  getMyResults: () => api.get('/assessments/results/my'),
};

// Skill Gap API
export const skillGapAPI = {
  getSkillGapReport: () => api.get('/skill-gap'),
};

// Roadmap API
export const roadmapAPI = {
  getRoadmap: () => api.get('/roadmap'),
  generateRoadmap: () => api.post('/roadmap/generate'),
  updateTaskStatus: (taskId, status) => api.put(`/roadmap/tasks/${taskId}`, { status }),
};

// Resources API
export const resourcesAPI = {
  getResources: (params) => api.get('/resources', { params }),
  toggleBookmark: (id) => api.post(`/resources/${id}/bookmark`),
  getMyBookmarks: () => api.get('/resources/bookmarks/my'),
};

// AI Mentor API
export const mentorAPI = {
  getConversations: () => api.get('/mentor/conversations'),
  getMessages: (conversationId) => api.get(`/mentor/conversations/${conversationId}/messages`),
  sendMessage: (data) => api.post('/mentor/chat', data),
};

// Peers API
export const peersAPI = {
  getRecommendations: () => api.get('/peers/recommendations'),
  sendConnectRequest: (userId, compatibilityScore) => api.post(`/peers/connect/${userId}`, { compatibilityScore }),
  respondRequest: (connectionId, status) => api.put(`/peers/requests/${connectionId}`, { status }),
  getMyConnections: () => api.get('/peers/connections'),
  getStudyGroups: () => api.get('/peers/study-groups'),
  joinStudyGroup: (groupId) => api.post(`/peers/study-groups/${groupId}/join`),
  createStudyGroup: (data) => api.post('/peers/study-groups', data),
};

// Mock Interviews API
export const interviewAPI = {
  startInterview: (data) => api.post('/interviews/start', data),
  getInterview: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/answer`, data),
  getMyInterviews: () => api.get('/interviews/history/my'),
};

// Analytics API
export const analyticsAPI = {
  getProgressAnalytics: (range) => api.get('/analytics', { params: { range } }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getLearners: (params) => api.get('/admin/learners', { params }),
  getSystemHealth: () => api.get('/admin/system-health'),
};

// Notifications API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};
