package com.ats.service.impl;

import com.ats.dto.CreateInterviewSkeletonRequest;
import com.ats.dto.InterviewSkeletonDTO;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.InterviewSkeleton;
import com.ats.model.Job;
import com.ats.model.User;
import com.ats.repository.InterviewRepository;
import com.ats.repository.InterviewSkeletonRepository;
import com.ats.repository.JobRepository;
import com.ats.repository.UserRepository;
import com.ats.service.InterviewSkeletonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class InterviewSkeletonServiceImpl implements InterviewSkeletonService {

    private final InterviewSkeletonRepository interviewSkeletonRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;

    @Autowired
    public InterviewSkeletonServiceImpl(
            InterviewSkeletonRepository interviewSkeletonRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            InterviewRepository interviewRepository) {
        this.interviewSkeletonRepository = interviewSkeletonRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.interviewRepository = interviewRepository;
    }

    @Override
    public InterviewSkeletonDTO createSkeleton(CreateInterviewSkeletonRequest request, Long createdById) {
        log.info("Creating interview skeleton for job {} by user {}", request.getJobId(), createdById);

        // Validate job exists
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));

        // Validate creator exists
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + createdById));

        // Convert request to entity
        InterviewSkeleton skeleton = new InterviewSkeleton();
        skeleton.setJob(job);
        skeleton.setName(request.getName());
        skeleton.setDescription(request.getDescription());
        skeleton.setCreatedBy(creator);

        // Convert focus areas
        List<InterviewSkeleton.FocusArea> focusAreas = request.getFocusAreas().stream()
                .map(fa -> new InterviewSkeleton.FocusArea(fa.getTitle(), fa.getDescription(), 0.0))
                .collect(Collectors.toList());
        skeleton.setFocusAreas(focusAreas);

        // Save and return DTO
        InterviewSkeleton savedSkeleton = interviewSkeletonRepository.save(skeleton);
        log.info("Interview skeleton created with ID: {}", savedSkeleton.getId());

        return mapToDTO(savedSkeleton);
    }

    @Override
    public InterviewSkeletonDTO updateSkeleton(Long skeletonId, CreateInterviewSkeletonRequest request, Long updatedById) {
        log.info("Updating interview skeleton {} by user {}", skeletonId, updatedById);

        // Validate skeleton exists
        InterviewSkeleton skeleton = interviewSkeletonRepository.findById(skeletonId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview skeleton not found with ID: " + skeletonId));

        // Validate job exists (if changed)
        if (!skeleton.getJob().getId().equals(request.getJobId())) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));
            skeleton.setJob(job);
        }

        // Update fields
        skeleton.setName(request.getName());
        skeleton.setDescription(request.getDescription());

        // Update focus areas
        List<InterviewSkeleton.FocusArea> focusAreas = request.getFocusAreas().stream()
                .map(fa -> new InterviewSkeleton.FocusArea(fa.getTitle(), fa.getDescription(), 0.0))
                .collect(Collectors.toList());
        skeleton.setFocusAreas(focusAreas);

        // Save and return DTO
        InterviewSkeleton updatedSkeleton = interviewSkeletonRepository.save(skeleton);
        log.info("Interview skeleton {} updated successfully", skeletonId);

        return mapToDTO(updatedSkeleton);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InterviewSkeletonDTO> getSkeletonById(Long skeletonId) {
        log.debug("Fetching interview skeleton with ID: {}", skeletonId);
        return interviewSkeletonRepository.findById(skeletonId)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSkeletonDTO> getSkeletonsByJobId(Long jobId) {
        log.debug("Fetching interview skeletons for job ID: {}", jobId);
        return interviewSkeletonRepository.findByJobIdOrderByCreatedAtDesc(jobId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSkeletonDTO> getSkeletonsByCreatedBy(Long createdById) {
        log.debug("Fetching interview skeletons created by user ID: {}", createdById);
        return interviewSkeletonRepository.findByCreatedById(createdById).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSkeleton(Long skeletonId) {
        log.info("Deleting interview skeleton with ID: {}", skeletonId);

        // Check if skeleton exists
        InterviewSkeleton skeleton = interviewSkeletonRepository.findById(skeletonId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview skeleton not found with ID: " + skeletonId));

        // Check if any interviews are using this skeleton
        List<com.ats.model.Interview> interviews = interviewRepository.findBySkeletonId(skeletonId);
        if (!interviews.isEmpty()) {
            throw new IllegalStateException("Cannot delete interview skeleton: " + interviews.size() + " interviews are using it");
        }

        // Delete the skeleton
        interviewSkeletonRepository.delete(skeleton);
        log.info("Interview skeleton {} deleted successfully", skeletonId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSkeletonDTO> getAllSkeletons() {
        log.debug("Fetching all interview skeletons");
        return interviewSkeletonRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private InterviewSkeletonDTO mapToDTO(InterviewSkeleton skeleton) {
        InterviewSkeletonDTO dto = new InterviewSkeletonDTO();
        dto.setId(skeleton.getId());
        dto.setJobId(skeleton.getJob().getId());
        dto.setJobTitle(skeleton.getJob().getTitle());
        dto.setName(skeleton.getName());
        dto.setDescription(skeleton.getDescription());
        dto.setCreatedById(skeleton.getCreatedBy().getId());
        dto.setCreatedByName(skeleton.getCreatedBy().getFirstName() + " " + skeleton.getCreatedBy().getLastName());
        dto.setCreatedAt(skeleton.getCreatedAt().atZone(java.time.ZoneId.systemDefault()));
        dto.setUpdatedAt(skeleton.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()));

        // Map focus areas
        List<InterviewSkeletonDTO.FocusAreaDTO> focusAreaDTOs = skeleton.getFocusAreas().stream()
                .map(fa -> new InterviewSkeletonDTO.FocusAreaDTO(fa.getTitle(), fa.getDescription()))
                .collect(Collectors.toList());
        dto.setFocusAreas(focusAreaDTOs);

        return dto;
    }
} 