import { hackPortalConfig } from '../../hackportal.config';

export type GroupName = 'Raven' | 'Cat' | 'Deer' | 'Fox';

const LEGACY_GROUP_ALIASES: Record<string, GroupName> = {
  bird: 'Raven',
};

export function computeHash(userId: string): number {
  const p = 61,
    m = 1000000009;
  let ans = 0,
    curr = 1;
  for (let c of userId) {
    ans = (ans + ((c.charCodeAt(0) * curr) % m)) % m;
    curr = (curr * p) % m;
  }
  return ans;
}

export function normalizeGroupName(group?: string | null): GroupName | undefined {
  if (!group) {
    return undefined;
  }

  const trimmed = group.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();

  const canonicalMatch = hackPortalConfig.groupNames.find((name) => name.toLowerCase() === lower);
  if (canonicalMatch) {
    return canonicalMatch as GroupName;
  }

  if (LEGACY_GROUP_ALIASES[lower]) {
    return LEGACY_GROUP_ALIASES[lower];
  }

  return undefined;
}

export function determineColorByTeamIdx(userHashValue: number): GroupName {
  const index = userHashValue % hackPortalConfig.groupNames.length;
  const group = hackPortalConfig.groupNames[index];
  const normalized = normalizeGroupName(group);
  if (!normalized) {
    throw new Error(`Unknown group name configured for index ${index}: ${group}`);
  }
  return normalized;
}
