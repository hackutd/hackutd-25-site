export interface PreEventData {
  id: string;
  title: string;
  description: string;
  type:
    | 'Workshop'
    | 'Info Session'
    | 'Networking'
    | 'Social'
    | 'Training'
    | 'Preparation'
    | 'Sponsor';
  track: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  location: string;
  roomNumber?: string;
  isVirtual: boolean;
  registrationRequired: boolean;
  rsvpLink?: string;
  maxCapacity?: number;
  currentRegistrations?: number;
  speakers?: string[];
  organizer?: string;
  contactEmail?: string;
  prerequisites?: string[];
  materials?: string[];
  tags?: string[];
  page?: string;
}

export const PRE_EVENTS_DATA: PreEventData[] = [
  {
    id: 'pnc-bank-meet-and-greet',
    title: 'PNC Bank Meet & Greet',
    description:
      'Join us for an exclusive PNC BANK Meet and Greet. Mingle with industry experts, play fun games, and enjoy free food while expanding your professional network!',
    type: 'Sponsor',
    track: 'General',
    startDate: '2025-11-06T19:00:00-06:00',
    endDate: '2025-11-06T20:30:00-06:00',
    location: 'ECSS 2.311',
    roomNumber: 'ECSS 2.311',
    isVirtual: false,
    registrationRequired: false,
    maxCapacity: 150,
    currentRegistrations: 0,
    speakers: ['PNC Bank'],
    organizer: 'PNC Bank',
    tags: ['Networking', 'Free Food', 'Sponsor'],
  },
  {
    id: 'hackathon-101',
    title: 'Hackathon 101',
    description:
      'Everything you need to know about hackathons! Learn about challenges, prizes, schedule, and what to expect. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'General',
    startDate: '2025-09-23T19:30:00-05:00',
    endDate: '2025-09-23T21:30:00-05:00',
    location: 'ECSW 1.315',
    roomNumber: 'ECSW 1.315',
    isVirtual: false,
    registrationRequired: false,
    maxCapacity: 100,
    currentRegistrations: 45,
    speakers: ['HackUTD Organizing Team'],
    organizer: 'HackUTD',
    contactEmail: 'info@hackutd.co',
    tags: ['Hackathon', 'Introduction', 'Free Food'],
    page: '/workshops/hackathon-101',
  },
  {
    id: 'github-workshop',
    title: 'GitHub Workshop',
    description:
      'Learn version control and collaboration with GitHub. Perfect for hackathon projects and team development. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'Technical',
    startDate: '2025-09-30T19:30:00-05:00',
    endDate: '2025-09-30T21:30:00-05:00',
    location: 'ECSS 2.102 (TI Auditorium)',
    roomNumber: 'ECSS 2.102',
    isVirtual: false,
    registrationRequired: false,
    rsvpLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSdOK5FSUN7b8S0Vchy5KD2hJIoXAfguhJzZm1ewMaEmXDQ6WA/viewform?usp=sharing&ouid=102621178606123820261',
    maxCapacity: 80,
    currentRegistrations: 52,
    speakers: ['HackUTD Tech Team'],
    organizer: 'HackUTD',
    contactEmail: 'tech@hackutd.co',
    prerequisites: ['Basic programming knowledge'],
    materials: ['Laptop', 'GitHub account'],
    tags: ['GitHub', 'Version Control', 'Collaboration', 'Free Food'],
    page: '/workshops/github',
  },
  {
    id: 'react-workshop',
    title: 'React Workshop',
    description:
      'Build dynamic web applications with React! Learn components, state management, and modern web development. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'Technical',
    startDate: '2025-10-07T19:30:00-05:00',
    endDate: '2025-10-07T21:30:00-05:00',
    location: 'ECSW 1.315',
    roomNumber: 'ECSW 1.315',
    isVirtual: false,
    registrationRequired: false,
    rsvpLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSfqphJaAKZ9j-ie0SiIbtjZEq-KIqoGPJOztKiTudHsvsvCTw/viewform?usp=sharing&ouid=102621178606123820261',
    maxCapacity: 70,
    currentRegistrations: 38,
    speakers: ['HackUTD Tech Team'],
    organizer: 'HackUTD',
    contactEmail: 'tech@hackutd.co',
    prerequisites: ['Basic JavaScript knowledge'],
    materials: ['Laptop', 'Node.js installed'],
    tags: ['React', 'JavaScript', 'Web Development', 'Free Food'],
    page: '/workshops/react',
  },
  {
    id: 'firebase-workshop',
    title: 'Firebase Workshop',
    description:
      'Build full-stack applications with Firebase! Learn about authentication, databases, and hosting. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'Technical',
    startDate: '2025-10-14T19:30:00-05:00',
    endDate: '2025-10-14T21:30:00-05:00',
    location: 'ECSW 1.315',
    roomNumber: 'ECSW 1.315',
    isVirtual: false,
    registrationRequired: false,
    rsvpLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSdqECQdOJxhZdIotWiPvqRf4xyOc3Rp2srDewvI97jlraH8SQ/viewform?usp=sharing&ouid=102621178606123820261',
    maxCapacity: 60,
    currentRegistrations: 41,
    speakers: ['HackUTD Tech Team'],
    organizer: 'HackUTD',
    contactEmail: 'tech@hackutd.co',
    prerequisites: ['Basic programming knowledge'],
    materials: ['Laptop', 'Google account'],
    tags: ['Firebase', 'Backend', 'Database', 'Free Food'],
    page: '/workshops/firebase',
  },
  {
    id: 'advanced-styling-workshop',
    title: 'Advanced Styling Workshop',
    description:
      'Master CSS, animations, and modern styling techniques to create beautiful user interfaces. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'Design',
    startDate: '2025-10-21T19:30:00-05:00',
    endDate: '2025-10-21T21:30:00-05:00',
    location: 'ECSW 1.315',
    roomNumber: 'ECSW 1.315',
    isVirtual: false,
    registrationRequired: false,
    rsvpLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSffXEyQxMy6eV4nNUlX3JmHZ8eG7BO0mlVBSjBG7YoROjCcWQ/viewform?usp=sharing&ouid=102621178606123820261',
    maxCapacity: 50,
    currentRegistrations: 29,
    speakers: ['HackUTD Design Team'],
    organizer: 'HackUTD',
    contactEmail: 'design@hackutd.co',
    prerequisites: ['Basic CSS knowledge'],
    materials: ['Laptop', 'Code editor'],
    tags: ['CSS', 'Styling', 'Design', 'Free Food'],
    page: '/workshops/advanced-styling',
  },
  {
    id: 'computer-vision-workshop',
    title: 'Computer Vision Workshop',
    description:
      'Explore AI and computer vision! Learn image processing, object detection, and machine learning basics. Plus FREE FOOD!',
    type: 'Workshop',
    track: 'Technical',
    startDate: '2025-10-28T19:30:00-05:00',
    endDate: '2025-10-28T21:30:00-05:00',
    location: 'ECSW 1.315',
    roomNumber: 'ECSW 1.315',
    isVirtual: false,
    registrationRequired: false,
    rsvpLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSdltHjAKsUD_8VBZdE730P8dpJGUAnis9hre83TcURH1cpm7w/viewform?usp=sharing&ouid=102621178606123820261',
    maxCapacity: 40,
    currentRegistrations: 23,
    speakers: ['HackUTD AI Team'],
    organizer: 'HackUTD',
    contactEmail: 'ai@hackutd.co',
    prerequisites: ['Basic Python knowledge'],
    materials: ['Laptop', 'Python 3.8+'],
    tags: ['Computer Vision', 'AI', 'Machine Learning', 'Free Food'],
    page: '/workshops/computer-vision',
  },
];

// Helper functions for working with pre-events data
export const getUpcomingEvents = (limit?: number): PreEventData[] => {
  const now = new Date();
  const upcoming = PRE_EVENTS_DATA.filter((event) => new Date(event.startDate) > now).sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return limit ? upcoming.slice(0, limit) : upcoming;
};

export const getEventsByType = (type: PreEventData['type']): PreEventData[] => {
  return PRE_EVENTS_DATA.filter((event) => event.type === type);
};

export const getEventById = (id: string): PreEventData | undefined => {
  return PRE_EVENTS_DATA.find((event) => event.id === id);
};

export const getEventsRequiringRegistration = (): PreEventData[] => {
  return PRE_EVENTS_DATA.filter((event) => event.registrationRequired);
};

export const getVirtualEvents = (): PreEventData[] => {
  return PRE_EVENTS_DATA.filter((event) => event.isVirtual);
};
