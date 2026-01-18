import api from "./api";

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export const jobCategoryService = {
  // Get only active categories (for public display)
  getActiveCategories: async (): Promise<JobCategory[]> => {
    const response = await api.get("/job-categories/active");
    return response.data;
  },
};

export default jobCategoryService;
