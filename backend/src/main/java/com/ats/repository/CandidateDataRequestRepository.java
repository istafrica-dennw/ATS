package com.ats.repository;

import com.ats.model.CandidateDataRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateDataRequestRepository extends JpaRepository<CandidateDataRequest, Long> {
    List<CandidateDataRequest> findByUserIdOrderByRequestedAtDesc(Long userId);
    List<CandidateDataRequest> findByStatusOrderByRequestedAtDesc(String status);
    List<CandidateDataRequest> findByRequestTypeOrderByRequestedAtDesc(String requestType);
}

