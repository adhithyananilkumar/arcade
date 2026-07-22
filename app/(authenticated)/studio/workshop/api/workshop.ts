import axios from 'axios';
import { CreateWorkshopRequest, Workshop, WorkshopFormData } from '@/app/(authenticated)/studio/workshop/types';

// Assuming an existing axios instance or using raw axios with interceptors setup in the project
// If there's an api client already configured, we should use it. For now, we use a basic axios setup.
// Example: import api from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const createWorkshop = async (data: CreateWorkshopRequest): Promise<Workshop> => {
  const response = await axios.post(`${API_BASE_URL}/workshops`, data, {
    withCredentials: true // Assuming session-based or token-based auth stored in cookies
  });
  return response.data;
};
