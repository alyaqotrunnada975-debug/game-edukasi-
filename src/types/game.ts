export type GameScreen = 'opening' | 'map' | 'explore' | 'finale';

export type LocationId =
  | 'benteng-kuto-besak'
  | 'museum-smb2'
  | 'jembatan-ampera'
  | 'pulau-kemaro'
  | 'rumah-limas'
  | 'taman-purbakala';

export type GuideId = 'arya';

export type FloorTheme =
  | 'stone-courtyard'
  | 'heritage-terracotta'
  | 'musi-boardwalk'
  | 'swamp-lotus'
  | 'village-garden'
  | 'candi-ruins';

export type SpriteAction =
  | 'idle'
  | 'jalan'
  | 'lari'
  | 'lompat'
  | 'melambai'
  | 'berbicara'
  | 'menunjuk'
  | 'merayakan'
  | 'jalan_alt'
  | 'lari_alt';

export interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

export interface RelicItem {
  id: string;
  name: string;
  shortDesc: string;
  historyFact: string;
  iconType: 'cannon' | 'key' | 'stone' | 'songket' | 'statue' | 'coin' | 'compass' | 'boat' | 'badge' | 'jar' | 'lantern' | 'tablet' | 'lacquer' | 'wood' | 'spire' | 'inscription' | 'brick' | 'ship';
  position: [number, number];
}

export interface GuideDialogue {
  speakerName: string;
  guideId: GuideId;
  lines: {
    speaker: string;
    text: string;
    kikoReaction?: string;
  }[];
}

export interface InfoBoardData {
  title: string;
  summary: string;
  paragraphs: string[];
  vocabulary: VocabItem[];
}

export type MiniGameConfig =
  | {
      type: 'paragraph-order';
      title: string;
      instruction: string;
      sentences: { id: string; text: string; correctOrder: number }[];
    }
  | {
      type: 'match-and-main-idea';
      title: string;
      instruction: string;
      pairs: { id: string; itemName: string; description: string }[];
      readingTitle: string;
      readingPassage: string;
      question: string;
      options: { id: string; text: string; isCorrect: boolean }[];
    }
  | {
      type: 'effective-sentence';
      title: string;
      instruction: string;
      wordTokens: string[];
      correctSentence: string;
      hintSpok: string;
      readingTitle: string;
      readingPassage: string;
      question: string;
      options: { id: string; text: string; isCorrect: boolean }[];
    }
  | {
      type: 'fact-vs-legend';
      title: string;
      instruction: string;
      statements: { id: string; text: string; category: 'fakta' | 'legenda'; mainCharacter?: string }[];
      characterQuestion: {
        prompt: string;
        options: string[];
        correct: string;
      };
      storyOrder: { id: string; text: string; correctOrder: number }[];
    }
  | {
      type: 'vocab-and-observation';
      title: string;
      instruction: string;
      vocabMatches: { id: string; word: string; definition: string }[];
      observationOrder: { id: string; text: string; correctOrder: number }[];
    }
  | {
      type: 'memory-and-riddle';
      title: string;
      instruction: string;
      memoryPairs: { id: string; title: string; clue: string }[];
      riddles: {
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
      }[];
    };

export interface LocationConfig {
  id: LocationId;
  order: number;
  name: string;
  shortName: string;
  subtitle: string;
  backdropUrl: string;
  floorTheme: FloorTheme;
  fogColor: string;
  skyTopColor: string;
  skyBottomColor: string;
  mapCoords: [number, number];
  guide: GuideDialogue;
  infoBoard: InfoBoardData;
  infoBoardPos: [number, number];
  guidePos: [number, number];
  relics: RelicItem[];
  miniGame: MiniGameConfig;
  badgeId: string;
}

export interface LocationProgress {
  talkedToGuide: boolean;
  readInfoBoard: boolean;
  collectedRelics: string[];
  completedMiniGame: boolean;
  stars: number; // 0..3
}

export interface AudioSettings {
  muted: boolean;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
}

export interface PlayerProgress {
  playerName: string;
  xp: number;
  coins: number;
  badges: string[];
  locations: Record<LocationId, LocationProgress>;
  audio: AudioSettings;
  finaleSeen: boolean;
}

export interface BadgeConfig {
  id: string;
  locationId: LocationId;
  title: string;
  description: string;
  accentColor: string;
}
