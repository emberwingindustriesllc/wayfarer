'use client';

import React, { useState, useEffect } from 'react';
import { Arc, Challenge } from '../types/game';
import { WayfarerAvatar } from './WayfarerAvatar';
import { CheckCircle2, Lock, Play, Flame, CloudRain, Snowflake, Cloud, Sun } from 'lucide-react';
import { audio } from '../utils/audio';

export type BiomeType = 'snow' | 'savannah' | 'desert' | 'forest';
export type WeatherType = 'snow' | 'rain' | 'clouds' | 'clear';

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

const ARC_DEFAULT_BIOMES: Record<string, BiomeType> = {
  grief: 'snow',
  relationship: 'savannah',
  work: 'desert',
  self: 'forest'
};

export const WorldLandscape: React.FC<WorldLandscapeProps> = ({
  arc,
  completedChallenges,
  onSelectChallenge,
  onOpenRest,
  faith,
  wisdom
}) => {
  const challenges = arc.challenges || [];
  const defaultBiome = ARC_DEFAULT_BIOMES[arc.id] || 'snow';
  const [selectedBiome, setSelectedBiome] = useState<BiomeType>(defaultBiome);

  // Stage coordinates (natural progression up the terrain)
  const nodePositions: NodePoint[] = [
    { x: 25, y: 78 }, // Stage 1 (Valley Foothills)
    { x: 74, y: 58 }, // Stage 2 (Mid Ridge)
    { x: 30, y: 38 }, // Stage 3 (High Pass)
    { x: 50, y: 16 }  // Sanctuary Checkpoint (Campfire Summit)
  ];

  const activeIndex = challenges.findIndex(c => !completedChallenges.includes(c.id));
  const currentTargetIndex = activeIndex === -1 ? challenges.length : activeIndex;

  const [avatarIndex, setAvatarIndex] = useState(currentTargetIndex);
  const [isWalking, setIsWalking] = useState(false);

  // Dynamic Weather System (snow, rain, clouds, clear)
  // Defaults based on progression: Stage 0/1 -> rain/clouds, Stage 2 -> snow, Sanctuary -> clear
  const defaultWeatherForStage = (index: number): WeatherType => {
    if (index === 0) return 'rain';
    if (index === 1) return 'clouds';
    if (index === 2) return 'snow';
    return 'clear';
  };

  const [weather, setWeather] = useState<WeatherType>(defaultWeatherForStage(currentTargetIndex));

  // Sync default biome when arc changes
  useEffect(() => {
    setSelectedBiome(ARC_DEFAULT_BIOMES[arc.id] || 'snow');
  }, [arc.id]);

  // Animate avatar and shift weather as avatar travels
  useEffect(() => {
    if (avatarIndex !== currentTargetIndex) {
      setIsWalking(true);
      const stepInterval = setInterval(() => {
        audio.playFootstep();
      }, 180);

      const timer = setTimeout(() => {
        setAvatarIndex(currentTargetIndex);
        setIsWalking(false);
        // Automatically shift weather to reflect new pilgrimage stage
        setWeather(defaultWeatherForStage(currentTargetIndex));
        clearInterval(stepInterval);
      }, 700);

      return () => {
        clearTimeout(timer);
        clearInterval(stepInterval);
      };
    }
  }, [currentTargetIndex]);

  const cycleWeather = () => {
    audio.playFootstep();
    const weatherCycle: WeatherType[] = ['rain', 'snow', 'clouds', 'clear'];
    const nextIdx = (weatherCycle.indexOf(weather) + 1) % weatherCycle.length;
    setWeather(weatherCycle[nextIdx]);
  };

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
      // Shift weather dynamically with travel
      setWeather(defaultWeatherForStage(index));

      setTimeout(() => {
        setIsWalking(false);
        audio.playEncounterStart();
        onSelectChallenge(challenge);
      }, 500);
    }
  };

  const currentPos = nodePositions[Math.min(avatarIndex, nodePositions.length - 1)] || { x: 50, y: 50 };

  return (
    <div className="relative w-full h-[410px] rounded-2xl overflow-hidden border-2 border-gold/40 shadow-[0_12px_32px_rgba(0,0,0,0.8)] bg-[#0a0c16] select-none">
      {/* Top Controls: Biome & Dynamic Weather Switchers */}
      <div className="absolute top-2.5 right-2.5 z-40 flex items-center space-x-1.5">
        {/* Weather Indicator & Manual Cycle Button */}
        <button
          onClick={cycleWeather}
          className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-white/15 text-[10px] font-mono text-gray-200 flex items-center space-x-1 hover:border-gold transition-all shadow-lg"
          title="Click to cycle weather"
        >
          {weather === 'rain' && <><CloudRain size={12} className="text-blue-400 animate-pulse" /><span>Rain</span></>}
          {weather === 'snow' && <><Snowflake size={12} className="text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} /><span>Snow</span></>}
          {weather === 'clouds' && <><Cloud size={12} className="text-gray-300" /><span>Overcast</span></>}
          {weather === 'clear' && <><Sun size={12} className="text-amber-400 animate-pulse" /><span>Clear</span></>}
        </button>

        {/* Biome Switcher */}
        <div className="flex items-center bg-black/80 backdrop-blur-md rounded-xl p-0.5 border border-white/10 shadow-lg space-x-0.5">
          <button
            onClick={() => { audio.playFootstep(); setSelectedBiome('snow'); }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] transition-all ${
              selectedBiome === 'snow' ? 'bg-blue-600 text-white font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="Snowy Mountains"
          >
            ❄️
          </button>
          <button
            onClick={() => { audio.playFootstep(); setSelectedBiome('savannah'); }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] transition-all ${
              selectedBiome === 'savannah' ? 'bg-amber-600 text-white font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="Golden Savannah"
          >
            🌾
          </button>
          <button
            onClick={() => { audio.playFootstep(); setSelectedBiome('desert'); }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] transition-all ${
              selectedBiome === 'desert' ? 'bg-yellow-600 text-white font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="Sun Desert"
          >
            🏜️
          </button>
          <button
            onClick={() => { audio.playFootstep(); setSelectedBiome('forest'); }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] transition-all ${
              selectedBiome === 'forest' ? 'bg-emerald-700 text-white font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
            title="Ancient Forest"
          >
            🌲
          </button>
        </div>
      </div>

      {/* World Name / Arc Badge (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-40 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gold/40 shadow-lg">
        <div className="text-[9px] font-mono uppercase tracking-widest text-gold font-semibold flex items-center space-x-1">
          <span>🕊️</span>
          <span>
            {selectedBiome === 'snow' ? 'SNOWY MOUNTAINS' : selectedBiome === 'savannah' ? 'GOLDEN SAVANNAH' : selectedBiome === 'desert' ? 'DESERT OF PURPOSE' : 'ANCIENT FOREST'}
          </span>
        </div>
        <div className="text-xs font-serif font-bold text-gray-100">
          {arc.title}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. TERRAIN: SNOWY MOUNTAINS */}
      {/* ========================================================= */}
      {selectedBiome === 'snow' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1329] via-[#132247] to-[#1e346b]">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-teal-500/15 via-blue-400/20 to-indigo-500/15 blur-2xl pointer-events-none" />

          <svg className="absolute bottom-0 w-full h-full opacity-90" viewBox="0 0 400 410" preserveAspectRatio="none">
            <polygon points="0,120 70,70 140,130 210,50 300,120 370,60 400,90 400,410 0,410" fill="#182a53" />
            <polygon points="50,85 70,70 90,85" fill="#e2e8f0" />
            <polygon points="190,70 210,50 230,70" fill="#e2e8f0" />
            <polygon points="350,75 370,60 390,75" fill="#e2e8f0" />

            <polygon points="0,180 90,130 180,190 270,120 360,180 400,150 400,410 0,410" fill="#1e3a75" />
            <polygon points="70,145 90,130 115,150" fill="#ffffff" />
            <polygon points="245,135 270,120 295,140" fill="#ffffff" />

            <path d="M 0 240 Q 120 200, 240 250 T 400 230 L 400 410 L 0 410 Z" fill="#294d96" />
            <path d="M 0 290 Q 160 270, 300 310 T 400 280 L 400 410 L 0 410 Z" fill="#3b66bc" fillOpacity="0.5" />
            <path d="M 120 410 Q 180 340, 160 270 T 260 210" stroke="#93c5fd" strokeWidth="8" fill="none" strokeOpacity="0.4" />
          </svg>

          {/* Frosted Pines */}
          <div className="absolute left-6 bottom-24 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[32px] border-b-[#1e293b]" />
          <div className="absolute left-8 bottom-32 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[20px] border-b-[#f8fafc]" />
          <div className="absolute right-8 bottom-32 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[36px] border-b-[#1e293b]" />
          <div className="absolute right-10 bottom-42 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[24px] border-b-[#f8fafc]" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TERRAIN: GOLDEN SAVANNAH */}
      {/* ========================================================= */}
      {selectedBiome === 'savannah' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e1065] via-[#701a75] to-[#b45309]">
          <div className="absolute left-1/2 -translate-x-1/2 top-10 w-32 h-32 rounded-full bg-gradient-to-t from-[#f59e0b] to-[#fef08a] shadow-[0_0_60px_#f59e0b] opacity-80" />

          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 400 410" preserveAspectRatio="none">
            <path d="M 0 170 Q 80 150, 160 175 T 320 160 T 400 170 L 400 410 L 0 410 Z" fill="#4a044e" />
            <path d="M 0 230 Q 140 210, 270 240 T 400 220 L 400 410 L 0 410 Z" fill="#78350f" />
            <path d="M 0 300 Q 180 270, 320 310 T 400 290 L 400 410 L 0 410 Z" fill="#92400e" />

            <g fill="#2e1065">
              <path d="M 80 230 Q 75 190, 70 170 L 74 170 Q 79 190, 83 230 Z" />
              <ellipse cx="68" cy="168" rx="28" ry="7" />
              <ellipse cx="82" cy="165" rx="22" ry="6" />
              <ellipse cx="58" cy="172" rx="16" ry="5" />
            </g>

            <g fill="#2e1065">
              <path d="M 330 250 Q 325 180, 335 150 L 348 150 Q 355 180, 352 250 Z" />
              <circle cx="340" cy="142" r="16" />
              <circle cx="330" cy="146" r="12" />
              <circle cx="352" cy="146" r="12" />
            </g>
          </svg>

          <div className="absolute left-12 bottom-8 flex space-x-1.5 text-amber-300/80 text-sm">
            <span>🌾</span><span>🌾</span>
          </div>
          <div className="absolute right-14 bottom-12 flex space-x-1.5 text-amber-300/80 text-sm">
            <span>🌾</span>
          </div>
          <div className="absolute left-1/3 top-12 text-[10px] text-purple-950 font-bold select-none opacity-75">
            ^ ^ &nbsp; ^
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TERRAIN: SUN-DRENCHED DESERT */}
      {/* ========================================================= */}
      {selectedBiome === 'desert' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1917] via-[#451a03] to-[#78350f]">
          <div className="absolute left-8 top-6 w-1.5 h-1.5 bg-[#fef08a] rounded-full shadow-[0_0_6px_#fde047]" />
          <div className="absolute right-14 top-10 w-2 h-2 bg-[#fef08a] rounded-full shadow-[0_0_8px_#fde047]" />
          <div className="absolute left-1/2 top-4 w-1 h-1 bg-[#ffffff]" />

          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 400 410" preserveAspectRatio="none">
            <path d="M 0 160 Q 120 110, 240 170 T 400 140 L 400 410 L 0 410 Z" fill="#92400e" />
            <path d="M 0 220 Q 150 170, 290 230 T 400 200 L 400 410 L 0 410 Z" fill="#b45309" />
            <path d="M 0 300 Q 180 250, 320 310 T 400 270 L 400 410 L 0 410 Z" fill="#d97706" />

            <rect x="55" y="110" width="14" height="120" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            <polygon points="51,110 73,110 69,104 55,104" fill="#92400e" />

            <rect x="330" y="140" width="16" height="100" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            <polygon points="326,140 350,140 346,134 330,134" fill="#92400e" />

            <ellipse cx="200" cy="350" rx="60" ry="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <ellipse cx="200" cy="350" rx="45" ry="12" fill="#0369a1" />
          </svg>

          <div className="absolute left-[165px] top-[305px] text-2xl select-none">🌴</div>
          <div className="absolute left-[215px] top-[312px] text-xl select-none">🌴</div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TERRAIN: DEEP ANCIENT FOREST */}
      {/* ========================================================= */}
      {selectedBiome === 'forest' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#065f46]">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.4) 0%, transparent 40%, rgba(254, 240, 138, 0.2) 60%, transparent 100%)'
            }}
          />

          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 400 410" preserveAspectRatio="none">
            <rect x="30" y="40" width="32" height="370" fill="#022c22" />
            <rect x="330" y="60" width="36" height="350" fill="#022c22" />
            <rect x="180" y="20" width="28" height="390" fill="#043c2e" />

            <circle cx="45" cy="40" r="55" fill="#064e3b" />
            <circle cx="195" cy="20" r="60" fill="#047857" />
            <circle cx="348" cy="50" r="65" fill="#064e3b" />
            <circle cx="110" cy="30" r="45" fill="#059669" fillOpacity="0.7" />
            <circle cx="280" cy="35" r="50" fill="#059669" fillOpacity="0.7" />

            <ellipse cx="200" cy="360" rx="75" ry="24" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <ellipse cx="200" cy="360" rx="60" ry="16" fill="#0369a1" />
            <ellipse cx="200" cy="360" rx="80" ry="26" fill="none" stroke="#64748b" strokeWidth="4" strokeDasharray="6 3" />
          </svg>

          {/* Fireflies */}
          <div className="absolute left-14 top-28 w-2 h-2 rounded-full bg-[#a7f3d0] shadow-[0_0_12px_#34d399] animate-pulse" />
          <div className="absolute right-16 top-36 w-2.5 h-2.5 rounded-full bg-[#fef08a] shadow-[0_0_14px_#fde047] animate-bounce" style={{ animationDuration: '3.8s' }} />
        </div>
      )}

      {/* ========================================================= */}
      {/* DYNAMIC WEATHER OVERLAYS (Rain, Snow, Clouds, Clear) */}
      {/* ========================================================= */}
      {/* RAIN WEATHER */}
      {weather === 'rain' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Animated Rain streaks */}
          <div className="absolute inset-0 bg-blue-950/20" />
          <svg className="w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rainPattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                <line x1="0" y1="0" x2="0" y2="16" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.7" />
                <line x1="20" y1="18" x2="20" y2="34" stroke="#bfdbfe" strokeWidth="1.2" strokeOpacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rainPattern)" className="animate-pulse" />
          </svg>
        </div>
      )}

      {/* SNOW WEATHER */}
      {weather === 'snow' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute left-[15%] top-10 w-2 h-2 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-bounce" style={{ animationDuration: '3.2s' }} />
          <div className="absolute left-[35%] top-24 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <div className="absolute left-[65%] top-16 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-bounce" style={{ animationDuration: '4.5s' }} />
          <div className="absolute left-[85%] top-32 w-2 h-2 bg-blue-100 rounded-full animate-pulse" />
          <div className="absolute left-[50%] top-48 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '2.8s' }} />
        </div>
      )}

      {/* CLOUDS / OVERCAST WEATHER */}
      {weather === 'clouds' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Drifting Mist and Clouds */}
          <div className="absolute -left-10 top-8 w-60 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -right-10 top-20 w-72 h-28 bg-slate-200/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-0 bg-slate-950/15 pointer-events-none" />
        </div>
      )}

      {/* CLEAR WEATHER */}
      {weather === 'clear' && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Gentle celestial radiance */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl animate-pulse-gentle" />
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE NODES (Positioned naturally without yellow line) */}
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
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Stage Container */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-125 shadow-xl ${
                isRestNode
                  ? 'bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#f59e0b] border-[#fef08a] text-white ring-4 ring-amber-500/40 shadow-[0_0_20px_#f59e0b]'
                  : isCompleted
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 shadow-[0_0_10px_#34d399]'
                  : isCurrentTarget
                  ? 'bg-card border-gold text-gold ring-4 ring-gold/40 animate-bounce shadow-[0_0_16px_#eab308]'
                  : 'bg-black/80 border-white/20 text-gray-500 opacity-60'
              }`}
            >
              {isRestNode ? (
                <Flame size={20} className="animate-pulse text-amber-200" />
              ) : isCompleted ? (
                <CheckCircle2 size={18} />
              ) : isCurrentTarget ? (
                <Play size={15} className="fill-gold ml-0.5" />
              ) : (
                <Lock size={14} />
              )}
            </div>

            {/* Stage Tag Banner */}
            <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 px-2.5 py-0.5 rounded-md border border-gold/40 shadow-xl pointer-events-none transition-all group-hover:scale-105">
              <span className="font-serif text-[10px] font-bold text-gray-100">
                {isRestNode ? 'Sanctuary Campfire' : `Stage ${idx + 1}: ${challenge?.title}`}
              </span>
            </div>
          </div>
        );
      })}

      {/* ========================================================= */}
      {/* THE WAYFARER HERO AVATAR WALKING ON MAP */}
      {/* ========================================================= */}
      <div
        className="absolute -translate-x-1/2 -translate-y-[82%] z-30 transition-all duration-700 ease-in-out pointer-events-none"
        style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
      >
        <WayfarerAvatar
          isWalking={isWalking}
          faith={faith}
          wisdom={wisdom}
          size="md"
        />
        {/* Name Banner */}
        <div className="mt-1 bg-black/90 px-2 py-0.5 rounded-full border border-gold text-[10px] font-serif font-bold text-gold text-center shadow-2xl whitespace-nowrap flex items-center justify-center space-x-1">
          <span>⚔️</span>
          <span>The Wayfarer</span>
        </div>
      </div>
    </div>
  );
};
