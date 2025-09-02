import React, { useState, Fragment } from 'react';
import { Role } from '../../types/user';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ChevronUpDownIcon, CheckIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  token: string;
}

const roleOptions = [
  { name: 'Admin', value: Role.ADMIN },
  { name: 'Interviewer', value: Role.INTERVIEWER },
  { name: 'Hiring Manager', value: Role.HIRING_MANAGER },
  { name: 'Candidate', value: Role.CANDIDATE },
];

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded, token }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: Role.CANDIDATE,
    sendVerificationEmail: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setFormData({
      ...formData,
      role: newRole,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: true,
          isEmailVerified: !formData.sendVerificationEmail, // Only mark as verified if not sending email
          sendVerificationEmail: formData.sendVerificationEmail,
        }),
      });
      
      if (response.ok) {
        // Success toast notification
        const successMessage = formData.sendVerificationEmail 
          ? `User ${formData.firstName} ${formData.lastName} created successfully. A verification email has been sent.`
          : `User ${formData.firstName} ${formData.lastName} created successfully.`;
        
        toast.success(successMessage);
        onUserAdded();
        onClose();
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          role: Role.CANDIDATE,
          sendVerificationEmail: true,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          // Error toast notification
          toast.error(`Failed to create user: ${errorData.message}`);
          setErrors({
            ...errors,
            form: errorData.message,
          });
        } else {
          // Generic error toast notification
          toast.error('Failed to create user. Please try again.');
          setErrors({
            ...errors,
            form: 'Failed to create user. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // Network error toast notification
      toast.error('Network error. Please check your connection and try again.');
      setErrors({
        ...errors,
        form: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900/75 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-bottom shadow-xl dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-6 sm:p-8 sm:pb-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">Add New User</h3>
              <button
                type="button"
                className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {errors.form && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4">
                <div className="text-sm text-red-700 dark:text-red-400">{errors.form}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full py-3 px-4 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all duration-200 ${
                      errors.firstName 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  />
                  {errors.firstName && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full py-3 px-4 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all duration-200 ${
                      errors.lastName 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  />
                  {errors.lastName && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full py-3 px-4 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <Listbox value={formData.role} onChange={handleRoleChange}>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                      <span className="block truncate">{roleOptions.find(r => r.value === formData.role)?.name}</span>
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
                        {roleOptions.map((role, roleIdx) => (
                          <Listbox.Option
                            key={roleIdx}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                              }`
                            }
                            value={role.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full py-3 px-4 pr-10 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full py-3 px-4 pr-20 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent shadow-sm transition-all duration-200 ${
                        errors.confirmPassword || passwordsDontMatch
                          ? 'border-red-500 dark:border-red-400' 
                          : passwordsMatch
                          ? 'border-green-500 dark:border-green-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    />
                    
                    <div className="absolute inset-y-0 right-10 flex items-center pr-1">
                      {formData.confirmPassword && (
                        <>
                          {passwordsMatch ? (
                            <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
                          ) : passwordsDontMatch ? (
                            <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
                          ) : null}
                        </>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center">
                      {passwordsMatch ? (
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                          <CheckIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                          Passwords match
                        </p>
                      ) : passwordsDontMatch ? (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <XCircleIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                          Passwords do not match
                        </p>
                      ) : null}
                    </div>
                  )}
                  
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="sendVerificationEmail"
                    name="sendVerificationEmail"
                    checked={formData.sendVerificationEmail}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-offset-0 transition-colors duration-200"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="sendVerificationEmail" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Send verification email to user
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    User will need to verify their email before they can log in.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 sm font-medium text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:ml-3 sm:w-auto transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 sm:mt-0 sm:w-auto transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal; 