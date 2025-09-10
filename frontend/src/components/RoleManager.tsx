import React, { useState, useEffect } from 'react';
import { Role, User } from '../types/user';
import { RoleDTO, AssignRolesRequest } from '../services/roleAPI';
import roleAPI from '../services/roleAPI';
import { useAuth } from '../contexts/AuthContext';

interface RoleManagerProps {
  userId: number;
  onUserUpdated?: (user: User) => void;
  className?: string;
}

const RoleManager: React.FC<RoleManagerProps> = ({ 
  userId, 
  onUserUpdated,
  className = '' 
}) => {
  const { user: currentUser } = useAuth();
  const [userRoles, setUserRoles] = useState<RoleDTO[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [primaryRole, setPrimaryRole] = useState<Role | null>(null);
  const [allSystemRoles] = useState<Role[]>([
    Role.ADMIN,
    Role.INTERVIEWER, 
    Role.HIRING_MANAGER,
    Role.CANDIDATE
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getRoleDisplayName = (role: Role): string => {
    switch (role) {
      case Role.ADMIN:
        return 'Administrator';
      case Role.INTERVIEWER:
        return 'Interviewer';
      case Role.HIRING_MANAGER:
        return 'Hiring Manager';
      case Role.CANDIDATE:
        return 'Candidate';
      default:
        return role;
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserRoles();
    }
  }, [userId]);

  // Debug logging for rendering
  useEffect(() => {
    console.log('RoleManager - Rendering with primaryRole:', primaryRole, 'selectedRoles:', selectedRoles);
  }, [primaryRole, selectedRoles]);

  const loadUserRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const roles = await roleAPI.getAvailableRolesForUser(userId);
      setUserRoles(roles);
      
      // Set current roles as selected
      const currentRoles = roles.map((r: RoleDTO) => r.role);
      setSelectedRoles(currentRoles);
      
      // Set primary role
      const primary = roles.find((r: RoleDTO) => r.isPrimary);
      console.log('RoleManager - Loaded roles:', roles);
      console.log('RoleManager - Primary role found:', primary);
      
      // If no primary role is found, set the first role as primary
      const primaryRoleToSet = primary?.role || (currentRoles.length > 0 ? currentRoles[0] : null);
      setPrimaryRole(primaryRoleToSet);
      
    } catch (err) {
      console.error('Failed to load user roles:', err);
      setError('Failed to load user roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (role: Role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Remove role
        const newRoles = prev.filter(r => r !== role);
        // If removing primary role, clear it
        if (primaryRole === role) {
          setPrimaryRole(null);
        }
        return newRoles;
      } else {
        // Add role
        return [...prev, role];
      }
    });
  };

  const handlePrimaryRoleChange = (role: Role) => {
    setPrimaryRole(role);
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) {
      setError('At least one role must be selected');
      return;
    }

    if (!primaryRole || !selectedRoles.includes(primaryRole)) {
      setError('Primary role must be selected from the assigned roles');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const request: AssignRolesRequest = {
        userId,
        roles: selectedRoles,
        primaryRole: primaryRole || undefined
      };

      const updatedUser = await roleAPI.assignRoles(request);
      
      setSuccess('Roles updated successfully');
      if (updatedUser) {
        onUserUpdated?.(updatedUser);
      }
      
      // Reload roles to reflect changes
      await loadUserRoles();
      
    } catch (err) {
      console.error('Failed to update roles:', err);
      setError('Failed to update roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (role: Role) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await roleAPI.removeRole(userId, role);
      
      setSuccess(`Role ${role} removed successfully`);
      
      // Reload roles to reflect changes
      await loadUserRoles();
      
    } catch (err) {
      console.error('Failed to remove role:', err);
      setError('Failed to remove role');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show for non-admin users
  if (currentUser?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className={`role-manager ${className}`}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Role Management
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Available Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Roles
            </label>
            <div className="space-y-2">
              {allSystemRoles.map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role}`}
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    disabled={isLoading}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor={`role-${role}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {getRoleDisplayName(role)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Role Selection */}
          {selectedRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Role
              </label>
              <select
                value={primaryRole || ''}
                onChange={(e) => handlePrimaryRoleChange(e.target.value as Role)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              >
                <option value="">Select primary role</option>
                {selectedRoles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Roles Display */}
          {userRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {userRoles.map((roleData: RoleDTO) => (
                  <div
                    key={roleData.role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {getRoleDisplayName(roleData.role)}
                    {roleData.isPrimary && (
                      <span className="ml-1 text-xs">(Primary)</span>
                    )}
                    <button
                      onClick={() => handleRemoveRole(roleData.role)}
                      disabled={isLoading}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading || selectedRoles.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              onClick={loadUserRoles}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return 'Administrator';
    case Role.HIRING_MANAGER:
      return 'Hiring Manager';
    case Role.INTERVIEWER:
      return 'Interviewer';
    case Role.CANDIDATE:
      return 'Candidate';
    default:
      return role;
  }
};

export default RoleManager;