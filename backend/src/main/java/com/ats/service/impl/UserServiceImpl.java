package com.ats.service.impl;

import com.ats.dto.UserDTO;
import com.ats.exception.ResourceAlreadyExistsException;
import com.ats.exception.ResourceNotFoundException;
import com.ats.model.User;
import com.ats.model.Role;
import com.ats.repository.UserRepository;
import com.ats.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }
        if (userDTO.getLinkedinId() != null && userRepository.existsByLinkedinId(userDTO.getLinkedinId())) {
            throw new ResourceAlreadyExistsException("LinkedIn ID already exists");
        }

        User user = convertToEntity(userDTO);
        user.setIsActive(true);
        return convertToDTO(userRepository.save(user));
    }

    @Override
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

        User updatedUser = convertToEntity(userDTO);
        updatedUser.setId(id);
        return convertToDTO(userRepository.save(updatedUser));
    }

    @Override
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
            .map(this::convertToDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(this::convertToDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO updateUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(isActive);
        return convertToDTO(userRepository.save(user));
    }

    @Override
    public UserDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return convertToDTO(userRepository.save(user));
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(dto.getRole());
        user.setDepartment(dto.getDepartment());
        user.setLinkedinId(dto.getLinkedinId());
        user.setLinkedinProfileUrl(dto.getLinkedinProfileUrl());
        user.setProfilePictureUrl(dto.getProfilePictureUrl());
        user.setIsEmailPasswordEnabled(dto.getIsEmailPasswordEnabled());
        user.setLastLogin(dto.getLastLogin());
        user.setIsActive(dto.getIsActive());
        return user;
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
        return dto;
    }
} 