// The Wayfarer's Journey - Core Type Definitions

export type StatType = 'resilience' | 'wisdom' | 'faith' | 'patience' | 'community';

export interface GameStats {
  resilience: number; // 0 - 100 (HP / Fortitude)
  wisdom: number;     //Discernment accumulated
  faith: number;      // Reliance on God and Scripture
  patience: number;   // Emotional de-escalation & pause
  community: number;  // Social support and fellowship
}

export type ChoiceArchetype = 'Impulsive' | 'Faith' | 'Patience' | 'Community';

export interface Choice {
  archetype: ChoiceArchetype;
  label: string;
  desc: string;
  resilienceCost?: number;
  resilienceGain?: number;
  wisdomGain?: number;
  faithGain?: number;
  patienceGain?: number;
  communityGain?: number;
  reflectionOutcome: string;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  scriptureAnchor: string;
  reflectionQuestion: string;
  choices: Choice[];
}

export interface Arc {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  icon: string;
  scripture: string;
  challenges: Challenge[];
}

export interface Discipline {
  id: string;
  name: string;
  type: string;
  description: string;
  buff: string;
  icon: string;
  equipped?: boolean;
}

export interface ActOfGrace {
  id: string;
  title: string;
  prompt: string;
  category: string;
  reward: string;
  completed?: boolean;
  notes?: string;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  guestId?: string;
  challengeId?: string;
  arcId?: string;
  prompt?: string;
  content: string;
  createdAt: string;
}

export interface RestAreaLog {
  id: string;
  restType: 'campfire' | 'scripture_well' | 'support_circle';
  reflection?: string;
  scriptureReferenced?: string;
  createdAt: string;
}

export type TabType = 'compass' | 'inventory' | 'journal' | 'grace' | 'rest';

export interface GameProgressState {
  stats: GameStats;
  currentArc: string;
  activeChallengeId: string | null;
  completedChallenges: string[];
  inventory: string[];
  stasisCount: number;
  guestId: string;
  lastUpdated: string;
}
