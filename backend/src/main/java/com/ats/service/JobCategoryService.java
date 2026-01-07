package com.ats.service;

import com.ats.dto.JobCategoryDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface JobCategoryService {
    
    JobCategoryDTO createCategory(JobCategoryDTO categoryDTO);
    
    JobCategoryDTO updateCategory(Long id, JobCategoryDTO categoryDTO);
    
    void deleteCategory(Long id);
    
    JobCategoryDTO getCategoryById(Long id);
    
    List<JobCategoryDTO> getAllCategories();
    
    List<JobCategoryDTO> getActiveCategories();
}


