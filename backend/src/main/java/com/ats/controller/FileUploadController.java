package com.ats.controller;

import com.ats.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "APIs for file uploads")
public class FileUploadController {
    
    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    private final FileStorageService fileStorageService;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload/profile-picture")
    @Operation(summary = "Upload profile picture", description = "Uploads a profile picture for a user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file format"),
        @ApiResponse(responseCode = "500", description = "Server error during upload")
    })
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @Parameter(description = "Profile picture file to upload", required = true)
            @RequestParam("file") MultipartFile file) {
        
        String fileUrl = fileStorageService.storeProfilePicture(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("message", "File uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Returns information about the file storage system")
    public ResponseEntity<Map<String, Object>> getFileSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Path profilePicsPath = uploadPath.resolve("profile-pictures");
            
            boolean uploadDirExists = Files.exists(uploadPath);
            boolean profilePicsDirExists = Files.exists(profilePicsPath);
            
            info.put("uploadDirectory", uploadPath.toString());
            info.put("profilePicturesDirectory", profilePicsPath.toString());
            info.put("uploadDirectoryExists", String.valueOf(uploadDirExists));
            info.put("profilePicturesDirectoryExists", String.valueOf(profilePicsDirExists));
            
            // List files in the profile pictures directory if it exists
            if (profilePicsDirExists) {
                List<Map<String, String>> files = new ArrayList<>();
                try (Stream<Path> paths = Files.list(profilePicsPath)) {
                    List<Path> filesList = paths.collect(Collectors.toList());
                    
                    for (Path filePath : filesList) {
                        Map<String, String> fileInfo = new HashMap<>();
                        String filename = filePath.getFileName().toString();
                        fileInfo.put("name", filename);
                        fileInfo.put("fullPath", filePath.toString());
                        fileInfo.put("size", String.valueOf(Files.size(filePath)) + " bytes");
                        fileInfo.put("url", "/api/files/profile-pictures/" + filename);
                        files.add(fileInfo);
                    }
                    
                    info.put("files", files);
                    info.put("fileCount", files.size());
                }
            }
            
            info.put("message", "File system information retrieved successfully");
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("Error retrieving file system info", e);
            info.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(info);
        }
    }
} 