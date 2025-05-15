package com.ats.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling file storage operations
 */
public interface FileStorageService {
    
    /**
     * Stores a profile picture file and returns the URL to access it
     * 
     * @param file The profile picture file to store
     * @return The URL where the file can be accessed
     */
    String storeProfilePicture(MultipartFile file);
} 