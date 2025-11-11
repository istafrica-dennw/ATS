import React, { useState, useEffect, Fragment } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowPathIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'styles/react-quill.css'

import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

// Status options for the dropdown
const statusOptions = [
  { name: 'All Statuses', value: 'ALL' },
  { name: 'Draft', value: 'DRAFT' },
  { name: 'Published', value: 'PUBLISHED' },
  { name: 'Expired', value: 'EXPIRED' },
  { name: 'Closed', value: 'CLOSED' },
  { name: 'Reopened', value: 'REOPENED' },
];

// Employment Type options
const employmentTypeOptions = [
  { name: 'Full Time', value: 'Full Time' },
  { name: 'Part Time', value: 'Part Time' },
  { name: 'Contract', value: 'Contract' },
  { name: 'Internship', value: 'Internship' },
];

// Work Setting options
const workSettingOptions = [
  { name: 'Remote', value: 'REMOTE' },
  { name: 'Onsite', value: 'ONSITE' },
  { name: 'Hybrid', value: 'HYBRID' },
];

// Job Status options
const jobStatusOptions = [
  { name: 'Draft', value: 'DRAFT' },
  { name: 'Published', value: 'PUBLISHED' },
  { name: 'Expired', value: 'EXPIRED' },
  { name: 'Closed', value: 'CLOSED' },
  { name: 'Reopened', value: 'REOPENED' },
];



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
  expirationDate?: string;
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
  expirationDate?: string;
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
  expirationDate: '',
  customQuestions: []
};

// Add this before the JobManagementPage component
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

