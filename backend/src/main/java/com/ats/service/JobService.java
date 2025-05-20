package com.ats.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.ats.dto.*;
import com.ats.model.JobStatus;
import com.ats.model.WorkSetting;

import jakarta.validation.Valid;

@Service
public interface JobService {
    // Add your job service methods here
    
    public JobDTO createJob(JobDTO jobDTO);

    public JobDTO getJobById(Long id);
    public JobDTO updateJob(JobDTO jobDTO, Long id);
    public boolean deleteJob(Long id);
    public List<JobDTO> getAllJobs(List<JobStatus> jobStatuses, List<WorkSetting> workSetting, String description);
    public List<JobDTO> getActiveJobs();
    public List<JobDTO> getPastJobs();
    public List<JobDTO> searchJobs(String keyword, String filter);
}
