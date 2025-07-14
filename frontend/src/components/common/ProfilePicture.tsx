import React, { useState } from 'react';

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  firstName,
  lastName,
  profilePictureUrl,
  size = 'medium',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'h-8 w-8 text-xs',
    medium: 'h-10 w-10 text-sm',
    large: 'h-12 w-12 text-base'
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleImageError = () => {
    setImageError(true);
  };

  // Show initials if no profile picture URL or if image failed to load
  if (!profilePictureUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}>
        <span className="text-gray-500 font-medium">
          {initials}
        </span>
      </div>
    );
  }

  // Show profile picture
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      <img
        src={profilePictureUrl}
        alt={`${firstName} ${lastName}`}
        className="h-full w-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default ProfilePicture; 