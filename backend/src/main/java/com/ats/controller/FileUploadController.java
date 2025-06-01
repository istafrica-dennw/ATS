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
import java.io.IOException;
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
    
    @PostMapping("/upload/resume")
    @Operation(summary = "Upload resume", description = "Uploads a resume for a job application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file format"),
        @ApiResponse(responseCode = "500", description = "Server error during upload")
    })
    public ResponseEntity<Map<String, String>> uploadResume(
            @Parameter(description = "Resume file to upload (PDF, DOC, DOCX, TXT)", required = true)
            @RequestParam("file") MultipartFile file) {
        
        String fileUrl = fileStorageService.storeResume(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("message", "Resume uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/upload/cover-letter")
    @Operation(summary = "Upload cover letter", description = "Uploads a cover letter for a job application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file format"),
        @ApiResponse(responseCode = "500", description = "Server error during upload")
    })
    public ResponseEntity<Map<String, String>> uploadCoverLetter(
            @Parameter(description = "Cover letter file to upload (PDF, DOC, DOCX, TXT)", required = true)
            @RequestParam("file") MultipartFile file) {
        
        String fileUrl = fileStorageService.storeCoverLetter(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("message", "Cover letter uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/profile-pictures/{fileName:.+}")
    @Operation(summary = "Get profile picture", description = "Retrieves a profile picture by its filename")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve("profile-pictures").resolve(fileName);
            byte[] fileBytes = Files.readAllBytes(filePath);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(fileBytes);
        } catch (Exception e) {
            logger.error("Error retrieving profile picture: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/resumes/{fileName:.+}")
    @Operation(summary = "Get resume", description = "Retrieves a resume by its filename")
    public ResponseEntity<byte[]> getResume(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve("resumes").resolve(fileName);
            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = determineContentType(fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);
        } catch (Exception e) {
            logger.error("Error retrieving resume: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/cover-letters/{fileName:.+}")
    @Operation(summary = "Get cover letter", description = "Retrieves a cover letter by its filename")
    public ResponseEntity<byte[]> getCoverLetter(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve("cover-letters").resolve(fileName);
            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = determineContentType(fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);
        } catch (Exception e) {
            logger.error("Error retrieving cover letter: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "txt":
                return "text/plain";
            default:
                return "application/octet-stream";
        }
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Returns information about the file storage system")
    public ResponseEntity<Map<String, Object>> getFileSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Path profilePicsPath = uploadPath.resolve("profile-pictures");
            Path resumesPath = uploadPath.resolve("resumes");
            Path coverLettersPath = uploadPath.resolve("cover-letters");
            
            boolean uploadDirExists = Files.exists(uploadPath);
            boolean profilePicsDirExists = Files.exists(profilePicsPath);
            boolean resumesDirExists = Files.exists(resumesPath);
            boolean coverLettersDirExists = Files.exists(coverLettersPath);
            
            info.put("uploadDirectory", uploadPath.toString());
            info.put("profilePicturesDirectory", profilePicsPath.toString());
            info.put("resumesDirectory", resumesPath.toString());
            info.put("coverLettersDirectory", coverLettersPath.toString());
            info.put("uploadDirectoryExists", String.valueOf(uploadDirExists));
            info.put("profilePicturesDirectoryExists", String.valueOf(profilePicsDirExists));
            info.put("resumesDirectoryExists", String.valueOf(resumesDirExists));
            info.put("coverLettersDirectoryExists", String.valueOf(coverLettersDirExists));
            
            // List files in the profile pictures directory if it exists
            if (profilePicsDirExists) {
                info.put("profilePictures", getDirectoryFiles(profilePicsPath, "/api/files/profile-pictures/"));
            }
            
            // List files in the resumes directory if it exists
            if (resumesDirExists) {
                info.put("resumes", getDirectoryFiles(resumesPath, "/api/files/resumes/"));
            }
            
            // List files in the cover letters directory if it exists
            if (coverLettersDirExists) {
                info.put("coverLetters", getDirectoryFiles(coverLettersPath, "/api/files/cover-letters/"));
            }
            
            info.put("message", "File system information retrieved successfully");
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("Error retrieving file system info", e);
            info.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(info);
        }
    }
    
    private Map<String, Object> getDirectoryFiles(Path directory, String urlPrefix) throws IOException {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> files = new ArrayList<>();
        
        try (Stream<Path> paths = Files.list(directory)) {
            List<Path> filesList = paths.collect(Collectors.toList());
            
            for (Path filePath : filesList) {
                Map<String, String> fileInfo = new HashMap<>();
                String filename = filePath.getFileName().toString();
                fileInfo.put("name", filename);
                fileInfo.put("fullPath", filePath.toString());
                fileInfo.put("size", String.valueOf(Files.size(filePath)) + " bytes");
                fileInfo.put("url", urlPrefix + filename);
                files.add(fileInfo);
            }
        }
        
        result.put("files", files);
        result.put("fileCount", files.size());
        return result;
    }
} 