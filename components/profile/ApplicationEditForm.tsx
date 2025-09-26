import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { RequestHelper } from '@/lib/request-helper';
import { useAuthContext } from '@/lib/user/AuthContext';
import Loading from '@/components/icon/Loading';

interface ApplicationEditFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedData?: any) => void;
  initialData: {
    teammate1: string;
    teammate2: string;
    teammate3: string;
    whyAttend: string;
    hackathonNumber: string;
    hackathonFirstTimer: string;
    lookingForward: string;
  };
}

export default function ApplicationEditForm({
  open,
  onClose,
  onSave,
  initialData,
}: ApplicationEditFormProps) {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Debug logging
  console.log('ApplicationEditForm initialized with:', { open, initialData, user: user?.id });

  // Update form data when initialData changes
  useEffect(() => {
    console.log('Initial data changed, updating form data:', initialData);
    setFormData(initialData);
    setHasChanges(false);
    setError(null);
    setEmailErrors({});
    setFieldErrors({});
  }, [initialData]);

  const validateEmail = (email: string): string | null => {
    if (email.trim() === '') return null; // Empty is valid (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) ? null : 'Please enter a valid email address';
  };

  const validateRequiredFields = (): string[] => {
    const errors: string[] = [];
    const requiredFields = [
      { key: 'whyAttend', label: 'Why do you want to attend HackUTD?' },
      {
        key: 'hackathonNumber',
        label: 'Tell us about a personal project or idea you were excited about?',
      },
      {
        key: 'hackathonFirstTimer',
        label: 'Describe a time you taught yourself something new to complete a project?',
      },
      {
        key: 'lookingForward',
        label: 'What is something not on your resume that you are proud of?',
      },
    ];

    requiredFields.forEach((field) => {
      const value = formData[field.key];
      if (!value || value.trim() === '') {
        errors.push(`${field.label} is required`);
      }
    });

    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Input changed - Field: ${field}, Value: ${value}`);
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log('New form data:', newData);
      return newData;
    });
    setHasChanges(true);
    setError(null);

    // Validate email fields
    if (field.startsWith('teammate')) {
      const emailError = validateEmail(value);
      setEmailErrors((prev) => ({
        ...prev,
        [field]: emailError || '',
      }));
    }

    // Validate essay fields in real-time
    const requiredEssayFields = [
      'whyAttend',
      'hackathonNumber',
      'hackathonFirstTimer',
      'lookingForward',
    ];
    if (requiredEssayFields.includes(field)) {
      let fieldError = '';
      if (!value || value.trim() === '') {
        fieldError = 'This field is required';
      }

      setFieldErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    // Check for required field validation errors
    const requiredFieldErrors = validateRequiredFields();
    if (requiredFieldErrors.length > 0) {
      setError(`Please fill in all required fields:\n• ${requiredFieldErrors.join('\n• ')}`);
      setIsSaving(false);
      return;
    }

    // Check for email validation errors
    console.log('Email errors:', emailErrors);
    const hasEmailErrors = Object.values(emailErrors).some((error) => error !== '');
    console.log('Has email errors:', hasEmailErrors);
    if (hasEmailErrors) {
      setError('Please fix the email validation errors before saving.');
      setIsSaving(false);
      return;
    }

    try {
      console.log('Saving form data:', formData);
      console.log('User token:', user.token);
      console.log('Form data JSON stringified:', JSON.stringify(formData));

      const response = await RequestHelper.patch<any, { msg: string; updatedData: any }>(
        '/api/applications/partial-update',
        {
          headers: {
            Authorization: user.token,
            'Content-Type': 'application/json',
          },
        },
        formData,
      );

      console.log('Save response:', response);

      // Check if the response was successful
      if (response.status >= 200 && response.status < 300) {
        // Call the onSave callback to refresh the profile data with updated data
        onSave(response.data.updatedData);
        setHasChanges(false);
        onClose();
      } else {
        // Handle non-2xx responses
        const errorMessage = response.data?.msg || 'Failed to save changes. Please try again.';
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error saving application:', err);

      // Handle network errors or other exceptions
      const errorMessage = err.message || 'Failed to save changes. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?',
      );
      if (!confirmCancel) {
        return;
      }
    }
    setFormData(initialData);
    setHasChanges(false);
    setError(null);
    setEmailErrors({});
    setFieldErrors({});
    onClose();
  };

  const textFieldProps = {
    fullWidth: true,
    margin: 'normal' as const,
    variant: 'outlined' as const,
    sx: {
      '& .MuiInputBase-input': {
        color: '#000',
        WebkitTextFillColor: 'unset !important',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
      '& .MuiInputLabel-root': {
        color: '#000',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#2D5016',
      },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
    },
  };

  const emailFieldProps = {
    fullWidth: true,
    margin: 'normal' as const,
    variant: 'outlined' as const,
    sx: {
      '& .MuiInputBase-input': {
        color: '#000',
        WebkitTextFillColor: 'unset !important',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
      '& .MuiInputLabel-root': {
        color: '#000',
        transform: 'translate(14px, 7px) scale(1)',
        '&.Mui-focused, &.MuiFormLabel-filled': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#2D5016',
      },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2D5016',
      },
      '& .MuiOutlinedInput-input': {
        padding: '16px 14px',
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '24px',
        },
      }}
    >
      <DialogTitle className="text-2xl font-bold text-[#2D5016] text-center">
        Edit Application
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ marginBottom: '16px' }}>
            {error}
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2D5016] mb-4">Teammates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Emails should be the same as the email they registered with!
            </p>

            <div className="space-y-4">
              <TextField
                {...emailFieldProps}
                label="Teammate 1 Email (optional)"
                value={formData.teammate1}
                onChange={(e) => handleInputChange('teammate1', e.target.value)}
                type="email"
                error={!!emailErrors.teammate1}
                helperText={emailErrors.teammate1}
              />

              <TextField
                {...emailFieldProps}
                label="Teammate 2 Email (optional)"
                value={formData.teammate2}
                onChange={(e) => handleInputChange('teammate2', e.target.value)}
                type="email"
                error={!!emailErrors.teammate2}
                helperText={emailErrors.teammate2}
              />

              <TextField
                {...emailFieldProps}
                label="Teammate 3 Email (optional)"
                value={formData.teammate3}
                onChange={(e) => handleInputChange('teammate3', e.target.value)}
                type="email"
                error={!!emailErrors.teammate3}
                helperText={emailErrors.teammate3}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#2D5016] mb-2">Essay Questions</h3>
            <p className="text-sm text-gray-600 mb-4">
              All essay questions are required and must be filled out.
            </p>

            <div className="space-y-4">
              <TextField
                {...textFieldProps}
                label="Why do you want to attend HackUTD?"
                value={formData.whyAttend}
                onChange={(e) => handleInputChange('whyAttend', e.target.value)}
                multiline
                rows={3}
                required
                error={!!fieldErrors.whyAttend}
                helperText={fieldErrors.whyAttend}
              />

              <TextField
                {...textFieldProps}
                label="Tell us about a personal project or idea you were excited about? What made it meaningful to you?"
                value={formData.hackathonNumber}
                onChange={(e) => handleInputChange('hackathonNumber', e.target.value)}
                multiline
                rows={3}
                required
                error={!!fieldErrors.hackathonNumber}
                helperText={fieldErrors.hackathonNumber}
              />

              <TextField
                {...textFieldProps}
                label="Describe a time you taught yourself something new to complete a project?"
                value={formData.hackathonFirstTimer}
                onChange={(e) => handleInputChange('hackathonFirstTimer', e.target.value)}
                multiline
                rows={3}
                required
                error={!!fieldErrors.hackathonFirstTimer}
                helperText={fieldErrors.hackathonFirstTimer}
              />

              <TextField
                {...textFieldProps}
                label="What is something not on your resume that you are proud of?"
                value={formData.lookingForward}
                onChange={(e) => handleInputChange('lookingForward', e.target.value)}
                multiline
                rows={3}
                required
                error={!!fieldErrors.lookingForward}
                helperText={fieldErrors.lookingForward}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="px-6 pb-6">
        <Button
          onClick={handleCancel}
          disabled={isSaving}
          className="mr-2"
          sx={{
            color: '#666',
            borderColor: '#666',
            '&:hover': {
              borderColor: '#333',
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          variant="contained"
          sx={{
            backgroundColor: '#7A9E7E',
            '&:hover': {
              backgroundColor: '#6A8F6E',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
            },
          }}
        >
          {isSaving ? (
            <div className="flex items-center">
              <Loading width={16} height={16} />
              <span className="ml-2">Saving...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
