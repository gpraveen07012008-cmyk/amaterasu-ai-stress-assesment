export interface CrisisResource {
  name: string;
  category: string;
  contact: string;
  type: 'Toll-Free Phone' | 'SMS / Chat' | '24/7 Helpline';
  countryRegion: string;
  description: string;
  hours: string;
  availableOnline: boolean;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: 'Tele-MANAS (Mental Health Helpline)',
    category: 'Government Initiative',
    contact: '14416 / 1800-891-4416',
    type: 'Toll-Free Phone',
    countryRegion: 'India (National)',
    description: 'Government 24/7 tele-mental health assistance in multiple Indian languages.',
    hours: '24/7',
    availableOnline: true,
  },
  {
    name: 'KIRAN National Mental Health Helpline',
    category: 'Government Support',
    contact: '1800-599-0019',
    type: 'Toll-Free Phone',
    countryRegion: 'India (National)',
    description: 'Department of Empowerment of Persons with Disabilities 24/7 crisis support.',
    hours: '24/7',
    availableOnline: false,
  },
  {
    name: 'Vandrevala Foundation Helpline',
    category: 'Crisis Support',
    contact: '+91 9999 666 555',
    type: 'Toll-Free Phone',
    countryRegion: 'India & International',
    description: 'Free confidential emotional support and crisis counseling by trained psychologists.',
    hours: '24/7',
    availableOnline: true,
  },
  {
    name: 'AASRA Crisis Intervention',
    category: 'Suicide Prevention & Crisis',
    contact: '+91 98204 66726',
    type: '24/7 Helpline',
    countryRegion: 'India',
    description: 'Non-judgmental, confidential listening service for anyone in severe distress.',
    hours: '24/7',
    availableOnline: true,
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    category: 'Crisis & Suicide Prevention',
    contact: '988 (Call or Text)',
    type: 'Toll-Free Phone',
    countryRegion: 'USA & North America',
    description: 'Immediate 24/7 free and confidential support for people in suicidal crisis or emotional distress.',
    hours: '24/7',
    availableOnline: true,
  },
  {
    name: 'Befrienders Worldwide',
    category: 'International Support Network',
    contact: 'https://www.befrienders.org',
    type: '24/7 Helpline',
    countryRegion: 'Global',
    description: 'International directory of volunteer emotional support centers around the globe.',
    hours: '24/7',
    availableOnline: true,
  }
];

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isAvailable: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', isAvailable: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isAvailable: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isAvailable: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isAvailable: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isAvailable: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isAvailable: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isAvailable: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isAvailable: false },
];

export const MANDATORY_ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    text: "How are you feeling right now? Tell me in your own words what you are experiencing emotionally.",
    category: 'General Emotional State',
    possibleIndicators: [
      'Happy', 'Sad', 'Angry', 'Calm', 'Tired', 'Excited', 
      'Worried', 'Stressed', 'Afraid', 'Lonely', 'Confused'
    ]
  },
  {
    id: 2,
    text: "What has been affecting or worrying you the most lately? You can share anything that has been causing stress, sadness, fear, anger, or emotional pain.",
    category: 'Main Concern Identification',
    possibleIndicators: [
      'Academic', 'Career', 'Family', 'Relationship', 'Financial', 
      'Work', 'Health', 'Loneliness', 'Personal', 'Other'
    ]
  },
  {
    id: 3,
    text: "How often have these feelings or thoughts been on your mind? For example: occasionally, during the day, mostly at night, or almost all the time.",
    category: 'Thought Frequency',
    possibleIndicators: ['Occasionally', 'During the day', 'Mostly at night', 'Almost all the time']
  },
  {
    id: 4,
    text: "Have these feelings been affecting your sleep, energy, appetite, studies/work, or daily activities? Tell me what has changed, if anything.",
    category: 'Daily Functioning',
    possibleIndicators: [
      'Sleep', 'Energy', 'Appetite', 'Studies or work', 'Daily activities', 'No change'
    ]
  },
  {
    id: 5,
    text: "How have you been feeling around other people, and is there someone you feel comfortable talking to about what you're going through? You can share whether you feel supported, isolated, uncomfortable, or somewhere in between.",
    category: 'Social Support & Connection',
    possibleIndicators: ['Supported', 'Isolated', 'Uncomfortable', 'Somewhere in between', 'Trusted person']
  }
];

export const GENERAL_CONVERSATION_TOPICS = [
  'Hobbies',
  'Movies',
  'Favourite actors',
  'Music',
  'Sports',
  'Anime',
  'Web series',
  'K-dramas',
  'Games',
  'Travel',
  'Food',
  'Books',
  'Technology'
];

export const NON_CLINICAL_DISCLAIMER =
  "AMATERASU is a prototype stress screening and personalized support system. It is designed to evaluate self-reported stress indicators and provide supportive care pathways. It is NOT a medical diagnosis, does not identify clinical disorders, and does not replace consultation with a licensed psychologist, psychiatrist, or medical doctor.";
