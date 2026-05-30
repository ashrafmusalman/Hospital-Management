import axios from "axios";
import API_BASE_URL from "../config";

const API = `${API_BASE_URL}/auth`;

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