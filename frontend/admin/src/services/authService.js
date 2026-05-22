import axios from "axios";

const API = "http://127.0.0.1:8000/auth";

export const loginUser = async (data) => {
  return axios.post(`${API}/login`, data);
};

export const getCurrentUser = async (token) => {
  return axios.get(`${API}/currentUser`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};