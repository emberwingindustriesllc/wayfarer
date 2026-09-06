// The Wayfarer's Journey - Dual-Mode Storage Engine (Offline-First + Supabase Cloud)
import { createClient } from '@supabase/supabase-js';
import { GameProgressState, GameStats, JournalEntry, ActOfGrace } from '../types/game';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cthmkcnynflcjkcluwwr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aG1rY255bmZsY2prY2x1d3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjY3MDQsImV4cCI6MjEwNDMwMjcwNH0.PX_OlqUTIYNhPm4p5vdYhunIOJBM1l3Hnk8140v32C4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_KEY = 'wayfarer_journey_state_v2';
const JOURNAL_KEY = 'wayfarer_journey_journals_v2';
const GRACE_KEY = 'wayfarer_journey_grace_v2';

export const DEFAULT_STATS: GameStats = {
  resilience: 100,
  wisdom: 0,
  faith: 10,
  patience: 5,
  community: 5
};

export const DEFAULT_STATE: GameProgressState = {
  stats: DEFAULT_STATS,
  currentArc: 'grief',
  activeChallengeId: null,
  completedChallenges: [],
  inventory: ['gospel_reading', 'breath_of_grace'],
  stasisCount: 0,
  guestId: '',
  lastUpdated: new Date().toISOString()
};

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'server-wayfarer';
  let id = localStorage.getItem('wayfarer_guest_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('wayfarer_guest_id', id);
  }
  return id;
}

export function loadLocalState(): GameProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE, guestId: 'server' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const guestId = getOrCreateGuestId();
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed, guestId };
    }
    const initial = { ...DEFAULT_STATE, guestId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return { ...DEFAULT_STATE, guestId: getOrCreateGuestId() };
  }
}

export function saveLocalState(state: GameProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

export async function syncStateToSupabase(state: GameProgressState): Promise<void> {
  saveLocalState(state);
  try {
    if (!state.guestId) state.guestId = getOrCreateGuestId();
    await supabase.from('game_progress').upsert(
      {
        guest_id: state.guestId,
        current_arc: state.currentArc,
        active_challenge_id: state.activeChallengeId,
        stats: state.stats,
        inventory: state.inventory,
        completed_challenges: state.completedChallenges,
        stasis_count: state.stasisCount,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'guest_id' }
    );
  } catch (err) {
    console.warn('Supabase sync skipped (offline or network pause):', err);
  }
}

export async function fetchRemoteState(guestId: string): Promise<Partial<GameProgressState> | null> {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('guest_id', guestId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      stats: data.stats || DEFAULT_STATS,
      currentArc: data.current_arc || 'grief',
      activeChallengeId: data.active_challenge_id || null,
      completedChallenges: data.completed_challenges || [],
      inventory: data.inventory || ['gospel_reading', 'breath_of_grace'],
      stasisCount: data.stasis_count || 0
    };
  } catch {
    return null;
  }
}

// Journals Storage
export function loadLocalJournals(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
  const newEntry: JournalEntry = {
    ...entry,
    id: 'entry_' + Date.now().toString(36),
    createdAt: new Date().toISOString()
  };

  const list = loadLocalJournals();
  list.unshift(newEntry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(list));
  }

  // Cloud sync
  try {
    const guestId = getOrCreateGuestId();
    await supabase.from('journal_entries').insert({
      guest_id: guestId,
      challenge_id: entry.challengeId,
      arc_id: entry.arcId,
      prompt: entry.prompt,
      content: entry.content
    });
  } catch (err) {
    console.warn('Supabase journal sync offline:', err);
  }

  return newEntry;
}

// Acts of Grace
export function loadLocalActsOfGrace(): ActOfGrace[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GRACE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveActOfGrace(act: ActOfGrace): Promise<void> {
  const list = loadLocalActsOfGrace();
  const index = list.findIndex(a => a.id === act.id);
  if (index >= 0) {
    list[index] = act;
  } else {
    list.push(act);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(GRACE_KEY, JSON.stringify(list));
  }

  try {
    const guestId = getOrCreateGuestId();
    await supabase.from('acts_of_grace').upsert({
      guest_id: guestId,
      act_title: act.title,
      notes: act.notes || '',
      completed: act.completed || false,
      completed_at: act.completed ? new Date().toISOString() : null
    });
  } catch (err) {
    console.warn('Grace sync offline:', err);
  }
}

// Rest Area Log
export async function logRestAreaVisit(restType: 'campfire' | 'scripture_well' | 'support_circle', reflection?: string, scriptureReferenced?: string) {
  try {
    const guestId = getOrCreateGuestId();
    await supabase.from('rest_area_logs').insert({
      guest_id: guestId,
      rest_type: restType,
      reflection: reflection || '',
      scripture_referenced: scriptureReferenced || ''
    });
  } catch {}
}
