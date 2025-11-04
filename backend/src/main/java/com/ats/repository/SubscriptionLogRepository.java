package com.ats.repository;

import com.ats.model.SubscriptionLog;
import com.ats.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionLogRepository extends JpaRepository<SubscriptionLog, Long> {
    List<SubscriptionLog> findByUser(User user);
    List<SubscriptionLog> findByUserId(Long userId);
}

