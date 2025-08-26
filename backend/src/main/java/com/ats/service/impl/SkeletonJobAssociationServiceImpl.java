package com.ats.service.impl;

import com.ats.dto.SkeletonJobAssociationRequest;
import com.ats.dto.SkeletonWithJobsDTO;
import com.ats.model.*;
import com.ats.repository.*;
import com.ats.service.SkeletonJobAssociationService;
import com.ats.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkeletonJobAssociationServiceImpl implements SkeletonJobAssociationService {

    private final SkeletonJobAssociationRepository associationRepository;
    private final InterviewSkeletonRepository skeletonRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void associateSkeletonWithJobs(SkeletonJobAssociationRequest request, Long userId) {
        log.info("Associating skeleton {} with jobs {} by user {}", request.getSkeletonId(), request.getJobIds(), userId);

        // Validate skeleton exists
        InterviewSkeleton skeleton = skeletonRepository.findById(request.getSkeletonId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview skeleton not found with ID: " + request.getSkeletonId()));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Remove existing associations for this skeleton
        associationRepository.deleteBySkeletonId(request.getSkeletonId());

        // Create new associations
        for (Long jobId : request.getJobIds()) {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

            SkeletonJobAssociation association = new SkeletonJobAssociation(skeleton, job, user);
            associationRepository.save(association);
        }

        log.info("Successfully associated skeleton {} with {} jobs", request.getSkeletonId(), request.getJobIds().size());
    }

    @Override
    @Transactional
    public void removeSkeletonJobAssociation(Long skeletonId, Long jobId) {
        log.info("Removing association between skeleton {} and job {}", skeletonId, jobId);
        associationRepository.deleteBySkeletonIdAndJobId(skeletonId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkeletonWithJobsDTO> getSkeletonsWithJobs() {
        log.debug("Fetching all skeletons with their job associations");

        List<InterviewSkeleton> skeletons = skeletonRepository.findAll();
        
        return skeletons.stream().map(skeleton -> {
            // Get associated jobs for this skeleton
            List<Long> jobIds = associationRepository.findJobIdsBySkeletonId(skeleton.getId());
            List<Job> associatedJobs = jobRepository.findAllById(jobIds);

            // Map to DTO
            SkeletonWithJobsDTO dto = new SkeletonWithJobsDTO();
            dto.setId(skeleton.getId());
            dto.setName(skeleton.getName());
            dto.setDescription(skeleton.getDescription());
            dto.setCreatedAt(skeleton.getCreatedAt().atZone(java.time.ZoneId.systemDefault()));
            dto.setUpdatedAt(skeleton.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()));
            dto.setCreatedByName(skeleton.getCreatedBy().getFirstName() + " " + skeleton.getCreatedBy().getLastName());

            // Map focus areas
            List<SkeletonWithJobsDTO.FocusAreaDTO> focusAreaDTOs = skeleton.getFocusAreas().stream()
                    .map(fa -> new SkeletonWithJobsDTO.FocusAreaDTO(fa.getTitle(), fa.getDescription(), fa.getRating()))
                    .collect(Collectors.toList());
            dto.setFocusAreas(focusAreaDTOs);

            // Map associated jobs
            List<SkeletonWithJobsDTO.JobSummaryDTO> jobSummaryDTOs = associatedJobs.stream()
                    .map(job -> new SkeletonWithJobsDTO.JobSummaryDTO(job.getId(), job.getTitle(), job.getJobStatus().toString()))
                    .collect(Collectors.toList());
            dto.setAssociatedJobs(jobSummaryDTOs);

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getSkeletonIdsByJobId(Long jobId) {
        log.debug("Fetching skeleton IDs for job {}", jobId);
        return associationRepository.findSkeletonIdsByJobId(jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getJobIdsBySkeletonId(Long skeletonId) {
        log.debug("Fetching job IDs for skeleton {}", skeletonId);
        return associationRepository.findJobIdsBySkeletonId(skeletonId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getFocusAreasForJob(Long jobId) {
        log.debug("Fetching focus areas for job {}", jobId);
        
        List<Long> skeletonIds = associationRepository.findSkeletonIdsByJobId(jobId);
        List<InterviewSkeleton> skeletons = skeletonRepository.findAllById(skeletonIds);
        
        Set<String> focusAreas = new HashSet<>();
        for (InterviewSkeleton skeleton : skeletons) {
            skeleton.getFocusAreas().forEach(fa -> focusAreas.add(fa.getTitle()));
        }
        
        return focusAreas.stream().sorted().collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSkeletonAssociatedWithJob(Long skeletonId, Long jobId) {
        return associationRepository.findBySkeletonIdAndJobId(skeletonId, jobId).isPresent();
    }
}