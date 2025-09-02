import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface CustomQuestion {
  id: number;
  jobId: number;
  questionText: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'YES_NO' | 'RATING' | 'FILE_UPLOAD' | 'DATE';
  required: boolean;
  options?: string[];
}

export interface QuestionAnswer {
  questionId: number;
  answer: string;
}

interface CustomQuestionFormProps {
  questions: CustomQuestion[];
  answers: QuestionAnswer[];
  onChange: (answers: QuestionAnswer[]) => void;
  errors: Record<number, string>;
}

const CustomQuestionForm: React.FC<CustomQuestionFormProps> = ({ 
  questions, 
  answers, 
  onChange, 
  errors 
}) => {
  const handleAnswerChange = (questionId: number, value: string) => {
    const updatedAnswers = [...answers];
    const existingAnswerIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex !== -1) {
      updatedAnswers[existingAnswerIndex].answer = value;
    } else {
      updatedAnswers.push({ questionId, answer: value });
    }
    
    onChange(updatedAnswers);
  };

  const getQuestionAnswer = (questionId: number): string => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : '';
  };

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No additional questions for this position.</p>
        </div>
      ) : (
        questions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <label className="block text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
              {question.questionText}
              {question.required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
            </label>
            
            {question.questionType === 'TEXT' && (
              <div>
                <textarea
                  rows={3}
                  placeholder="Your answer"
                  value={getQuestionAnswer(question.id)}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base transition-all duration-200 ${
                    errors[question.id] 
                      ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors[question.id] && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors[question.id]}
                  </div>
                )}
              </div>
            )}
          
            {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
              <div>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label key={index} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option}
                        checked={getQuestionAnswer(question.id) === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700"
                      />
                      <span className="ml-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {errors[question.id] && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors[question.id]}
                  </div>
                )}
              </div>
            )}
          
            {question.questionType === 'YES_NO' && (
              <div>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="Yes"
                      checked={getQuestionAnswer(question.id) === 'Yes'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value="No"
                      checked={getQuestionAnswer(question.id) === 'No'}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                      No
                    </span>
                  </label>
                </div>
                {errors[question.id] && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {errors[question.id]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CustomQuestionForm;
