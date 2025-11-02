import { useState } from 'react';
import QRCodeReader from '@/components/dashboard/QRCodeReader';
import MLHAgreementDialog from '@/components/scan/MLHAgreementDialog';
import {
  ScanType,
  UserProfile,
  successStrings,
  getSuccessColor,
  SuccessMessage,
} from '@/types/scan';

interface ScannerViewProps {
  currentScan: ScanType;
  userToken: string;
  onDone: () => void;
}

export default function ScannerView({ currentScan, userToken, onDone }: ScannerViewProps) {
  const [scanData, setScanData] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [scannedUserInfo, setScannedUserInfo] = useState<UserProfile>();
  const [showMLHDialog, setShowMLHDialog] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [pendingScanName, setPendingScanName] = useState<string>('');
  const [isWalkIn, setIsWalkIn] = useState(false);

  const handleScan = async (data: string) => {
    if (!data.startsWith('hack:')) {
      setScanData(data);
      setSuccess(successStrings.invalidFormat);
      return;
    }

    const query = new URL(`/api/scan`, window.location.origin);
    query.searchParams.append('id', data.replaceAll('hack:', ''));
    const userId = data.split(':')[1];

    try {
      const result = await fetch(query.toString(), {
        mode: 'cors',
        headers: { Authorization: userToken },
        method: 'POST',
        body: JSON.stringify({
          id: userId,
          scan: currentScan.name,
        }),
      });

      setScanData(data);
      const userResponse = await fetch(`/api/userinfo?id=${userId}`, {
        headers: { Authorization: userToken },
      });
      const userPayload = await userResponse.json();
      setScannedUserInfo(userPayload.data);

      // Handle MLH agreement required (428 Precondition Required)
      if (result.status === 428) {
        const resultData = await result.json();
        if (resultData.code === 'mlh-agreement-required') {
          setPendingUserId(userId);
          setPendingScanName(currentScan.name);
          setIsWalkIn(resultData.isWalkIn || false);
          setShowMLHDialog(true);
          return; // Stop here, dialog will handle the rest
        }
      }

      if (result.status === 404) {
        setSuccess(successStrings.invalidUser);
      } else if (result.status === 201) {
        setSuccess(successStrings.alreadyClaimed);
      } else if (result.status === 403) {
        setSuccess(successStrings.notCheckedIn);
      } else if (result.status === 400) {
        const resultData = await result.json();
        if (resultData.code === 'insufficient-points') {
          setSuccess(
            `Insufficient points! You need ${resultData.required} points but only have ${resultData.current}.`,
          );
        } else {
          setSuccess(successStrings.lateCheckinIneligible);
        }
      } else if (result.status !== 200) {
        setSuccess(successStrings.unexpectedError);
      } else {
        const resultData = await result.json();
        if (resultData.pointsAwarded !== undefined) {
          setSuccess(
            `${successStrings.claimed} ${resultData.message} Total: ${resultData.newTotalPoints} points`,
          );
        } else {
          setSuccess(successStrings.claimed);
        }
      }
    } catch (err) {
      console.error(err);
      setScanData(data);
      setSuccess(successStrings.unexpectedError);
    }
  };

  const handleMLHAgree = async () => {
    // Close dialog
    setShowMLHDialog(false);

    // Retry the scan after agreement
    setSuccess('MLH Agreement recorded! Completing check-in...');

    // Wait a moment then retry scan
    setTimeout(async () => {
      try {
        const result = await fetch('/api/scan', {
          mode: 'cors',
          headers: { Authorization: userToken },
          method: 'POST',
          body: JSON.stringify({
            id: pendingUserId,
            scan: pendingScanName,
          }),
        });

        if (result.status === 200) {
          const resultData = await result.json();
          if (resultData.pointsAwarded !== undefined) {
            setSuccess(
              `${successStrings.claimed} ${resultData.message} Total: ${resultData.newTotalPoints} points`,
            );
          } else {
            setSuccess(successStrings.claimed);
          }
        } else {
          setSuccess('Check-in completed!');
        }
      } catch (err) {
        console.error('Error completing check-in after MLH agreement:', err);
        setSuccess('MLH agreement recorded, but check-in may need to be retried.');
      }
    }, 1000);
  };

  const handleMLHCancel = () => {
    setShowMLHDialog(false);
    setScanData(undefined);
    setPendingUserId('');
    setPendingScanName('');
    setIsWalkIn(false);
    setSuccess(undefined);
    setScannedUserInfo(undefined);
  };

  return (
    <div className="my-6">
      {/* MLH Agreement Dialog */}
      {showMLHDialog && scannedUserInfo && (
        <MLHAgreementDialog
          userName={`${scannedUserInfo.user.firstName} ${scannedUserInfo.user.lastName}`}
          userId={pendingUserId}
          userToken={userToken}
          onAgree={handleMLHAgree}
          onCancel={handleMLHCancel}
          isWalkIn={isWalkIn}
        />
      )}

      <div className="flex flex-col gap-y-4">
        <div className="text-center text-xl font-black">{currentScan.name}</div>

        {!scanData && <QRCodeReader width={200} height={200} callback={handleScan} />}

        {scanData && (
          <>
            <div
              className="text-center text-3xl font-black"
              style={{ color: getSuccessColor(success! as SuccessMessage) }}
            >
              <p>{success ?? 'Unexpected error!'}</p>
              {scannedUserInfo && (
                <p>
                  Name: {scannedUserInfo.user.firstName} {scannedUserInfo.user.lastName}
                </p>
              )}
            </div>

            <div className="flex m-auto items-center justify-center">
              <div
                className="w-min-5 m-3 rounded-lg text-center text-lg font-black p-3 cursor-pointer hover:bg-green-300 border border-green-800 text-green-900"
                onClick={() => setScanData(undefined)}
              >
                Next Scan
              </div>
              <div
                className="w-min-5 m-3 rounded-lg text-center text-lg font-black p-3 cursor-pointer hover:bg-green-300 border border-green-800 text-green-900"
                onClick={onDone}
              >
                Done
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
