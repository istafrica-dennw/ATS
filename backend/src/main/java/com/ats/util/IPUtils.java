package com.ats.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Utility class for extracting IP addresses from HTTP requests
 */
public class IPUtils {
    
    /**
     * Extract the real IP address from the current HTTP request
     * Handles various proxy headers and load balancers
     * 
     * @return the real IP address or null if not available
     */
    public static String getClientIPAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return null;
            }
            
            HttpServletRequest request = attributes.getRequest();
            return getClientIPAddress(request);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Extract the real IP address from an HTTP request
     * Handles various proxy headers and load balancers
     * 
     * @param request the HTTP request
     * @return the real IP address or null if not available
     */
    public static String getClientIPAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        
        // Check various headers that might contain the real IP
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP", 
            "X-Client-IP",
            "CF-Connecting-IP", // Cloudflare
            "X-Cluster-Client-IP",
            "X-Forwarded",
            "Forwarded-For",
            "Forwarded"
        };
        
        for (String headerName : headerNames) {
            String headerValue = request.getHeader(headerName);
            if (headerValue != null && !headerValue.trim().isEmpty()) {
                // X-Forwarded-For can contain multiple IPs, take the first one
                String ip = headerValue.split(",")[0].trim();
                if (isValidIP(ip)) {
                    return ip;
                }
            }
        }
        
        // Fallback to remote address
        String remoteAddr = request.getRemoteAddr();
        if (isValidIP(remoteAddr)) {
            return remoteAddr;
        }
        
        return null;
    }
    
    /**
     * Check if the IP address is valid
     */
    private static boolean isValidIP(String ip) {
        if (ip == null || ip.trim().isEmpty()) {
            return false;
        }
        
        // Basic IP validation (IPv4 and IPv6)
        return ip.matches("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$") || 
               ip.matches("^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$");
    }
}