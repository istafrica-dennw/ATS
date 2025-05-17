package com.ats.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class MfaRequiredException extends RuntimeException {
    
    public MfaRequiredException(String message) {
        super(message);
    }
    
    public MfaRequiredException(String message, Throwable cause) {
        super(message, cause);
    }
} 