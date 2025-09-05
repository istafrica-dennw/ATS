package com.ats.model;

/**
 * Enum for interview location types
 */
public enum LocationType {
    OFFICE("Office Interview"),
    ONLINE("Online Interview");

    private final String displayName;

    LocationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}