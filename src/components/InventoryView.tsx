'use client';

import React from 'react';
import { Discipline, GameStats } from '../types/game';
import { BookOpen, PenTool, Shield, Cross, Wind, Sparkles, Check, Lock, ShieldCheck } from 'lucide-react';
import { audio } from '../utils/audio';

interface InventoryViewProps {
  disciplines: Discipline[];
  inventory: string[];
  stats: GameStats;
  onEquipItem: (itemId: string) => void;
  onUsePrayerKnot: () => void;
  onOpenJournal: () => void;
  onTriggerBreath: () => void;
}

const DISCIPLINE_ICONS: Record<string, React.ReactNode> = {
  gospel_reading: <BookOpen size={16} className="text-gold" />,
  journaling: <PenTool size={16} className="text-purple-300" />,
  boundaries: <ShieldCheck size={16} className="text-emerald-400" />,
  prayer_knot: <Cross size={16} className="text-rose-300" />,
  breath_of_grace: <Wind size={16} className="text-blue-300" />,
  gratitude_stone: <Sparkles size={16} className="text-amber-300" />
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  disciplines,
  inventory,
  stats,
  onEquipItem,
  onUsePrayerKnot,
  onOpenJournal,
  onTriggerBreath
}) => {
  return (
    <div className="flex flex-col flex-1 p-4 pb-20">
      <div className="mb-3">
        <h2 className="font-serif text-base font-bold text-gold tracking-wide">
          Spiritual Armor & Disciplines
        </h2>
        <p className="text-xs text-gray-400 font-reading">
          Your weapons are wisdom, prayer, and community. Your armor is holy resilience.
        </p>
      </div>

      <div className="space-y-3">
        {disciplines.map((disc) => {
          const isUnlocked = inventory.includes(disc.id);
          const isPrayerKnot = disc.id === 'prayer_knot';
          const canCraftKnot = stats.faith >= 15 && stats.community >= 10;

          return (
            <div
              key={disc.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-card border-white/10 shadow-md'
                  : 'bg-secondary/40 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    {DISCIPLINE_ICONS[disc.id] || <Shield size={16} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-bold text-gray-100">
                      {disc.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                      {disc.type}
                    </span>
                  </div>
                </div>

                {/* Status or Action button */}
                {isUnlocked ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Check size={10} />
                    <span>Equipped</span>
                  </span>
                ) : isPrayerKnot ? (
                  canCraftKnot ? (
                    <button
                      onClick={() => {
                        audio.playGraceChord();
                        onUsePrayerKnot();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/40 text-[10px] font-serif text-gold font-semibold transition-colors"
                    >
                      Knot Prayer
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono">
                      Needs 15 FW, 10 CO
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-mono text-gray-500 flex items-center space-x-1">
                    <Lock size={10} />
                    <span>Pilgrimage Gift</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-300 font-reading leading-relaxed mb-2">
                {disc.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] font-sans text-gold/90 italic">
                  ✨ {disc.buff}
                </span>

                {/* Action button if applicable */}
                {disc.id === 'journaling' && (
                  <button
                    onClick={onOpenJournal}
                    className="text-[11px] text-purple-300 hover:text-purple-200 underline font-medium"
                  >
                    Open Journal
                  </button>
                )}

                {disc.id === 'breath_of_grace' && (
                  <button
                    onClick={onTriggerBreath}
                    className="text-[11px] text-blue-300 hover:text-blue-200 underline font-medium"
                  >
                    Practice Breath
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
