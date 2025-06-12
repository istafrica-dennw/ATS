import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  FormHelperText 
} from '@mui/material';

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

  const handleCheckboxChange = (questionId: number, option: string, checked: boolean) => {
    // Find existing answer
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    const currentOptions = existingAnswerIndex !== -1 
      ? answers[existingAnswerIndex].answer.split(',').filter(Boolean) 
      : [];
    
    let updatedOptions: string[];
    
    if (checked) {
      // Add option if checked
      updatedOptions = [...currentOptions, option];
    } else {
      // Remove option if unchecked
      updatedOptions = currentOptions.filter(opt => opt !== option);
    }
    
    // Update answers
    const updatedAnswers = [...answers];
    const updatedAnswer = updatedOptions.join(',');
    
    if (existingAnswerIndex !== -1) {
      updatedAnswers[existingAnswerIndex].answer = updatedAnswer;
    } else {
      updatedAnswers.push({ questionId, answer: updatedAnswer });
    }
    
    onChange(updatedAnswers);
  };
  
  const getQuestionAnswer = (questionId: number): string => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : '';
  };
  
  const isOptionChecked = (questionId: number, option: string): boolean => {
    const answer = getQuestionAnswer(questionId);
    return answer.split(',').includes(option);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Application Questions
      </Typography>
      
      {questions.map((question) => (
        <Box key={question.id} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            {question.questionText}
            {question.required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
          
          {question.questionType === 'TEXT' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Your answer"
              value={getQuestionAnswer(question.id)}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              error={!!errors[question.id]}
              helperText={errors[question.id]}
            />
          )}
          
          {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
            <FormControl component="fieldset" error={!!errors[question.id]}>
              <RadioGroup 
                value={getQuestionAnswer(question.id)}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                {question.options.map((option, index) => (
                  <FormControlLabel 
                    key={index} 
                    value={option} 
                    control={<Radio />} 
                    label={option} 
                  />
                ))}
              </RadioGroup>
              {errors[question.id] && (
                <FormHelperText>{errors[question.id]}</FormHelperText>
              )}
            </FormControl>
          )}
          
          {question.questionType === 'YES_NO' && (
            <FormControl component="fieldset" error={!!errors[question.id]}>
              <RadioGroup 
                value={getQuestionAnswer(question.id)}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                <FormControlLabel 
                  value="Yes" 
                  control={<Radio />} 
                  label="Yes" 
                />
                <FormControlLabel 
                  value="No" 
                  control={<Radio />} 
                  label="No" 
                />
              </RadioGroup>
              {errors[question.id] && (
                <FormHelperText>{errors[question.id]}</FormHelperText>
              )}
            </FormControl>
          )}
          
          {/* {question.questionType === 'CHECKBOX' && question.options && (
            <FormControl component="fieldset" error={!!errors[question.id]}>
              <FormGroup>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={isOptionChecked(question.id, option)}
                        onChange={(e) => handleCheckboxChange(
                          question.id, 
                          option, 
                          e.target.checked
                        )}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
              {errors[question.id] && (
                <FormHelperText>{errors[question.id]}</FormHelperText>
              )}
            </FormControl>
          )} */}
        </Box>
      ))}
    </Box>
  );
};

export default CustomQuestionForm;
