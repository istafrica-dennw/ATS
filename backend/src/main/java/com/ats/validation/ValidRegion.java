package com.ats.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for region field
 * Ensures region value is one of: EU, RW, OTHER, or null
 */
@Documented
@Constraint(validatedBy = ValidRegionValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRegion {
    String message() default "Invalid region. Must be one of: EU, RW, OTHER, or null";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}