package com.ats.controller;

import com.ats.model.Region;
import com.ats.service.GeolocationService;
import com.ats.util.IPUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for geolocation detection
 */
@RestController
@RequestMapping("/api/geolocation")
@Tag(name = "Geolocation", description = "APIs for IP geolocation detection")
public class GeolocationController {
    
    private final GeolocationService geolocationService;
    
    @Autowired
    public GeolocationController(GeolocationService geolocationService) {
        this.geolocationService = geolocationService;
    }
    
    @GetMapping("/detect")
    @Operation(
        summary = "Detect user's region based on IP address",
        description = "Detects the user's region (EU, RW, OTHER) based on their IP address"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Region detected successfully"),
        @ApiResponse(responseCode = "400", description = "Unable to detect region")
    })
    public ResponseEntity<Map<String, Object>> detectRegion() {
        try {
            String clientIP = IPUtils.getClientIPAddress();
            
            if (clientIP == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Unable to determine IP address");
                return ResponseEntity.ok(response);
            }
            
            Region region = geolocationService.detectRegion(clientIP);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("ip", clientIP);
            response.put("region", region != null ? region.name() : null);
            response.put("isEU", region == Region.EU);
            response.put("isRwanda", region == Region.RW);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error detecting region: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/check-eu")
    @Operation(
        summary = "Check if user is accessing from EU",
        description = "Returns true if the user's IP address is from EU region"
    )
    public ResponseEntity<Map<String, Object>> checkEUAccess() {
        try {
            String clientIP = IPUtils.getClientIPAddress();
            boolean isEU = geolocationService.isEUAccess(clientIP);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("ip", clientIP);
            response.put("isEU", isEU);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error checking EU access: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}