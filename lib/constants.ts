export const SafariColors = {
  // Primary Palette
  forest: '#1B4D3E',
  forestLight: '#256B57',
  forestDark: '#0F2E24',

  // Accent
  savanna: '#F4C542',
  savannaLight: '#FDD878',
  savannaDark: '#D4A520',

  // Neutrals
  parchment: '#FCFAF5',
  parchmentDark: '#F2EFE8',
  dust: '#E5E0D5',

  // Functional
  ink: '#131312',
  inkLight: '#3A3A36',
  stone: '#91918A',
  mist: '#D4D0C4',

  // Feedback
  success: '#2E7D32',
  error: '#C62828',
  warning: '#FF8F00',
};

export const AppConstants = {
  appName: 'SafariWrap',
  tagline: 'Your Safari, Wrapped.',
  privacyEmail: 'privacy@safariwrap.com',
  supportEmail: 'info@safariwrap.com',
  treeGps: '-3.3869, 37.3466',
  kilimanjaroProject: 'https://thekilimanjaroproject.org',
};

export const BigFive = [
  { name: 'Lion', emoji: '🦁' },
  { name: 'Elephant', emoji: '🐘' },
  { name: 'Rhino', emoji: '🦏' },
  { name: 'Leopard', emoji: '🐆' },
  { name: 'Buffalo', emoji: '🐃' },
];

export const OtherAnimals = [
  { name: 'Giraffe', emoji: '🦒' },
  { name: 'Zebra', emoji: '🦓' },
  { name: 'Hippo', emoji: '🦛' },
  { name: 'Crocodile', emoji: '🐊' },
  { name: 'Cheetah', emoji: '🐆' },
  { name: 'Wild Dog', emoji: '🐕' },
  { name: 'Wildebeest', emoji: '🐂' },
  { name: 'Flamingo', emoji: '🦩' },
  { name: 'Eagles & Birds', emoji: '🦅' },
];

export const AnimalList = [
  ...BigFive.map(a => ({ ...a, category: 'Big Five' })),
  ...OtherAnimals.map(a => ({ ...a, category: 'Other' }))
];

export const SafariDurations = [
  '1 day',
  '2–3 days',
  '4–5 days',
  '6–7 days',
  '8+ days',
];

export const WildlifeTimings = [
  'Early morning (5–8am)',
  'Mid-morning (8–11am)',
  'Afternoon (2–5pm)',
  'Sunset (5–7pm)',
];

export const ColorPresets = [
  { primary: '#1B4D3E', accent: '#F4C542' }, // Classic Safari
  { primary: '#2E5A88', accent: '#A5C9CA' }, // Blue Water
  { primary: '#5D4037', accent: '#FFCC80' }, // Earthy Brown
  { primary: '#2D5A27', accent: '#D4E157' }, // Deep Jungle
  { primary: '#455A64', accent: '#90A4AE' }, // Slate Stone
  { primary: '#AD1457', accent: '#F06292' }, // Sunset Pink
];

export const PreseededDestinations = [
  { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Serengeti National Park', country: 'Tanzania', emoji: '🦁' },
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Ngorongoro Crater', country: 'Tanzania', emoji: '🦏' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Tarangire National Park', country: 'Tanzania', emoji: '🐘' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Masai Mara National Reserve', country: 'Kenya', emoji: '🌊' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Amboseli National Park', country: 'Kenya', emoji: '🏔️' },
  { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Lake Manyara National Park', country: 'Tanzania', emoji: '🦩' },
  { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Ruaha National Park', country: 'Tanzania', emoji: '🐕' },
  { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Selous Game Reserve', country: 'Tanzania', emoji: '🚣' },
  { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Samburu National Reserve', country: 'Kenya', emoji: '🦓' },
  { id: '550e8400-e29b-41d4-a716-446655440009', name: 'Tsavo National Parks', country: 'Kenya', emoji: '🔴' },
];

export const Destinations = PreseededDestinations;
