import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { GetServerSideProps } from 'next';

import { useAuthContext } from '@/lib/user/AuthContext';
import { generateInitialValues, hackPortalConfig } from '@/hackportal.config';
import { RequestHelper } from '@/lib/request-helper';

import Loading from '@/components/icon/Loading';
import EditApplicationDisclaimerDialog from '@/components/profile/EditApplicationDisclaimerDialog';
import EditRegistrationWrapper from '@/components/register/EditRegistrationWrapper';

// Import the registration page components
import Register from '@/pages/register';

interface Props {
  allowedRegistrations: boolean;
}

export default function EditApplication({ allowedRegistrations }: Props) {
  const router = useRouter();
  const { user, profile, partialProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const disclaimerShownRef = useRef(false);

  // Show disclaimer on first load - only once per session
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('editApplicationDisclaimerShown');
    if (!hasSeenDisclaimer) {
      localStorage.setItem('editApplicationDisclaimerShown', 'true');
      setShowDisclaimer(true);
    }
  }, []);

  if (!allowedRegistrations) {
    return (
      <h1 className="mx-auto text-2xl mt-4 font-bold">
        Registrations is closed and no longer allowed
      </h1>
    );
  }

  if (!user) {
    router.push('/auth');
    return <div></div>;
  }

  if (!profile) {
    router.push('/profile');
    return <div></div>;
  }

  if (loading) {
    return <Loading width={200} height={200} />;
  }

  const handleContinueToEdit = () => {
    setShowDisclaimer(false);
  };

  const handleCloseDisclaimer = () => {
    router.push('/profile');
  };

  // Function to reset disclaimer (for testing purposes)
  const resetDisclaimer = () => {
    localStorage.removeItem('editApplicationDisclaimerShown');
    setShowDisclaimer(true);
  };

  // If disclaimer is showing, show the dialog
  if (showDisclaimer) {
    return (
      <EditApplicationDisclaimerDialog
        open={showDisclaimer}
        onClose={handleCloseDisclaimer}
        onContinue={handleContinueToEdit}
      />
    );
  }

  // Create a modified registration component for editing
  // We'll pass the profile data as initial values and disable autosave
  return (
    <>
      <Head>
        <title>Edit Hacker Application</title>
        <meta name="description" content="Edit your HackPortal application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Use the registration component with edit-specific props */}
      <EditRegistrationWrapper isEditMode={true}>
        <Register allowedRegistrations={allowedRegistrations} />
      </EditRegistrationWrapper>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data } = await RequestHelper.get<{ allowRegistrations: boolean }>(
    `${protocol}://${context.req.headers.host}/api/registrations/status`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return {
    props: {
      allowedRegistrations: data.allowRegistrations,
    },
  };
};
