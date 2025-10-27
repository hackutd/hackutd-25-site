import { getGroupId } from '@/components/admin/hacker-application/utils';
import { create } from 'zustand';

export type ApplicationEntry = {
  index: number;
  application: UserIdentifier[];
};

interface UserGroupState {
  groups: ApplicationEntry[];
  allUsers: ApplicationEntry[];
  currentUserGroup: string;
  setCurrentUsergroup: (s: string) => void;
  setUserGroup: (groups: ApplicationEntry[]) => void;
  setAllUserGroup: (allUsers: ApplicationEntry[]) => void;
  updateGroupVerdict: (groupId: string, newVerdict: string) => void;
  updateMemberVerdict: (groupId: string, memberId: string, newVerdict: string) => void;
  updateMemberScoring: (groupId: string, memberId: string, scoring: any[]) => void;
}

export const useUserGroup = create<UserGroupState>((set) => ({
  groups: [],
  allUsers: [],
  currentUserGroup: '',
  setUserGroup: (groups) =>
    set(() => ({
      groups,
    })),
  setAllUserGroup: (allUsers) => set(() => ({ allUsers })),
  updateGroupVerdict: (groupId, newVerdict) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        getGroupId(group.application) === groupId
          ? {
              ...group,
              application: group.application.map((member) => ({ ...member, status: newVerdict })),
            }
          : group,
      ),
    })),
  updateMemberVerdict: (groupId, memberId, newVerdict) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        getGroupId(group.application) === groupId
          ? {
              ...group,
              application: group.application.map((member) =>
                member.id === memberId ? { ...member, status: newVerdict } : member,
              ),
            }
          : group,
      ),
    })),
  updateMemberScoring: (groupId, memberId, scoring) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        getGroupId(group.application) === groupId
          ? {
              ...group,
              application: group.application.map((member) =>
                member.id === memberId ? { ...member, scoring } : member,
              ),
            }
          : group,
      ),
    })),
  setCurrentUsergroup: (s) => set(() => ({ currentUserGroup: s })),
}));
