import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/lib/user/AuthContext';

interface EditRegistrationWrapperProps {
  children: React.ReactNode;
  isEditMode?: boolean;
}

export default function EditRegistrationWrapper({
  children,
  isEditMode = false,
}: EditRegistrationWrapperProps) {
  const router = useRouter();
  const { profile, partialProfile } = useAuthContext();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Add page leave warning for edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges) {
        if (
          window.confirm(
            'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
          )
        ) {
          return;
        } else {
          router.events.emit('routeChangeError');
          throw 'Route change aborted.';
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, hasUnsavedChanges, isEditMode]);

  // Modify the children to inject edit mode behavior
  if (isEditMode) {
    // Clone children and modify props for edit mode
    return React.cloneElement(children as React.ReactElement, {
      isEditMode: true,
      initialProfile: profile,
      partialProfile: partialProfile,
      onFormChange: (dirty: boolean) => setHasUnsavedChanges(dirty),
    });
  }

  return <>{children}</>;
}
