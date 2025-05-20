package com.ats.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        errorDetails.put("status", status != null ? status : HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("message", message != null ? message : "Unknown error");
        errorDetails.put("path", path != null ? path : request.getRequestURI());
        
        if (exception != null) {
            errorDetails.put("exception", exception.toString());
            System.out.println("[DEBUG] Exception: " + exception);
        }
        
        return ResponseEntity.status(
                status != null ? Integer.parseInt(status.toString()) : HttpStatus.INTERNAL_SERVER_ERROR.value()
            ).body(errorDetails);
    }

    @ControllerAdvice
    public static class GlobalExceptionHandler {
        // ✅ Handle validation errors on DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorDetails.put("message", ex.getMessage());
            errorDetails.put("exception", ex.getClass().getName());
            
            System.out.println("[DEBUG] Global exception: " + ex);
            ex.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetails);
        }
        
        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFoundException(NoHandlerFoundException ex) {
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("status", HttpStatus.NOT_FOUND.value());
            errorDetails.put("message", "Resource not found");
            errorDetails.put("path", ex.getRequestURL());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetails);
        }
    }
} 