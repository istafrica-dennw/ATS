#!/bin/bash
# Script to fix admin role

echo "This script will update user roles to ADMIN"
echo "Please provide the email of the user you want to make admin:"
read USER_EMAIL

# Connect to your PostgreSQL database and run the update
# Adjust the connection parameters as needed
psql -U ${POSTGRES_USER:-postgres} -d ${DB_NAME:-ats} -c "UPDATE users SET role = 'ADMIN' WHERE email = '$USER_EMAIL';"

echo "Done! User $USER_EMAIL now has ADMIN role"
echo "Please restart the backend and log in again"
