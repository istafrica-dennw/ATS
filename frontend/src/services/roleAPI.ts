import axiosInstance from '../utils/axios';
import { Role } from '../types/user';

export interface RoleDTO {
  role: Role;
  displayName: string;
  isPrimary: boolean;
  isCurrent: boolean;
}

export interface SwitchRoleRequest {
  role: Role;
}

export interface AssignRolesRequest {
  userId: number;
  roles: Role[];
  primaryRole?: Role;
  assignedByUserId?: number;
}

const roleAPI = {
  getAvailableRoles: async (): Promise<RoleDTO[]> => {
    const response = await axiosInstance.get('/roles/available');
    return response.data;
  },

  getAvailableRolesForUser: async (userId: number): Promise<RoleDTO[]> => {
    const response = await axiosInstance.get(`/roles/available/${userId}`);
    return response.data;
  },

  getCurrentRole: async (): Promise<RoleDTO> => {
    const response = await axiosInstance.get('/roles/current');
    return response.data;
  },

  switchRole: async (request: SwitchRoleRequest): Promise<any> => {
    const response = await axiosInstance.post('/roles/switch', request);
    return response.data;
  },

  assignRoles: async (request: AssignRolesRequest): Promise<any> => {
    const response = await axiosInstance.post('/roles/assign', request);
    return response.data;
  },

  removeRole: async (userId: number, role: Role): Promise<void> => {
    await axiosInstance.delete(`/roles/${userId}/role/${role}`);
  },

  setPrimaryRole: async (userId: number, role: Role): Promise<any> => {
    const response = await axiosInstance.post(`/roles/${userId}/primary-role/${role}`);
    return response.data;
  },

  getUsersByRole: async (role: Role): Promise<any[]> => {
    const response = await axiosInstance.get(`/roles/users/${role}`);
    return response.data;
  },
};

export default roleAPI;