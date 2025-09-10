import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { getDefaultDashboardPath } from '../utils/routeUtils';
import { createPortal } from 'react-dom';

const RoleSwitcher: React.FC = () => {
  const { availableRoles, currentRole, switchRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 224, // 224px is w-56 (14rem)
        width: rect.width
      });
    }
  }, [isOpen]);

  // Debug logging
  console.log('RoleSwitcher - isLoading:', isLoading, 'currentRole:', currentRole, 'availableRoles:', availableRoles);
  
  if (isLoading || !currentRole) {
    return null; // Don't show if loading or no current role
  }
  
  // For testing: show even with one role, but with different styling
  if (availableRoles.length <= 1) {
    return (
      <div className="mt-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {getRoleDisplayName(currentRole)}
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Single role - no switching available
        </p>
      </div>
    );
  }

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) return;

    try {
      await switchRole(newRole);
      setIsOpen(false);
      
      // Navigate to the appropriate dashboard based on role
      const dashboardPath = getDefaultDashboardPath(newRole);
      navigate(dashboardPath);
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  const getRoleColor = (role: Role): string => {
    switch (role) {
      case Role.ADMIN:
        return 'text-red-600 dark:text-red-400';
      case Role.INTERVIEWER:
        return 'text-blue-600 dark:text-blue-400';
      case Role.HIRING_MANAGER:
        return 'text-green-600 dark:text-green-400';
      case Role.CANDIDATE:
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-indigo-600 dark:text-indigo-400';
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-medium rounded-md uppercase tracking-wider transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${getRoleColor(currentRole)}`}
        >
          {getRoleDisplayName(currentRole)}
          <ChevronDownIcon className="ml-1 h-4 w-4" />
        </button>
      </div>

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="fixed z-50 w-56 rounded-md bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
          >
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                Switch Role
              </div>
              {availableRoles.map((roleDto) => (
                <button
                  key={roleDto.role}
                  onClick={() => handleRoleChange(roleDto.role)}
                  disabled={roleDto.role === currentRole}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    roleDto.role === currentRole
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 cursor-default'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={getRoleColor(roleDto.role)}>
                      {getRoleDisplayName(roleDto.role)}
                    </span>
                    {roleDto.role === currentRole && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        Current
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default RoleSwitcher;