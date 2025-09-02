import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface EditApplicationDisclaimerDialogProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function EditApplicationDisclaimerDialog({
  open,
  onClose,
  onContinue,
}: EditApplicationDisclaimerDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon sx={{ color: 'warning.main' }} />
        Edit Application Disclaimer
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Important:</strong> By editing your application, you acknowledge that:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              You will need to resubmit your application to be considered again
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Your previous application status will be reset
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              All required fields must be completed before submission
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Changes are automatically saved when navigating between pages
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Your email address cannot be changed during editing
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            Are you sure you want to continue?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onContinue} variant="contained" color="primary">
          Continue to Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
