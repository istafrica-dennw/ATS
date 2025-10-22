package com.ats.service;

import com.ats.model.Region;

/**
 * Service interface for IP geolocation detection
 */
public interface GeolocationService {
    
    /**
     * Detect the region based on IP address
     * @param ipAddress the IP address to check
     * @return the detected region (EU, RW, OTHER, or null if unable to determine)
     */
    Region detectRegion(String ipAddress);
    
    /**
     * Check if the IP address is from EU region
     * @param ipAddress the IP address to check
     * @return true if the IP is from EU region
     */
    boolean isEUAccess(String ipAddress);
    
    /**
     * Check if the IP address is from Rwanda
     * @param ipAddress the IP address to check
     * @return true if the IP is from Rwanda
     */
    boolean isRwandaAccess(String ipAddress);
}