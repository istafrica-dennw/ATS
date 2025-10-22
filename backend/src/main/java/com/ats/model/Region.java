package com.ats.model;

/**
 * Enum representing user regions for GDPR compliance
 */
public enum Region {
    EU("Europe"),
    RW("Rwanda"), 
    OTHER("Other regions");
    
    private final String description;
    
    Region(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if this region is EU (for GDPR compliance)
     */
    public boolean isEU() {
        return this == EU;
    }
    
    /**
     * Get region from string value
     */
    public static Region fromString(String value) {
        if (value == null) {
            return null;
        }
        
        for (Region region : Region.values()) {
            if (region.name().equals(value)) {
                return region;
            }
        }
        
        throw new IllegalArgumentException("Invalid region: " + value);
    }
    
    /**
     * Check if a string value is a valid region
     */
    public static boolean isValid(String region) {
        if (region == null || region.trim().isEmpty()) {
            return true; // NULL is allowed for default
        }
        for (Region r : Region.values()) {
            if (r.name().equalsIgnoreCase(region)) {
                return true;
            }
        }
        return false;
    }
}