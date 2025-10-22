package com.ats.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for region field
 * Validates that region is one of: EU, RW, OTHER, or null
 */
public class ValidRegionValidator implements ConstraintValidator<ValidRegion, String> {
    
    private static final String[] VALID_REGIONS = {"EU", "RW", "OTHER"};
    
    @Override
    public void initialize(ValidRegion constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String region, ConstraintValidatorContext context) {
        // null is valid (default value)
        if (region == null) {
            return true;
        }
        
        // Check if region is one of the valid values
        for (String validRegion : VALID_REGIONS) {
            if (validRegion.equals(region)) {
                return true;
            }
        }
        
        return false;
    }
}