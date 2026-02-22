import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const uploadResume = (formData) => API.post('/resume/upload', formData);
export const getMyResume  = ()         => API.get('/resume/my');
export const getAllJobs   = ()         => API.get('/jobs');
export const postJob      = (data)     => API.post('/jobs', data);
export const deleteJob    = (id)       => API.delete(`/jobs/${id}`);