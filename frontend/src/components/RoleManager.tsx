import React, { useState, useEffect, useCallback } from 'react';
import { Role, User } from '../types/user';
import { RoleDTO, AssignRolesRequest } from '../services/roleAPI';
import roleAPI from '../services/roleAPI';
import { useAuth } from '../contexts/AuthContext';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

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
  const [initialRoles, setInitialRoles] = useState<{ roles: Role[]; primary: Role | null }>({ roles: [], primary: null });
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

  const loadUserRoles = useCallback(async () => {
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
      
      setInitialRoles({ roles: currentRoles, primary: primaryRoleToSet });
    } catch (err) {
      console.error('Failed to load user roles:', err);
      setError('Failed to load user roles');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserRoles();
    }
  }, [userId, loadUserRoles]);

  useEffect(() => {
    console.log('RoleManager - Rendering with primaryRole:', primaryRole, 'selectedRoles:', selectedRoles);
  }, [primaryRole, selectedRoles]);

  const hasChanges = () => {
    const initialRoleSet = new Set(initialRoles.roles);
    const selectedRoleSet = new Set(selectedRoles);
    
    if (initialRoles.primary !== primaryRole) {
      return true;
    }
    
    if (initialRoleSet.size !== selectedRoleSet.size) {
      return true;
    }

    for (const role of Array.from(initialRoleSet)) {
      if (!selectedRoleSet.has(role)) {
        return true;
      }
    }

    return false;
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Roles
            </label>
            <div className="space-y-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
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

          <div className="space-y-6">
            {selectedRoles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Role
                </label>
                <Listbox value={primaryRole} onChange={handlePrimaryRoleChange}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                      <span className="block truncate">{primaryRole ? getRoleDisplayName(primaryRole) : 'Select primary role'}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {selectedRoles.map((role) => (
                          <Listbox.Option
                            key={role}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                            value={role}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {getRoleDisplayName(role)}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 dark:text-indigo-400">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            )}

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
          </div>
        </div>

        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges()}
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
  );
};

export default RoleManager;