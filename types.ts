
export interface Channel {
  id: string;
  name: string;
  profilePicture: string; // URL or base64 string
  subscribers: number;
  views: number;
  money: number;
  watchHours: number;
  videos: Video[];
  equipment: EquipmentLevels;
  energy: number;
  maxEnergy: number;
  isMonetized: boolean;
  creationDate: number; // timestamp
  day: number; // In-game day
  totalEarnings: number;
  achievements: string[]; // IDs of unlocked achievements
  premiumFollowingProject: boolean; // Tracks if user @project is followed
  pendingCommunityBoost?: number; // Points earned from the comment minigame
  lastCommunityGamePlayedDay?: number; // To limit playing community minigame
  pendingThumbnailCTRBoost?: number; // CTR Boost percentage (e.g., 0.05 for 5%) from thumbnail game
  lastThumbnailGamePlayedDay?: number; // To limit playing thumbnail minigame
  pendingStreamBonus?: StreamBonus; // Bonus multipliers from streamer sensation game
  lastStreamGamePlayedDay?: number; // To limit playing streamer sensation game
}

export interface Video {
  id: string;
  title: string;
  genre: string;
  subGenre?: string; // For advanced genres
  recordingMethod: string;
  uploadDate: number; // timestamp (in-game date)
  views: number;
  subscribersGained: number;
  moneyGained: number;
  watchHoursGained: number; // Calculated based on views
}

export enum EquipmentType {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  EDITING_SOFTWARE = 'editingSoftware',
  DECORATION = 'decoration',
}

export interface EquipmentItem {
  name: string;
  levels: EquipmentLevelDetail[];
  description: string;
  icon: string; // Font Awesome class
}

export interface EquipmentLevelDetail {
  level: number;
  cost: number;
  description: string;
  statBoost?: number; // e.g., % view boost or energy boost
}

export type EquipmentLevels = {
  [key in EquipmentType]: number; // Current level for each equipment type
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Font Awesome class
  milestoneType: 'subscribers' | 'views' | 'watchHours' | 'money' | 'videosUploaded' | 'totalEarnings';
  milestoneValue: number;
  reward?: { money?: number; energyBoost?: number };
}

export type GenreDetails = {
  [key: string]: string[]; // Genre: SubGenre[]
};

export type GlobalStats = {
  totalChannelsCreated: number;
  totalSubscribers: number;
  totalViews: number;
  totalMoneyEarned: number;
};

export type PremiumBenefits = {
  extraSaveSlot: boolean;
  earningsMultiplier: number; // e.g., 1.5 for 1.5x
  viewsMultiplier: number;   // e.g., 1.5 for 1.5x
  exclusiveBadge: boolean;
  reducedEnergyCosts: boolean;
};

export const DEFAULT_PROFILE_PICTURE = `data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%23e2e8f0'/%3e%3cpath d='M50 30C41.716 30 35 36.716 35 45C35 53.284 41.716 60 50 60C58.284 60 65 53.284 65 45C65 36.716 58.284 30 50 30ZM25 70C25 58.954 36.193 50 50 50C63.807 50 75 58.954 75 70H25Z' fill='%2394a3b8'/%3e%3c/svg%3e`;

// Types for Community Minigame
export interface CommentOption {
  text: string;
  points: number; // Points awarded for choosing this option
  feedback: string; // e.g., "¡Buena elección!", "No es lo ideal."
  isCorrect?: boolean; // Optional: if there's a single "correct" answer for styling
}

export interface GameComment {
  id: string;
  text: string;
  author: string; // e.g., "Fan123", "TrollBot"
  type: 'positive' | 'neutral' | 'mildly_negative' | 'toxic_spam';
  options: CommentOption[];
}

// Types for Thumbnail Optimizer Minigame
export type ThumbnailComponentType = 'background' | 'object' | 'text';
export type ThumbnailComponentQuality = 'good' | 'neutral' | 'bad';

export interface ThumbnailVisualColor {
  type: 'color';
  value: string; // e.g., '#FF0000'
}
export interface ThumbnailVisualGradient {
  type: 'gradient';
  value: string; // e.g., 'linear-gradient(to right, #ff0000, #00ff00)'
}
export interface ThumbnailVisualIcon {
  type: 'icon';
  iconClass: string; // e.g., 'fas fa-rocket'
  color: string;
  size?: string; // e.g., '50px'
  backgroundColor?: string; // Optional background for the icon itself
}
export interface ThumbnailVisualText {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: string;
  color: string;
  strokeColor?: string;
  strokeWidth?: string;
}

export type ThumbnailVisual = ThumbnailVisualColor | ThumbnailVisualGradient | ThumbnailVisualIcon | ThumbnailVisualText;

export interface ThumbnailComponent {
  id: string;
  componentType: ThumbnailComponentType;
  displayName: string; // For display in the reel, e.g., "Fondo Rojo Brillante"
  visual: ThumbnailVisual;
  quality: ThumbnailComponentQuality;
  points: number;
}

// Types for Streamer Sensation Minigame
export type StreamPromptType = 'QUICK_CLICK' | 'KEYWORD_TYPE' | 'EMOJI_SELECT';

export interface StreamPromptDataClick {
  buttonText: string;
}
export interface StreamPromptDataKeyword {
  keyword: string;
  placeholder: string;
}
export interface StreamPromptDataEmoji {
  emojis: string[]; // Array of emojis, e.g., ['❤️', '👍', '😂']
  correctEmoji: string;
}

export interface StreamPrompt {
  id: string;
  type: StreamPromptType;
  displayText: string; // e.g., "¡Saluda al nuevo Sub!" or "El chat pide [keyword]"
  data: StreamPromptDataClick | StreamPromptDataKeyword | StreamPromptDataEmoji;
  durationSeconds: number; // How long the player has to react
  pointsForSuccess: number; // Hype gained
  pointsForFailure: number; // Hype lost (can be negative)
}

export interface StreamBonus {
  viewsMultiplier: number;
  subsMultiplier: number;
  moneyMultiplier: number;
}
