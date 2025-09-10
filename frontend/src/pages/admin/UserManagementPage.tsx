import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Role } from '../../types/user';
import AddUserModal from '../../components/admin/AddUserModal';
import UserDetailsModal from '../../components/admin/UserDetailsModal';
import ProfilePicture from '../../components/common/ProfilePicture';
import { toast } from 'react-toastify';
import { Listbox, Transition } from '@headlessui/react';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const roleOptions = [
  { name: 'All Roles', value: 'all' },
  { name: 'Admin', value: Role.ADMIN },
  { name: 'Interviewer', value: Role.INTERVIEWER },
  { name: 'Hiring Manager', value: Role.HIRING_MANAGER },
  { name: 'Candidate', value: Role.CANDIDATE },
];

const UserManagementPage: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Check if we should open the Add User modal from dashboard navigation
  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddUserModalOpen(true);
    }
  }, [location.state]);

  const handleAddUserClick = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleViewUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsUserDetailsModalOpen(true);
  };

  const handleViewFullProfile = (userId: number) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleCloseUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleDeleteClick = (userId: number, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast.success(`User ${userToDelete.name} deleted successfully`);
        setUsers(users.filter(u => u.id !== userToDelete.id));
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Network error when deleting user. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case Role.INTERVIEWER:
      case Role.HIRING_MANAGER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case Role.CANDIDATE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          {/* Table skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="flex space-x-2">
                    <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Management</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              A list of all users in your account including their name, email, role, and status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
              onClick={handleAddUserClick}
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add user
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 overflow-visible">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile-first responsive layout */}
          <div className="space-y-4 md:space-y-0 md:flex md:items-end md:justify-between md:gap-4">
            {/* Search Field */}
            <div className="flex-1">
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent block w-full pl-10 py-3 text-base dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md transition-all duration-200"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 md:sr-only">
                Filter by Role
              </label>
              <div className="relative">
                <Listbox value={selectedRole} onChange={setSelectedRole}>
                  <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-3 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-base border dark:border-gray-600 transition-all duration-200">
                  <span className="block truncate text-gray-900 dark:text-gray-100">{roleOptions.find(r => r.value === selectedRole)?.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-2 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border dark:border-gray-600">
                      {roleOptions.map((role, roleIdx) => (
                        <Listbox.Option
                          key={roleIdx}
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors duration-150 ${
                              active 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200' 
                                : selected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600/50'
                            }`
                          }
                          value={role.value}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {role.name}
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
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6 min-w-[200px]">
                  Name
                </th>
                <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-[200px]">
                  Email
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-[120px]">
                  Role
                </th>
                <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-[100px]">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-[120px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <ProfilePicture 
                        firstName={user.firstName}
                        lastName={user.lastName}
                        profilePictureUrl={user.profilePictureUrl}
                        size="medium"
                      />
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="sm:hidden text-gray-500 dark:text-gray-400 text-xs truncate mt-1">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</td>
                  <td className="px-3 py-4 text-sm">
                    <div className="space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <div className="md:hidden">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-1 sm:space-x-2">
                      <button
                        type="button"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        onClick={() => handleViewFullProfile(user.id)}
                        title="View full profile"
                      >
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                        onClick={() => handleViewUser(user.id)}
                        title="Quick view"
                      >
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                        onClick={() => handleViewUser(user.id)}
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        onClick={() => handleDeleteClick(user.id, `${user.firstName} ${user.lastName}`)}
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onUserAdded={handleUserAdded}
        token={token!}
      />

      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={handleCloseUserDetailsModal}
        userId={selectedUserId}
        token={token!}
        onUserUpdated={handleUserUpdated}
      />

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 transition-opacity" 
              onClick={cancelDelete}
              aria-hidden="true"
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-gray-100">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          "{userToDelete.name}"
                        </span>
                        ?
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        This action cannot be undone and will permanently remove this user's account.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className={`w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteUser}
                    disabled={isDeleting}
                    className={`w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-sm font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400 transform hover:scale-[1.02] transition-all duration-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-5 w-5 border-2 border-white rounded-full border-t-transparent" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Delete User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage; 