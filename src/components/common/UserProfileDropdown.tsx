import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

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
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          {user.profilePictureUrl ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.profilePictureUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <Link
                to="/profile"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 text-sm text-gray-700 w-full items-center'
                )}
              >
                <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Profile
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <Link
                to="/profile/settings"
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 text-sm text-gray-700 w-full items-center'
                )}
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Settings
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                onClick={logout}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'flex px-4 py-2 text-sm text-gray-700 w-full items-center'
                )}
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserProfileDropdown; 