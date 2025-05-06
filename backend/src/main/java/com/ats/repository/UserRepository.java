package com.ats.repository;

import com.ats.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByLinkedinId(String linkedinId);
    boolean existsByEmail(String email);
    boolean existsByLinkedinId(String linkedinId);
    long countByRole(String role);
    Optional<User> findByEmailVerificationToken(String token);
} 