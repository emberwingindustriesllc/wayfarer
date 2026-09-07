'use client';

import React from 'react';
import { GameStats } from '../types/game';
import { Volume2, VolumeX, Shield, BookOpen, Clock, Users, Sparkles, Heart } from 'lucide-react';
import { audio } from '../utils/audio';

interface HeaderProps {
  stats: GameStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRest: () => void;
  currentArcTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onOpenRest,
  currentArcTitle
}) => {
  const isCriticalResilience = stats.resilience <= 25;

  return (
    <header className="sticky top-0 z-40 bg-secondary/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
      {/* Top Brand & Sound */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs font-serif font-bold">
            🕊️
          </div>
          <div>
            <h1 className="font-serif text-sm font-semibold tracking-wider text-gold">
              THE WAYFARER
            </h1>
            <p className="text-[10px] text-gray-400 font-sans tracking-wide truncate max-w-[170px]">
              {currentArcTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenRest}
            className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center space-x-1 hover:bg-amber-500/25 transition-colors"
            title="Visit Rest Sanctuary"
          >
            <span>🔥</span>
            <span className="hidden xs:inline text-[11px]">Sanctuary</span>
          </button>

          <button
            onClick={() => {
              audio.unlockContext();
              onToggleSound();
            }}
            className={`px-2 py-1 rounded-full border text-xs flex items-center space-x-1 transition-colors ${
              soundEnabled
                ? 'bg-gold/15 border-gold/40 text-gold hover:bg-gold/25'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} className="animate-pulse" />
                <span className="text-[10px] font-mono font-semibold">ON</span>
              </>
            ) : (
              <>
                <VolumeX size={14} />
                <span className="text-[10px] font-mono">OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resilience Primary Bar (HP / Fortitude) */}
      <div className="mb-2">
        <div className="flex justify-between items-center text-[11px] mb-1 font-medium">
          <span className="flex items-center space-x-1 text-gray-300">
            <Heart size={12} className={isCriticalResilience ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} />
            <span>Resilience</span>
          </span>
          <span className={`font-mono text-xs font-semibold ${
            isCriticalResilience ? 'text-rose-400 font-bold' : 'text-gray-200'
          }`}>
            {stats.resilience} / 100
          </span>
        </div>
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCriticalResilience
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500'
            }`}
            style={{ width: `${Math.max(3, stats.resilience)}%` }}
          />
        </div>
      </div>

      {/* Internal Armor Attributes (Wisdom, Faith, Patience, Community) */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <div className="bg-black/30 rounded-lg px-2 py-1 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-purple-300 text-[10px]">
            <Sparkles size={11} />
            <span className="hidden xs:inline">Wisdom</span>
          </div>
          <span className="font-mono text-xs font-semibold text-purple-200">{stats.wisdom}</span>
        </div>

        <div className="bg-black/30 rounded-lg px-2 py-1 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gold text-[10px]">
            <BookOpen size={11} />
            <span className="hidden xs:inline">Faith</span>
          </div>
          <span className="font-mono text-xs font-semibold text-gold">{stats.faith}</span>
        </div>

        <div className="bg-black/30 rounded-lg px-2 py-1 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-teal-300 text-[10px]">
            <Clock size={11} />
            <span className="hidden xs:inline">Patience</span>
          </div>
          <span className="font-mono text-xs font-semibold text-teal-200">{stats.patience}</span>
        </div>

        <div className="bg-black/30 rounded-lg px-2 py-1 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-blue-300 text-[10px]">
            <Users size={11} />
            <span className="hidden xs:inline">Comm</span>
          </div>
          <span className="font-mono text-xs font-semibold text-blue-200">{stats.community}</span>
        </div>
      </div>
    </header>
  );
};
