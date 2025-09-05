package com.ats.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = OfficeAddressRequiredValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface OfficeAddressRequired {
    String message() default "Location address is required for office interviews";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}