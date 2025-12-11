package com.ats.service;

import com.ats.dto.ApplicationDTO;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.ApplicationStatus;
import jakarta.mail.MessagingException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Service for managing job applications
 */
public interface ApplicationService {

	/**
	 * Submit a new job application
	 *
	 * @param applicationDTO the application data
	 * @param candidateId    the ID of the candidate submitting the application
	 * @return the created application
	 */
	ApplicationDTO submitApplication(ApplicationDTO applicationDTO, Long candidateId, MultipartFile[] files);

	/**
	 * Get an application by ID
	 *
	 * @param applicationId the application ID
	 * @return the application if found
	 */
	ApplicationDTO getApplicationById(Long applicationId);

	/**
	 * Get all applications for a job with pagination
	 *
	 * @param jobId    the job ID
	 * @param pageable pagination information
	 * @return a page of applications
	 */
	Page<ApplicationDTO> getApplicationsByJobId(Long jobId, Pageable pageable);

	/**
	 * Get applications for a job filtered by status
	 *
	 * @param jobId    the job ID
	 * @param status   the application status
	 * @param pageable pagination information
	 * @return a page of applications
	 */
	Page<ApplicationDTO> getApplicationsByJobIdAndStatus(Long jobId, ApplicationStatus status, Pageable pageable);

	/**
	 * Get applications for a job with search functionality
	 *
	 * @param jobId      the job ID
	 * @param searchTerm the search term to filter by
	 * @param pageable   pagination information
	 * @return a page of applications matching the search criteria
	 */
	Page<ApplicationDTO> getApplicationsByJobIdWithSearch(Long jobId, String searchTerm, Pageable pageable);

	/**
	 * Get all applications for a candidate with pagination
	 *
	 * @param candidateId the candidate ID
	 * @param pageable    pagination information
	 * @return a page of applications
	 */
	Page<ApplicationDTO> getApplicationsByCandidateId(Long candidateId, Pageable pageable);

	/**
	 * Update an application's status
	 *
	 * @param applicationId the application ID
	 * @param newStatus     the new status
	 * @return the updated application
	 */
	ApplicationDTO updateApplicationStatus(Long applicationId, ApplicationStatus newStatus);

	/**
	 * Update an application
	 *
	 * @param applicationId  the application ID
	 * @param applicationDTO the updated application data
	 * @return the updated application
	 */
	ApplicationDTO updateApplication(Long applicationId, ApplicationDTO applicationDTO);

	/**
	 * Delete an application
	 *
	 * @param applicationId the application ID
	 * @return true if the application was deleted, false otherwise
	 */
	boolean deleteApplication(Long applicationId);

	/**
	 * Get application statistics for a job
	 *
	 * @param jobId the job ID
	 * @return a map of status to count
	 */
	Map<ApplicationStatus, Long> getApplicationStatsByJobId(Long jobId);

	/**
	 * Check if a candidate has already applied to a job
	 *
	 * @param jobId       the job ID
	 * @param candidateId the candidate ID
	 * @return true if the candidate has already applied, false otherwise
	 */
	boolean hasApplied(Long jobId, Long candidateId);

	/**
	 * Send a job offer email to a candidate with optional custom subject and content
	 * 
	 * @param applicationId the application ID
	 * @param customSubject custom email subject (optional, uses default if null)
	 * @param customContent custom email content with {{candidateName}} placeholder (optional, uses template if null)
	 * @throws NotFoundException  if the application is not found
	 * @throws MessagingException if there's an error sending the email
	 */
	void sendJobOfferEmail(Long applicationId, String customSubject, String customContent) throws MessagingException;
}
