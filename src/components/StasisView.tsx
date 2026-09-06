'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Wind, Sparkles, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface StasisViewProps {
  onRecover: () => void;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const StasisView: React.FC<StasisViewProps> = ({ onRecover }) => {
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const requiredCycles = 2;

  useEffect(() => {
    // Sound & Haptic cues on phase change
    if (phase === 'Inhale') {
      audio.playInhaleTone();
      audio.haptic(20);
    } else if (phase === 'Exhale') {
      audio.playExhaleTone();
      audio.haptic(20);
    } else if (phase === 'Hold' || phase === 'Rest') {
      audio.haptic(10);
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else if (phase === 'Exhale') {
            setPhase('Rest');
            return 4;
          } else {
            // Completed 1 full box cycle
            setCyclesCompleted((c) => c + 1);
            setPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const isReadyToReturn = cyclesCompleted >= requiredCycles;

  return (
    <div className="fixed inset-0 z-50 bg-[#07080d]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        {/* Soft Sacred Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart size={20} className="animate-pulse" />
          </div>
          <h2 className="font-serif text-xl font-bold text-gray-100 tracking-wider">
            The Stasis Sanctuary
          </h2>
          <p className="text-xs text-rose-300 font-serif uppercase tracking-widest">
            Burnout is not failure — it is a sacred call to rest
          </p>
        </div>

        {/* Biblical comfort */}
        <div className="p-3.5 rounded-xl bg-card/80 border border-white/10 text-xs font-reading text-gray-300 italic leading-relaxed">
          “He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.”
          <span className="block mt-1 font-sans not-italic text-[10px] text-gray-400">— Psalm 23:2-3</span>
        </div>

        {/* Guided Box Breathing Circle */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-1000 ${
              phase === 'Inhale'
                ? 'scale-110 border-blue-400 bg-blue-500/20 shadow-[0_0_40px_rgba(96,165,250,0.4)]'
                : phase === 'Hold'
                ? 'scale-110 border-gold bg-gold/20 shadow-[0_0_40px_rgba(229,185,116,0.4)]'
                : phase === 'Exhale'
                ? 'scale-90 border-teal-400 bg-teal-500/20 shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                : 'scale-90 border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(192,132,252,0.3)]'
            }`}
          >
            <span className="text-xs font-serif uppercase tracking-widest text-gray-200">
              {phase}
            </span>
            <span className="text-2xl font-mono font-bold text-white mt-0.5">
              {secondsLeft}s
            </span>
          </div>

          <div className="mt-3 text-[11px] text-gray-400 font-mono">
            Grounding Breath: {Math.min(cyclesCompleted, requiredCycles)} / {requiredCycles} Cycles
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-gray-400 font-reading leading-relaxed">
          Your resilience reached zero. Take slow, intentional breaths. Allow your heart rate to settle before picking up your staff once more.
        </p>

        {/* Return Button */}
        {isReadyToReturn ? (
          <button
            onClick={() => {
              audio.playGraceChord();
              onRecover();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-space font-serif font-bold text-xs uppercase tracking-wider shadow-glow hover:brightness-110 transition-all flex items-center justify-center space-x-2 animate-pulse-gentle"
          >
            <Check size={16} />
            <span>Arise with Restored Resilience (50 RE)</span>
          </button>
        ) : (
          <div className="text-[11px] text-gray-500 font-sans italic">
            Complete the 2 breathing cycles to restore your spirit...
          </div>
        )}
      </div>
    </div>
  );
};
