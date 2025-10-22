package com.ats.service.impl;

import com.ats.model.Region;
import com.ats.service.GeolocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Implementation of IP geolocation service using ipapi.co (free tier)
 */
@Service
public class GeolocationServiceImpl implements GeolocationService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeolocationServiceImpl.class);
    
    // EU country codes for GDPR compliance
    private static final List<String> EU_COUNTRIES = Arrays.asList(
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", 
        "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", 
        "SI", "ES", "SE"
    );
    
    private final RestTemplate restTemplate;
    
    public GeolocationServiceImpl() {
        this.restTemplate = new RestTemplate();
    }
    
    @Override
    public Region detectRegion(String ipAddress) {
        if (ipAddress == null || ipAddress.trim().isEmpty()) {
            logger.warn("IP address is null or empty");
            return null;
        }
        
        // Handle localhost and private IPs
        if (isLocalOrPrivateIP(ipAddress)) {
            logger.info("IP address {} is local/private, cannot determine region", ipAddress);
            return null;
        }
        
        try {
            String url = "http://ipapi.co/" + ipAddress + "/json/";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("country_code")) {
                String countryCode = (String) response.get("country_code");
                return determineRegionFromCountryCode(countryCode);
            }
            
        } catch (RestClientException e) {
            logger.error("Error fetching geolocation data for IP {}: {}", ipAddress, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during geolocation detection for IP {}: {}", ipAddress, e.getMessage());
        }
        
        return null;
    }
    
    @Override
    public boolean isEUAccess(String ipAddress) {
        Region region = detectRegion(ipAddress);
        return region == Region.EU;
    }
    
    @Override
    public boolean isRwandaAccess(String ipAddress) {
        Region region = detectRegion(ipAddress);
        return region == Region.RW;
    }
    
    /**
     * Determine region from country code
     */
    private Region determineRegionFromCountryCode(String countryCode) {
        if (countryCode == null) {
            return null;
        }
        
        String upperCountryCode = countryCode.toUpperCase();
        
        // Check if it's Rwanda
        if ("RW".equals(upperCountryCode)) {
            return Region.RW;
        }
        
        // Check if it's EU
        if (EU_COUNTRIES.contains(upperCountryCode)) {
            return Region.EU;
        }
        
        // Everything else is OTHER
        return Region.OTHER;
    }
    
    /**
     * Check if IP is local or private
     */
    private boolean isLocalOrPrivateIP(String ipAddress) {
        if (ipAddress == null) return true;
        
        // Localhost
        if ("127.0.0.1".equals(ipAddress) || "localhost".equals(ipAddress)) {
            return true;
        }
        
        // Private IP ranges
        if (ipAddress.startsWith("192.168.") || 
            ipAddress.startsWith("10.") || 
            ipAddress.startsWith("172.")) {
            return true;
        }
        
        // IPv6 localhost
        if ("::1".equals(ipAddress) || ipAddress.startsWith("::1")) {
            return true;
        }
        
        return false;
    }
}