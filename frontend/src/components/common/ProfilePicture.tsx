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
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    small: 'h-8 w-8 text-xs',
    medium: 'h-10 w-10 text-sm',
    large: 'h-12 w-12 text-base'
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
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

  // Show profile picture with loading state
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full flex items-center justify-center">
          <span className="text-gray-400 font-medium text-xs">
            {initials}
          </span>
        </div>
      )}
      <img
        src={profilePictureUrl}
        alt={`${firstName} ${lastName}`}
        className={`h-full w-full object-cover transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ProfilePicture; 