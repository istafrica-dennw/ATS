package com.ats.repository;

import com.ats.model.InterviewSkeleton;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSkeletonRepository extends JpaRepository<InterviewSkeleton, Long> {
    
    List<InterviewSkeleton> findByCreatedById(Long createdById);
    
    List<InterviewSkeleton> findAllByOrderByCreatedAtDesc();
} 