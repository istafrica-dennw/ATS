package com.ats.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints or controller methods that require 2FA to be enabled.
 * Can be used with or without specifying roles.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Require2FA {
    /**
     * Roles for which 2FA is required.
     * If empty, 2FA is required for all users accessing the endpoint.
     */
    String[] roles() default {};
} 