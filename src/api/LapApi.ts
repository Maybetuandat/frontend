import axios from 'axios';
import { Lab } from '../types/Lab';
import { CreateLabRequest } from '../types/CreateLabRequest';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  + '/lab';

export const labApi = {
  // Lấy danh sách labs
  getAllLabs: async (isActivate?: boolean): Promise<Lab[]> => {
    const params = isActivate !== undefined ? { isActivate } : {};
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  // Lấy lab theo ID
  getLabById: async (id: string): Promise<Lab> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Tạo lab mới
  createLab: async (lab: CreateLabRequest): Promise<Lab> => {
    const response = await axios.post(API_BASE_URL, lab);
    return response.data;
  },

  // Cập nhật lab
  updateLab: async (id: string, lab: CreateLabRequest): Promise<Lab> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, lab);
    return response.data;
  },

  // Xóa lab
  deleteLab: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Toggle trạng thái lab
  toggleLabStatus: async (id: string): Promise<Lab> => {
    const response = await axios.put(`${API_BASE_URL}/${id}/toggle-status`);
    return response.data.lab;
  }
};