package com.ats.controller;

import com.ats.dto.JobCategoryDTO;
import com.ats.service.JobCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-categories")
@RequiredArgsConstructor
@Tag(name = "Job Categories", description = "APIs for managing job categories")
public class JobCategoryController {

    private static final Logger logger = LoggerFactory.getLogger(JobCategoryController.class);
    
    private final JobCategoryService jobCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new job category", description = "Creates a new job category in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Category created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "409", description = "Category already exists")
    })
    public ResponseEntity<JobCategoryDTO> createCategory(@Valid @RequestBody JobCategoryDTO categoryDTO) {
        logger.debug("REST request to create job category: {}", categoryDTO.getName());
        JobCategoryDTO createdCategory = jobCategoryService.createCategory(categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    @GetMapping
    @Operation(summary = "Get all job categories", description = "Retrieves all job categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    public ResponseEntity<List<JobCategoryDTO>> getAllCategories() {
        logger.debug("REST request to get all job categories");
        return ResponseEntity.ok(jobCategoryService.getAllCategories());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active job categories", description = "Retrieves only active job categories for dropdown selection")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active categories retrieved successfully")
    })
    public ResponseEntity<List<JobCategoryDTO>> getActiveCategories() {
        logger.debug("REST request to get active job categories");
        return ResponseEntity.ok(jobCategoryService.getActiveCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job category by ID", description = "Retrieves a specific job category by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category found"),
        @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<JobCategoryDTO> getCategoryById(@PathVariable Long id) {
        logger.debug("REST request to get job category with ID: {}", id);
        return ResponseEntity.ok(jobCategoryService.getCategoryById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update job category", description = "Updates an existing job category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Category updated successfully"),
        @ApiResponse(responseCode = "404", description = "Category not found"),
        @ApiResponse(responseCode = "409", description = "Category name already exists")
    })
    public ResponseEntity<JobCategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody JobCategoryDTO categoryDTO) {
        logger.debug("REST request to update job category with ID: {}", id);
        return ResponseEntity.ok(jobCategoryService.updateCategory(id, categoryDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete job category", description = "Soft deletes a job category by setting it as inactive")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        logger.debug("REST request to delete job category with ID: {}", id);
        jobCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}

