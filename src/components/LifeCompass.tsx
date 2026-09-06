'use client';

import React from 'react';
import { Arc, Challenge } from '../types/game';
import { CheckCircle2, Lock, Play, Compass, Flame, ArrowRight, ShieldCheck, HeartHandshake, Briefcase, SunMedium } from 'lucide-react';
import { audio } from '../utils/audio';

interface LifeCompassProps {
  arcs: Record<string, Arc>;
  currentArcId: string;
  onSelectArc: (arcId: string) => void;
  completedChallenges: string[];
  onStartChallenge: (challenge: Challenge) => void;
  onOpenRestArea: () => void;
}

const ARC_ICONS: Record<string, React.ReactNode> = {
  grief: <HeartHandshake size={16} className="text-blue-400" />,
  relationship: <ShieldCheck size={16} className="text-emerald-400" />,
  work: <Briefcase size={16} className="text-amber-400" />,
  self: <SunMedium size={16} className="text-pink-400" />
};

export const LifeCompass: React.FC<LifeCompassProps> = ({
  arcs,
  currentArcId,
  onSelectArc,
  completedChallenges,
  onStartChallenge,
  onOpenRestArea
}) => {
  const currentArc = arcs[currentArcId] || Object.values(arcs)[0];
  const arcChallenges = currentArc?.challenges || [];

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Compass Arc Selector Tabs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center space-x-1.5 mb-2 text-xs font-serif text-gold uppercase tracking-wider">
          <Compass size={14} className="animate-spin" style={{ animationDuration: '20s' }} />
          <span>The Pilgrimage Path</span>
        </div>

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
                  <span className="p-1 rounded-md bg-black/40">
                    {ARC_ICONS[arc.id] || <Compass size={14} />}
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

      {/* Active Arc Sacred Header */}
      <div className="mx-4 mt-2 p-3.5 rounded-xl bg-card border border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none" />
        <h2 className="font-serif text-base font-semibold text-gold mb-1">
          {currentArc.title}
        </h2>
        <p className="text-xs text-gray-300 font-reading leading-relaxed mb-2.5">
          {currentArc.description}
        </p>
        <div className="p-2.5 rounded-lg bg-black/30 border-l-2 border-gold text-[11px] text-gold/90 italic font-reading">
          {currentArc.scripture}
        </div>
      </div>

      {/* Challenge Nodes Path */}
      <div className="px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-serif uppercase tracking-wider text-gray-400">
            Encounter Trail
          </span>
          <span className="text-[11px] text-gray-500">
            Pivoting conflict to resilience
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-gold/40 before:via-blue-500/30 before:to-transparent">
          {arcChallenges.map((challenge, idx) => {
            const isCompleted = completedChallenges.includes(challenge.id);
            // First incomplete challenge is active; earlier ones are completed
            const isFirstIncomplete = !isCompleted && arcChallenges.slice(0, idx).every(c => completedChallenges.includes(c.id));
            const isAvailable = isCompleted || isFirstIncomplete;

            return (
              <div key={challenge.id} className="relative group">
                {/* Node indicator */}
                <div
                  className={`absolute -left-6 top-3.5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-transform duration-300 ${
                    isCompleted
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20'
                      : isFirstIncomplete
                      ? 'bg-gold/20 border-gold text-gold ring-4 ring-gold/20 animate-pulse'
                      : 'bg-black/60 border-white/20 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} />
                  ) : isFirstIncomplete ? (
                    <Play size={10} className="fill-gold" />
                  ) : (
                    <Lock size={10} />
                  )}
                </div>

                {/* Challenge Card */}
                <div
                  onClick={() => {
                    if (isAvailable) {
                      audio.playChime(432, 1.5);
                      onStartChallenge(challenge);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isFirstIncomplete
                      ? 'bg-card border-gold/40 shadow-lg cursor-pointer hover:border-gold hover:translate-x-1'
                      : isCompleted
                      ? 'bg-card/70 border-white/5 opacity-80 cursor-pointer hover:opacity-100 hover:border-white/20'
                      : 'bg-secondary/40 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      Step {idx + 1}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Fortified
                      </span>
                    )}
                    {isFirstIncomplete && (
                      <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span>Current Challenge</span>
                        <ArrowRight size={10} />
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-gray-100 mb-0.5 font-serif">
                    {challenge.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-1.5 font-sans">
                    {challenge.subtitle}
                  </p>
                  <p className="text-xs text-gray-300 line-clamp-2 font-reading">
                    {challenge.narrative}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Rest Sanctuary Node at Trail End */}
          <div className="relative pt-2">
            <div className="absolute -left-6 top-5 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 flex items-center justify-center text-xs">
              🔥
            </div>
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
    </div>
  );
};
