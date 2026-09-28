import { CallHistoryItem, UserProfile } from '../types';

export const INITIAL_DEMO_USER: UserProfile = {
  id: 'usr_789123',
  name: 'Alex Rivera',
  userId: 'alex.rivera',
  password: 'Password123!',
  maritalStatus: 'Single',
  sex: 'Prefer not to say',
  dob: '2001-05-14',
  credits: 70, // starts at 70/100 as specified
  anonymousId: 'User_4821',
  favouriteCallers: ['User_7392'],
  createdAt: '2026-09-01T08:00:00.000Z',
  lastSvi: 56,
  lastRegion: 'ORANGE',
  lastConcern: 'Academic pressure',
  lastAssessmentDate: '2026-09-24T14:30:00.000Z'
};

export const INITIAL_CALL_HISTORY: CallHistoryItem[] = [
  {
    id: 'hist-1',
    date: '24 Sep 2026',
    anonymousUserId: 'User_7392',
    communicationType: 'Voice',
    duration: '12:31',
    status: 'Completed',
    rating: 5,
    feedbackText: 'Very validating conversation about exam anxieties.',
    isFavourite: true
  },
  {
    id: 'hist-2',
    date: '21 Sep 2026',
    anonymousUserId: 'User_6158',
    communicationType: 'Text',
    duration: '15:00',
    status: 'Completed',
    rating: 4,
    feedbackText: 'Shared practical tips on balancing part-time jobs.',
    isFavourite: false
  },
  {
    id: 'hist-3',
    date: '18 Sep 2026',
    anonymousUserId: 'User_9204',
    communicationType: 'Voice',
    duration: '08:45',
    status: 'Completed',
    rating: 4,
    feedbackText: 'Good listener, felt noticeably calmer afterwards.',
    isFavourite: false
  }
];

export interface AnonymousPeer {
  anonymousId: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  mainConcern: string;
  isOnline: boolean;
  avatarColor: string;
  interests: string[];
}

export const ANONYMOUS_PEER_POOL: AnonymousPeer[] = [
  {
    anonymousId: 'User_7392',
    gender: 'Prefer not to say',
    mainConcern: 'Academic pressure',
    isOnline: true,
    avatarColor: 'from-blue-500 to-indigo-600',
    interests: ['Music', 'Anime', 'Programming']
  },
  {
    anonymousId: 'User_6158',
    gender: 'Female',
    mainConcern: 'Career',
    isOnline: true,
    avatarColor: 'from-emerald-500 to-teal-600',
    interests: ['Travel', 'Books', 'Technology']
  },
  {
    anonymousId: 'User_9204',
    gender: 'Male',
    mainConcern: 'Loneliness',
    isOnline: true,
    avatarColor: 'from-amber-500 to-orange-600',
    interests: ['Gaming', 'Web series', 'Food']
  },
  {
    anonymousId: 'User_3389',
    gender: 'Other',
    mainConcern: 'Work',
    isOnline: true,
    avatarColor: 'from-purple-500 to-pink-600',
    interests: ['Movies', 'Sports', 'K-dramas']
  },
  {
    anonymousId: 'User_5127',
    gender: 'Prefer not to say',
    mainConcern: 'Family',
    isOnline: true,
    avatarColor: 'from-cyan-500 to-blue-600',
    interests: ['Technology', 'Music', 'Books']
  }
];
