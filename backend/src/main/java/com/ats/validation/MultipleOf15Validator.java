package com.ats.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MultipleOf15Validator implements ConstraintValidator<MultipleOf15, Integer> {
    
    @Override
    public void initialize(MultipleOf15 constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        // Allow null values (optional field)
        if (value == null) {
            return true;
        }
        
        // Check if value is a multiple of 15
        return value % 15 == 0;
    }
}