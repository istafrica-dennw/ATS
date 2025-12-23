package com.ats.service.impl;

import com.ats.dto.JobCategoryDTO;
import com.ats.exception.ResourceAlreadyExistsException;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.JobCategory;
import com.ats.repository.JobCategoryRepository;
import com.ats.service.JobCategoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCategoryServiceImpl implements JobCategoryService {

    private static final Logger logger = LoggerFactory.getLogger(JobCategoryServiceImpl.class);
    
    private final JobCategoryRepository jobCategoryRepository;

    @Override
    @Transactional
    public JobCategoryDTO createCategory(JobCategoryDTO categoryDTO) {
        logger.debug("Creating new job category: {}", categoryDTO.getName());
        
        if (jobCategoryRepository.existsByName(categoryDTO.getName())) {
            throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
        
        JobCategory category = mapToEntity(categoryDTO);
        category.setIsActive(true);
        
        JobCategory savedCategory = jobCategoryRepository.save(category);
        logger.info("Created job category with ID: {}", savedCategory.getId());
        
        return mapToDTO(savedCategory);
    }

    @Override
    @Transactional
    public JobCategoryDTO updateCategory(Long id, JobCategoryDTO categoryDTO) {
        logger.debug("Updating job category with ID: {}", id);
        
        JobCategory existingCategory = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job category not found with ID: " + id));
        
        // Check if new name conflicts with another category
        if (categoryDTO.getName() != null && 
            !categoryDTO.getName().equals(existingCategory.getName()) &&
            jobCategoryRepository.existsByNameAndIdNot(categoryDTO.getName(), id)) {
            throw new ResourceAlreadyExistsException("Category with name '" + categoryDTO.getName() + "' already exists");
        }
        
        if (categoryDTO.getName() != null) {
            existingCategory.setName(categoryDTO.getName());
        }
        if (categoryDTO.getDescription() != null) {
            existingCategory.setDescription(categoryDTO.getDescription());
        }
        if (categoryDTO.getColor() != null) {
            existingCategory.setColor(categoryDTO.getColor());
        }
        if (categoryDTO.getIsActive() != null) {
            existingCategory.setIsActive(categoryDTO.getIsActive());
        }
        
        JobCategory updatedCategory = jobCategoryRepository.save(existingCategory);
        logger.info("Updated job category with ID: {}", id);
        
        return mapToDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        logger.debug("Deleting job category with ID: {}", id);
        
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job category not found with ID: " + id));
        
        // Soft delete by setting isActive to false
        category.setIsActive(false);
        jobCategoryRepository.save(category);
        
        logger.info("Soft deleted job category with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public JobCategoryDTO getCategoryById(Long id) {
        logger.debug("Fetching job category with ID: {}", id);
        
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job category not found with ID: " + id));
        
        return mapToDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCategoryDTO> getAllCategories() {
        logger.debug("Fetching all job categories");
        
        return jobCategoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobCategoryDTO> getActiveCategories() {
        logger.debug("Fetching active job categories");
        
        return jobCategoryRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private JobCategoryDTO mapToDTO(JobCategory category) {
        return JobCategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .isActive(category.getIsActive())
                .build();
    }

    private JobCategory mapToEntity(JobCategoryDTO dto) {
        JobCategory category = new JobCategory();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setColor(dto.getColor() != null ? dto.getColor() : "#6366f1");
        category.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return category;
    }
}

