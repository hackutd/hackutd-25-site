import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ParkingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the PDF
    window.location.href = '/assets/saturdaySundayParking.pdf';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Redirecting to parking information...
        </h1>
        <p className="text-gray-600">
          If you are not redirected automatically,{' '}
          <a href="/assets/saturdaySundayParking.pdf" className="text-blue-600 underline">
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
