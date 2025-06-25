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

	/**
	 * Stores a resume file and returns the URL to access it
	 * 
	 * @param file The resume file to store
	 * @return The URL where the file can be accessed
	 */
	String storeResume(MultipartFile file);

	/**
	 * Stores a cover letter file and returns the URL to access it
	 * 
	 * @param file The cover letter file to store
	 * @return The URL where the file can be accessed
	 */
	String storeCoverLetter(MultipartFile file);

	/**
	 * Deletes a file from resumes or cover-letters directory by filename.
	 */
	void deleteFile(String filename);
}