'use client';

import React, { useState } from 'react';
import { Challenge, Choice, GameStats } from '../types/game';
import { ArrowLeft, BookOpen, Sparkles, Heart, Users, Clock, AlertTriangle, ShieldCheck, PenTool, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface EncounterViewProps {
  challenge: Challenge;
  arcId: string;
  stats: GameStats;
  inventory: string[];
  onResolveChoice: (choice: Choice) => void;
  onBack: () => void;
  onOpenJournalForChallenge: (challenge: Challenge, outcomeText: string) => void;
}

export const EncounterView: React.FC<EncounterViewProps> = ({
  challenge,
  arcId,
  stats,
  inventory,
  onResolveChoice,
  onBack,
  onOpenJournalForChallenge
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  // Active discipline effects
  const hasBoundaries = inventory.includes('boundaries');
  const hasGospelReading = inventory.includes('gospel_reading');

  const handleChoiceClick = (choice: Choice) => {
    let modifiedChoice = { ...choice };

    // Apply Boundaries armor benefit if in relationship arc
    if (hasBoundaries && arcId === 'relationship' && modifiedChoice.resilienceCost) {
      modifiedChoice.resilienceCost = Math.round(modifiedChoice.resilienceCost * 0.65);
    }

    // Apply Gospel reading buff
    if (hasGospelReading && modifiedChoice.faithGain) {
      modifiedChoice.faithGain = Math.round(modifiedChoice.faithGain * 1.2);
    }

    if (choice.archetype === 'Faith') {
      audio.playGraceChord();
    } else if (choice.archetype === 'Impulsive') {
      audio.haptic([40, 80, 40]);
      audio.playGroundingTone();
    } else {
      audio.playChime(432, 2.0);
    }

    setSelectedChoice(modifiedChoice);
    setShowOutcome(true);
    onResolveChoice(modifiedChoice);
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-20">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gold transition-colors py-1 px-2 -ml-2 rounded-lg"
        >
          <ArrowLeft size={14} />
          <span>Return to Path</span>
        </button>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gold/80 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
          Internal Conflict Resolution
        </span>
      </div>

      {!showOutcome ? (
        <div className="space-y-4">
          {/* Challenge Narrative Card */}
          <div className="p-4 rounded-2xl bg-card border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-serif text-gray-400 mb-1">
              <span>Encounter</span>
              <span>•</span>
              <span className="text-gray-300">{challenge.subtitle}</span>
            </div>

            <h2 className="text-lg font-serif font-bold text-gray-100 mb-2.5">
              {challenge.title}
            </h2>

            <p className="text-sm font-reading text-gray-200 leading-relaxed mb-4">
              {challenge.narrative}
            </p>

            {/* Scripture Anchor */}
            <div className="p-3 rounded-xl bg-secondary/80 border-l-2 border-gold/60 text-xs font-reading italic text-gold/90 mb-3.5">
              <div className="flex items-center space-x-1 text-[10px] not-italic text-gold font-sans font-medium uppercase tracking-wider mb-1">
                <BookOpen size={11} />
                <span>Anchoring Scripture</span>
              </div>
              {challenge.scriptureAnchor}
            </div>

            {/* Socratic Reflection Prompt */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-purple-200/90 font-reading">
              <span className="font-sans font-semibold text-purple-300 block text-[10px] uppercase tracking-wider mb-0.5">
                The Question Within:
              </span>
              {challenge.reflectionQuestion}
            </div>
          </div>

          {/* Micro-Decisions Section */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-serif uppercase tracking-wider text-gray-400">
                Choose Your Response
              </span>
              <span className="text-[10px] text-gray-500">
                Resource allocation & trade-offs
              </span>
            </div>

            <div className="space-y-2.5">
              {challenge.choices.map((choice, i) => {
                const isImpulsive = choice.archetype === 'Impulsive';
                const isFaith = choice.archetype === 'Faith';
                const isPatience = choice.archetype === 'Patience';
                const isCommunity = choice.archetype === 'Community';

                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceClick(choice)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group ${
                      isFaith
                        ? 'bg-gradient-to-r from-amber-950/30 to-card border-gold/40 hover:border-gold hover:shadow-glow'
                        : isImpulsive
                        ? 'bg-gradient-to-r from-rose-950/20 to-card border-rose-500/20 hover:border-rose-500/50'
                        : isPatience
                        ? 'bg-gradient-to-r from-teal-950/25 to-card border-teal-500/30 hover:border-teal-400'
                        : 'bg-gradient-to-r from-blue-950/25 to-card border-blue-500/30 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                          isFaith
                            ? 'bg-gold/15 text-gold border border-gold/30'
                            : isImpulsive
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : isPatience
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        }`}>
                          {choice.archetype}
                        </span>
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-white">
                          {choice.label}
                        </span>
                      </div>

                      {/* Stat cost/gain preview badge */}
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                        {choice.resilienceCost ? (
                          <span className="text-rose-400">-{choice.resilienceCost} RE</span>
                        ) : null}
                        {choice.resilienceGain ? (
                          <span className="text-emerald-400">+{choice.resilienceGain} RE</span>
                        ) : null}
                        {choice.wisdomGain ? (
                          <span className="text-purple-300">+{choice.wisdomGain} WI</span>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 font-reading leading-relaxed group-hover:text-gray-300">
                      {choice.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Reflection & Resolution View */
        <div className="p-5 rounded-2xl bg-card border border-gold/40 shadow-2xl space-y-4 animate-float-soft">
          <div className="flex items-center space-x-2 text-gold">
            <Sparkles size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-serif text-xs uppercase tracking-widest font-semibold">
              The Lesson Sealed
            </span>
          </div>

          <div>
            <h3 className="text-base font-serif font-bold text-gray-100 mb-1">
              You chose: {selectedChoice?.label}
            </h3>
            <p className="text-xs text-gray-400 font-reading mb-3">
              {selectedChoice?.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-sm font-reading text-gray-200 leading-relaxed italic">
            "{selectedChoice?.reflectionOutcome}"
          </div>

          {/* Stat Adjustments Summary */}
          <div className="p-3 rounded-xl bg-secondary/80 border border-white/5 space-y-2">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
              Spiritual & Emotional Shifts
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {selectedChoice?.resilienceGain ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{selectedChoice.resilienceGain} Resilience
                </span>
              ) : null}
              {selectedChoice?.resilienceCost ? (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  -{selectedChoice.resilienceCost} Resilience
                </span>
              ) : null}
              {selectedChoice?.wisdomGain ? (
                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  +{selectedChoice.wisdomGain} Wisdom
                </span>
              ) : null}
              {selectedChoice?.faithGain ? (
                <span className="px-2.5 py-1 rounded-md bg-gold/20 text-gold border border-gold/30">
                  +{selectedChoice.faithGain} Faith
                </span>
              ) : null}
              {selectedChoice?.patienceGain ? (
                <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  +{selectedChoice.patienceGain} Patience
                </span>
              ) : null}
              {selectedChoice?.communityGain ? (
                <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  +{selectedChoice.communityGain} Community
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                if (selectedChoice) {
                  onOpenJournalForChallenge(challenge, selectedChoice.reflectionOutcome);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-card border border-white/10 text-xs font-medium text-gray-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <PenTool size={13} className="text-gold" />
              <span>Record Thoughts in Wayfarer's Journal (+5 WI)</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-space font-semibold text-xs tracking-wider uppercase font-serif shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-1.5"
            >
              <Check size={14} />
              <span>Continue the Pilgrimage</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
