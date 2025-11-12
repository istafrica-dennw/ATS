package com.ats.service.impl;

import com.ats.model.Region;
import com.ats.service.GeolocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Implementation of IP geolocation service with multiple fallback providers
 * Uses ipapi.co as primary, with fallbacks to ip-api.com and ipgeolocation.io
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
        
        // Try multiple geolocation services with fallback
        Region region = tryIpApiCo(ipAddress);
        if (region != null) {
            logger.info("Primary service (ipapi.co) detected region: {} for IP {}", region, ipAddress);
            return region;
        }
        
        logger.info("Primary service (ipapi.co) failed, trying fallback service (ip-api.com) for IP {}", ipAddress);
        region = tryIpApiCom(ipAddress);
        if (region != null) {
            logger.info("Fallback service (ip-api.com) detected region: {} for IP {}", region, ipAddress);
            return region;
        }
        
        logger.warn("All geolocation services failed for IP {}", ipAddress);
        return null;
    }
    
    /**
     * Try ipapi.co service (primary)
     */
    private Region tryIpApiCo(String ipAddress) {
        try {
            String url = "https://ipapi.co/" + ipAddress + "/json/";
            logger.info("Fetching geolocation data from ipapi.co: {}", url);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response == null) {
                logger.warn("ipapi.co returned null response for IP {}", ipAddress);
                return null;
            }
            
            // Check for error response
            if (response.containsKey("error")) {
                Object errorObj = response.get("error");
                logger.warn("ipapi.co returned error for IP {}: {}", ipAddress, errorObj);
                return null;
            }
            
            // Extract country code
            Object countryCodeObj = response.get("country_code");
            if (countryCodeObj == null) {
                countryCodeObj = response.get("country");
            }
            
            if (countryCodeObj != null) {
                String countryCode = countryCodeObj.toString().toUpperCase();
                logger.info("ipapi.co detected country code: {} for IP {}", countryCode, ipAddress);
                return determineRegionFromCountryCode(countryCode);
            }
            
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() != null && e.getStatusCode().value() == 429) {
                logger.warn("ipapi.co rate limit exceeded for IP {}, will try fallback service", ipAddress);
            } else {
                logger.warn("ipapi.co HTTP error for IP {}: Status {}", ipAddress, e.getStatusCode());
            }
        } catch (RestClientException e) {
            logger.warn("ipapi.co request failed for IP {}: {}", ipAddress, e.getMessage());
        } catch (Exception e) {
            logger.warn("Unexpected error with ipapi.co for IP {}: {}", ipAddress, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Try ip-api.com service (fallback)
     */
    private Region tryIpApiCom(String ipAddress) {
        try {
            String url = "http://ip-api.com/json/" + ipAddress + "?fields=status,countryCode";
            logger.info("Fetching geolocation data from ip-api.com: {}", url);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response == null) {
                logger.warn("ip-api.com returned null response for IP {}", ipAddress);
                return null;
            }
            
            // Check status field
            Object statusObj = response.get("status");
            if (statusObj != null && "fail".equals(statusObj.toString().toLowerCase())) {
                logger.warn("ip-api.com returned fail status for IP {}", ipAddress);
                return null;
            }
            
            // Extract country code
            Object countryCodeObj = response.get("countryCode");
            if (countryCodeObj != null) {
                String countryCode = countryCodeObj.toString().toUpperCase();
                logger.info("ip-api.com detected country code: {} for IP {}", countryCode, ipAddress);
                return determineRegionFromCountryCode(countryCode);
            }
            
        } catch (HttpClientErrorException e) {
            logger.warn("ip-api.com HTTP error for IP {}: Status {}", ipAddress, e.getStatusCode());
        } catch (RestClientException e) {
            logger.warn("ip-api.com request failed for IP {}: {}", ipAddress, e.getMessage());
        } catch (Exception e) {
            logger.warn("Unexpected error with ip-api.com for IP {}: {}", ipAddress, e.getMessage());
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
            logger.warn("Country code is null");
            return null;
        }
        
        String upperCountryCode = countryCode.toUpperCase();
        logger.info("Checking country code: {} against EU countries list: {}", upperCountryCode, EU_COUNTRIES);
        
        // Check if it's Rwanda
        if ("RW".equals(upperCountryCode)) {
            logger.info("Country {} identified as Rwanda", upperCountryCode);
            return Region.RW;
        }
        
        // Check if it's EU
        if (EU_COUNTRIES.contains(upperCountryCode)) {
            logger.info("Country {} identified as EU", upperCountryCode);
            return Region.EU;
        }
        
        // Everything else is OTHER
        logger.info("Country {} identified as OTHER (non-EU)", upperCountryCode);
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