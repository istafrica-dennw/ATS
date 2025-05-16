package com.ats.controller;

import com.ats.dto.AuthRequest;
import com.ats.dto.AuthResponse;
import com.ats.dto.UserDTO;
import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import com.ats.security.JwtTokenProvider;
import com.ats.exception.ResourceAlreadyExistsException;
import com.ats.service.EmailService;
import com.ats.util.TokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & Profile", description = "APIs for user authentication, registration, and profile management")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @PostMapping("/signup")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account and sends a verification email"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User registered successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"message\": \"Registration successful. Please check your email for verification.\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input or email already in use",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-02-20T10:00:00\", \"message\": \"Email is already in use\", \"status\": 400, \"error\": \"Bad Request\"}"
                )
            )
        )
    })
    public ResponseEntity<?> signup(@Valid @RequestBody AuthRequest authRequest) {
        if (userRepository.existsByEmail(authRequest.getEmail())) {
            throw new ResourceAlreadyExistsException("Email is already in use");
        }

        User user = new User();
        user.setEmail(authRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(authRequest.getPassword()));
        user.setFirstName(authRequest.getFirstName());
        user.setLastName(authRequest.getLastName());
        user.setRole(Role.CANDIDATE);
        user.setIsActive(true);
        user.setIsEmailPasswordEnabled(true);
        
        // Generate verification token using TokenUtil
        String verificationToken = TokenUtil.generateVerificationToken(user);

        user = userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Registration successful. Please check your email for verification.");
            }});
        } catch (MessagingException e) {
            // Log the error but return success since user was created
            e.printStackTrace();
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Registration successful. However, we couldn't send the verification email. Please contact support.");
                put("verificationToken", verificationToken); // Include token in response for testing
            }});
        }

        finally {
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Registration successful. However, we couldn't send the verification email. Please contact support.");
                put("verificationToken", verificationToken); // Include token in response for testing
            }});
        }
    }

    @PostMapping("/login")
    @Operation(
        summary = "Authenticate user",
        description = "Authenticates a user with email and password, returns a JWT token"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User authenticated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(
                    value = "{\"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\", \"user\": {\"id\": 1, \"email\": \"john.doe@example.com\", \"firstName\": \"John\", \"lastName\": \"Doe\", \"role\": \"RECRUITER\"}}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-02-20T10:00:00\", \"message\": \"Invalid email or password\", \"status\": 400, \"error\": \"Bad Request\"}"
                )
            )
        )
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getIsEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }
        
        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new RuntimeException("This account has been deactivated. Please contact an administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(jwt, convertToDTO(user)));
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Logout user",
        description = "Logs out the current user by clearing the security context"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User logged out successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"message\": \"Logged out successfully\"}"
                )
            )
        )
    })
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().body(new HashMap<String, String>() {{
            put("message", "Logged out successfully");
        }});
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        user.setIsEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok().body(new HashMap<String, String>() {{
            put("message", "Email verified successfully");
        }});
    }
    
    @GetMapping("/me")
    @Operation(
        summary = "Get current user profile",
        description = "Retrieves detailed information about the currently authenticated user's profile. This endpoint returns all profile information including personal details, contact information, and account status. Authorization header with Bearer token is required."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User profile retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserDTO.class),
                examples = @ExampleObject(
                    value = "{\n" +
                           "  \"id\": 1,\n" +
                           "  \"email\": \"john.doe@example.com\",\n" +
                           "  \"firstName\": \"John\",\n" +
                           "  \"lastName\": \"Doe\",\n" +
                           "  \"role\": \"CANDIDATE\",\n" +
                           "  \"department\": \"Engineering\",\n" +
                           "  \"linkedinProfileUrl\": \"https://linkedin.com/in/johndoe\",\n" +
                           "  \"profilePictureUrl\": \"/api/files/profile-pictures/1bb1d8f6-649f-490d-85b5-621b16b5d2f7.jpg\",\n" +
                           "  \"birthDate\": \"1990-01-15\",\n" +
                           "  \"phoneNumber\": \"+1 (555) 123-4567\",\n" +
                           "  \"addressLine1\": \"123 Main Street\",\n" +
                           "  \"addressLine2\": \"Apt 4B\",\n" +
                           "  \"city\": \"New York\",\n" +
                           "  \"state\": \"NY\",\n" +
                           "  \"country\": \"United States\",\n" +
                           "  \"postalCode\": \"10001\",\n" +
                           "  \"bio\": \"Full-stack developer with 5 years of experience...\",\n" +
                           "  \"isActive\": true,\n" +
                           "  \"isEmailVerified\": true,\n" +
                           "  \"isEmailPasswordEnabled\": true\n" +
                           "}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Invalid or expired JWT token",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Invalid JWT token\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 404, \"error\": \"Not Found\", \"message\": \"User not found\"}"
                )
            )
        )
    })
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(convertToDTO(user));
    }
    
    @PutMapping("/me")
    @Operation(
        summary = "Update current user profile",
        description = "Updates information for the currently authenticated user. This endpoint allows users to update their profile information including personal details, contact information, and profile picture. Authorization header with Bearer token is required. Null values will clear the corresponding fields in the database."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserDTO.class),
                examples = @ExampleObject(
                    value = "{\n" +
                           "  \"id\": 1,\n" +
                           "  \"email\": \"john.doe@example.com\",\n" +
                           "  \"firstName\": \"John\",\n" +
                           "  \"lastName\": \"Smith\",\n" +
                           "  \"role\": \"CANDIDATE\",\n" +
                           "  \"department\": \"Product\",\n" +
                           "  \"linkedinProfileUrl\": \"https://linkedin.com/in/johnsmith\",\n" +
                           "  \"profilePictureUrl\": \"/api/files/profile-pictures/1bb1d8f6-649f-490d-85b5-621b16b5d2f7.jpg\",\n" +
                           "  \"birthDate\": \"1990-01-15\",\n" +
                           "  \"phoneNumber\": \"+1 (555) 123-4567\",\n" +
                           "  \"addressLine1\": \"456 Park Avenue\",\n" +
                           "  \"addressLine2\": null,\n" +
                           "  \"city\": \"New York\",\n" +
                           "  \"state\": \"NY\",\n" +
                           "  \"country\": \"United States\",\n" +
                           "  \"postalCode\": \"10022\",\n" +
                           "  \"bio\": \"Senior developer with expertise in React and Spring Boot\",\n" +
                           "  \"isActive\": true,\n" +
                           "  \"isEmailVerified\": true,\n" +
                           "  \"isEmailPasswordEnabled\": true\n" +
                           "}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request body",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid request body\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Invalid or expired JWT token",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Invalid JWT token\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 404, \"error\": \"Not Found\", \"message\": \"User not found\"}"
                )
            )
        )
    })
    public ResponseEntity<UserDTO> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UserDTO userDTO) {
        String email = authentication.getName();
        System.out.println("Updating profile for user: " + email);
        System.out.println("Received update data: " + userDTO);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update user information (set fields regardless of null status to allow clearing fields)
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setDepartment(userDTO.getDepartment());
        user.setLinkedinProfileUrl(userDTO.getLinkedinProfileUrl());
        user.setProfilePictureUrl(userDTO.getProfilePictureUrl());
        
        // Update profile fields
        user.setBirthDate(userDTO.getBirthDate());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setAddressLine1(userDTO.getAddressLine1());
        user.setAddressLine2(userDTO.getAddressLine2());
        user.setCity(userDTO.getCity());
        user.setState(userDTO.getState());
        user.setCountry(userDTO.getCountry());
        user.setPostalCode(userDTO.getPostalCode());
        user.setBio(userDTO.getBio());
        
        // Don't update sensitive fields like email, role, active status, etc.
        
        // Save the updated user
        user = userRepository.save(user);
        System.out.println("Profile updated successfully for user: " + email);
        
        UserDTO updatedUserDTO = convertToDTO(user);
        System.out.println("Returning updated user data: " + updatedUserDTO);
        return ResponseEntity.ok(updatedUserDTO);
    }
    
    @PostMapping("/deactivate")
    @Operation(
        summary = "Deactivate current user account",
        description = "Deactivates the currently authenticated user's account. Requires a reason for deactivation. The account will be marked as inactive but data will be preserved for future reactivation by an administrator."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Account deactivated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserDTO.class),
                examples = @ExampleObject(
                    value = "{\n" +
                           "  \"id\": 1,\n" +
                           "  \"email\": \"john.doe@example.com\",\n" +
                           "  \"firstName\": \"John\",\n" +
                           "  \"lastName\": \"Doe\",\n" +
                           "  \"role\": \"CANDIDATE\",\n" +
                           "  \"isActive\": false,\n" +
                           "  \"deactivationReason\": \"Moving to a different platform\",\n" +
                           "  \"deactivationDate\": \"2024-05-20T10:00:00\"\n" +
                           "}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid request - Missing deactivation reason",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"message\": \"Deactivation reason is required\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Unauthorized - Invalid or expired JWT token",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Invalid JWT token\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404", 
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"timestamp\": \"2024-05-20T10:00:00\", \"status\": 404, \"error\": \"Not Found\", \"message\": \"User not found\"}"
                )
            )
        )
    })
    public ResponseEntity<UserDTO> deactivateCurrentUser(
            Authentication authentication,
            @Schema(description = "Deactivation request with reason", required = true, example = "{\"reason\": \"Moving to a different platform\"}")
            @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Deactivation reason is required");
        }
        
        user.setIsActive(false);
        user.setDeactivationReason(reason);
        user.setDeactivationDate(LocalDateTime.now());
        
        user = userRepository.save(user);
        
        return ResponseEntity.ok(convertToDTO(user));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setRole(user.getRole());
        userDTO.setDepartment(user.getDepartment());
        userDTO.setLinkedinId(user.getLinkedinId());
        userDTO.setLinkedinProfileUrl(user.getLinkedinProfileUrl());
        userDTO.setProfilePictureUrl(user.getProfilePictureUrl());
        userDTO.setIsActive(user.getIsActive());
        userDTO.setIsEmailVerified(user.getIsEmailVerified());
        userDTO.setIsEmailPasswordEnabled(user.getIsEmailPasswordEnabled());
        userDTO.setLastLogin(user.getLastLogin());
        
        // Include additional profile fields
        userDTO.setBirthDate(user.getBirthDate());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setAddressLine1(user.getAddressLine1());
        userDTO.setAddressLine2(user.getAddressLine2());
        userDTO.setCity(user.getCity());
        userDTO.setState(user.getState());
        userDTO.setCountry(user.getCountry());
        userDTO.setPostalCode(user.getPostalCode());
        userDTO.setBio(user.getBio());
        userDTO.setDeactivationReason(user.getDeactivationReason());
        userDTO.setDeactivationDate(user.getDeactivationDate());
        
        return userDTO;
    }
} 