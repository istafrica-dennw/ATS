package com.ats.service.impl;

import com.ats.exception.FileStorageException;
import com.ats.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private final Path fileStorageLocation;
    private final Path profilePicturesDir;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public FileStorageServiceImpl(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        this.profilePicturesDir = this.fileStorageLocation.resolve("profile-pictures");
        
        // Initialize storage directories during construction
        try {
            // Create main upload directory if it doesn't exist
            if (!Files.exists(fileStorageLocation)) {
                Files.createDirectories(fileStorageLocation);
                logger.info("Created main file storage location at: {}", fileStorageLocation);
            }
            
            // Create profile pictures directory if it doesn't exist
            if (!Files.exists(profilePicturesDir)) {
                Files.createDirectories(profilePicturesDir);
                logger.info("Created profile pictures directory at: {}", profilePicturesDir);
            }
            
            // Verify directory is writable
            if (!Files.isWritable(profilePicturesDir)) {
                logger.warn("Profile pictures directory is not writable: {}", profilePicturesDir);
                // Try to fix permissions
                try {
                    Files.setPosixFilePermissions(profilePicturesDir, java.nio.file.attribute.PosixFilePermissions.fromString("rwxrwxrwx"));
                    logger.info("Set permissions on profile pictures directory");
                } catch (Exception e) {
                    logger.warn("Could not set permissions on profile pictures directory", e);
                }
            }
            
            logger.info("File storage locations initialized successfully");
        } catch (IOException ex) {
            logger.error("Could not initialize storage directories", ex);
            throw new FileStorageException("Could not initialize storage directories", ex);
        }
    }
    
    /**
     * Initialize or reinitialize storage directories.
     */
    public void initializeStorageDirectories() {
        try {
            // Create main upload directory if it doesn't exist
            if (!Files.exists(fileStorageLocation)) {
                Files.createDirectories(fileStorageLocation);
                logger.info("Created main file storage location at: {}", fileStorageLocation);
            }
            
            // Create profile pictures directory if it doesn't exist
            if (!Files.exists(profilePicturesDir)) {
                Files.createDirectories(profilePicturesDir);
                logger.info("Created profile pictures directory at: {}", profilePicturesDir);
            }
            
            // Verify directory is writable
            if (!Files.isWritable(profilePicturesDir)) {
                logger.warn("Profile pictures directory is not writable: {}", profilePicturesDir);
                // Try to fix permissions
                try {
                    Files.setPosixFilePermissions(profilePicturesDir, java.nio.file.attribute.PosixFilePermissions.fromString("rwxrwxrwx"));
                    logger.info("Set permissions on profile pictures directory");
                } catch (Exception e) {
                    logger.warn("Could not set permissions on profile pictures directory", e);
                }
            }
            
            logger.info("File storage locations initialized successfully");
        } catch (IOException ex) {
            logger.error("Could not initialize storage directories", ex);
            throw new FileStorageException("Could not initialize storage directories", ex);
        }
    }
    
    /**
     * Periodically check if storage directories exist and recreate if necessary
     */
    @Scheduled(fixedRate = 3600000) // Check every hour
    public void checkStorageDirectories() {
        logger.debug("Performing scheduled check of storage directories");
        try {
            if (!Files.exists(fileStorageLocation) || !Files.exists(profilePicturesDir)) {
                logger.warn("One or more storage directories missing, recreating...");
                initializeStorageDirectories();
            }
        } catch (Exception e) {
            logger.error("Error during scheduled storage directory check", e);
        }
    }

    @Override
    public String storeProfilePicture(MultipartFile file) {
        // Check if directories exist, recreate if needed
        if (!Files.exists(profilePicturesDir)) {
            logger.warn("Profile pictures directory not found, recreating...");
            initializeStorageDirectories();
        }
        
        // Normalize file name and add a UUID to avoid name collisions
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        
        if (fileName.contains(".")) {
            fileExtension = fileName.substring(fileName.lastIndexOf("."));
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }
        
        String uniqueFileName = UUID.randomUUID() + "-" + fileName + fileExtension;
        logger.info("Generated unique filename: {}", uniqueFileName);
        
        // Check for valid file types (images only)
        if (!isImageFile(file)) {
            throw new FileStorageException("Only image files (JPEG, PNG, GIF) are allowed for profile pictures");
        }
        
        try {
            // Copy file to the target location
            Path targetLocation = profilePicturesDir.resolve(uniqueFileName);
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
                logger.info("Stored file at: {}", targetLocation);
                
                // Verify file was actually written
                if (!Files.exists(targetLocation)) {
                    throw new FileStorageException("File appears not to have been written: " + targetLocation);
                }
                
                if (Files.size(targetLocation) == 0) {
                    throw new FileStorageException("File was written but has zero size: " + targetLocation);
                }
            }
            
            // Build the URL to access the file - use a relative URL that starts with / 
            // to ensure it works with both localhost and production environments
            String fileUrl = "/api/files/profile-pictures/" + uniqueFileName;
                    
            logger.info("File URL for access: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException ex) {
            logger.error("Failed to store file: {}", uniqueFileName, ex);
            throw new FileStorageException("Could not store file " + uniqueFileName, ex);
        }
    }
    
    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        logger.debug("Checking file type: {}", contentType);
        return contentType != null && contentType.startsWith("image/");
    }
} 