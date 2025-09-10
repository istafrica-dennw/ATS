package com.ats.repository;

import com.ats.model.Role;
import com.ats.model.User;
import com.ats.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    /**
     * Find all roles for a specific user
     */
    List<UserRole> findByUserId(Long userId);
    
    /**
     * Find all roles for a specific user
     */
    List<UserRole> findByUser(User user);
    
    /**
     * Find primary role for a user
     */
    Optional<UserRole> findByUserIdAndIsPrimaryTrue(Long userId);
    
    /**
     * Find primary role for a user
     */
    Optional<UserRole> findByUserAndIsPrimaryTrue(User user);
    
    /**
     * Check if user has a specific role
     */
    boolean existsByUserAndRole(User user, Role role);
    
    /**
     * Check if user has a specific role
     */
    boolean existsByUserIdAndRole(Long userId, Role role);
    
    /**
     * Find all users with a specific role
     */
    @Query("SELECT ur.user FROM UserRole ur WHERE ur.role = :role")
    List<User> findUsersByRole(@Param("role") Role role);
    
    /**
     * Find all users with a specific role (by role name)
     */
    @Query("SELECT ur.user FROM UserRole ur WHERE ur.role = :roleName")
    List<User> findUsersByRoleName(@Param("roleName") String roleName);
    
    /**
     * Count users with a specific role
     */
    long countByRole(Role role);
    
    /**
     * Delete all roles for a user
     */
    void deleteByUserId(Long userId);
    
    /**
     * Delete all roles for a user
     */
    void deleteByUser(User user);
    
    /**
     * Delete a specific role for a user
     */
    void deleteByUserAndRole(User user, Role role);
    
    /**
     * Delete a specific role for a user
     */
    void deleteByUserIdAndRole(Long userId, Role role);
}