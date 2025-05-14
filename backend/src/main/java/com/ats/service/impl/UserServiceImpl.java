package com.ats.service.impl;

import com.ats.dto.UserDTO;
import com.ats.exception.ResourceAlreadyExistsException;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import com.ats.service.EmailService;
import com.ats.service.UserService;
import com.ats.util.TokenUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }
        if (userDTO.getLinkedinId() != null && userRepository.existsByLinkedinId(userDTO.getLinkedinId())) {
            throw new ResourceAlreadyExistsException("LinkedIn ID already exists");
        }

        User user = new User();
        user.setEmail(userDTO.getEmail());
        
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setRole(userDTO.getRole());
        user.setDepartment(userDTO.getDepartment());
        user.setLinkedinId(userDTO.getLinkedinId());
        user.setLinkedinProfileUrl(userDTO.getLinkedinProfileUrl());
        user.setProfilePictureUrl(userDTO.getProfilePictureUrl());
        user.setIsEmailPasswordEnabled(userDTO.getIsEmailPasswordEnabled() != null ? userDTO.getIsEmailPasswordEnabled() : true);
        user.setIsActive(userDTO.getIsActive() != null ? userDTO.getIsActive() : true);
        
        // Handle email verification based on request
        boolean shouldSendVerificationEmail = userDTO.getSendVerificationEmail() != null ? userDTO.getSendVerificationEmail() : false;
        if (shouldSendVerificationEmail) {
            // Use TokenUtil to generate verification token
            TokenUtil.generateVerificationToken(user);
        } else {
            // Otherwise, use the value from the DTO or default to false
            user.setIsEmailVerified(userDTO.getIsEmailVerified() != null ? userDTO.getIsEmailVerified() : false);
        }
        
        User savedUser = userRepository.save(user);
        
        // Send verification email if requested
        if (shouldSendVerificationEmail && savedUser.getEmailVerificationToken() != null) {
            try {
                emailService.sendNewUserVerificationEmail(savedUser, savedUser.getEmailVerificationToken());
            } catch (Exception e) {
                // Log the error but continue since the user was created successfully
                System.err.println("Failed to send verification email to " + savedUser.getEmail());
                e.printStackTrace();
            }
        }
        
        return convertToDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!existingUser.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        if (userDTO.getLinkedinId() != null && 
            !userDTO.getLinkedinId().equals(existingUser.getLinkedinId()) && 
            userRepository.existsByLinkedinId(userDTO.getLinkedinId())) {
            throw new ResourceAlreadyExistsException("LinkedIn ID already exists");
        }

        existingUser.setEmail(userDTO.getEmail());
        
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        existingUser.setFirstName(userDTO.getFirstName());
        existingUser.setLastName(userDTO.getLastName());
        
        if (userDTO.getRole() != null) {
            existingUser.setRole(userDTO.getRole());
        }
        
        existingUser.setDepartment(userDTO.getDepartment());
        existingUser.setLinkedinProfileUrl(userDTO.getLinkedinProfileUrl());
        existingUser.setProfilePictureUrl(userDTO.getProfilePictureUrl());
        
        if (userDTO.getIsActive() != null) {
            existingUser.setIsActive(userDTO.getIsActive());
        }
        
        User updatedUser = userRepository.save(existingUser);
        
        return convertToDTO(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
            .map(this::convertToDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(this::convertToDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(isActive);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setDepartment(user.getDepartment());
        dto.setLinkedinId(user.getLinkedinId());
        dto.setLinkedinProfileUrl(user.getLinkedinProfileUrl());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setIsEmailPasswordEnabled(user.getIsEmailPasswordEnabled());
        dto.setLastLogin(user.getLastLogin());
        dto.setIsActive(user.getIsActive());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
} 