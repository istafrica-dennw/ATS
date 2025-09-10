package com.ats.repository;

import com.ats.model.User;
import com.ats.model.UserRoleSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleSessionRepository extends JpaRepository<UserRoleSession, Long> {
    
    /**
     * Find active session for a user
     */
    Optional<UserRoleSession> findByUserIdAndExpiresAtAfter(Long userId, LocalDateTime now);
    
    /**
     * Find active session for a user
     */
    Optional<UserRoleSession> findByUserAndExpiresAtAfter(User user, LocalDateTime now);
    
    /**
     * Find session by token
     */
    Optional<UserRoleSession> findBySessionToken(String sessionToken);
    
    /**
     * Find all sessions for a user
     */
    List<UserRoleSession> findByUserId(Long userId);
    
    /**
     * Find all sessions for a user
     */
    List<UserRoleSession> findByUser(User user);
    
    /**
     * Find all expired sessions
     */
    List<UserRoleSession> findByExpiresAtBefore(LocalDateTime now);
    
    /**
     * Delete expired sessions
     */
    @Modifying
    @Query("DELETE FROM UserRoleSession urs WHERE urs.expiresAt < :now")
    void deleteExpiredSessions(@Param("now") LocalDateTime now);
    
    /**
     * Delete all sessions for a user
     */
    void deleteByUserId(Long userId);
    
    /**
     * Delete all sessions for a user
     */
    void deleteByUser(User user);
    
    /**
     * Delete session by token
     */
    void deleteBySessionToken(String sessionToken);
    
    /**
     * Update session expiration
     */
    @Modifying
    @Query("UPDATE UserRoleSession urs SET urs.expiresAt = :newExpiresAt WHERE urs.sessionToken = :sessionToken")
    void updateSessionExpiration(@Param("sessionToken") String sessionToken, @Param("newExpiresAt") LocalDateTime newExpiresAt);
}