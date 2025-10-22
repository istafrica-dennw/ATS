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
        if (isValidIP(remoteAddr) && !isPrivateIP(remoteAddr)) {
            return remoteAddr;
        }
        
        // If we only have private IPs, try to get the real public IP
        if (isPrivateIP(remoteAddr)) {
            return getPublicIPAddress();
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
    
    /**
     * Check if the IP address is private
     */
    private static boolean isPrivateIP(String ip) {
        if (ip == null || ip.trim().isEmpty()) {
            return false;
        }
        
        // Check for private IP ranges
        return ip.startsWith("192.168.") || 
               ip.startsWith("10.") || 
               ip.startsWith("172.16.") || 
               ip.startsWith("172.17.") || 
               ip.startsWith("172.18.") || 
               ip.startsWith("172.19.") || 
               ip.startsWith("172.20.") || 
               ip.startsWith("172.21.") || 
               ip.startsWith("172.22.") || 
               ip.startsWith("172.23.") || 
               ip.startsWith("172.24.") || 
               ip.startsWith("172.25.") || 
               ip.startsWith("172.26.") || 
               ip.startsWith("172.27.") || 
               ip.startsWith("172.28.") || 
               ip.startsWith("172.29.") || 
               ip.startsWith("172.30.") || 
               ip.startsWith("172.31.") ||
               ip.equals("127.0.0.1") || 
               ip.equals("localhost");
    }
    
    /**
     * Get the public IP address by making a request to an external service
     */
    private static String getPublicIPAddress() {
        try {
            // Use a simple service to get the public IP
            java.net.URL url = new java.net.URL("https://api.ipify.org");
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(connection.getInputStream())
            );
            String publicIP = reader.readLine();
            reader.close();
            
            if (isValidIP(publicIP) && !isPrivateIP(publicIP)) {
                return publicIP;
            }
        } catch (Exception e) {
            // If we can't get the public IP, return null
        }
        return null;
    }
}