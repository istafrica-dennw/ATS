package com.ats.scheduler;

import com.ats.model.Job;
import com.ats.model.JobStatus;
import com.ats.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled task to automatically expire jobs on their expiration date
 * Runs daily at midnight to check and expire jobs
 */
@Component
public class JobExpirationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(JobExpirationScheduler.class);

    @Autowired
    private JobRepository jobRepository;

    /**
     * Expire jobs that have reached their expiration date
     * Runs daily at 00:00:00 (midnight)
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    @Transactional
    public void expireJobs() {
        logger.info("Starting job expiration check...");
        
        LocalDate today = LocalDate.now();
        List<Job> jobsToExpire = jobRepository.findJobsToExpire(today);
        
        if (jobsToExpire.isEmpty()) {
            logger.info("No jobs to expire today");
            return;
        }
        
        logger.info("Found {} job(s) to expire", jobsToExpire.size());
        
        int expiredCount = 0;
        for (Job job : jobsToExpire) {
            try {
                job.setJobStatus(JobStatus.EXPIRED);
                jobRepository.save(job);
                expiredCount++;
                logger.info("Expired job ID: {}, Title: {}, Expiration Date: {}", 
                          job.getId(), job.getTitle(), job.getExpirationDate());
            } catch (Exception e) {
                logger.error("Error expiring job ID: {}: {}", job.getId(), e.getMessage(), e);
            }
        }
        
        logger.info("Job expiration check completed. Expired {} job(s) out of {} found", 
                   expiredCount, jobsToExpire.size());
    }
}

