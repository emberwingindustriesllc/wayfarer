'use client';

import React, { useState, useEffect } from 'react';
import { GameStats } from '../types/game';
import { ArrowLeft, Flame, BookOpen, Users, Sparkles, Heart, Check, RefreshCw } from 'lucide-react';
import { audio } from '../utils/audio';
import { logRestAreaVisit } from '../utils/gameStorage';

interface RestAreaViewProps {
  stats: GameStats;
  onApplyRestReward: (statChanges: Partial<GameStats>) => void;
  onBack: () => void;
  onOpenJournal: () => void;
}

const SCRIPTURE_WELL_VERSES = [
  {
    verse: "“Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart.”",
    ref: "Matthew 11:28-29",
    application: "Jesus does not offer a heavier task list; He offers an exchange. You surrender your exhaustion; He provides gentle rhythm."
  },
  {
    verse: "“Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and minds.”",
    ref: "Philippians 4:6-7",
    application: "Peace is not the absence of trouble; it is the presence of God guarding the fortress of your mind."
  },
  {
    verse: "“Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.”",
    ref: "Isaiah 40:31",
    application: "Spiritual renewal is not about sprinting faster; it is about learning to wait until the Divine wind lifts you."
  }
];

export const RestAreaView: React.FC<RestAreaViewProps> = ({
  stats,
  onApplyRestReward,
  onBack,
  onOpenJournal
}) => {
  const [activeTab, setActiveTab] = useState<'campfire' | 'well' | 'circle'>('campfire');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [isCampfireRested, setIsCampfireRested] = useState(false);
  const [wellVerseIndex, setWellVerseIndex] = useState(0);
  const [isWellReflected, setIsWellReflected] = useState(false);
  const [isCircleVisited, setIsCircleVisited] = useState(false);

  useEffect(() => {
    audio.toggleAmbientSanctuary(true);
    return () => {
      audio.toggleAmbientSanctuary(false);
    };
  }, []);

  const handleCampfireRest = () => {
    const resilienceGain = Math.min(100 - stats.resilience, 25);
    const faithGain = 8;
    const wisdomGain = 6;

    audio.playGraceChord();
    setIsCampfireRested(true);
    onApplyRestReward({
      resilience: Math.min(100, stats.resilience + resilienceGain),
      faith: stats.faith + faithGain,
      wisdom: stats.wisdom + wisdomGain
    });
    logRestAreaVisit('campfire', `Gratitudes: ${gratitude1} | ${gratitude2}`);
  };

  const handleScriptureMeditate = () => {
    const current = SCRIPTURE_WELL_VERSES[wellVerseIndex];
    audio.playChime(528, 3.0);
    setIsWellReflected(true);
    onApplyRestReward({
      wisdom: stats.wisdom + 12,
      faith: stats.faith + 10
    });
    logRestAreaVisit('scripture_well', current.application, current.ref);
  };

  const handleSupportCircle = () => {
    audio.playChime(396, 2.5);
    setIsCircleVisited(true);
    onApplyRestReward({
      community: stats.community + 12,
      resilience: Math.min(100, stats.resilience + 15)
    });
    logRestAreaVisit('support_circle', 'Gathered encouragement from the fellowship');
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-20 bg-gradient-to-b from-primary via-secondary to-space">
      {/* Return button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gold transition-colors py-1 px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft size={14} />
          <span>Return to Journey</span>
        </button>
        <span className="text-[10px] font-mono text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center space-x-1">
          <Flame size={11} className="animate-pulse" />
          <span>Sacred Rest Checkpoint</span>
        </span>
      </div>

      {/* Sanctuary Heading */}
      <div className="text-center my-2">
        <h2 className="font-serif text-xl font-bold text-gold tracking-wide">
          The Rest Sanctuary
        </h2>
        <p className="text-xs text-gray-400 font-reading italic">
          “Be still, and know that I am God.” — Psalm 46:10
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 my-3">
        <button
          onClick={() => {
            audio.playGroundingTone();
            setActiveTab('campfire');
          }}
          className={`py-2 px-1 rounded-lg text-xs font-serif flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'campfire'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame size={13} />
          <span>The Campfire</span>
        </button>

        <button
          onClick={() => {
            audio.playGroundingTone();
            setActiveTab('well');
          }}
          className={`py-2 px-1 rounded-lg text-xs font-serif flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'well'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookOpen size={13} />
          <span>Scripture Well</span>
        </button>

        <button
          onClick={() => {
            audio.playGroundingTone();
            setActiveTab('circle');
          }}
          className={`py-2 px-1 rounded-lg text-xs font-serif flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'circle'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users size={13} />
          <span>Support Circle</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* CAMPFIRE */}
        {activeTab === 'campfire' && (
          <div className="p-4 rounded-2xl bg-card/90 border border-amber-500/30 shadow-xl space-y-4">
            <div className="text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-2xl shadow-glow-fire animate-pulse-gentle">
                🔥
              </div>
              <h3 className="font-serif text-base font-bold text-amber-200 mt-2">
                Warmth of the Campfire
              </h3>
              <p className="text-xs text-gray-300 font-reading max-w-xs mx-auto mt-1">
                The flame flickers against the twilight. Rest is not wasted time; it is where armor is mended and the soul refuels.
              </p>
            </div>

            {!isCampfireRested ? (
              <div className="space-y-3 bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="text-[11px] font-sans font-semibold text-amber-300 uppercase tracking-wider block">
                  Gratitude Reflection (Optional)
                </span>
                <input
                  type="text"
                  placeholder="Name one blessing from today..."
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-secondary/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="Name a second gift or source of grace..."
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-secondary/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />

                <button
                  onClick={handleCampfireRest}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-space font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
                >
                  <Flame size={14} />
                  <span>Receive Warmth & Fortification</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <Check size={24} className="text-amber-400 mx-auto" />
                <h4 className="font-serif text-sm font-semibold text-amber-200">
                  Resilience & Faith Restored
                </h4>
                <p className="text-xs text-gray-300 font-reading">
                  Your spirit feels anchored once more. (+25 Resilience, +8 Faith, +6 Wisdom)
                </p>
                <button
                  onClick={onOpenJournal}
                  className="mt-2 text-xs text-amber-300 underline underline-offset-4"
                >
                  Write deeper reflections in your Journal
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCRIPTURE WELL */}
        {activeTab === 'well' && (
          <div className="p-4 rounded-2xl bg-card/90 border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif text-blue-300 flex items-center space-x-1">
                <BookOpen size={14} />
                <span>Living Waters</span>
              </span>
              <button
                onClick={() => {
                  setWellVerseIndex((wellVerseIndex + 1) % SCRIPTURE_WELL_VERSES.length);
                  setIsWellReflected(false);
                }}
                className="text-[11px] text-gray-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <RefreshCw size={11} />
                <span>Another Verse</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-blue-500/20 text-center space-y-2">
              <p className="font-reading text-sm text-gray-100 italic leading-relaxed">
                {SCRIPTURE_WELL_VERSES[wellVerseIndex].verse}
              </p>
              <span className="text-xs font-mono font-medium text-blue-300 block">
                — {SCRIPTURE_WELL_VERSES[wellVerseIndex].ref}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/80 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">
                Spiritual Application
              </span>
              <p className="text-xs text-gray-300 font-reading leading-relaxed">
                {SCRIPTURE_WELL_VERSES[wellVerseIndex].application}
              </p>
            </div>

            {!isWellReflected ? (
              <button
                onClick={handleScriptureMeditate}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles size={14} />
                <span>Meditate on this Promise (+12 WI, +10 FW)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center text-xs text-blue-200">
                You have meditated upon the Word. Wisdom and Faith have taken deeper root.
              </div>
            )}
          </div>
        )}

        {/* SUPPORT CIRCLE */}
        {activeTab === 'circle' && (
          <div className="p-4 rounded-2xl bg-card/90 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Users size={24} />
              </div>
              <h3 className="font-serif text-base font-bold text-emerald-200 mt-2">
                The Support Circle
              </h3>
              <p className="text-xs text-gray-300 font-reading max-w-xs mx-auto mt-1">
                Pilgrims were never designed to traverse the wilderness alone. True resilience is shared resilience.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-reading text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Reach out to a counselor, pastor, or trusted brother/sister who holds your confidence sacred.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Confessing struggle is not weakness; it breaks the illusion of perfection that isolates us.</span>
              </div>
            </div>

            {!isCircleVisited ? (
              <button
                onClick={handleSupportCircle}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
              >
                <Users size={14} />
                <span>Connect with Fellowship (+12 CO, +15 RE)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs text-emerald-200">
                Fellowship acknowledged. The weight is distributed. (+12 Community, +15 Resilience)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
