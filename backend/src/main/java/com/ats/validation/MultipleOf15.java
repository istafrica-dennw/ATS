package com.ats.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = MultipleOf15Validator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface MultipleOf15 {
    String message() default "Duration must be a multiple of 15 minutes";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}