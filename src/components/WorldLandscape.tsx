'use client';

import React, { useState, useEffect } from 'react';
import { Arc, Challenge } from '../types/game';
import { WayfarerAvatar } from './WayfarerAvatar';
import { CheckCircle2, Lock, Play, Flame, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';

interface WorldLandscapeProps {
  arc: Arc;
  completedChallenges: string[];
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenRest: () => void;
  faith: number;
  wisdom: number;
}

interface NodePoint {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

export const WorldLandscape: React.FC<WorldLandscapeProps> = ({
  arc,
  completedChallenges,
  onSelectChallenge,
  onOpenRest,
  faith,
  wisdom
}) => {
  const challenges = arc.challenges || [];

  // Overworld stage coordinates (classic Mario Bros 3 / Shovel Knight style winding path)
  const nodePositions: NodePoint[] = [
    { x: 26, y: 76 }, // Stage 1
    { x: 74, y: 56 }, // Stage 2
    { x: 30, y: 36 }, // Stage 3
    { x: 50, y: 15 }  // Sanctuary Checkpoint (Campfire / Sanctuary Tent)
  ];

  const activeIndex = challenges.findIndex(c => !completedChallenges.includes(c.id));
  const currentTargetIndex = activeIndex === -1 ? challenges.length : activeIndex;

  const [avatarIndex, setAvatarIndex] = useState(currentTargetIndex);
  const [isWalking, setIsWalking] = useState(false);
  const [waterFrame, setWaterFrame] = useState(0);

  // Retro water/sparkle frame animation
  useEffect(() => {
    const timer = setInterval(() => {
      setWaterFrame(f => (f + 1) % 4);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Animate avatar when active node changes
  useEffect(() => {
    if (avatarIndex !== currentTargetIndex) {
      setIsWalking(true);
      const stepInterval = setInterval(() => {
        audio.playFootstep();
      }, 180);

      const timer = setTimeout(() => {
        setAvatarIndex(currentTargetIndex);
        setIsWalking(false);
        clearInterval(stepInterval);
      }, 700);

      return () => {
        clearTimeout(timer);
        clearInterval(stepInterval);
      };
    }
  }, [currentTargetIndex]);

  const handleNodeClick = (index: number) => {
    if (index === challenges.length) {
      audio.playZeldaSecret();
      onOpenRest();
      return;
    }

    const challenge = challenges[index];
    if (!challenge) return;

    const isCompleted = completedChallenges.includes(challenge.id);
    const isFirstIncomplete = index === currentTargetIndex;

    if (isCompleted || isFirstIncomplete) {
      audio.playFootstep();
      setIsWalking(true);
      setAvatarIndex(index);

      setTimeout(() => {
        setIsWalking(false);
        audio.playEncounterStart();
        onSelectChallenge(challenge);
      }, 500);
    }
  };

  const currentPos = nodePositions[Math.min(avatarIndex, nodePositions.length - 1)] || { x: 50, y: 50 };

  return (
    <div className="relative w-full h-[370px] rounded-xl overflow-hidden border-4 border-[#3a2d1d] shadow-[0_0_20px_rgba(0,0,0,0.9)] bg-black select-none">
      {/* Scanline CRT overlay for authentic retro feel */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-15"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* ========================================================= */}
      {/* 1. ARC OF GRIEF: The Valley of Still Waters (Retro 16-bit) */}
      {/* ========================================================= */}
      {arc.id === 'grief' && (
        <div className="absolute inset-0 bg-[#0f172a]">
          {/* Distant pixel mountains */}
          <div className="absolute top-0 left-0 right-0 h-32 opacity-40">
            <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none" style={{ shapeRendering: 'crispEdges' }}>
              <polygon points="0,50 30,20 60,50 90,25 130,55 170,15 200,45 200,80 0,80" fill="#1e293b" />
              <polygon points="10,60 45,35 80,65 110,40 150,68 180,30 200,55 200,80 0,80" fill="#334155" />
            </svg>
          </div>

          {/* Pixel Lake / Still Waters */}
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-[#1e3a8a]/60 border-t-2 border-[#60a5fa]/40">
            {/* Shimmering pixel water highlights */}
            <div className="absolute left-8 top-6 w-8 h-1 bg-white/40" style={{ opacity: waterFrame % 2 === 0 ? 0.7 : 0.2 }} />
            <div className="absolute right-12 top-14 w-12 h-1 bg-white/40" style={{ opacity: waterFrame % 2 === 1 ? 0.7 : 0.2 }} />
            <div className="absolute left-28 top-24 w-10 h-1 bg-white/40" style={{ opacity: (waterFrame + 1) % 2 === 0 ? 0.6 : 0.1 }} />

            {/* Pixel Floating Lanterns */}
            <div className="absolute left-12 top-10 flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s' }}>
              <div className="w-2 h-2 bg-[#fef08a] shadow-[0_0_6px_#f59e0b]" />
              <div className="w-3 h-1.5 bg-[#b45309]" />
            </div>

            <div className="absolute right-16 top-20 flex flex-col items-center animate-bounce" style={{ animationDuration: '3.2s' }}>
              <div className="w-2 h-2 bg-[#fef08a] shadow-[0_0_6px_#f59e0b]" />
              <div className="w-3 h-1.5 bg-[#b45309]" />
            </div>
          </div>

          {/* Pixel Weeping Willow Trees */}
          <div className="absolute left-2 bottom-20 w-8 h-16 bg-[#1e293b] rounded-t-lg" />
          <div className="absolute right-3 bottom-28 w-10 h-20 bg-[#1e293b] rounded-t-lg" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ARC OF RELATIONSHIPS: Mountain of Accord (Zelda style) */}
      {/* ========================================================= */}
      {arc.id === 'relationship' && (
        <div className="absolute inset-0 bg-[#062c24]">
          {/* Alpine Ridgelines */}
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-60" preserveAspectRatio="none" style={{ shapeRendering: 'crispEdges' }}>
            <polygon points="0,30 40,80 90,40 140,90 180,35 200,60 200,120 0,120" fill="#083e33" />
            <polygon points="10,60 60,110 110,70 160,110 200,80 200,120 0,120" fill="#0e4e40" />
            {/* Wooden Pixel Bridge across the chasm */}
            <line x1="45" y1="75" x2="155" y2="75" stroke="#78350f" strokeWidth="4" strokeDasharray="3 1" />
            <line x1="45" y1="77" x2="155" y2="77" stroke="#451a03" strokeWidth="2" />
          </svg>

          {/* Pixel Mountain Pines */}
          <div className="absolute left-6 bottom-16 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-[#064e3b]" />
          <div className="absolute right-8 bottom-28 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px] border-b-[#064e3b]" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ARC OF WORK: Desert of Purpose (Shovel Knight style) */}
      {/* ========================================================= */}
      {arc.id === 'work' && (
        <div className="absolute inset-0 bg-[#451a03]">
          {/* Desert Dunes */}
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-70" preserveAspectRatio="none" style={{ shapeRendering: 'crispEdges' }}>
            <path d="M 0 40 Q 60 15, 120 45 T 200 35 L 200 120 L 0 120 Z" fill="#78350f" />
            <path d="M 0 70 Q 80 50, 150 75 T 200 65 L 200 120 L 0 120 Z" fill="#92400e" />
            {/* Weathered Stone Pillars */}
            <rect x="35" y="25" width="8" height="60" fill="#29180e" />
            <rect x="34" y="23" width="10" height="3" fill="#3f2719" />
            <rect x="155" y="40" width="10" height="50" fill="#29180e" />
          </svg>

          {/* Pixel Desert Stars */}
          <div className="absolute left-10 top-6 w-1 h-1 bg-[#fef08a]" />
          <div className="absolute right-14 top-10 w-1.5 h-1.5 bg-[#fef08a]" />
          <div className="absolute left-1/2 top-4 w-1 h-1 bg-[#fde047]" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ARC OF SELF-CARE: Sacred Grove (Mega Man / Zelda night) */}
      {/* ========================================================= */}
      {arc.id === 'self' && (
        <div className="absolute inset-0 bg-[#1e1035]">
          {/* Sacred Grove Canopy */}
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-60" preserveAspectRatio="none" style={{ shapeRendering: 'crispEdges' }}>
            <circle cx="30" cy="30" r="25" fill="#2e1065" />
            <circle cx="70" cy="20" r="30" fill="#3b0764" />
            <circle cx="160" cy="25" r="35" fill="#2e1065" />
            {/* Living Water Pool */}
            <ellipse cx="100" cy="95" rx="55" ry="18" fill="#581c87" />
            <ellipse cx="100" cy="95" rx="45" ry="14" fill="#6b21a8" />
          </svg>

          {/* Animated Pixel Fireflies */}
          <div className="absolute left-16 top-24 w-1.5 h-1.5 bg-[#f472b6] shadow-[0_0_8px_#f472b6] animate-pulse" />
          <div className="absolute right-20 top-20 w-1.5 h-1.5 bg-[#c084fc] shadow-[0_0_8px_#c084fc] animate-pulse-gentle" />
          <div className="absolute left-1/2 top-32 w-1.5 h-1.5 bg-[#fde047] shadow-[0_0_8px_#fde047] animate-bounce" />
        </div>
      )}

      {/* ========================================================= */}
      {/* Retro Dotted Overworld Path (Like Super Mario Bros 3 / Shovel Knight) */}
      {/* ========================================================= */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M ${nodePositions[0].x} ${nodePositions[0].y} Q 50 65, ${nodePositions[1].x} ${nodePositions[1].y} T ${nodePositions[2].x} ${nodePositions[2].y} T ${nodePositions[3].x} ${nodePositions[3].y}`}
          fill="none"
          stroke="#fef08a"
          strokeWidth="1.8"
          strokeDasharray="2 2"
          className="drop-shadow-[0_0_4px_#f59e0b]"
        />
      </svg>

      {/* ========================================================= */}
      {/* Retro Overworld Stage Nodes (Mario 3 / Shovel Knight circles) */}
      {/* ========================================================= */}
      {nodePositions.map((pos, idx) => {
        const isRestNode = idx === challenges.length;
        const challenge = challenges[idx];
        const isCompleted = challenge ? completedChallenges.includes(challenge.id) : false;
        const isFirstIncomplete = idx === currentTargetIndex;
        const isCurrentTarget = isFirstIncomplete || (isRestNode && currentTargetIndex >= challenges.length);

        return (
          <div
            key={idx}
            onClick={() => handleNodeClick(idx)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Retro Pixel Node Container */}
            <div
              className={`w-8 h-8 flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-125 ${
                isRestNode
                  ? 'bg-[#451a03] border-[#f59e0b] text-[#fef08a] shadow-[0_0_12px_#f59e0b]'
                  : isCompleted
                  ? 'bg-[#064e3b] border-[#34d399] text-[#a7f3d0] shadow-[0_0_8px_#34d399]'
                  : isCurrentTarget
                  ? 'bg-[#1e2238] border-[#fde047] text-[#fde047] animate-bounce shadow-[0_0_12px_#fde047]'
                  : 'bg-[#18181b] border-[#52525b] text-[#71717a] opacity-70'
              }`}
              style={{ imageRendering: 'pixelated' }}
            >
              {isRestNode ? (
                <span className="text-sm">🔥</span>
              ) : isCompleted ? (
                <span className="text-xs font-bold font-mono">★</span>
              ) : (
                <span className="font-['Press_Start_2P',monospace] text-[10px] font-bold">
                  {idx + 1}
                </span>
              )}
            </div>

            {/* Retro Stage Title Banner */}
            <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 px-2 py-0.5 border border-[#e5b974]/50 shadow-md pointer-events-none opacity-90 group-hover:opacity-100 transition-all">
              <span className="font-['Press_Start_2P',monospace] text-[8px] text-[#fde047]">
                {isRestNode ? 'REST' : `STG ${idx + 1}`}
              </span>
            </div>
          </div>
        );
      })}

      {/* ========================================================= */}
      {/* THE PIXEL WAYFARER AVATAR Walking on Map */}
      {/* ========================================================= */}
      <div
        className="absolute -translate-x-1/2 -translate-y-[88%] z-30 transition-all duration-500 ease-in-out pointer-events-none"
        style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
      >
        <WayfarerAvatar
          isWalking={isWalking}
          faith={faith}
          wisdom={wisdom}
          size="md"
        />
        {/* Retro Name Badge */}
        <div className="mt-0.5 bg-black/95 px-1.5 py-0.5 border border-[#e5b974] text-[8px] font-['Press_Start_2P',monospace] text-[#e5b974] text-center shadow-lg whitespace-nowrap">
          WAYFARER
        </div>
      </div>

      {/* Top Banner (World Title like "WORLD 1-1") */}
      <div className="absolute top-2 left-2 z-20 bg-black/85 px-2.5 py-1 border-2 border-[#e5b974] shadow-md flex items-center space-x-2">
        <span className="text-xs">🕊️</span>
        <div>
          <div className="font-['Press_Start_2P',monospace] text-[8px] text-[#fde047]">
            {arc.id === 'grief' ? 'WORLD 1: GRIEF' : arc.id === 'relationship' ? 'WORLD 2: ACCORD' : arc.id === 'work' ? 'WORLD 3: PURPOSE' : 'WORLD 4: SABBATH'}
          </div>
          <div className="text-[10px] text-gray-300 font-serif">
            {arc.title.replace('The Arc of ', '')}
          </div>
        </div>
      </div>
    </div>
  );
};
