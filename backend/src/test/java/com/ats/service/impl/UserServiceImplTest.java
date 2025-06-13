package com.ats.service.impl;

import com.ats.AtsApplication;
import com.ats.config.TestConfig;
import com.ats.dto.UserDTO;
import com.ats.exception.ResourceAlreadyExistsException;
import com.ats.model.Role;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest(classes = AtsApplication.class)
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
@DisplayName("User Signup - Integration Tests")
class UserServiceImplTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("✅ A user should be able to signup with valid information")
    void shouldCreateUser_WhenGivenValidUserData() {
        // Given
        UserDTO userDTO = createValidUserDTO();

        // When
        UserDTO result = userService.createUser(userDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getEmail()).isEqualTo(userDTO.getEmail());
        assertThat(result.getFirstName()).isEqualTo(userDTO.getFirstName());
        assertThat(result.getLastName()).isEqualTo(userDTO.getLastName());
        assertThat(result.getRole()).isEqualTo(userDTO.getRole());
        assertThat(result.getIsActive()).isTrue();
        assertThat(result.getIsEmailVerified()).isFalse();

        // Verify user was saved in database
        User savedUser = userRepository.findByEmail(userDTO.getEmail()).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo(userDTO.getEmail());
        assertThat(savedUser.getPasswordHash()).isNotNull(); // Password should be encoded
        assertThat(savedUser.getPasswordHash()).isNotEqualTo(userDTO.getPassword()); // Should be encoded, not plain text
    }

    @Test
    @DisplayName("❌ A user should NOT be able to signup with an email that already exists")
    void shouldThrowResourceAlreadyExistsException_WhenEmailAlreadyExists() {
        // Given
        UserDTO firstUser = createValidUserDTO();
        userService.createUser(firstUser); // Create first user

        UserDTO duplicateEmailUser = createValidUserDTO();
        duplicateEmailUser.setLinkedinId("different-linkedin-id"); // Different LinkedIn ID but same email

        // When & Then
        assertThatThrownBy(() -> userService.createUser(duplicateEmailUser))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage("Email already exists");

        // Verify only one user exists in database
        long userCount = userRepository.count();
        assertThat(userCount).isEqualTo(1);
    }

    @Test
    @DisplayName("❌ A user should NOT be able to signup with a LinkedIn ID that already exists")
    void shouldThrowResourceAlreadyExistsException_WhenLinkedInIdAlreadyExists() {
        // Given
        UserDTO firstUser = createValidUserDTO();
        userService.createUser(firstUser); // Create first user

        UserDTO duplicateLinkedInUser = createValidUserDTO();
        duplicateLinkedInUser.setEmail("different@example.com"); // Different email but same LinkedIn ID

        // When & Then
        assertThatThrownBy(() -> userService.createUser(duplicateLinkedInUser))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage("LinkedIn ID already exists");

        // Verify only one user exists in database
        long userCount = userRepository.count();
        assertThat(userCount).isEqualTo(1);
    }

    @Test
    @DisplayName("✅ A user should be able to signup without providing a password (OAuth flow)")
    void shouldCreateUser_WhenPasswordIsNull() {
        // Given
        UserDTO userDTO = createValidUserDTO();
        userDTO.setPassword(null);

        // When
        UserDTO result = userService.createUser(userDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();

        // Verify user was saved with null password
        User savedUser = userRepository.findByEmail(userDTO.getEmail()).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getPasswordHash()).isNull();
    }

    @Test
    @DisplayName("✅ A user should have default values set when optional fields are not provided")
    void shouldSetDefaultValues_WhenOptionalFieldsAreNull() {
        // Given
        UserDTO userDTO = createMinimalUserDTO();

        // When
        UserDTO result = userService.createUser(userDTO);

        // Then
        assertThat(result.getIsEmailPasswordEnabled()).isTrue();
        assertThat(result.getIsActive()).isTrue();
        assertThat(result.getIsEmailVerified()).isFalse();

        // Verify defaults in database
        User savedUser = userRepository.findByEmail(userDTO.getEmail()).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getIsEmailPasswordEnabled()).isTrue();
        assertThat(savedUser.getIsActive()).isTrue();
        assertThat(savedUser.getIsEmailVerified()).isFalse();
    }

    @Test
    @DisplayName("✅ Multiple users should be able to signup with unique information")
    void shouldCreateMultipleUsers_WhenDataIsUnique() {
        // Given
        UserDTO user1 = createValidUserDTO();
        UserDTO user2 = createValidUserDTO();
        user2.setEmail("user2@example.com");
        user2.setLinkedinId("user2-linkedin");

        // When
        UserDTO result1 = userService.createUser(user1);
        UserDTO result2 = userService.createUser(user2);

        // Then
        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(result1.getId()).isNotEqualTo(result2.getId());

        // Verify both users exist in database
        long userCount = userRepository.count();
        assertThat(userCount).isEqualTo(2);
    }

    // Helper methods to create test data
    private UserDTO createValidUserDTO() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("test@example.com");
        userDTO.setPassword("password123");
        userDTO.setFirstName("John");
        userDTO.setLastName("Doe");
        userDTO.setRole(Role.CANDIDATE);
        userDTO.setLinkedinId("john-doe-123");
        userDTO.setIsEmailPasswordEnabled(true);
        userDTO.setIsActive(true);
        userDTO.setIsEmailVerified(false);
        return userDTO;
    }

    private UserDTO createMinimalUserDTO() {
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail("minimal@example.com");
        userDTO.setPassword("password123");
        userDTO.setFirstName("Jane");
        userDTO.setLastName("Smith");
        userDTO.setRole(Role.CANDIDATE);
        return userDTO;
    }
} 