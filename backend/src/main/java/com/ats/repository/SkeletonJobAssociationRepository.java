package com.ats.repository;

import com.ats.model.SkeletonJobAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkeletonJobAssociationRepository extends JpaRepository<SkeletonJobAssociation, Long> {
    
    /**
     * Find all skeletons associated with a specific job
     */
    @Query("SELECT sja.skeleton.id FROM SkeletonJobAssociation sja WHERE sja.job.id = :jobId")
    List<Long> findSkeletonIdsByJobId(@Param("jobId") Long jobId);
    
    /**
     * Find all jobs associated with a specific skeleton
     */
    @Query("SELECT sja.job.id FROM SkeletonJobAssociation sja WHERE sja.skeleton.id = :skeletonId")
    List<Long> findJobIdsBySkeletonId(@Param("skeletonId") Long skeletonId);
    
    /**
     * Check if a skeleton is associated with a job
     */
    @Query("SELECT sja FROM SkeletonJobAssociation sja WHERE sja.skeleton.id = :skeletonId AND sja.job.id = :jobId")
    Optional<SkeletonJobAssociation> findBySkeletonIdAndJobId(@Param("skeletonId") Long skeletonId, @Param("jobId") Long jobId);
    
    /**
     * Find all associations for a specific skeleton
     */
    List<SkeletonJobAssociation> findBySkeletonId(Long skeletonId);
    
    /**
     * Find all associations for a specific job
     */
    List<SkeletonJobAssociation> findByJobId(Long jobId);
    
    /**
     * Delete association by skeleton and job IDs
     */
    void deleteBySkeletonIdAndJobId(Long skeletonId, Long jobId);
    
    /**
     * Delete all associations for a skeleton
     */
    void deleteBySkeletonId(Long skeletonId);
    
    /**
     * Delete all associations for a job
     */
    void deleteByJobId(Long jobId);
}