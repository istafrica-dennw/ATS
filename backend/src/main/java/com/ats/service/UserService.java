package com.ats.service;

import com.ats.dto.UserDTO;
import com.ats.dto.MfaSetupResponse;
import com.ats.model.User;
import com.ats.model.Role;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface UserService {
    UserDTO createUser(UserDTO userDTO);
    UserDTO updateUser(Long id, UserDTO userDTO);
    UserDTO getUserById(Long id);
    UserDTO getUserByEmail(String email);
    List<UserDTO> getAllUsers();
    void deleteUser(Long id);
    UserDTO updateUserStatus(Long id, boolean isActive);
    UserDTO updateUserStatus(Long id, boolean isActive, Authentication authentication);
    UserDTO updateUserRole(Long id, Role role);
    UserDTO deactivateAccount(Long id, String reason);
    UserDTO deactivateAccount(Long id, String reason, Authentication authentication);
    
    // 2FA methods
    MfaSetupResponse setupMfa(String email, String currentPassword);
    boolean verifyAndEnableMfa(String email, String code, String secret);
    boolean disableMfa(String email, String currentPassword);
    boolean validateMfaCode(String email, String code);
    boolean validateMfaRecoveryCode(String email, String recoveryCode);
    
    // Utility methods
    UserDTO convertToDTO(User user);
} 