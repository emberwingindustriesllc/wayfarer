'use client';

import React, { useState, useEffect } from 'react';
import challengeData from '../../data/challenges.json';
import { Arc, Challenge, Choice, GameStats, JournalEntry, ActOfGrace, TabType } from '../types/game';
import { Header } from '../components/Header';
import { LifeCompass } from '../components/LifeCompass';
import { EncounterView } from '../components/EncounterView';
import { RestAreaView } from '../components/RestAreaView';
import { StasisView } from '../components/StasisView';
import { InventoryView } from '../components/InventoryView';
import { JournalModal } from '../components/JournalModal';
import { ActOfGraceCard } from '../components/ActOfGraceCard';
import { audio } from '../utils/audio';
import {
  loadLocalState,
  syncStateToSupabase,
  loadLocalJournals,
  saveJournalEntry,
  loadLocalActsOfGrace,
  saveActOfGrace
} from '../utils/gameStorage';
import { Compass, Shield, PenTool, Heart, Flame } from 'lucide-react';

export default function WayfarerPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    resilience: 100,
    wisdom: 0,
    faith: 10,
    patience: 5,
    community: 5
  });
  const [currentArcId, setCurrentArcId] = useState('grief');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [inventory, setInventory] = useState<string[]>(['gospel_reading', 'breath_of_grace']);
  const [activeTab, setActiveTab] = useState<TabType>('compass');
  const [isStasis, setIsStasis] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState<string | undefined>();
  const [actsOfGrace, setActsOfGrace] = useState<ActOfGrace[]>([]);

  const arcs = challengeData.arcs as Record<string, Arc>;
  const disciplines = challengeData.disciplines;

  // Initialize and load saved state
  useEffect(() => {
    setMounted(true);
    const saved = loadLocalState();
    setStats(saved.stats);
    setCurrentArcId(saved.currentArc || 'grief');
    setCompletedChallenges(saved.completedChallenges || []);
    setInventory(saved.inventory || ['gospel_reading', 'breath_of_grace']);
    setJournals(loadLocalJournals());

    // Load or initialize daily acts of grace
    const savedActs = loadLocalActsOfGrace();
    if (savedActs && savedActs.length > 0) {
      setActsOfGrace(savedActs);
    } else {
      setActsOfGrace(challengeData.actsOfGrace as ActOfGrace[]);
    }

    if (saved.stats.resilience <= 0) {
      setIsStasis(true);
    }
  }, []);

  // Sync to Supabase whenever critical game state changes
  useEffect(() => {
    if (!mounted) return;
    syncStateToSupabase({
      stats,
      currentArc: currentArcId,
      activeChallengeId: activeChallenge?.id || null,
      completedChallenges,
      inventory,
      stasisCount: 0,
      guestId: '',
      lastUpdated: new Date().toISOString()
    });
  }, [stats, currentArcId, activeChallenge, completedChallenges, inventory, mounted]);

  // Check for Stasis trigger
  useEffect(() => {
    if (mounted && stats.resilience <= 0 && !isStasis) {
      setIsStasis(true);
    }
  }, [stats.resilience, mounted, isStasis]);

  const handleResolveChoice = (choice: Choice) => {
    setStats((prev) => {
      const netResilience = Math.max(
        0,
        Math.min(100, prev.resilience + (choice.resilienceGain || 0) - (choice.resilienceCost || 0))
      );
      return {
        resilience: netResilience,
        wisdom: prev.wisdom + (choice.wisdomGain || 0),
        faith: prev.faith + (choice.faithGain || 0),
        patience: prev.patience + (choice.patienceGain || 0),
        community: prev.community + (choice.communityGain || 0)
      };
    });

    if (activeChallenge && !completedChallenges.includes(activeChallenge.id)) {
      setCompletedChallenges((prev) => [...prev, activeChallenge.id]);
    }
  };

  const handleStasisRecover = () => {
    setIsStasis(false);
    setStats((prev) => ({
      ...prev,
      resilience: 50
    }));
    setActiveChallenge(null);
    setActiveTab('compass');
  };

  const handleApplyRestReward = (changes: Partial<GameStats>) => {
    setStats((prev) => ({
      ...prev,
      ...changes
    }));
  };

  const handleSaveJournal = async (content: string, prompt?: string) => {
    const saved = await saveJournalEntry({
      challengeId: activeChallenge?.id,
      arcId: currentArcId,
      prompt,
      content
    });
    setJournals((prev) => [saved, ...prev]);
    setStats((prev) => ({
      ...prev,
      wisdom: prev.wisdom + 5,
      community: prev.community + 3
    }));
  };

  const handleCompleteActOfGrace = async (actId: string, notes?: string) => {
    const updated = actsOfGrace.map((a) => {
      if (a.id === actId) {
        return {
          ...a,
          completed: true,
          notes,
          completedAt: new Date().toISOString()
        };
      }
      return a;
    });
    setActsOfGrace(updated);
    const target = updated.find((a) => a.id === actId);
    if (target) {
      await saveActOfGrace(target);
      // Give rewards
      setStats((prev) => ({
        ...prev,
        community: prev.community + 10,
        wisdom: prev.wisdom + 5,
        resilience: Math.min(100, prev.resilience + 10)
      }));
    }
  };

  const handleUsePrayerKnot = () => {
    if (stats.faith >= 15 && stats.community >= 10) {
      setStats((prev) => ({
        ...prev,
        faith: prev.faith - 10,
        resilience: Math.min(100, prev.resilience + 25)
      }));
      if (!inventory.includes('prayer_knot')) {
        setInventory((prev) => [...prev, 'prayer_knot']);
      }
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.soundEnabled = next;
    if (next) {
      audio.unlockContext();
      audio.playZeldaSecret();
    }
  };

  const currentArc = arcs[currentArcId] || Object.values(arcs)[0];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center text-gold">
        <div className="text-center space-y-2">
          <div className="text-3xl animate-spin" style={{ animationDuration: '4s' }}>🕊️</div>
          <p className="font-serif text-sm tracking-widest uppercase">Preparing The Pilgrimage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portrait-container">
      {/* Header Bar */}
      <Header
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenRest={() => {
          setActiveChallenge(null);
          setActiveTab('rest');
        }}
        currentArcTitle={currentArc?.title || 'The Wayfarer'}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {isStasis ? (
          <StasisView onRecover={handleStasisRecover} />
        ) : activeChallenge ? (
          <EncounterView
            challenge={activeChallenge}
            arcId={currentArcId}
            stats={stats}
            inventory={inventory}
            onResolveChoice={handleResolveChoice}
            onBack={() => setActiveChallenge(null)}
            onOpenJournalForChallenge={(ch, outcome) => {
              setJournalPrompt(`Reflecting on "${ch.title}": ${outcome}`);
              setIsJournalOpen(true);
            }}
          />
        ) : activeTab === 'compass' ? (
          <LifeCompass
            arcs={arcs}
            currentArcId={currentArcId}
            onSelectArc={(arcId) => setCurrentArcId(arcId)}
            completedChallenges={completedChallenges}
            onStartChallenge={(ch) => setActiveChallenge(ch)}
            onOpenRestArea={() => setActiveTab('rest')}
            faith={stats.faith}
            wisdom={stats.wisdom}
          />
        ) : activeTab === 'inventory' ? (
          <InventoryView
            disciplines={disciplines}
            inventory={inventory}
            stats={stats}
            onEquipItem={(id) => {
              if (!inventory.includes(id)) setInventory([...inventory, id]);
            }}
            onUsePrayerKnot={handleUsePrayerKnot}
            onOpenJournal={() => setIsJournalOpen(true)}
            onTriggerBreath={() => setIsStasis(true)}
          />
        ) : activeTab === 'grace' ? (
          <ActOfGraceCard
            acts={actsOfGrace}
            onCompleteAct={handleCompleteActOfGrace}
          />
        ) : activeTab === 'rest' ? (
          <RestAreaView
            stats={stats}
            onApplyRestReward={handleApplyRestReward}
            onBack={() => setActiveTab('compass')}
            onOpenJournal={() => setIsJournalOpen(true)}
          />
        ) : null}
      </main>

      {/* Journal Modal */}
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journals}
        onSaveEntry={handleSaveJournal}
        initialPrompt={journalPrompt}
      />

      {/* Bottom Mobile Navigation Tabs */}
      {!activeChallenge && !isStasis && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-secondary/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex justify-around">
          <button
            onClick={() => {
              audio.playGroundingTone();
              setActiveTab('compass');
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'compass'
                ? 'text-gold font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass size={18} />
            <span className="text-[10px] font-serif tracking-wider mt-0.5">Compass</span>
          </button>

          <button
            onClick={() => {
              audio.playGroundingTone();
              setActiveTab('inventory');
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'inventory'
                ? 'text-gold font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Shield size={18} />
            <span className="text-[10px] font-serif tracking-wider mt-0.5">Armor</span>
          </button>

          <button
            onClick={() => {
              audio.playGroundingTone();
              setActiveTab('grace');
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'grace'
                ? 'text-gold font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Heart size={18} />
            <span className="text-[10px] font-serif tracking-wider mt-0.5">Grace</span>
          </button>

          <button
            onClick={() => {
              audio.playGroundingTone();
              setIsJournalOpen(true);
            }}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-gray-400 hover:text-purple-300 transition-all"
          >
            <PenTool size={18} />
            <span className="text-[10px] font-serif tracking-wider mt-0.5">Journal</span>
          </button>

          <button
            onClick={() => {
              audio.playGroundingTone();
              setActiveTab('rest');
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'rest'
                ? 'text-amber-400 font-semibold scale-105'
                : 'text-gray-400 hover:text-amber-300'
            }`}
          >
            <Flame size={18} />
            <span className="text-[10px] font-serif tracking-wider mt-0.5">Sanctuary</span>
          </button>
        </nav>
      )}
    </div>
  );
}
