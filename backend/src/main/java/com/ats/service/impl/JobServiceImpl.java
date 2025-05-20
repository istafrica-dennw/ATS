package com.ats.service.impl;

import org.hibernate.annotations.NotFoundAction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.ats.dto.JobDTO;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.Job;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;
import com.ats.repository.JobRepository;
import com.ats.service.JobService;
import com.ats.util.ModelMapperUtil;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ModelMapperUtil modelMapper;

    @Override
    public JobDTO createJob(JobDTO jobDTO) {
        Job job = modelMapper.map(jobDTO, Job.class);
        if (job.getJobStatus() == null){
            job.setJobStatus(JobStatus.DRAFT);
        }
        
        job = jobRepository.save(job);
        return modelMapper.map(job, JobDTO.class);
    }

    @Override
    public JobDTO getJobById(Long id) {
        Optional<Job> job = jobRepository.findById(id);
        return job.map(j -> modelMapper.map(j, JobDTO.class))
                 .orElseThrow(() -> new NotFoundException("Job not found with id: " + id));
    }



    @Override
    public JobDTO updateJob(JobDTO jobDTO, Long id) {
        Optional<Job> existingJob = jobRepository.findById(id);
        
        if (existingJob.isPresent()) {
            Job updatedJob = existingJob.get();
            updatedJob.setTitle(jobDTO.getTitle());
            updatedJob.setDescription(jobDTO.getDescription());
            updatedJob.setDepartment(jobDTO.getDepartment());
            updatedJob.setSalaryRange(jobDTO.getSalaryRange());
            updatedJob.setEmploymentType(jobDTO.getEmploymentType());
            updatedJob.setSkills(jobDTO.getSkills());
            updatedJob.setWorkSetting(jobDTO.getWorkSetting());
            updatedJob.setJobStatus(jobDTO.getJobStatus());
            Job savedJob = jobRepository.save(updatedJob);
            return modelMapper.map(savedJob, JobDTO.class);
        } else {
            throw new NotFoundException("Job not found with id: " + jobDTO.getId());
        }
    }

    @Override
    public boolean deleteJob(Long id) {
        Optional<Job> job = jobRepository.findById(id);
        if (job.isPresent()) {
            jobRepository.delete(job.get());
            return true;
        }
        return false;
    }

    @Override
    public List<JobDTO> getAllJobs(
        List<JobStatus> jobStatuses, 
        List<WorkSetting> workSettings, 
        String description
    ) {
        // Create dynamic query using Specifications
        Specification<Job> spec = Specification.where(null);

        // Add filters only if parameters are provided
        if (jobStatuses != null && !jobStatuses.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("jobStatus").in(jobStatuses));
        }

        if (workSettings != null && !workSettings.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("workSetting").in(workSettings));
        }

        if (description != null && !description.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%"));
        }

        if (description != null && !description.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), "%" + description.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%")
            ));
        }

        // Execute query and map to DTOs
        return jobRepository.findAll(spec)
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public List<JobDTO> getActiveJobs() {
        return jobRepository.findByJobStatusIn(List.of(JobStatus.PUBLISHED, JobStatus.REOPENED))
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<JobDTO> getPastJobs() {
        return jobRepository.findByJobStatusIn(List.of(JobStatus.EXPIRED, JobStatus.CLOSED))
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public List<JobDTO> searchJobs(String keyword, String filter) {
        return jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            keyword, keyword)
                .stream()
                .map(job -> modelMapper.map(job, JobDTO.class))
                .collect(Collectors.toList());
    }
}
