package com.ats.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to indicate that a method requires a valid Authentication object.
 * Methods annotated with this will be intercepted to check if the Authentication
 * parameter is null, and if so, return a 401 Unauthorized response.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresAuthentication {
    /**
     * Custom message to include in the error response
     */
    String message() default "Unauthorized: Please Authenticate";
} 