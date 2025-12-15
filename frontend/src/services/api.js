import axios from 'axios';

/**
 * API Service
 * Centralized API client with authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ===== AUTH API =====

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ===== PROJECT API =====

export const projectAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    getPapers: (id) => api.get(`/projects/${id}/papers`),
};

// ===== PAPER API =====

export const paperAPI = {
    upload: (formData) => api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    addByDOI: (data) => api.post('/papers/add-by-doi', data),
    getOne: (id) => api.get(`/papers/${id}`),
    delete: (id) => api.delete(`/papers/${id}`),
};

// ===== ANALYSIS API =====

export const analysisAPI = {
    getSummaries: (paperId, mode = 'tldr') =>
        api.get(`/papers/${paperId}/summaries?mode=${mode}`),

    getReview: (paperId, domain = 'computer science') =>
        api.post(`/papers/${paperId}/review`, { domain }),

    compare: (paperIds) =>
        api.post('/compare', { paperIds }),

    search: (query, projectId, topK = 5) =>
        api.post('/search', { query, projectId, topK }),

    ask: (question, projectId, paperId = null) =>
        api.post('/ask', { question, projectId, paperId }),

    getConceptGraph: (paperId) =>
        api.get(`/papers/${paperId}/concept-graph`),

    getNoveltyRadar: (projectId) =>
        api.get(`/projects/${projectId}/novelty-radar`),

    checkNoveltyWeb: (projectId, paperId) =>
        api.post(`/projects/${projectId}/novelty/web`, { paperId }),

    checkNoveltyPair: (projectId, paperIds) =>
        api.post(`/projects/${projectId}/novelty/pair`, { paperIds }),

    suggestExperiments: (paperId, userIdea) =>
        api.post(`/papers/${paperId}/suggest-experiments`, { userIdea }),

    getReadingPath: (projectId, topic, level = 'intermediate') =>
        api.post('/reading-path', { projectId, topic, level }),

    checkCitations: (text, paperIds) =>
        api.post('/citation-check', { text, paperIds }),

    getResourcesSummary: (paperId) =>
        api.get(`/papers/${paperId}/resources-summary`),

    getMindMap: (paperId) =>
        api.get(`/papers/${paperId}/mind-map`),

    checkEthics: (paperId, mode = 'detailed') =>
        api.post(`/papers/${paperId}/ethics-check?mode=${mode}`),

    compareVersions: (oldPaperId, newPaperId) =>
        api.post('/compare-versions', { oldPaperId, newPaperId }),
};

// ===== NOTES API =====

export const notesAPI = {
    getAll: (paperId) => api.get(`/papers/${paperId}/notes`),
    create: (paperId, data) => api.post(`/papers/${paperId}/notes`, data),
    update: (noteId, data) => api.put(`/notes/${noteId}`, data),
    delete: (noteId) => api.delete(`/notes/${noteId}`),
    generateAI: (paperId, data) => api.post(`/papers/${paperId}/ai-notes`, data),
};

export const plagiarismAPI = {
    checkWeb: (text) => api.post('/plagiarism/check-web', { text }),
    checkInternal: (text, projectId) => api.post('/plagiarism/check-internal', { text, projectId }),
    checkFile: (formData) => api.post('/plagiarism/check-file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    checkHumanism: (data) => api.post('/plagiarism/check-humanism', data),
};

export default api;
