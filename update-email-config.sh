#!/bin/bash

# Create a backup of the original .env file
cp .env .env.backup

# Update the email configuration
sed -i '' 's/MAIL_USERNAME=your-email@gmail.com/MAIL_USERNAME=denis.niwemugisha@gmail.com/' .env
echo "Please enter your Gmail App Password (without quotes):"
read -s app_password
escaped_password=$(printf "%q" "$app_password")
sed -i '' "s/MAIL_PASSWORD=\"your app password with spaces\"/MAIL_PASSWORD=\"$escaped_password\"/" .env

echo "Email configuration updated. A backup of the original .env file was created as .env.backup"
echo "Now let's restart the containers to apply the changes"
docker-compose down
docker-compose up -d

echo "Containers restarted. Wait a few moments for the backend to initialize."
echo "You can check the status with: docker logs -f ats-backend" 