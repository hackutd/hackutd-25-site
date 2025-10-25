export interface ScanType {
  name: string;
  isCheckIn: boolean;
  isPermanentScan: boolean;
  startTime: Date;
  endTime: Date;
  precedence: number;
  netPoints: number;
  isSwag: boolean;
  isReclaimable: boolean;
}

export interface ScanFormData {
  name: string;
  isCheckIn: boolean;
  isPermanentScan: boolean;
  startTime: Date;
  endTime: Date;
  netPoints: number;
  isSwag: boolean;
  isReclaimable: boolean;
}

export interface UserProfile {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    permissions: string[];
    preferredEmail: string;
  };
  points?: number;
  scans?: Array<{
    name: string;
    timestamp: string;
    netPoints?: number;
  }>;
}

export const successStrings = {
  claimed: 'Scan claimed...',
  invalidUser: 'Invalid user...',
  alreadyClaimed: 'User has already claimed...',
  unexpectedError: 'Unexpected error...',
  notCheckedIn: "User hasn't checked in!",
  invalidFormat: 'Invalid hacker tag format...',
  lateCheckinIneligible: 'User is not eligible for late check-in...',
} as const;

export type SuccessMessage = (typeof successStrings)[keyof typeof successStrings];

export function getSuccessColor(success: SuccessMessage | string): string {
  if (
    success === successStrings.claimed ||
    (typeof success === 'string' && success.includes('Scan claimed...'))
  ) {
    return '#5fde05';
  }
  return '#ff0000';
}
