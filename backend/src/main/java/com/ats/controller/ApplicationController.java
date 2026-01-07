package com.ats.controller;

import com.ats.dto.ApplicationDTO;
import com.ats.dto.JobOfferEmailRequest;
import com.ats.exception.AtsCustomExceptions.BadRequestException;
import com.ats.exception.AtsCustomExceptions.NotFoundException;
import com.ats.model.ApplicationStatus;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.service.ApplicationService;
import com.ats.service.FileStorageService;
import com.ats.service.JobCustomQuestionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "APIs for managing job applications")
@Slf4j
public class ApplicationController {

	private final ApplicationService applicationService;
	private final JobCustomQuestionService jobCustomQuestionService;
	private final FileStorageService fileStorageService;
	private final ObjectMapper objectMapper;
	private final UserRepository userRepository;

	@Autowired
	public ApplicationController(ApplicationService applicationService,
			JobCustomQuestionService jobCustomQuestionService, FileStorageService fileStorageService,
			ObjectMapper objectMapper, UserRepository userRepository) {
		this.applicationService = applicationService;
		this.jobCustomQuestionService = jobCustomQuestionService;
		this.fileStorageService = fileStorageService;
		this.objectMapper = objectMapper;
		this.userRepository = userRepository;
	}

	@Operation(summary = "Submit a job application", description = "Submit a new job application with answers to custom questions")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Application submitted successfully", content = @Content(schema = @Schema(implementation = ApplicationDTO.class))),
			@ApiResponse(responseCode = "400", description = "Invalid input data or missing required questions"),
			@ApiResponse(responseCode = "404", description = "Job not found"),
			@ApiResponse(responseCode = "409", description = "Already applied to this job"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@PostMapping(consumes = { "multipart/form-data" })
	public ResponseEntity<?> submitApplication(@Valid @RequestPart("applicationDTO") ApplicationDTO applicationDTO,
			@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart(value = "files", required = false) MultipartFile[] files) {

		try {
			// Extract the user ID from the authenticated user
			// In a real implementation, you would extract the user ID from UserDetails
			// For now, we'll use a placeholder that would be replaced with actual code
			Long candidateId = extractUserIdFromUserDetails(userDetails);

			ApplicationDTO submittedApplication = applicationService.submitApplication(applicationDTO, candidateId,
					files);
			log.info("Application submitted successfully with ID: {}", submittedApplication.getId());

			return new ResponseEntity<>(submittedApplication, HttpStatus.CREATED);

		} catch (BadRequestException e) {
			log.warn("Bad request when submitting application: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

		} catch (NotFoundException e) {
			log.warn("Resource not found when submitting application: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error submitting application", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while submitting the application", e);
		}
	}

	@Operation(summary = "Check application status", description = "Check if the authenticated user has already applied to a specific job")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns application status"),
			@ApiResponse(responseCode = "404", description = "Job not found"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/check-status/{jobId}")
	public ResponseEntity<?> checkApplicationStatus(@PathVariable Long jobId,
			@AuthenticationPrincipal UserDetails userDetails) {

		try {
			Long candidateId = extractUserIdFromUserDetails(userDetails);
			boolean hasApplied = applicationService.hasApplied(jobId, candidateId);

			Map<String, Object> response = new HashMap<>();
			response.put("hasApplied", hasApplied);

			return ResponseEntity.ok(response);

		} catch (NotFoundException e) {
			log.warn("Resource not found when checking application status: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error checking application status", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while checking application status", e);
		}
	}

	@Operation(summary = "Get candidate's applications", description = "Get all applications submitted by the authenticated user")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns paginated list of applications"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/my-applications")
	public ResponseEntity<Page<ApplicationDTO>> getMyApplications(@PageableDefault(size = 10) Pageable pageable,
			@AuthenticationPrincipal UserDetails userDetails) {

		try {
			Long candidateId = extractUserIdFromUserDetails(userDetails);
			Page<ApplicationDTO> applications = applicationService.getApplicationsByCandidateId(candidateId, pageable);

			return ResponseEntity.ok(applications);

		} catch (Exception e) {
			log.error("Error getting applications for candidate", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while retrieving applications", e);
		}
	}

	@Operation(summary = "Get application by ID", description = "Get details of a specific application by ID")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns application details"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized to view this application"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/{id}")
	public ResponseEntity<?> getApplicationById(@PathVariable("id") Long applicationId,
			@AuthenticationPrincipal UserDetails userDetails) {

		try {
			ApplicationDTO application = applicationService.getApplicationById(applicationId);

			// Check if the user is authorized to view this application
			// Either the user is the candidate who submitted the application or an admin
			Long userId = extractUserIdFromUserDetails(userDetails);
			boolean isAdmin = userDetails.getAuthorities().stream()
					.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

			if (!isAdmin && !application.getCandidateId().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("error", "You are not authorized to view this application"));
			}

			return ResponseEntity.ok(application);

		} catch (NotFoundException e) {
			log.warn("Application not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error getting application by ID", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while retrieving the application", e);
		}
	}

	@Operation(summary = "Get applications for a job", description = "Get all applications for a specific job (admin only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns paginated list of applications"),
			@ApiResponse(responseCode = "404", description = "Job not found"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/job/{jobId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> getApplicationsByJobId(@PathVariable Long jobId,
			@RequestParam(required = false) ApplicationStatus status,
			@RequestParam(required = false) String search,
			@PageableDefault(size = 10) Pageable pageable) {

		try {
			Page<ApplicationDTO> applications;

			if (search != null && !search.trim().isEmpty()) {
				// Use search functionality
				applications = applicationService.getApplicationsByJobIdWithSearch(jobId, search, pageable);
			} else if (status != null) {
				applications = applicationService.getApplicationsByJobIdAndStatus(jobId, status, pageable);
			} else {
				applications = applicationService.getApplicationsByJobId(jobId, pageable);
			}

			return ResponseEntity.ok(applications);

		} catch (NotFoundException e) {
			log.warn("Job not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error getting applications for job", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while retrieving applications", e);
		}
	}

	@Operation(summary = "Get applications by user ID", description = "Get all applications for a specific user (admin only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns paginated list of applications"),
			@ApiResponse(responseCode = "404", description = "User not found"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/user/{userId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> getApplicationsByUserId(@PathVariable Long userId,
			@PageableDefault(size = 10) Pageable pageable) {

		try {
			Page<ApplicationDTO> applications = applicationService.getApplicationsByCandidateId(userId, pageable);
			return ResponseEntity.ok(applications);

		} catch (NotFoundException e) {
			log.warn("User not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error getting applications for user", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while retrieving applications", e);
		}
	}

	@Operation(summary = "Update application status", description = "Update the status of an application (admin only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Status updated successfully"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "400", description = "Invalid status"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@PatchMapping("/{id}/status")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> updateApplicationStatus(@PathVariable("id") Long applicationId,
			@RequestBody Map<String, String> statusUpdate) {

		try {
			if (!statusUpdate.containsKey("status")) {
				return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
			}

			String statusStr = statusUpdate.get("status");
			ApplicationStatus newStatus;

			try {
				newStatus = ApplicationStatus.valueOf(statusStr.toUpperCase());
			} catch (IllegalArgumentException e) {
				return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value: " + statusStr));
			}

			ApplicationDTO updatedApplication = applicationService.updateApplicationStatus(applicationId, newStatus);
			return ResponseEntity.ok(updatedApplication);

		} catch (NotFoundException e) {
			log.warn("Application not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error updating application status", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while updating application status", e);
		}
	}

	@Operation(summary = "Get job application statistics", description = "Get statistics about applications for a specific job (admin only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Returns application statistics"),
			@ApiResponse(responseCode = "404", description = "Job not found"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@GetMapping("/stats/job/{jobId}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> getApplicationStatsByJobId(@PathVariable Long jobId) {
		try {
			Map<ApplicationStatus, Long> stats = applicationService.getApplicationStatsByJobId(jobId);
			return ResponseEntity.ok(stats);

		} catch (NotFoundException e) {
			log.warn("Job not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error getting application statistics", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while retrieving application statistics", e);
		}
	}

	@Operation(summary = "Delete an application", description = "Delete an application (can be done by the candidate who submitted it or an admin)")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "Application deleted successfully"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized to delete this application"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteApplication(@PathVariable("id") Long applicationId,
			@AuthenticationPrincipal UserDetails userDetails) {

		try {
			ApplicationDTO application = applicationService.getApplicationById(applicationId);

			// Check if the user is authorized to delete this application
			// Either the user is the candidate who submitted the application or an admin
			Long userId = extractUserIdFromUserDetails(userDetails);
			boolean isAdmin = userDetails.getAuthorities().stream()
					.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

			if (!isAdmin && !application.getCandidateId().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("error", "You are not authorized to delete this application"));
			}

			boolean deleted = applicationService.deleteApplication(applicationId);

			if (deleted) {
				return ResponseEntity.noContent().build();
			} else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.body(Map.of("error", "Failed to delete application"));
			}

		} catch (NotFoundException e) {
			log.warn("Application not found: {}", e.getMessage());
			Map<String, String> response = new HashMap<>();
			response.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			log.error("Error deleting application", e);
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"An error occurred while deleting the application", e);
		}
	}

	@Operation(summary = "Send job offer email", description = "Send a job offer email to a candidate (admin only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Email sent successfully"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "400", description = "Invalid request or application not in OFFERED status"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@PostMapping("/{id}/send-offer-email")
	@PreAuthorize("hasRole('ADMIN')")
<<<<<<< HEAD
	public ResponseEntity<?> sendJobOfferEmail(
			@PathVariable("id") Long applicationId,
			@RequestBody(required = false) Map<String, String> emailContent) {
		try {
			String customSubject = emailContent != null ? emailContent.get("subject") : null;
			String customContent = emailContent != null ? emailContent.get("content") : null;
			
			applicationService.sendJobOfferEmail(applicationId, customSubject, customContent);
=======
	public ResponseEntity<?> sendJobOfferEmail(@PathVariable("id") Long applicationId) {
		try {
			applicationService.sendJobOfferEmail(applicationId);
>>>>>>> 48314e32 (Add project files without large video)
			return ResponseEntity.ok().build();
		} catch (MessagingException e) {
			log.error("Failed to send job offer email for application ID: {}: {}", applicationId, e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to send job offer email: " + e.getMessage());
		}
	}

	@Operation(summary = "Respond to job offer", description = "Accept or reject a job offer (candidate only)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Offer response processed successfully"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "400", description = "Invalid request or application not in OFFERED status"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@PostMapping("/{id}/respond-offer")
	public ResponseEntity<?> respondToJobOffer(@PathVariable("id") Long applicationId,
			@RequestBody Map<String, String> response, @AuthenticationPrincipal UserDetails userDetails) {

		try {
			// Extract user ID from UserDetails
			Long userId = extractUserIdFromUserDetails(userDetails);

			// Get the application
			ApplicationDTO application = applicationService.getApplicationById(applicationId);

			// Verify the user is the candidate
			if (!application.getCandidateId().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body("You are not authorized to respond to this offer");
			}

			// Verify the application is in OFFERED status
			if (application.getStatus() != ApplicationStatus.OFFERED) {
				return ResponseEntity.badRequest().body("Can only respond to applications in OFFERED status");
			}

			// Process the response
			String action = response.get("action");
			if (action == null || (!action.equals("ACCEPT") && !action.equals("REJECT"))) {
				return ResponseEntity.badRequest().body("Invalid action. Must be either 'ACCEPT' or 'REJECT'");
			}

			// Update application status based on response
			ApplicationStatus newStatus = action.equals("ACCEPT") ? ApplicationStatus.OFFER_ACCEPTED
					: ApplicationStatus.OFFER_REJECTED;

			applicationService.updateApplicationStatus(applicationId, newStatus);

			return ResponseEntity.ok(Map.of("message", "Offer response processed successfully", "status", newStatus));

		} catch (NotFoundException e) {
			log.warn("Application not found: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			log.error("Error processing offer response", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "An error occurred while processing the offer response"));
		}
	}

	@Operation(summary = "Withdraw application", description = "Withdraw an application (candidate only - can only set status to WITHDRAWN)")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Application withdrawn successfully"),
			@ApiResponse(responseCode = "404", description = "Application not found"),
			@ApiResponse(responseCode = "400", description = "Invalid request - application may already be withdrawn or in a final state"),
			@ApiResponse(responseCode = "403", description = "Forbidden - not authorized"),
			@ApiResponse(responseCode = "500", description = "Internal server error") })
	@PatchMapping("/{id}/withdraw")
	public ResponseEntity<?> withdrawApplication(@PathVariable("id") Long applicationId,
			@AuthenticationPrincipal UserDetails userDetails) {

		try {
			// Extract user ID from UserDetails
			Long userId = extractUserIdFromUserDetails(userDetails);

			// Get the application
			ApplicationDTO application = applicationService.getApplicationById(applicationId);

			// Verify the user is the candidate
			if (!application.getCandidateId().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("error", "You are not authorized to withdraw this application"));
			}

			// Check if application is already withdrawn
			if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
				return ResponseEntity.badRequest()
						.body(Map.of("error", "Application is already withdrawn"));
			}

			// Check if application is in a final state that cannot be withdrawn
			if (application.getStatus() == ApplicationStatus.OFFER_ACCEPTED
					|| application.getStatus() == ApplicationStatus.ACCEPTED) {
				return ResponseEntity.badRequest()
						.body(Map.of("error", "Cannot withdraw an application that has been accepted"));
			}

			// Update application status to WITHDRAWN
			ApplicationDTO updatedApplication = applicationService.updateApplicationStatus(applicationId,
					ApplicationStatus.WITHDRAWN);

			log.info("Application {} withdrawn by candidate {}", applicationId, userId);

			return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully", "application",
					updatedApplication));

		} catch (NotFoundException e) {
			log.warn("Application not found: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			log.error("Error withdrawing application", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "An error occurred while withdrawing the application"));
		}
	}

	/**
	 * Extract user ID from the UserDetails object
	 * 
	 * @param userDetails the authenticated user details
	 * @return the user ID
	 */
	private Long extractUserIdFromUserDetails(UserDetails userDetails) {
		// Get the email from UserDetails (which is used as the username)
		String email = userDetails.getUsername();

		// Find the user by email and return their ID
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found with email: " + email));

		return user.getId();
	}
}
