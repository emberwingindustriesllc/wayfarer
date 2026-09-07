'use client';

import React, { useState } from 'react';
import { JournalEntry } from '../types/game';
import { PenTool, X, Save, Sparkles, BookOpen, Clock } from 'lucide-react';
import { audio } from '../utils/audio';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onSaveEntry: (content: string, prompt?: string) => void;
  initialPrompt?: string;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSaveEntry,
  initialPrompt
}) => {
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt || 'What is God teaching you through this current valley?');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!content.trim()) return;
    audio.playGraceChord();
    onSaveEntry(content.trim(), prompt);
    setContent('');
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4">
      <div className="bg-card w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <PenTool size={16} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-gray-100">
                Wayfarer's Journal
              </h3>
              <p className="text-[10px] text-gray-400">
                Entries are permanently saved & synced to Supabase (+5 WI, +3 CO)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Writing Box */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-reading text-purple-200 italic">
              “{prompt}”
            </div>

            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your honest reflection here... There is no judgment, only grace."
              className="w-full p-3 rounded-xl bg-secondary/90 border border-white/10 text-xs font-reading text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none leading-relaxed"
            />

            <button
              onClick={handleSave}
              disabled={!content.trim() || isSaved}
              className={`w-full py-2.5 px-4 rounded-xl font-serif text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-lg transition-all ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : content.trim()
                  ? 'bg-gradient-to-r from-gold via-amber-400 to-gold text-space hover:brightness-110'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaved ? (
                <>
                  <Sparkles size={14} />
                  <span>Reflection Sealed in Grace</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Preserve in Pilgrimage Record</span>
                </>
              )}
            </button>
          </div>

          {/* Past Entries */}
          {entries.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                <BookOpen size={11} />
                <span>Previous Pilgrimage Pages ({entries.length})</span>
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span className="text-purple-300">Sealed</span>
                    </div>
                    {entry.prompt && (
                      <p className="text-[11px] font-reading text-gold/80 italic">
                        {entry.prompt}
                      </p>
                    )}
                    <p className="text-xs font-reading text-gray-300 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
