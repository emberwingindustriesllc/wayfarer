'use client';

import React, { useState } from 'react';
import { ActOfGrace } from '../types/game';
import { Sparkles, CheckCircle2, Circle, Heart, Send } from 'lucide-react';
import { audio } from '../utils/audio';

interface ActOfGraceProps {
  acts: ActOfGrace[];
  onCompleteAct: (actId: string, notes?: string) => void;
}

export const ActOfGraceCard: React.FC<ActOfGraceProps> = ({
  acts,
  onCompleteAct
}) => {
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleToggle = (act: ActOfGrace) => {
    if (act.completed) return; // already completed
    setSubmittingId(act.id);
  };

  const handleConfirmCompletion = (actId: string) => {
    audio.playGraceChord();
    onCompleteAct(actId, activeNotes[actId] || '');
    setSubmittingId(null);
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-20">
      <div className="mb-3">
        <div className="flex items-center space-x-1.5 text-xs font-serif text-gold uppercase tracking-wider mb-0.5">
          <Heart size={14} className="text-rose-400" />
          <span>Daily Micro-Discipline</span>
        </div>
        <h2 className="font-serif text-base font-bold text-gray-100 tracking-wide">
          Today's Acts of Grace
        </h2>
        <p className="text-xs text-gray-400 font-reading">
          The pilgrimage is not just on this screen; it flows into how you treat real people today.
        </p>
      </div>

      <div className="space-y-3">
        {acts.map((act) => {
          const isCompleting = submittingId === act.id;

          return (
            <div
              key={act.id}
              className={`p-4 rounded-xl border transition-all ${
                act.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                  : 'bg-card border-white/10 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(act)}
                    disabled={act.completed}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {act.completed ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <Circle size={20} className="text-gray-400 hover:text-gold" />
                    )}
                  </button>
                  <div>
                    <h3 className={`text-xs font-serif font-bold ${
                      act.completed ? 'text-emerald-200 line-through' : 'text-gray-100'
                    }`}>
                      {act.title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono text-gray-400">
                      {act.category} • {act.reward}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-300 font-reading leading-relaxed mb-2.5 pl-7">
                {act.prompt}
              </p>

              {/* Completing Prompt */}
              {isCompleting && (
                <div className="pl-7 pt-2 border-t border-white/10 space-y-2">
                  <input
                    type="text"
                    placeholder="Short note: What happened? (Optional)"
                    value={activeNotes[act.id] || ''}
                    onChange={(e) => setActiveNotes({ ...activeNotes, [act.id]: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg bg-black/40 border border-white/10 text-gray-100 focus:outline-none focus:border-gold"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmCompletion(act.id)}
                      className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-serif text-[11px] font-semibold uppercase tracking-wider flex items-center space-x-1 hover:brightness-110"
                    >
                      <Sparkles size={12} />
                      <span>Confirm Grace</span>
                    </button>
                    <button
                      onClick={() => setSubmittingId(null)}
                      className="py-1.5 px-3 rounded-lg bg-white/5 text-gray-400 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {act.completed && act.notes && (
                <div className="pl-7 text-[11px] font-reading text-emerald-300/80 italic">
                  Note: “{act.notes}”
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
