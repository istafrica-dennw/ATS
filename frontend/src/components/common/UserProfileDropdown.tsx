import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
          <span className="sr-only">Open user menu</span>
          {user.profilePictureUrl ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.profilePictureUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-medium">
              {initials}
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] ring-1 ring-black ring-opacity-5 dark:ring-gray-700 dark:ring-opacity-50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={classNames(
                  active ? 'bg-gray-50 dark:bg-gray-700/50' : '',
                  'flex px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full items-center transition-colors'
                )}
              >
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Profile
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile/settings"
                className={classNames(
                  active ? 'bg-gray-50 dark:bg-gray-700/50' : '',
                  'flex px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full items-center transition-colors'
                )}
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Settings
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile/security"
                className={classNames(
                  active ? 'bg-gray-50 dark:bg-gray-700/50' : '',
                  'flex px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full items-center transition-colors'
                )}
              >
                <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                Security
              </Link>
            )}
          </Menu.Item>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={classNames(
                    active ? 'bg-gray-50 dark:bg-gray-700/50' : '',
                    'flex px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full items-center transition-colors'
                  )}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserProfileDropdown; 