package com.ats.controller;

import com.ats.dto.AuthRequest;
import com.ats.dto.AuthResponse;
import com.ats.dto.UserDTO;
import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import com.ats.security.JwtTokenProvider;
import com.ats.exception.ResourceAlreadyExistsException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/signup")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account and returns a JWT token for authentication"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User registered successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(
                    value = "{\"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\", \"user\": {\"id\": 1, \"email\": \"john.doe@example.com\", \"firstName\": \"New\", \"lastName\": \"User\", \"role\": \"RECRUITER\"}}"
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
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody AuthRequest authRequest) {
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
        user.setAuthenticationMethod("EMAIL_PASSWORD");

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new AuthResponse(jwt, convertToDTO(user)));
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
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(authRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

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

    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setRole(user.getRole());
        userDTO.setDepartment(user.getDepartment());
        userDTO.setLinkedinProfileUrl(user.getLinkedinProfileUrl());
        userDTO.setProfilePictureUrl(user.getProfilePictureUrl());
        return userDTO;
    }
} 