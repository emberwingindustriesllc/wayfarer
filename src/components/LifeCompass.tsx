'use client';

import React, { useState } from 'react';
import { Arc, Challenge } from '../types/game';
import { WorldLandscape } from './WorldLandscape';
import { Compass, Flame, ArrowRight, ShieldCheck, HeartHandshake, Briefcase, SunMedium, Map, List, Play, CheckCircle2, Lock } from 'lucide-react';
import { audio } from '../utils/audio';

interface LifeCompassProps {
  arcs: Record<string, Arc>;
  currentArcId: string;
  onSelectArc: (arcId: string) => void;
  completedChallenges: string[];
  onStartChallenge: (challenge: Challenge) => void;
  onOpenRestArea: () => void;
  faith: number;
  wisdom: number;
}

const ARC_ICONS: Record<string, { icon: React.ReactNode; biome: string }> = {
  grief: { icon: <span className="text-sm">❄️</span>, biome: 'Snowy Mountains' },
  relationship: { icon: <span className="text-sm">🌾</span>, biome: 'Golden Savannah' },
  work: { icon: <span className="text-sm">🏜️</span>, biome: 'Sun Desert' },
  self: { icon: <span className="text-sm">🌲</span>, biome: 'Ancient Forest' }
};

export const LifeCompass: React.FC<LifeCompassProps> = ({
  arcs,
  currentArcId,
  onSelectArc,
  completedChallenges,
  onStartChallenge,
  onOpenRestArea,
  faith,
  wisdom
}) => {
  const [viewMode, setViewMode] = useState<'world' | 'list'>('world');
  const currentArc = arcs[currentArcId] || Object.values(arcs)[0];
  const arcChallenges = currentArc?.challenges || [];

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Compass Arc Selector Tabs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-serif text-gold uppercase tracking-wider">
            <Compass size={14} className="animate-spin" style={{ animationDuration: '24s' }} />
            <span>The Pilgrimage Path</span>
          </div>

          {/* Toggle between World Map and Detail List */}
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode('world')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'world' ? 'bg-gold/20 text-gold font-semibold' : 'text-gray-400'
              }`}
            >
              <Map size={11} />
              <span>World</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'list' ? 'bg-gold/20 text-gold font-semibold' : 'text-gray-400'
              }`}
            >
              <List size={11} />
              <span>Trail</span>
            </button>
          </div>
        </div>

        {/* The 4 Thematic World Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {Object.values(arcs).map((arc) => {
            const isSelected = arc.id === currentArcId;
            const completedCount = arc.challenges.filter(c => completedChallenges.includes(c.id)).length;
            const totalCount = arc.challenges.length;

            return (
              <button
                key={arc.id}
                onClick={() => {
                  audio.playGroundingTone();
                  onSelectArc(arc.id);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'bg-card border-gold/50 shadow-md ring-1 ring-gold/20'
                    : 'bg-secondary/60 border-white/5 hover:bg-card/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="p-1 rounded-md bg-black/40 flex items-center space-x-1">
                    {ARC_ICONS[arc.id]?.icon || <span>🗺️</span>}
                    <span className="text-[9px] font-mono text-gold/90 font-medium">{ARC_ICONS[arc.id]?.biome || ''}</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="text-xs font-semibold text-gray-100 truncate">
                  {arc.title.replace('The Arc of ', '')}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {arc.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main World Landscape or List View */}
      <div className="px-4 py-2 space-y-3">
        {viewMode === 'world' ? (
          <>
            {/* The Living World Landscape with Animated Avatar */}
            <WorldLandscape
              arc={currentArc}
              completedChallenges={completedChallenges}
              onSelectChallenge={onStartChallenge}
              onOpenRest={onOpenRestArea}
              faith={faith}
              wisdom={wisdom}
            />

            {/* Instruction Tip */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-reading">
              <span>Tap any active node on the trail to walk and engage</span>
              <span className="text-gold font-mono">Step along path</span>
            </div>
          </>
        ) : null}

        {/* Active Arc Scripture & Meditation Card */}
        <div className="p-3.5 rounded-xl bg-card border border-white/10 shadow-lg relative overflow-hidden">
          <h2 className="font-serif text-sm font-semibold text-gold mb-1">
            {currentArc.title}
          </h2>
          <p className="text-xs text-gray-300 font-reading leading-relaxed mb-2">
            {currentArc.description}
          </p>
          <div className="p-2.5 rounded-lg bg-black/30 border-l-2 border-gold text-[11px] text-gold/90 italic font-reading">
            {currentArc.scripture}
          </div>
        </div>

        {/* Detailed Trail Cards (Visible in both or list mode) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-serif uppercase tracking-wider text-gray-400">
              Pilgrimage Challenges
            </span>
            <span className="text-[10px] text-gray-500">
              Pivoting conflict to resilience
            </span>
          </div>

          {arcChallenges.map((challenge, idx) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            const isFirstIncomplete = !isCompleted && arcChallenges.slice(0, idx).every(c => completedChallenges.includes(c.id));
            const isAvailable = isCompleted || isFirstIncomplete;

            return (
              <div
                key={challenge.id}
                onClick={() => {
                  if (isAvailable) {
                    audio.playFootstep();
                    audio.playEncounterStart();
                    onStartChallenge(challenge);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFirstIncomplete
                    ? 'bg-card border-gold/50 shadow-lg cursor-pointer hover:border-gold hover:translate-x-1'
                    : isCompleted
                    ? 'bg-card/70 border-white/5 opacity-80 cursor-pointer hover:opacity-100 hover:border-white/20'
                    : 'bg-secondary/40 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isCompleted
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                        : isFirstIncomplete
                        ? 'bg-gold/20 text-gold border border-gold animate-pulse'
                        : 'bg-black/50 text-gray-500 border border-white/10'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={12} /> : isFirstIncomplete ? <Play size={10} className="fill-gold" /> : <Lock size={10} />}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      Step {idx + 1}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Fortified
                    </span>
                  )}
                  {isFirstIncomplete && (
                    <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span>Active</span>
                      <ArrowRight size={10} />
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-semibold text-gray-100 mb-0.5 font-serif">
                  {challenge.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-sans line-clamp-1">
                  {challenge.subtitle}
                </p>
              </div>
            );
          })}

          {/* Rest Sanctuary Entry */}
          <button
            onClick={() => {
              audio.playGroundingTone();
              onOpenRestArea();
            }}
            className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-card to-card border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-md flex items-center justify-between"
          >
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-serif text-amber-300 font-semibold mb-0.5">
                <Flame size={14} className="animate-pulse text-amber-400" />
                <span>The Rest Sanctuary</span>
              </div>
              <p className="text-[11px] text-gray-300 font-reading">
                Campfire reflection, Scripture Well, & Support Circle.
              </p>
            </div>
            <ArrowRight size={16} className="text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
