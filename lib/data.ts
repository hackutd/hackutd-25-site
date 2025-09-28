export const buttonDatas = [
  { text: 'Hacker App', path: '/' },
  { text: 'Mentor App', path: '/' },
  { text: 'Sponsor App', path: '/' },
];

export const navItems = [
  { text: 'Home', path: '/' },
  { text: 'Dashboard', path: '/dashboard' },
  { text: 'Pre-Events', path: '/pre-events' },
  { text: 'Schedule', path: '/schedule' },
  { text: 'HackerPack', path: '/hackerpacks' },
];

export const stats = [
  {
    data: 'Big',
    object: 'statistic 1',
  },
  {
    data: 'Shocking',
    object: 'statistic 2',
  },
  {
    data: 'Incredible',
    object: 'statistic 3',
  },
];

export const DEFAULT_EVENT_FORM_DATA: ScheduleEvent = {
  description: '',
  title: '',
  page: '',
  type: '',
  track: '',
  location: '',
  speakers: [],
  startDate: new Date(),
  endDate: new Date(),
  Event: -1,
};

export const DEFAULT_PRE_EVENT_FORM_DATA: PreEvent = {
  description: '',
  title: '',
  page: '',
  type: '',
  track: '',
  location: '',
  speakers: [],
  startDate: new Date(),
  endDate: new Date(),
  Event: -1,
  isVirtual: false,
  registrationRequired: false,
  maxCapacity: 0,
  currentRegistrations: 0,
};
