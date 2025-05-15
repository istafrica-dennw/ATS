-- Add user profile fields
ALTER TABLE users
ADD COLUMN birth_date DATE,
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN address_line1 VARCHAR(255),
ADD COLUMN address_line2 VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN bio TEXT,
ADD COLUMN deactivation_reason TEXT,
ADD COLUMN deactivation_date TIMESTAMP; 