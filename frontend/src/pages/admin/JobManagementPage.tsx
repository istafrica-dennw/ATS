import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,

  ChevronUpIcon
} from '@heroicons/react/24/outline';

import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

// Types
interface Job {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  postedDate: string;
  workSetting: 'REMOTE' | 'ONSITE' | 'HYBRID';
  jobStatus: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'REOPENED';
  salaryRange: string;
  customQuestions?: CustomQuestion[];
}

interface CustomQuestion {
  id: string;
  question: string;
  isRequired: boolean;
  type: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'RATING' | 'FILE_UPLOAD' | 'DATE';
  options?: string[];
}

interface JobFormData {
  title: string;
  department: string;
  description: string;
  location: string;
  employmentType: string;
  skills: string[];
  workSetting: 'REMOTE' | 'ONSITE' | 'HYBRID';
  jobStatus?: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'REOPENED';
  salaryRange: string;
  customQuestions: CustomQuestion[];
}

const initialFormData: JobFormData = {
  title: '',
  department: '',
  description: '',
  location: '',
  employmentType: 'Full Time',
  skills: [],
  workSetting: 'ONSITE',
  jobStatus: 'DRAFT',
  salaryRange: '',
  customQuestions: []
};

const JobManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [skillInput, setSkillInput] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Add click event listener to close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll('[id^="status-dropdown-"]');
      dropdowns.forEach(dropdown => {
        if (!(dropdown as HTMLElement).classList.contains('hidden')) {
          // Check if the click is outside the dropdown
          if (!(event.target as HTMLElement).closest(`#${dropdown.id}`) && 
              !(event.target as HTMLElement).closest(`[data-dropdown-toggle="${dropdown.id}"]`)) {
            (dropdown as HTMLElement).classList.add('hidden');
          }
        }
      });
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Check if we should open the Create Job modal from dashboard navigation
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setFormData(initialFormData);
      setIsEditing(false);
      setCurrentJobId(null);
      setShowModal(true);
    }
  }, [location.state]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add a skill to the skills array
  const handleAddSkill = () => {
    if (skillInput.trim() !== '' && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  // Remove a skill from the skills array
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Handle skill input keypress (add on Enter)
  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Submit form to create or update a job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert frontend custom questions format to backend format
      const convertedCustomQuestions = formData.customQuestions.map(q => ({
        id: q.id.startsWith('temp_') ? null : parseInt(q.id), // null for new questions with temp_ prefix
        jobId: currentJobId,
        questionText: q.question,
        questionType: q.type,
        options: q.options && q.options.length > 0 ? q.options : null,
        required: q.isRequired,
        active: true
      }));

      const submitData = {
        ...formData,
        customQuestions: convertedCustomQuestions
      };

      console.log('Submitting job data:', submitData);

      if (isEditing && currentJobId) {
        // Update existing job
        await axios.put(`/api/jobs/${currentJobId}`, submitData);
        toast.success('Job updated successfully!');
      } else {
        // Create new job
        await axios.post('/api/jobs', submitData);
        toast.success('Job created successfully!');
      }
      
      // Reset form and fetch updated jobs
      setShowModal(false);
      setFormData(initialFormData);
      setIsEditing(false);
      setCurrentJobId(null);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to save job. Please try again.');
      console.error('Error saving job:', err);
    }
  };

  // State for new custom question form
  const [newQuestion, setNewQuestion] = useState<Omit<CustomQuestion, 'id'>>({ 
    question: '', 
    isRequired: false, 
    type: 'TEXT',
    options: []
  });
  const [showQuestionForm, setShowQuestionForm] = useState<boolean>(false);
  const [newOption, setNewOption] = useState<string>('');

  // Add a new custom question
  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) return;
    
    const question: CustomQuestion = {
      ...newQuestion,
      id: `temp_${Date.now()}`, // Use temp_ prefix for new questions
      options: newQuestion.type === 'MULTIPLE_CHOICE' ? (newQuestion.options || []) : undefined
    };
    
    setFormData({
      ...formData,
      customQuestions: [...formData.customQuestions, question]
    });
    
    // Reset form
    setNewQuestion({ 
      question: '', 
      isRequired: false, 
      type: 'TEXT',
      options: [] 
    });
    setShowQuestionForm(false);
  };

  // Delete a question
  const handleDeleteQuestion = async (id: string) => {
    // If it's a new question (temp_ prefix), delete immediately
    if (id.startsWith('temp_')) {
      setFormData({
        ...formData,
        customQuestions: formData.customQuestions.filter(q => q.id !== id)
      });
      return;
    }

    // For existing questions, check if they have answers
    try {
      await axios.delete(`/api/jobs/custom-questions/${id}`);
      setFormData({
        ...formData,
        customQuestions: formData.customQuestions.filter(q => q.id !== id)
      });
      toast.success('Question deleted successfully!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Cannot delete question: it has already been answered by applicants');
      } else {
        toast.error('Failed to delete question. Please try again.');
      }
      console.error('Error deleting question:', error);
    }
  };

  // Add option to question
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), newOption.trim()]
    });
    setNewOption('');
  };

  // Remove option from question
  const handleRemoveOption = (index: number) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions.splice(index, 1);
    setNewQuestion({
      ...newQuestion,
      options: newOptions
    });
  };

  // Open edit modal with job data
  const handleEdit = async (job: Job) => {
    console.log('Editing job:', job);
    console.log('Job location:', job.location);
    
    try {
      // Fetch the complete job details including custom questions
      const response = await axios.get(`/api/jobs/${job.id}`);
      const fullJobData = response.data;
      
      console.log('Full job data with custom questions:', fullJobData);
      
      // Convert backend custom questions format to frontend format
      const convertedCustomQuestions = fullJobData.customQuestions ? 
        fullJobData.customQuestions.map((q: any) => ({
          id: q.id.toString(), // Convert number to string for frontend
          question: q.questionText,
          isRequired: q.required,
          type: q.questionType,
          options: q.options || []
        })) : [];
      
      const updatedFormData = {
        title: fullJobData.title || '',
        department: fullJobData.department || '',
        description: fullJobData.description || '',
        location: fullJobData.location || '',
        employmentType: fullJobData.employmentType || 'Full Time',
        skills: fullJobData.skills || [],
        workSetting: fullJobData.workSetting || 'ONSITE',
        jobStatus: fullJobData.jobStatus || 'DRAFT',
        salaryRange: fullJobData.salaryRange || '',
        customQuestions: convertedCustomQuestions
      };
      
      console.log('Setting form data with converted custom questions:', updatedFormData);
      setFormData(updatedFormData);
      setIsEditing(true);
      setCurrentJobId(job.id);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job details for editing:', error);
      toast.error('Failed to load job details for editing');
    }
  };

  // Delete a job
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`/api/jobs/${id}`);
        toast.success('Job deleted successfully!');
        fetchJobs();
      } catch (err) {
        toast.error('Failed to delete job. Please try again.');
        console.error('Error deleting job:', err);
      }
    }
  };

  // Change job status
  const handleStatusChange = async (id: number, newStatus: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'REOPENED') => {
    try {
      // Log the request
      console.log(`Updating job ${id} status to ${newStatus}`);
      
      // Make API call to update status using PATCH
      // The backend expects a JobStatus enum, so we need to send it as a JSON object with the status property
      const response = await axios.patch(`/api/jobs/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      toast.success(`Job status updated to ${newStatus.toLowerCase()}`);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to update job status. Please try again.');
      console.error('Error updating job status:', err);
    }
  };

  // Filter jobs by status
  const filteredJobs = filterStatus === 'ALL' 
    ? jobs 
    : jobs.filter(job => job.jobStatus === filterStatus);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Published</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Draft</span>;
      case 'EXPIRED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Expired</span>;
      case 'CLOSED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Closed</span>;
      case 'REOPENED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Reopened</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get work setting badge
  const getWorkSettingBadge = (setting: string) => {
    switch (setting) {
      case 'REMOTE':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Remote</span>;
      case 'ONSITE':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Onsite</span>;
      case 'HYBRID':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Hybrid</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{setting}</span>;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Job Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create, edit, and manage job postings for your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setIsEditing(false);
              setCurrentJobId(null);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Job
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="mt-4 flex items-center space-x-4">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          name="status-filter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="EXPIRED">Expired</option>
          <option value="CLOSED">Closed</option>
          <option value="REOPENED">Reopened</option>
        </select>
        
        <button
          type="button"
          onClick={fetchJobs}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Job table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">No jobs found. Create a new job to get started.</div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Department
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Work Setting
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Posted Date
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {job.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.department}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.location}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {getWorkSettingBadge(job.workSetting)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 relative">
                          <div className="relative inline-block text-left">
                            <div>
                              <button 
                                type="button"
                                data-dropdown-toggle={`status-dropdown-${job.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Close all other dropdowns first
                                  document.querySelectorAll('[id^="status-dropdown-"]').forEach(el => {
                                    if (el.id !== `status-dropdown-${job.id}`) {
                                      el.classList.add('hidden');
                                    }
                                  });
                                  
                                  // Toggle this dropdown visibility
                                  const dropdownId = `status-dropdown-${job.id}`;
                                  const dropdown = document.getElementById(dropdownId);
                                  if (dropdown) {
                                    dropdown.classList.toggle('hidden');
                                  }
                                }}
                                className="inline-flex items-center"
                              >
                                {getStatusBadge(job.jobStatus)}
                                <ChevronUpIcon className="ml-1 h-4 w-4 text-gray-400" aria-hidden="true" />
                              </button>
                            </div>

                            <div 
                              id={`status-dropdown-${job.id}`}
                              className="absolute left-0 bottom-full z-50 mb-2 w-56 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden"
                              style={{ minWidth: '200px', maxHeight: '300px', overflow: 'auto' }}
                            >
                              <div className="py-1">
                                {job.jobStatus !== 'PUBLISHED' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(job.id, 'PUBLISHED');
                                      document.getElementById(`status-dropdown-${job.id}`)?.classList.add('hidden');
                                    }}
                                    className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <CheckCircleIcon className="mr-3 h-5 w-5 text-green-500" aria-hidden="true" />
                                    Publish
                                  </button>
                                )}
                                
                                {job.jobStatus !== 'DRAFT' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(job.id, 'DRAFT');
                                      document.getElementById(`status-dropdown-${job.id}`)?.classList.add('hidden');
                                    }}
                                    className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ClockIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                                    Set as Draft
                                  </button>
                                )}
                                
                                {job.jobStatus !== 'CLOSED' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(job.id, 'CLOSED');
                                      document.getElementById(`status-dropdown-${job.id}`)?.classList.add('hidden');
                                    }}
                                    className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <XCircleIcon className="mr-3 h-5 w-5 text-red-500" aria-hidden="true" />
                                    Close
                                  </button>
                                )}
                                
                                {job.jobStatus === 'CLOSED' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(job.id, 'REOPENED');
                                      document.getElementById(`status-dropdown-${job.id}`)?.classList.add('hidden');
                                    }}
                                    className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ArrowPathIcon className="mr-3 h-5 w-5 text-blue-500" aria-hidden="true" />
                                    Reopen
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Not posted'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            {/* Status dropdown removed - now directly in the status column */}
                            
                            {/* View button */}
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/jobs/${job.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            
                            {/* Edit button */}
                            <button
                              type="button"
                              onClick={() => handleEdit(job)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(job.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Close</span>
                  <XCircleIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditing ? 'Edit Job' : 'Create New Job'}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Job Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          value={formData.title}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          Department *
                        </label>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          required
                          value={formData.department}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Job Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Job Description *
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={4}
                          required
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          required
                          value={formData.location || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Employment Type */}
                      <div>
                        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                          Employment Type *
                        </label>
                        <select
                          name="employmentType"
                          id="employmentType"
                          required
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      {/* Work Setting */}
                      <div>
                        <label htmlFor="workSetting" className="block text-sm font-medium text-gray-700">
                          Work Setting *
                        </label>
                        <select
                          name="workSetting"
                          id="workSetting"
                          required
                          value={formData.workSetting}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="REMOTE">Remote</option>
                          <option value="ONSITE">Onsite</option>
                          <option value="HYBRID">Hybrid</option>
                        </select>
                      </div>

                      {/* Job Status - Only shown when editing */}
                      {isEditing && (
                        <div>
                          <label htmlFor="jobStatus" className="block text-sm font-medium text-gray-700">
                            Job Status *
                          </label>
                          <select
                            name="jobStatus"
                            id="jobStatus"
                            required
                            value={formData.jobStatus}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REOPENED">Reopened</option>
                          </select>
                        </div>
                      )}

                      {/* Salary Range */}
                      <div>
                        <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700">
                          Salary Range
                        </label>
                        <input
                          type="text"
                          name="salaryRange"
                          id="salaryRange"
                          placeholder="e.g., $50,000 - $70,000"
                          value={formData.salaryRange}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Skills */}
                      <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                          Skills
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="skills"
                            id="skills"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={handleSkillKeyPress}
                            placeholder="Add a skill and press Enter"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                          >
                            Add
                          </button>
                        </div>
                        {formData.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600"
                                >
                                    <XCircleIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Custom Questions */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">Custom Application Questions</h4>
                          <button
                            type="button"
                            onClick={() => {
                              setNewQuestion({ 
                                question: '', 
                                isRequired: false, 
                                type: 'TEXT',
                                options: [] 
                              });
                              setShowQuestionForm(true);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            + Add Question
                          </button>
                        </div>

                        {/* Custom Questions List */}
                        {formData.customQuestions.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {formData.customQuestions.map((q) => (
                              <div key={q.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <div>
                                  <p className="text-sm font-medium">
                                    {q.question} {q.isRequired && <span className="text-red-500">*</span>}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({q.type.replace('_', ' ').toLowerCase()})
                                    </span>
                                  </p>
                                  {q.options && q.options.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Options: {q.options.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add/Edit Question Form */}
                      {showQuestionForm && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Add New Question
                          </h4>
                          
                          <div className="space-y-4">
                            {/* Question Text */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Question Text *
                              </label>
                              <input
                                type="text"
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your question"
                              />
                            </div>

                            {/* Question Type */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Question Type *
                              </label>
                              <select
                                value={newQuestion.type}
                                onChange={(e) => setNewQuestion({
                                  ...newQuestion, 
                                  type: e.target.value as any,
                                  options: e.target.value === 'TEXT' ? undefined : (newQuestion.options || [])
                                })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="TEXT">Text</option>
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="YES_NO">Yes/No</option>
                                <option value="RATING">Rating</option>
                                <option value="FILE_UPLOAD">File Upload</option>
                                <option value="DATE">Date</option>
                              </select>
                            </div>

                            {/* Options for multiple choice questions */}
                            {newQuestion.type === 'MULTIPLE_CHOICE' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Options (one per line) *
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                                    placeholder="Add an option and press Enter"
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                                  >
                                    Add
                                  </button>
                                </div>
                                
                                {/* Display added options */}
                                {newQuestion.options && newQuestion.options.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {newQuestion.options.map((option, idx) => (
                                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                                        <span className="text-sm">{option}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOption(idx)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <XCircleIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Required toggle */}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="isRequired"
                                checked={newQuestion.isRequired}
                                onChange={(e) => setNewQuestion({...newQuestion, isRequired: e.target.checked})}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700">
                                Required
                              </label>
                            </div>

                            {/* Form actions */}
                            <div className="flex justify-end space-x-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowQuestionForm(false);
                                  setNewQuestion({ 
                                    question: '', 
                                    isRequired: false, 
                                    type: 'TEXT',
                                    options: [] 
                                  });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleAddQuestion}
                                disabled={!newQuestion.question.trim() || (newQuestion.type === 'MULTIPLE_CHOICE' && (!newQuestion.options || newQuestion.options.length === 0))}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(!newQuestion.question.trim() || (newQuestion.type === 'MULTIPLE_CHOICE' && (!newQuestion.options || newQuestion.options.length === 0))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Add Question
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isEditing ? 'Update Job' : 'Create Job'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagementPage;
