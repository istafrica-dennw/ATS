import axiosInstance from "../utils/axios";

export interface JobCategoryDTO {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface CreateJobCategoryDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateJobCategoryDTO {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export const jobCategoryService = {
  // Get all categories (including inactive)
  getAllCategories: async (): Promise<JobCategoryDTO[]> => {
    const response = await axiosInstance.get("/job-categories");
    return response.data;
  },

  // Get only active categories (for dropdowns)
  getActiveCategories: async (): Promise<JobCategoryDTO[]> => {
    const response = await axiosInstance.get("/job-categories/active");
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<JobCategoryDTO> => {
    const response = await axiosInstance.get(`/job-categories/${id}`);
    return response.data;
  },

  // Create a new category
  createCategory: async (
    category: CreateJobCategoryDTO
  ): Promise<JobCategoryDTO> => {
    const response = await axiosInstance.post("/job-categories", category);
    return response.data;
  },

  // Update a category
  updateCategory: async (
    id: number,
    category: UpdateJobCategoryDTO
  ): Promise<JobCategoryDTO> => {
    const response = await axiosInstance.put(`/job-categories/${id}`, category);
    return response.data;
  },

  // Delete (soft delete) a category
  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/job-categories/${id}`);
  },
};

export default jobCategoryService;