const RichTextEditor: React.FC<{
  value: string;
  onChange: (content: string) => void;
}> = ({ value, onChange }) => {
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('findDOMNode is deprecated')
      ) {
        return; 
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
        <div className="react-quill-no-outline dark:border-gray-700 bg-white dark:bg-gray-700 rounded-md overflow-hidden">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
          />
        </div>
  );
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
  const [openStatusJobId, setOpenStatusJobId] = useState<number | null>(null);

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string, name?: string) => {
    if (typeof e === 'string') {
      // Handle React Quill editor changes
      setFormData({
        ...formData,
        description: e
      });
    } else {
      // Handle regular input changes
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    }
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

  const handleEmploymentTypeChange = React.useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      employmentType: value
    }));
  }, []);

  const handleWorkSettingChange = React.useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      workSetting: value as 'REMOTE' | 'ONSITE' | 'HYBRID'
    }));
  }, []);

  const handleJobStatusChange = React.useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      jobStatus: value as 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED' | 'REOPENED'
    }));
  }, []);

  const handleQuestionTypeChange = React.useCallback((value: string) => {
    setNewQuestion(prev => ({
      question: prev.question,
      isRequired: prev.isRequired,
      type: value as any,
      options: value === 'MULTIPLE_CHOICE' ? (prev.options || []) : []
    }));
  }, []);

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
  
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const selectedStatusName = React.useMemo(() => 
    statusOptions.find(s => s.value === filterStatus)?.name, [filterStatus]
  );
  
  const selectedEmploymentTypeName = React.useMemo(() => 
    employmentTypeOptions.find(e => e.value === formData.employmentType)?.name, [formData.employmentType]
  );
  
  const selectedWorkSettingName = React.useMemo(() => 
    workSettingOptions.find(w => w.value === formData.workSetting)?.name, [formData.workSetting]
  );
  
  const selectedJobStatusName = React.useMemo(() => 
    jobStatusOptions.find(j => j.value === formData.jobStatus)?.name, [formData.jobStatus]
  );
  


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
        expirationDate: fullJobData.expirationDate || '',
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

  const handleDelete = (id: number, title: string) => {
    setJobToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`/api/jobs/${jobToDelete.id}`);
      console.log('Delete response:', response);
      
      toast.success(`Job "${jobToDelete.title}" deleted successfully!`);
      
      await fetchJobs();
      
    } catch (err: any) {
      console.error('Error deleting job:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete job. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteModal) {
        cancelDelete();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDeleteModal]);

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
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Published</span>;
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Draft</span>;
      case 'EXPIRED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Expired</span>;
      case 'CLOSED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Closed</span>;
      case 'REOPENED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Reopened</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  // Get work setting badge
  const getWorkSettingBadge = (setting: string) => {
    switch (setting) {
      case 'REMOTE':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Remote</span>;
      case 'ONSITE':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Onsite</span>;
      case 'HYBRID':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">Hybrid</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{setting}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Job Management</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 sm:w-auto transform hover:scale-[1.02] transition-all duration-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Job
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </label>
          <div className="w-full relative">
            <Listbox value={filterStatus} onChange={setFilterStatus}>
              <div className="relative">
                                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                    <span className="block truncate">{selectedStatusName}</span>
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
                    {statusOptions.map((status, statusIdx) => (
                      <Listbox.Option
                        key={statusIdx}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                          }`
                        }
                        value={status.value}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {status.name}
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
          
          <button
            type="button"
            onClick={fetchJobs}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
          >
            <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-red-600 dark:text-red-400">{error}</div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 dark:text-gray-400">No jobs found. Create a new job to get started.</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Department
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Location
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Work Setting
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Posted Date
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                        {job.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{job.department}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{job.location}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getWorkSettingBadge(job.workSetting)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 relative">
                        <button 
                          type="button"
                          onClick={() => setOpenStatusJobId(job.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        >
                          {getStatusBadge(job.jobStatus)}
                          <ChevronUpIcon className="ml-2 h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200" />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Not posted'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/jobs/${job.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleEdit(job)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDelete(job.id, job.title)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
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

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    {isEditing ? 'Edit Job' : 'Create New Job'}
                  </h3>
                  <div className="mt-6 max-h-[80vh] overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Job Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              required
                              value={formData.title}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                            />
                          </div>

                          <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Department *
                            </label>
                            <input
                              type="text"
                              name="department"
                              id="department"
                              required
                              value={formData.department}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                            />
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Job Description *
                            </label>
                            <RichTextEditor
                              value={formData.description}
                              onChange={(content) => handleInputChange(content)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 lg:mt-0 mt-4">
                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Location *
                            </label>
                            <input
                              type="text"
                              name="location"
                              id="location"
                              required
                              value={formData.location || ''}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                            />
                          </div>

                          <div>
                            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Employment Type *
                            </label>
                            <div className="mt-1 relative">
                              <Listbox value={formData.employmentType} onChange={handleEmploymentTypeChange}>
                                <div className="relative">
                                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                                    <span className="block truncate">{selectedEmploymentTypeName}</span>
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
                                      {employmentTypeOptions.map((employmentType, employmentTypeIdx) => (
                                        <Listbox.Option
                                          key={employmentTypeIdx}
                                          className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                              active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                                            }`
                                          }
                                          value={employmentType.value}
                                        >
                                          {({ selected }) => (
                                            <>
                                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {employmentType.name}
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

                          <div>
                            <label htmlFor="workSetting" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Work Setting *
                            </label>
                            <div className="mt-1 relative">
                              <Listbox value={formData.workSetting} onChange={handleWorkSettingChange}>
                                <div className="relative">
                                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                                    <span className="block truncate">{selectedWorkSettingName}</span>
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
                                      {workSettingOptions.map((workSetting, workSettingIdx) => (
                                        <Listbox.Option
                                          key={workSettingIdx}
                                          className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                              active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                                            }`
                                          }
                                          value={workSetting.value}
                                        >
                                          {({ selected }) => (
                                            <>
                                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {workSetting.name}
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

                          {isEditing && (
                            <div>
                              <label htmlFor="jobStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Job Status *
                              </label>
                              <div className="mt-1 relative">
                                <Listbox value={formData.jobStatus} onChange={handleJobStatusChange}>
                                  <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2.5 pl-3 pr-10 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm transition-all duration-200 border border-gray-300 dark:border-gray-600">
                                      <span className="block truncate">{selectedJobStatusName}</span>
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
                                        {jobStatusOptions.map((jobStatus, jobStatusIdx) => (
                                          <Listbox.Option
                                            key={jobStatus.value}
                                            className={({ active }) =>
                                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200' : 'text-gray-900 dark:text-gray-100'
                                              }`
                                            }
                                            value={jobStatus.value}
                                          >
                                            {({ selected }) => (
                                              <>
                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                  {jobStatus.name}
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
                          )}

                          <div>
                            <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Salary Range
                            </label>
                            <input
                              type="text"
                              name="salaryRange"
                              id="salaryRange"
                              placeholder="e.g., $50,000 - $70,000"
                              value={formData.salaryRange}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                            />
                          </div>

                          <div>
                            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expiration Date (Optional)
                            </label>
                            <input
                              type="date"
                              name="expirationDate"
                              id="expirationDate"
                              value={formData.expirationDate || ''}
                              onChange={handleInputChange}
                              min={new Date().toISOString().split('T')[0]}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm hover:shadow-md transition-shadow duration-200"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              If set, the job will automatically expire on this date
                            </p>
                          </div>

                          <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleAddSkill}
                                className="inline-flex items-center px-3 py-2 border border-l-0 border-transparent rounded-r-md bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white font-medium sm:text-sm transition-all duration-200 transform hover:scale-[1.02]"
                              >
                                Add
                              </button>
                            </div>
                            {formData.skills.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {formData.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSkill(skill)}
                                      className="ml-1.5 inline-flex text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-200"
                                    >
                                        <XCircleIcon className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Application Questions</h4>
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
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-200"
                          >
                            + Add Question
                          </button>
                        </div>

                        {formData.customQuestions.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {formData.customQuestions.map((q) => (
                              <div key={q.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {q.question} {q.isRequired && <span className="text-red-500 dark:text-red-400">*</span>}
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      ({q.type.replace('_', ' ').toLowerCase()})
                                    </span>
                                  </p>
                                  {q.options && q.options.length > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Options: {q.options.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {showQuestionForm && (
                        <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Add New Question
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Question Text *
                              </label>
                              <input
                                type="text"
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                placeholder="Enter your question"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Question Type *
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  value={newQuestion.type}
                                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                >
                                  <option value="TEXT">Text</option>
                                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                  <option value="YES_NO">Yes/No</option>
                                  <option value="RATING">Rating</option>
                                  <option value="FILE_UPLOAD">File Upload</option>
                                  <option value="DATE">Date</option>
                                </select>
                              </div>
                            </div>

                            {newQuestion.type === 'MULTIPLE_CHOICE' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Options (one per line) *
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                  <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                                    placeholder="Add an option and press Enter"
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-transparent rounded-r-md bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white font-medium sm:text-sm transition-all duration-200 transform hover:scale-[1.02]"
                                  >
                                    Add
                                  </button>
                                </div>
                                
                                {newQuestion.options && newQuestion.options.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {newQuestion.options.map((option, idx) => (
                                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{option}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOption(idx)}
                                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                                        >
                                          <XCircleIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="isRequired"
                                checked={newQuestion.isRequired}
                                onChange={(e) => setNewQuestion({...newQuestion, isRequired: e.target.checked})}
                                className="h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                              />
                              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Required
                              </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
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
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleAddQuestion}
                                disabled={!newQuestion.question.trim() || (newQuestion.type === 'MULTIPLE_CHOICE' && (!newQuestion.options || newQuestion.options.length === 0))}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 ${(!newQuestion.question.trim() || (newQuestion.type === 'MULTIPLE_CHOICE' && (!newQuestion.options || newQuestion.options.length === 0))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Add Question
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700 pt-6">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-base font-medium text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:ml-3 sm:w-auto sm:text-sm transform hover:scale-[1.02] transition-all duration-200"
                        >
                          {isEditing ? 'Update Job' : 'Create Job'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
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

      {openStatusJobId !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity backdrop-blur-sm" 
              onClick={() => setOpenStatusJobId(null)}
              aria-hidden="true"
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Job Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {jobs.find(job => job.id === openStatusJobId)?.title} • Current: <span className="font-medium text-indigo-600 dark:text-indigo-400">{jobs.find(job => job.id === openStatusJobId)?.jobStatus}</span>
                  </p>
                </div>
                <button
                  onClick={() => setOpenStatusJobId(null)}
                  className="rounded-lg bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto py-4">
              <div className="px-6 space-y-2">
                {[
                  { value: 'DRAFT', label: 'Draft', icon: '📝', color: 'text-gray-600 dark:text-gray-400', bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-700/50', desc: 'Job is being prepared and not visible to candidates' },
                  { value: 'PUBLISHED', label: 'Published', icon: '🌟', color: 'text-green-600 dark:text-green-400', bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20', desc: 'Job is live and accepting applications' },
                  { value: 'CLOSED', label: 'Closed', icon: '🔒', color: 'text-red-600 dark:text-red-400', bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20', desc: 'Job is no longer accepting applications' },
                  { value: 'EXPIRED', label: 'Expired', icon: '⏰', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20', desc: 'Job posting has expired automatically' },
                  { value: 'REOPENED', label: 'Reopened', icon: '🔄', color: 'text-blue-600 dark:text-blue-400', bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', desc: 'Previously closed job is now accepting applications again' }
                ].map((status) => {
                  const currentJob = jobs.find(job => job.id === openStatusJobId);
                  const isCurrentStatus = currentJob?.jobStatus === status.value;
                  
                  return (
                    <button
                      key={status.value}
                      onClick={() => {
                        if (openStatusJobId && !isCurrentStatus) {
                          handleStatusChange(openStatusJobId, status.value as any);
                          setOpenStatusJobId(null);
                        }
                      }}
                      disabled={isCurrentStatus}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4 ${
                        isCurrentStatus 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 cursor-not-allowed opacity-75' 
                          : `border-gray-100 dark:border-gray-600 ${status.bgColor} hover:border-gray-200 dark:hover:border-gray-500 cursor-pointer hover:shadow-md transform hover:scale-[1.02]`
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{status.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-base font-semibold ${status.color}`}>
                            {status.label}
                          </p>
                          {isCurrentStatus && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                              <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-300 rounded-full mr-1.5"></div>
                              Current Status
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{status.desc}</p>
                      </div>
                      {!isCurrentStatus && (
                        <div className="flex-shrink-0">
                          <ArrowPathIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Status changes affect job visibility and application acceptance
                  </p>
                  <button
                    onClick={() => setOpenStatusJobId(null)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
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
                      Delete Job
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          "{jobToDelete.title}"
                        </span>
                        ?
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        This action cannot be undone and will permanently remove the job posting and all associated applications.
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
                    onClick={confirmDeleteJob}
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
                        Delete Job
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

export default JobManagementPage;