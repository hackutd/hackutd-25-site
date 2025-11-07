import { useState } from 'react';
import QRCodeReader from '@/components/dashboard/QRCodeReader';
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
  onBack?: () => void;
}

export default function ScannerView({ currentScan, userToken, onDone, onBack }: ScannerViewProps) {
  const [scanData, setScanData] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [scannedUserInfo, setScannedUserInfo] = useState<UserProfile>();

  const handleScan = async (data: string) => {
    if (!data.startsWith('hack:')) {
      setScanData(data);
      setSuccess(successStrings.invalidFormat);
      return;
    }

    const query = new URL(`/api/scan`, window.location.origin);
    query.searchParams.append('id', data.replaceAll('hack:', ''));

    try {
      const result = await fetch(query.toString(), {
        mode: 'cors',
        headers: { Authorization: userToken },
        method: 'POST',
        body: JSON.stringify({
          id: data.replaceAll('hack:', ''),
          scan: currentScan.name,
        }),
      });

      const userId = data.split(':')[1];
      const userResponse = await fetch(`/api/userinfo?id=${userId}`, {
        headers: { Authorization: userToken },
      });
      const userPayload = await userResponse.json();

      let successMessage = '';
      if (result.status === 404) {
        successMessage = successStrings.invalidUser;
      } else if (result.status === 201) {
        successMessage = successStrings.alreadyClaimed;
      } else if (result.status === 403) {
        successMessage = successStrings.notCheckedIn;
      } else if (result.status === 400) {
        const resultData = await result.json();
        if (resultData.code === 'insufficient-points') {
          successMessage = `Insufficient points! You need ${resultData.required} points but only have ${resultData.current}.`;
        } else {
          successMessage = successStrings.lateCheckinIneligible;
        }
      } else if (result.status !== 200) {
        successMessage = successStrings.unexpectedError;
      } else {
        const resultData = await result.json();
        if (resultData.pointsAwarded !== undefined) {
          successMessage = `${successStrings.claimed} ${resultData.message} Total: ${resultData.newTotalPoints} points`;
        } else {
          successMessage = successStrings.claimed;
        }
      }

      // Set all state at once to prevent race condition
      setScannedUserInfo(userPayload.data);
      setSuccess(successMessage);
      setScanData(data);
    } catch (err) {
      console.error(err);
      setSuccess(successStrings.unexpectedError);
      setScanData(data);
    }
  };

  return (
    <div className="my-4 md:my-6 px-2 md:px-0">
      <div className="flex flex-col gap-y-3 md:gap-y-4">
        <div className="flex items-center justify-between px-2 md:px-0">
          {onBack && !scanData && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-semibold text-sm md:text-base flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          {(!onBack || scanData) && <div className="w-16"></div>}
          <h2 className="text-center text-lg md:text-xl font-black flex-grow">
            {currentScan.name}
          </h2>
          <div className="w-16"></div>
        </div>

        {!scanData && (
          <div className="flex justify-center">
            <QRCodeReader width={200} height={200} callback={handleScan} />
          </div>
        )}

        {scanData && (
          <>
            <div
              className="text-center text-xl md:text-3xl font-black px-4"
              style={{ color: getSuccessColor(success! as SuccessMessage) }}
            >
              <p className="mb-2">{success ?? 'Unexpected error!'}</p>
              {scannedUserInfo && (
                <p className="text-lg md:text-2xl">
                  Name: {scannedUserInfo.user.firstName} {scannedUserInfo.user.lastName}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row m-auto items-center justify-center gap-2 sm:gap-0 px-4 w-full sm:w-auto">
              <div
                className="w-full sm:w-min-5 mx-0 sm:m-3 rounded-lg text-center text-base md:text-lg font-black p-2 md:p-3 cursor-pointer hover:bg-green-300 border border-green-800 text-green-900"
                onClick={() => setScanData(undefined)}
              >
                Next Scan
              </div>
              <div
                className="w-full sm:w-min-5 mx-0 sm:m-3 rounded-lg text-center text-base md:text-lg font-black p-2 md:p-3 cursor-pointer hover:bg-green-300 border border-green-800 text-green-900"
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
