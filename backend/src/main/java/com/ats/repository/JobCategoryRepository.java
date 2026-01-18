package com.ats.repository;

import com.ats.model.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    
    List<JobCategory> findByIsActiveTrue();
    
    List<JobCategory> findAllByOrderByNameAsc();
    
    List<JobCategory> findByIsActiveTrueOrderByNameAsc();
    
    Optional<JobCategory> findByName(String name);
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}

