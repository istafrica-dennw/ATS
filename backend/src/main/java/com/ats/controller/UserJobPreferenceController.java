package com.ats.controller;

import com.ats.dto.UserJobPreferenceDTO;
import com.ats.service.UserJobPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-job-preferences")
@RequiredArgsConstructor
@Tag(name = "User Job Preferences", description = "APIs for managing user job preferences from career portal")
public class UserJobPreferenceController {

    private static final Logger logger = LoggerFactory.getLogger(UserJobPreferenceController.class);

    private final UserJobPreferenceService userJobPreferenceService;

    @PostMapping
    @Operation(summary = "Save user job preferences", description = "Saves user email, selected job categories, and consent status from career portal connect feature")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Preferences saved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<UserJobPreferenceDTO> savePreference(@Valid @RequestBody UserJobPreferenceDTO preferenceDTO) {
        logger.debug("REST request to save user job preference for email: {}", preferenceDTO.getEmail());
        UserJobPreferenceDTO savedPreference = userJobPreferenceService.savePreference(preferenceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPreference);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all user job preferences", description = "Retrieves all user job preferences (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Preferences retrieved successfully")
    })
    public ResponseEntity<List<UserJobPreferenceDTO>> getAllPreferences() {
        logger.debug("REST request to get all user job preferences");
        return ResponseEntity.ok(userJobPreferenceService.getAllPreferences());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user job preference by ID", description = "Retrieves a specific user job preference by its ID (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Preference found"),
        @ApiResponse(responseCode = "404", description = "Preference not found")
    })
    public ResponseEntity<UserJobPreferenceDTO> getPreferenceById(@PathVariable Long id) {
        logger.debug("REST request to get user job preference with ID: {}", id);
        return ResponseEntity.ok(userJobPreferenceService.getPreferenceById(id));
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user job preferences by email", description = "Retrieves all user job preferences for a specific email (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Preferences retrieved successfully")
    })
    public ResponseEntity<List<UserJobPreferenceDTO>> getPreferencesByEmail(@RequestParam String email) {
        logger.debug("REST request to get user job preferences for email: {}", email);
        return ResponseEntity.ok(userJobPreferenceService.getPreferencesByEmail(email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user job preference", description = "Deletes a user job preference by ID (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Preference deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Preference not found")
    })
    public ResponseEntity<Void> deletePreference(@PathVariable Long id) {
        logger.debug("REST request to delete user job preference with ID: {}", id);
        userJobPreferenceService.deletePreference(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check if email exists", description = "Checks if an email already has saved preferences")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Check completed successfully")
    })
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        logger.debug("REST request to check if email exists: {}", email);
        return ResponseEntity.ok(userJobPreferenceService.emailExists(email));
    }
}


