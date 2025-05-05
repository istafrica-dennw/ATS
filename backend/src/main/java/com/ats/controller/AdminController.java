package com.ats.controller;

import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long totalAdmins = userRepository.countByRole("ADMIN");
            long totalRecruiters = userRepository.countByRole("RECRUITER");
            long totalCandidates = userRepository.countByRole("CANDIDATE");

            Map<String, Object> stats = new HashMap<>();
            stats.put("total_users", totalUsers);
            stats.put("total_admins", totalAdmins);
            stats.put("total_recruiters", totalRecruiters);
            stats.put("total_candidates", totalCandidates);
            stats.put("active_jobs", 0); // TODO: Implement job count
            stats.put("upcoming_interviews", 0); // TODO: Implement interview count
            stats.put("conversion_rate", 0); // TODO: Implement conversion rate calculation

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard stats: " + e.getMessage());
        }
    }
} 