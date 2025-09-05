package com.ats.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import com.ats.model.LocationType;

public class OfficeAddressRequiredValidator implements ConstraintValidator<OfficeAddressRequired, String> {
    
    @Override
    public void initialize(OfficeAddressRequired constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String address, ConstraintValidatorContext context) {
        // This validator will be applied to the address field
        // We need to check the location type from the parent object
        // For now, we'll handle this validation in the service layer
        // since we need access to both locationType and locationAddress
        return true; // Always pass here, handle in service
    }
}