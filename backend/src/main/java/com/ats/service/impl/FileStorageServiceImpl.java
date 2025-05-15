package com.ats.service.impl;

import com.ats.exception.FileStorageException;
import com.ats.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public FileStorageServiceImpl(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            logger.info("File storage location initialized at: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored", ex);
        }
    }

    @Override
    public String storeProfilePicture(MultipartFile file) {
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
            // Create the "profile-pictures" subdirectory if it doesn't exist
            Path profilePicturesDir = this.fileStorageLocation.resolve("profile-pictures");
            if (!Files.exists(profilePicturesDir)) {
                Files.createDirectories(profilePicturesDir);
                logger.info("Created profile pictures directory at: {}", profilePicturesDir);
            }
            
            // Copy file to the target location
            Path targetLocation = profilePicturesDir.resolve(uniqueFileName);
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
                logger.info("Stored file at: {}", targetLocation);
            }
            
            // Build the URL to access the file - use a relative URL that starts with / 
            // to ensure it works with both localhost and production environments
            String fileUrl = "/api/files/profile-pictures/" + uniqueFileName;
                    
            logger.info("File URL for access: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + uniqueFileName, ex);
        }
    }
    
    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        logger.debug("Checking file type: {}", contentType);
        return contentType != null && contentType.startsWith("image/");
    }
} 